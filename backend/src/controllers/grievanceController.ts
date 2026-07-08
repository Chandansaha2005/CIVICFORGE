import { Response, NextFunction } from 'express';
import fs from 'fs';
import { AuthenticatedRequest } from '../middleware/auth';
import { Grievance } from '../models/Grievance';
import { categorizeAndScoreText } from '../services/geminiService';
import { getInfrastructureGap } from '../services/dataFusionService';
import { computeUrgencyScore, updateClusterMetrics } from '../services/scoringService';
import { uploadToCloud } from '../utils/uploadAdapter';
import { runAIPrioritizationTask } from '../services/aiPrioritizer';
import { GoogleGenAI } from '@google/genai';

// Initialize Gemini client globally for audio transcription
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function createGrievance(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { inputType, lat, lng, address } = req.body;
    let description = req.body.description || '';
    
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!inputType || !lat || !lng || !address) {
      return res.status(400).json({ message: 'Missing required location or inputType fields.' });
    }

    const latitude = Number(lat);
    const longitude = Number(lng);

    let mediaUrl = null;
    let transcript = null;

    // Handle photo or voice note uploads from multer
    if (req.file) {
      // 1. Upload to Cloudinary (via your existing adapter)
      const cloudUrl = await uploadToCloud(req.file.path);
      mediaUrl = cloudUrl;

      // 2. Transcribe and Translate Audio using Gemini
      if (inputType === 'voice') {
        const fileBuffer = fs.readFileSync(req.file.path);
        const base64Audio = fileBuffer.toString('base64');

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: [
            {
              role: 'user',
              parts: [
                { inlineData: { data: base64Audio, mimeType: req.file.mimetype } },
                { text: "Listen to this audio. Transcribe it directly into English. Provide only the translated English transcription without any conversational filler, markdown, or quotation marks." }
              ]
            }
          ]
        });

        transcript = response.text?.trim() || '';
        description = transcript; // Make transcribed text the description
      }

      // 3. Clean up the local temp file to prevent server bloat
      fs.unlinkSync(req.file.path);
    }

    if (!description && inputType !== 'voice') {
      return res.status(400).json({ message: 'Grievance description text is required.' });
    }

    // AI Classification and tone-urgency scoring
    const { category, stressScore, summary } = await categorizeAndScoreText(description);

    // Geographic data fusion with local Indian census metrics
    const { gapScore } = getInfrastructureGap(latitude, longitude, category);

    // Create the grievance (initial recurrenceCount of 1)
    const initialUrgency = computeUrgencyScore(1, stressScore, gapScore);

    const grievanceDoc = new Grievance({
      citizen: req.user.id,
      category,
      description,
      inputType,
      mediaUrl,
      transcript,
      location: { lat: latitude, lng: longitude, address },
      stressScore,
      recurrenceCount: 1,
      infrastructureGapScore: gapScore,
      urgencyScore: initialUrgency,
      status: 'pending_review',
      aiLastEvaluatedAt: null
    });
    
    const newGrievance = await grievanceDoc.save();

    runAIPrioritizationTask(); // Trigger AI prioritization after new grievance creation

    // Recompute cluster-based recurrence counts and update urgency scores for nearby issues within 2km
    const { count } = await updateClusterMetrics(category, latitude, longitude);

    // Re-fetch the updated grievance to return accurate computed scores
    const updatedGrievance = await Grievance.findById(newGrievance._id);

    return res.status(201).json({
      success: true,
      grievance: updatedGrievance
    });
  } catch (error) {
    // Ensure temp files are cleaned up even if the transaction fails
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    next(error);
  }
}

export async function getMyGrievances(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) return res.status(401).json({ message: 'Authentication required' });

    const grievances = await Grievance.find({ citizen: req.user.id }).sort({ createdAt: -1 });
    return res.json({ success: true, grievances });
  } catch (error) {
    next(error);
  }
}

export async function getAllGrievances(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { category, region, status } = req.query;
    const filter: any = {};

    if (category) filter.category = category;
    if (status) filter.status = status;
    
    // In our mock and standard Mongo setup, we search within address fields for region matches
    if (region) {
      filter['location.address'] = { $regex: String(region), $options: 'i' };
    }

    // Populate the citizen data
    const grievances = await Grievance.find(filter)
      .sort({ urgencyScore: -1 })
      .populate('citizen');

    return res.json({ success: true, grievances });
  } catch (error) {
    next(error);
  }
}

export async function getGrievancesHeatmap(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    // Only return required minimal payload for high-performance map rendering
    const grievances = await Grievance.find({});
    const heatmapData = grievances.map((g: any) => ({
      _id: g._id,
      lat: g.location?.lat,
      lng: g.location?.lng,
      urgencyScore: g.urgencyScore,
      category: g.category,
      address: g.location?.address
    }));

    return res.json({ success: true, heatmap: heatmapData });
  } catch (error) {
    next(error);
  }
}

export async function verifyGrievance(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const grievance = await Grievance.findById(id);

    if (!grievance) {
      return res.status(404).json({ message: 'Grievance not found.' });
    }

    grievance.status = 'verified';
    grievance.aiLastEvaluatedAt = null;
    await grievance.save();

    runAIPrioritizationTask();

    return res.json({
      success: true,
      message: 'Grievance successfully verified.',
      grievance
    });
  } catch (error) {
    next(error);
  }
}