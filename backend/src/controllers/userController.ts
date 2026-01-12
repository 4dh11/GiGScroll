import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { prisma } from '../db/prisma';
import { extractSkillsFromResume } from '../utils/resumeParser';

// Extend AuthRequest to include multer's file property
interface AuthRequestWithFile extends AuthRequest {
  file?: Express.Multer.File;
}

export async function uploadResume(req: AuthRequestWithFile, res: Response) {
  try {
    const userId = req.userId!;
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const resumePath = req.file.path;
    const resumeUrl = `/${req.file.path}`;

    // Extract skills from resume (whatever can be found)
    const skills = await extractSkillsFromResume(resumePath);

    // Update user with resume URL and extracted skills
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        resumeUrl,
        skills,
      },
    });

    res.json({
      success: true,
      message: 'Resume uploaded. Skills auto-detected - you can edit them via update profile.',
      data: {
        resumeUrl: user.resumeUrl,
        skills: user.skills,
      },
    });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
}

export async function getProfile(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId!;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        skills: true,
        resumeUrl: true,
        preferences: true,
      },
    });
    res.json({ success: true, data: user });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
}

export async function updateProfile(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId!;
    const { fullName, skills, preferences } = req.body;

    // Handle resume upload safely
    let resumeUrl = req.body.resumeUrl as string | undefined;
    if (req.file) {  // ✅ Safe check
      resumeUrl = `/uploads/${req.file.filename}`;
    }

    const updateData: any = {};
    if (fullName !== undefined) updateData.fullName = fullName;
    if (skills && Array.isArray(skills)) updateData.skills = skills;
    if (preferences !== undefined) updateData.preferences = preferences;

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        fullName: true,
        skills: true,
        resumeUrl: true,
        preferences: true,
      },
    });

    res.json({ success: true, data: user });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
}
