import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { Grievance } from '../models/Grievance';
import { Solution } from '../models/Solution';
import { Vouch } from '../models/Vouch';

export async function getPriorityMatrix(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const grievances = await Grievance.find({})
      .sort({ urgencyScore: -1 })
      .populate('citizen')
      .exec();

    const solutions = await Solution.find({}).populate('developer').exec();
    const vouches = await Vouch.find({});

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const enrichedMatrix = grievances.map((grievance: any) => {
      const plainGrievance = typeof grievance.toObject === 'function' ? grievance.toObject() : grievance;

      // Find solutions with matching targetCategory
      const matched = solutions.filter((sol: any) => sol.targetCategory === grievance.category);

      // Sort matched by vouchCount DESC
      matched.sort((a: any, b: any) => (b.vouchCount || 0) - (a.vouchCount || 0));

      const topSol = matched[0];
      let topSolution = null;
      let weeklyMomentum = 0;

      if (topSol) {
        topSolution = {
          _id: topSol._id,
          title: topSol.title,
          developer: topSol.developer,
          vouchCount: topSol.vouchCount || 0
        };

        // Calculate vouches in the last 7 days for this topSolution
        const recentVouches = vouches.filter((v: any) => {
          const vSolId = typeof v.solution === 'object' ? v.solution._id : v.solution;
          return vSolId && vSolId.toString() === topSol._id.toString() && new Date(v.createdAt) >= sevenDaysAgo;
        });

        weeklyMomentum = recentVouches.length;
      }

      return {
        ...plainGrievance,
        topSolution,
        weeklyMomentum
      };
    });

    return res.json({
      success: true,
      matrix: enrichedMatrix
    });
  } catch (error) {
    next(error);
  }
}
