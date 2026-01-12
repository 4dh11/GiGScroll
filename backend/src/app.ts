import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/authRoutes';
import jobRoutes from './routes/jobRoutes';
import applicationRoutes from './routes/applicationRoutes';
import bookmarkRoutes from './routes/bookmarkRoutes';
import userRoutes from './routes/userRoutes';
import searchRoutes from './routes/searchRoutes';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/v1/users', userRoutes);

app.get('/api/v1/health', (_req, res) => {
  res.json({ ok: true, service: 'GigScroll API' });
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/jobs', jobRoutes);
app.use('/api/v1/applications', applicationRoutes);
app.use('/api/v1/bookmarks', bookmarkRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/search', searchRoutes);

app.use((_req, res) => res.status(404).json({ error: 'Route not found' }));

app.use((err: any, _req: any, res: any, _next: any) => {
  console.error(err);
  res.status(err?.status || 500).json({ error: err?.message || 'Internal server error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ GigScroll API running at http://localhost:${PORT}`));
