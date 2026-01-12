import { Response } from 'express';
import { prisma } from '../db/prisma';
import { AuthRequest } from '../middleware/auth';

export async function searchJobs(req: AuthRequest, res: Response) {
  try {
    const { q, location, workMode, jobType, experienceLevel, minSalary, maxSalary } = req.query;
    
    // Pagination
    const page = Math.max(1, Number(req.query.page ?? 1));
    const limit = Math.min(50, Math.max(1, Number(req.query.limit ?? 10)));
    const skip = (page - 1) * limit;

    // Filters (same as jobs listing)
    const where: any = { status: 'Active' };

    if (q) {
      where.OR = [
        { title: { contains: String(q), mode: 'insensitive' } },
        { company: { contains: String(q), mode: 'insensitive' } },
        { description: { contains: String(q), mode: 'insensitive' } },
        { requiredSkills: { hasSome: [String(q)] } },
      ];
    }

    if (location) where.location = { contains: String(location), mode: 'insensitive' };
    if (workMode) where.workMode = String(workMode).toUpperCase();
    if (jobType) where.jobType = String(jobType).toUpperCase();
    if (experienceLevel) where.experienceLevel = String(experienceLevel).toUpperCase();

    if (minSalary || maxSalary) {
      where.salaryMin = {};
      if (minSalary) where.salaryMin.gte = Number(minSalary);
      if (maxSalary) where.salaryMin.lte = Number(maxSalary);
    }

    const total = await prisma.job.count({ where });
    const jobs = await prisma.job.findMany({
      where,
      orderBy: { postedDate: 'desc' },
      skip,
      take: limit,
    });

    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: jobs,
      pagination: { currentPage: page, totalPages, total, limit },
    });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
}

export async function searchUsers(req: AuthRequest, res: Response) {
  try {
    const { q, skills } = req.query;  // Removed location (doesn't exist on User)
    const page = Math.max(1, Number(req.query.page ?? 1));
    const limit = Math.min(50, Math.max(1, Number(req.query.limit ?? 10)));
    const skip = (page - 1) * limit;

    const where: any = {};

    if (q) {
      where.OR = [
        { fullName: { contains: String(q), mode: 'insensitive' } },
        { email: { contains: String(q), mode: 'insensitive' } },
      ];
    }

    if (skills) {
      where.skills = { hasSome: [String(skills)] };
    }

    const total = await prisma.user.count({ where });
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        fullName: true,
        email: true,
        skills: true,
        resumeUrl: true,
        preferences: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: 'desc' },
      skip,
      take: limit,
    });

    res.json({
      success: true,
      data: users,
      pagination: { currentPage: page, totalUsers: total, limit },
    });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
}