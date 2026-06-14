import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';

export const notesRouter = Router();

notesRouter.get('/candidate/:candidateId', async (req: Request, res: Response) => {
  try {
    const candidateId = req.params.candidateId as string;
    const notes = await prisma.note.findMany({
      where: { candidateId },
      include: {
        author: { select: { firstName: true, lastName: true, avatar: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
});

notesRouter.post('/', async (req: Request, res: Response) => {
  try {
    const note = await prisma.note.create({
      data: req.body,
      include: {
        author: { select: { firstName: true, lastName: true, avatar: true } },
      },
    });
    res.status(201).json(note);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create note' });
  }
});

notesRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    await prisma.note.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete note' });
  }
});
