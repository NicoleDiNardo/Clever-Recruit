import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';

export const tasksRouter = Router();

tasksRouter.get('/candidate/:candidateId', async (req: Request, res: Response) => {
  try {
    const candidateId = req.params.candidateId as string;
    const tasks = await prisma.task.findMany({
      where: { candidateId },
      include: {
        assignee: { select: { firstName: true, lastName: true, avatar: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

tasksRouter.post('/', async (req: Request, res: Response) => {
  try {
    const task = await prisma.task.create({
      data: req.body,
      include: {
        assignee: { select: { firstName: true, lastName: true, avatar: true } },
      },
    });
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create task' });
  }
});

tasksRouter.put('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const task = await prisma.task.update({
      where: { id },
      data: req.body,
    });
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update task' });
  }
});

tasksRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    await prisma.task.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete task' });
  }
});
