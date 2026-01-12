import { Response } from 'express';
import { prisma } from '../db/prisma';
import { AuthRequest } from '../middleware/auth';

export async function addBookmark(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId!;
    const jobId = String(req.params.jobId);

    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) return res.status(404).json({ error: 'Job not found' });

    const bm = await prisma.bookmark.upsert({
      where: { userId_jobId: { userId, jobId } },
      create: { userId, jobId },
      update: {},
    });

    res.status(201).json({ success: true, data: bm });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
}

export async function removeBookmark(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId!;
    const jobId = String(req.params.jobId);

    await prisma.bookmark.delete({
      where: { userId_jobId: { userId, jobId } },
    });

    res.status(204).end();
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
}

export async function getMyBookmarks(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId!;

    const items = await prisma.bookmark.findMany({
      where: { userId },
      include: { job: true },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: items });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
}
