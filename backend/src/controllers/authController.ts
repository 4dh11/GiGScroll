import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../db/prisma';
import { JWT_SECRET, JWT_EXPIRES_IN, BCRYPT_ROUNDS } from '../config/authConfig';

function signToken(userId: string) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export async function registerUser(req: Request, res: Response) {
  try {
    const { email, password, fullName, skills } = req.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        fullName,
        skills: skills ?? [],
      },
    });

    const token = signToken(user.id);

    res.status(201).json({
      success: true,
      data: {
        user: { id: user.id, email: user.email, fullName: user.fullName, skills: user.skills },
        token,
      },
    });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
}

export async function loginUser(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = signToken(user.id);

    res.json({
      success: true,
      data: {
        user: { id: user.id, email: user.email, fullName: user.fullName, skills: user.skills },
        token,
      },
    });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
}
