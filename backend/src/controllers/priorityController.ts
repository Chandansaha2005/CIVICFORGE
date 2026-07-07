import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { Grievance } from '../models/Grievance';
import { Solution } from '../models/Solution';
import { Vouch } from '../models/Vouch';
import { runAIPrioritizationTask } from '../services/aiPrioritizer';

export async function getPriorityMatrix(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    // Sort by AI Priority Score first, fallback to urgency
    const grievances = await Grievance.find({})
      .sort({ aiPriorityScore: -1, urgencyScore: -1 })
      .populate('citizen')
      .exec();

    const solutions = await Solution.find({}).populate('developer').exec();
    const vouches = await Vouch.find({});

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const enrichedMatrix = grievances.map((grievance: any) => {
      const plainGrievance = typeof grievance.toObject === 'function' ? grievance.toObject() : grievance;

      const matched = solutions.filter((sol: any) => sol.targetCategory === grievance.category);

      // Sort solutions primarily by AI Suitability for THIS specific grievance, fallback to vouches
      matched.sort((a: any, b: any) => {
        const aSuit = a.aiSuitability?.find((s: any) => s.grievanceId?.toString() === grievance._id.toString())?.score || 0;
        const bSuit = b.aiSuitability?.find((s: any) => s.grievanceId?.toString() === grievance._id.toString())?.score || 0;
        if (aSuit !== bSuit) return bSuit - aSuit;
        return (b.vouchCount || 0) - (a.vouchCount || 0);
      });

      const topSol = matched[0];
      let topSolution = null;
      let weeklyMomentum = 0;

      if (topSol) {
        topSolution = {
          _id: topSol._id,
          title: topSol.title,
          developer: topSol.developer,
          vouchCount: topSol.vouchCount || 0,
          aiMatchScore: topSol.aiSuitability?.find((s: any) => s.grievanceId?.toString() === grievance._id.toString())?.score || 0
        };

        const recentVouches = vouches.filter((v: any) => {
          const vSolId = typeof v.solution === 'object' ? v.solution._id : v.solution;
          return vSolId && vSolId.toString() === topSol._id.toString() && new Date(v.createdAt) >= sevenDaysAgo;
        });

        weeklyMomentum = recentVouches.length;
      }

      return { ...plainGrievance, topSolution, weeklyMomentum };
    });

    return res.json({ success: true, matrix: enrichedMatrix });
  } catch (error) {
    next(error);
  }
}

export async function forcePrioritizeAll(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    await Grievance.updateMany(
      { status: { $in: ['pending_review', 'verified'] } },
      { $set: { aiLastEvaluatedAt: null } }
    );
    runAIPrioritizationTask();
    return res.json({ success: true, message: 'AI Priority daemon triggered for all active grievances.' });
  } catch (error) {
    next(error);
  }
}