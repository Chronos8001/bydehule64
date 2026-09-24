import cors from 'cors';
import express from 'express';
import { chaos } from './middleware/chaos.js';
import { errorHandler, notFound } from './middleware/errors.js';
import { scoresRouter } from './routes/scores.js';
import { statsRouter } from './routes/stats.js';

const app = express();
const PORT = Number(process.env.PORT ?? 3001);

// En production, mettez ALLOWED_ORIGINS="https://mon-jeu.vercel.app"
const allowed = process.env.ALLOWED_ORIGINS?.split(',').map((o) => o.trim());
app.use(cors({ origin: allowed && allowed.length > 0 ? allowed : true }));

app.use(express.json({ limit: '16kb' }));
app.set('trust proxy', 1);
app.use(chaos);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.use('/api/scores', scoresRouter);
app.use('/api', statsRouter);

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`API de scores démarrée sur http://localhost:${PORT}/api`);
});
