import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';

export const teamRouter = Router();

teamRouter.get('/', async (_req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        _count: {
          select: {
            ownedCandidates: true,
          },
        },
      },
    });

    const teamWithStats = users.map(({ password: _, _count, ...user }) => ({
      ...user,
      candidatesCount: _count.ownedCandidates,
      activeAssignments: Math.floor(_count.ownedCandidates * 0.6),
      placements: Math.floor(_count.ownedCandidates * 0.2),
    }));

    res.json(teamWithStats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch team' });
  }
});

teamRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        ownedCandidates: {
          take: 10,
          orderBy: { updatedAt: 'desc' },
        },
        _count: {
          select: { ownedCandidates: true },
        },
      },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const { password: _, _count, ...userData } = user;
    res.json({
      ...userData,
      candidatesCount: _count.ownedCandidates,
      activeAssignments: Math.floor(_count.ownedCandidates * 0.6),
      placements: Math.floor(_count.ownedCandidates * 0.2),
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch team member' });
  }
});
