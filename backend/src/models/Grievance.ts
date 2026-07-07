import mongoose from 'mongoose';
import { getModelAdapter } from './dbAdapter';

const GrievanceSchema = new mongoose.Schema({
  citizen: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category: { 
    type: String, 
    enum: ['water', 'road', 'electricity', 'sanitation', 'health', 'education', 'other'], 
    required: true 
  },
  description: { type: String, required: true },
  inputType: { type: String, enum: ['text', 'photo', 'voice'], required: true },
  mediaUrl: { type: String, default: null },
  transcript: { type: String, default: null },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    address: { type: String, required: true }
  },
  stressScore: { type: Number, default: 0 },
  recurrenceCount: { type: Number, default: 1 },
  infrastructureGapScore: { type: Number, default: 0 },
  urgencyScore: { type: Number, default: 0 },
  status: { 
    type: String, 
    enum: ['pending_review', 'verified', 'matched', 'resolved'], 
    default: 'pending_review' 
  },
  // AI Prioritization Fields
  aiPriorityScore: { type: Number, default: 0 },
  aiPriorityExplanation: { type: String, default: null },
  aiLastEvaluatedAt: { type: Date, default: null },
  
  createdAt: { type: Date, default: Date.now }
});

export const Grievance = getModelAdapter('Grievance', GrievanceSchema);