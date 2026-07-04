import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { Solution } from '../models/Solution';
import { User } from '../models/User';

export async function getDeveloperLeaderboard(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Fetch all developer users to seed the leaderboard
    const developers = await User.find({ role: 'developer' });
    const leaderboardMap: { [key: string]: any } = {};

    developers.forEach((dev: any) => {
      // Remove sensitive fields
      const plainDev = typeof dev.toObject === 'function' ? dev.toObject() : dev;
      const { password, ...safeDev } = plainDev;
      leaderboardMap[dev._id.toString()] = {
        developer: safeDev,
        totalVouches: 0,
        solutionCount: 0,
        hasDeployedBadge: false
      };
    });

    // Fetch all solutions
    const solutions = await Solution.find({});

    solutions.forEach((sol: any) => {
      const devId = sol.developer ? (typeof sol.developer === 'object' ? sol.developer._id : sol.developer).toString() : '';
      if (devId && leaderboardMap[devId]) {
        leaderboardMap[devId].totalVouches += (sol.vouchCount || 0);
        leaderboardMap[devId].solutionCount += 1;
        if (sol.status === 'deployed') {
          leaderboardMap[devId].hasDeployedBadge = true;
        }
      }
    });

    // Convert to array and sort by totalVouches DESC, then solutionCount DESC
    const leaderboard = Object.values(leaderboardMap).sort((a: any, b: any) => {
      if (b.totalVouches !== a.totalVouches) {
        return b.totalVouches - a.totalVouches;
      }
      return b.solutionCount - a.solutionCount;
    });

    return res.json({
      success: true,
      leaderboard
    });
  } catch (error) {
    next(error);
  }
}
