import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';

export const candidatesRouter = Router();

candidatesRouter.get('/', async (req: Request, res: Response) => {
  try {
    const search = req.query.search as string | undefined;
    const status = req.query.status as string | undefined;
    const stage = req.query.stage as string | undefined;
    const page = (req.query.page as string) || '1';
    const pageSize = (req.query.pageSize as string) || '15';
    const sortBy = (req.query.sortBy as string) || 'createdAt';
    const sortOrder = (req.query.sortOrder as string) || 'desc';

    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { jobTitle: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) where.status = status;
    if (stage) where.stage = stage;

    const pageNum = parseInt(page);
    const size = parseInt(pageSize);
    const skip = (pageNum - 1) * size;

    const [candidates, total] = await Promise.all([
      prisma.candidate.findMany({
        where,
        include: {
          owner: {
            select: { id: true, email: true, firstName: true, lastName: true, avatar: true },
          },
          assignments: {
            include: {
              job: true,
              company: true,
            },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: size,
      }),
      prisma.candidate.count({ where }),
    ]);

    res.json({
      data: candidates,
      total,
      page: pageNum,
      pageSize: size,
      totalPages: Math.ceil(total / size),
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch candidates' });
  }
});

candidatesRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const candidate = await prisma.candidate.findUnique({
      where: { id },
      include: {
        owner: {
          select: { id: true, email: true, firstName: true, lastName: true, avatar: true },
        },
        assignments: {
          include: { job: true, company: true },
        },
        notes: {
          include: { author: { select: { firstName: true, lastName: true } } },
          orderBy: { createdAt: 'desc' },
        },
        tasks: {
          include: { assignee: { select: { firstName: true, lastName: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!candidate) {
      res.status(404).json({ error: 'Candidate not found' });
      return;
    }
    res.json(candidate);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch candidate' });
  }
});

candidatesRouter.post('/', async (req: Request, res: Response) => {
  try {
    const candidate = await prisma.candidate.create({
      data: req.body,
    });
    res.status(201).json(candidate);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create candidate' });
  }
});

candidatesRouter.put('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const candidate = await prisma.candidate.update({
      where: { id },
      data: req.body,
    });
    res.json(candidate);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update candidate' });
  }
});

candidatesRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    await prisma.candidate.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete candidate' });
  }
});
