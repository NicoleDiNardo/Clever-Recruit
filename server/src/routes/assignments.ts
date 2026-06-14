import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';

export const assignmentsRouter = Router();

assignmentsRouter.get('/candidate/:candidateId', async (req: Request, res: Response) => {
  try {
    const candidateId = req.params.candidateId as string;
    const assignments = await prisma.assignment.findMany({
      where: { candidateId },
      include: {
        job: true,
        company: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch assignments' });
  }
});

assignmentsRouter.post('/', async (req: Request, res: Response) => {
  try {
    const assignment = await prisma.assignment.create({
      data: req.body,
      include: {
        job: true,
        company: true,
        candidate: true,
      },
    });
    res.status(201).json(assignment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create assignment' });
  }
});

assignmentsRouter.put('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const assignment = await prisma.assignment.update({
      where: { id },
      data: req.body,
      include: {
        job: true,
        company: true,
      },
    });
    res.json(assignment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update assignment' });
  }
});

assignmentsRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    await prisma.assignment.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete assignment' });
  }
});
