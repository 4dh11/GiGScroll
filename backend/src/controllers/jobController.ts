import { Response } from 'express';
import { prisma } from '../db/prisma';
import { AuthRequest } from '../middleware/auth';
import { computeJobMatch } from '../utils/matcher';

// 1. LIST JOBS (Your original complex filter logic)
export async function listJobs(req: AuthRequest, res: Response) {
  try {
    const { q, location, workMode, jobType, minSalary, maxSalary } = req.query;

    const page = Math.max(1, Number(req.query.page ?? 1));
    const limit = Math.min(50, Math.max(1, Number(req.query.limit ?? 10))); 
    const skip = (page - 1) * limit;

    const where: any = { status: 'Active' };

    if (q) {
      where.OR = [
        { title: { contains: String(q), mode: 'insensitive' } },
        { company: { contains: String(q), mode: 'insensitive' } },
        { description: { contains: String(q), mode: 'insensitive' } },
      ];
    }

    if (location) where.location = { contains: String(location), mode: 'insensitive' };
    if (workMode) where.workMode = String(workMode).toUpperCase();
    if (jobType) where.jobType = String(jobType).toUpperCase();

    if (minSalary || maxSalary) {
      where.AND = [];
      if (minSalary) where.AND.push({ salaryMin: { gte: Number(minSalary) } });
      if (maxSalary) where.AND.push({ salaryMax: { lte: Number(maxSalary) } });
    }

    const totalJobs = await prisma.job.count({ where });

    const jobs = await prisma.job.findMany({
      where,
      orderBy: { postedDate: 'desc' },
      skip,
      take: limit,
    });

    const totalPages = Math.max(1, Math.ceil(totalJobs / limit));

    res.json({
      success: true,
      data: jobs,
      pagination: {
        currentPage: page,
        totalPages,
        totalJobs,
        limit,
      },
    });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
}

// 2. GET NEXT JOB (Your original matching logic)
export async function getNextJob(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId!;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { skills: true, preferences: true, declinedJobs: true },
    });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const applied = await prisma.application.findMany({
      where: { userId },
      select: { jobId: true },
    });
    const appliedIds = applied.map(a => a.jobId);

    const candidates = await prisma.job.findMany({
      where: {
        status: 'Active',
        id: { notIn: [...(user.declinedJobs ?? []), ...appliedIds] },
      },
      orderBy: { postedDate: 'desc' },
      take: 50,
    });

    if (candidates.length === 0) {
      return res.json({ success: true, data: null });
    }

    let best = candidates[0];
    let bestScore = -1;
    let bestReasons: string[] = [];

    for (const job of candidates) {
      const r = computeJobMatch({
        userSkills: user.skills ?? [],
        preferences: (user.preferences as any) ?? null,
        job: {
          title: job.title,
          location: (job as any).location ?? null,
          workMode: (job as any).workMode ?? null,
          jobType: (job as any).jobType ?? null,
          requiredSkills: (job as any).requiredSkills ?? [],
          salaryMin: (job as any).salaryMin ?? null,
          salaryMax: (job as any).salaryMax ?? null,
        },
      });

      if (r.score > bestScore) {
        best = job;
        bestScore = r.score;
        bestReasons = r.reasons;
      }
    }

    return res.json({
      success: true,
      data: {
        job: best,
        matchScore: bestScore,
        reasons: bestReasons,
      },
    });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
}

// 3. SWIPE RIGHT (Your original code)
export async function swipeRightOnJob(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId!;
    const jobId = String(req.params.jobId);

    const application = await prisma.application.upsert({
      where: { userId_jobId: { userId, jobId } },
      create: { userId, jobId, status: 'APPLIED' }, // Ensure status is set
      update: {},
    });

    res.status(201).json({ success: true, data: application });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
}

// 4. SWIPE LEFT (Your original code - Pushes to array)
export async function swipeLeftOnJob(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId!;
    const jobId = String(req.params.jobId);

    await prisma.user.update({
      where: { id: userId },
      data: { declinedJobs: { push: jobId } },
    });

    res.status(204).end();
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
}

// 5. MATCH SCORE (Your original code)
export async function getJobMatchScore(req: AuthRequest, res: Response) {
  const userId = req.userId!;
  const jobId = String(req.params.jobId);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { skills: true, preferences: true },
  });
  if (!user) return res.status(404).json({ error: 'User not found' });

  const job = await prisma.job.findUnique({ where: { id: jobId } });
  if (!job) return res.status(404).json({ error: 'Job not found' });

  const r = computeJobMatch({
    userSkills: user.skills ?? [],
    preferences: (user.preferences as any) ?? null,
    job: job as any,
  });

  res.json({ success: true, data: r });
}

// 6. ✅ CORRECTED RECOVER FUNCTION
// Since you use 'declinedJobs' array, we just need to empty that array.
export async function recoverRejectedJobs(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId!; // Using strict ID from your AuthRequest

    // Update the user to clear the declinedJobs array
    await prisma.user.update({
      where: { id: userId },
      data: {
        declinedJobs: {
          set: [], // This wipes the history cleanly
        },
      },
    });

    res.json({
      success: true,
      message: 'Rejected jobs history cleared.',
    });
  } catch (error) {
    console.error('Error recovering jobs:', error);
    res.status(500).json({ success: false, error: 'Failed to recover jobs' });
  }
}