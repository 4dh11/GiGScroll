import { Response } from 'express';
import { prisma } from '../db/prisma';
import { AuthRequest } from '../middleware/auth';
import { ApplicationStatus } from '@prisma/client';

export async function getUserApplications(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId!;
    const statusParam = req.query.status ? String(req.query.status).toUpperCase() : null;

    const where: { userId: string; status?: ApplicationStatus } = { userId };

    // Optional status filter
    if (statusParam) {
      const allowed = Object.values(ApplicationStatus);
      if (!allowed.includes(statusParam as ApplicationStatus)) {
        return res.status(400).json({
          error: `Invalid status. Allowed: ${allowed.join(', ')}`,
        });
      }
      where.status = statusParam as ApplicationStatus;
    }

    const applications = await prisma.application.findMany({
      where,
      include: { job: true },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: applications });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
}

export async function updateApplicationStatus(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId!;
    const applicationId = String(req.params.applicationId);
    const statusParam = String(req.body.status ?? '').toUpperCase();

    const allowed = Object.values(ApplicationStatus);
    if (!allowed.includes(statusParam as ApplicationStatus)) {
      return res.status(400).json({
        error: `Invalid status. Allowed: ${allowed.join(', ')}`,
      });
    }

    // Ownership check
    const app = await prisma.application.findUnique({
      where: { id: applicationId },
    });

    if (!app) return res.status(404).json({ error: 'Application not found' });
    if (app.userId !== userId) return res.status(403).json({ error: 'Not allowed' });

    const updated = await prisma.application.update({
      where: { id: applicationId },
      data: { status: statusParam as ApplicationStatus },
      include: { job: true },
    });

    res.json({ success: true, data: updated });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
}
