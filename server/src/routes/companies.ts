import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';

export const companiesRouter = Router();

companiesRouter.get('/', async (req: Request, res: Response) => {
  try {
    const search = req.query.search as string | undefined;
    const industry = req.query.industry as string | undefined;
    const page = (req.query.page as string) || '1';
    const pageSize = (req.query.pageSize as string) || '20';

    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { industry: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (industry) where.industry = industry;

    const pageNum = parseInt(page);
    const size = parseInt(pageSize);
    const skip = (pageNum - 1) * size;

    const [companies, total] = await Promise.all([
      prisma.company.findMany({
        where,
        include: {
          _count: { select: { jobs: true } },
        },
        orderBy: { name: 'asc' },
        skip,
        take: size,
      }),
      prisma.company.count({ where }),
    ]);

    res.json({
      data: companies,
      total,
      page: pageNum,
      pageSize: size,
      totalPages: Math.ceil(total / size),
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch companies' });
  }
});

companiesRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const company = await prisma.company.findUnique({
      where: { id },
      include: {
        jobs: { where: { status: 'open' } },
      },
    });
    if (!company) {
      res.status(404).json({ error: 'Company not found' });
      return;
    }
    res.json(company);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch company' });
  }
});

companiesRouter.post('/', async (req: Request, res: Response) => {
  try {
    const company = await prisma.company.create({ data: req.body });
    res.status(201).json(company);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create company' });
  }
});

companiesRouter.put('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const company = await prisma.company.update({
      where: { id },
      data: req.body,
    });
    res.json(company);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update company' });
  }
});

companiesRouter.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    await prisma.company.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete company' });
  }
});
