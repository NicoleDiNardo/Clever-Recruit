import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';

export const dashboardRouter = Router();

dashboardRouter.get('/', async (_req: Request, res: Response) => {
  try {
    const [totalCandidates, activeJobs, candidatesByStage] = await Promise.all([
      prisma.candidate.count(),
      prisma.job.count({ where: { status: 'open' } }),
      prisma.candidate.groupBy({
        by: ['stage'],
        _count: { id: true },
      }),
    ]);

    const interviewsScheduled = candidatesByStage.find(
      (s) => s.stage === 'interview'
    )?._count.id || 0;

    const placements = candidatesByStage.find(
      (s) => s.stage === 'hired'
    )?._count.id || 0;

    const pipelineData = [
      { stage: 'Applied', count: totalCandidates },
      { stage: 'Screening', count: Math.floor(totalCandidates * 0.5) },
      { stage: 'Interview', count: interviewsScheduled },
      { stage: 'Assessment', count: Math.floor(interviewsScheduled * 0.5) },
      { stage: 'Offer', count: Math.floor(interviewsScheduled * 0.2) },
      { stage: 'Hired', count: placements },
    ];

    const recentCandidates = await prisma.candidate.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { owner: { select: { firstName: true, lastName: true, avatar: true } } },
    });

    const recentActivity = recentCandidates.map((c) => ({
      id: c.id,
      type: 'candidate_added',
      description: `${c.firstName} ${c.lastName} was added as a new candidate`,
      timestamp: c.createdAt.toISOString(),
      user: c.owner ? { firstName: c.owner.firstName, lastName: c.owner.lastName, avatar: c.owner.avatar } : undefined,
    }));

    res.json({
      totalCandidates,
      activeJobs,
      interviewsScheduled,
      placements,
      recentActivity,
      pipelineData,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});
