import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import morgan from 'morgan';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import authRoutes from './routes/auth';
import historyRoutes from './routes/history';
import usersRoutes from './routes/users';
import docsRoutes from './routes/docs';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

console.log('Env PORT:', process.env.PORT);
console.log('Env MONGODB_URI:', process.env.MONGODB_URI ? 'set' : 'missing');

console.log('Backend bootstrap starting...');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI as string;

app.use(helmet());
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://127.0.0.1:5173'
  ],
  credentials: true
}));
app.use(express.json({ limit: '2mb' }));
app.use(mongoSanitize());
app.use(morgan('combined'));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
});
app.use('/api/', limiter);

app.get('/api/health', (_req: express.Request, res: express.Response) => {
  const state = mongoose.connection.readyState; // 1 == connected
  res.json({ status: 'ok', db: state === 1 ? 'connected' : 'disconnected' });
});

// Fast-fail if DB is not connected to avoid slow 10s buffering timeouts
app.use((req, res, next) => {
  if (req.path.startsWith('/api/health')) return next();
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ error: 'Database not connected' });
  }
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/docs', docsRoutes);

async function start() {
  async function connect() {
    try {
      await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
      console.log('Connected to MongoDB');
    } catch (err) {
      console.error('MongoDB connection failed; retrying in 5s:', err);
      await new Promise((r) => setTimeout(r, 5000));
      return connect();
    }
  }

  await connect();

  const server = app.listen(Number(PORT), '0.0.0.0', () => {
    const addr = server.address();
    const bound = typeof addr === 'string' ? addr : `${addr?.address}:${addr?.port}`;
    console.log(`Server starting on ${bound}`);
  });
  server.on('error', (err) => {
    console.error('HTTP server error:', err);
  });
}

start();