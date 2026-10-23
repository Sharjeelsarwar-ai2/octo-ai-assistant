import express from 'express';
import cors from 'cors';
import config from './config/env.js';
import { connectDB, isMongoConnected } from './config/db.js';
import chatRoutes from './routes/chatRoutes.js';
import conversationRoutes from './routes/conversationRoutes.js';
import configRoutes from './routes/configRoutes.js';
import { notFoundHandler, globalErrorHandler } from './middlewares/errorHandler.js';

const app = express();

// CORS configuration supporting Vite dev server and custom origins
const allowedOrigins = new Set([
  config.clientOrigin,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000'
].filter(Boolean));

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g., mobile apps, curl, postman)
      if (!origin || allowedOrigins.has(origin)) {
        return callback(null, true);
      }
      // A false CORS response blocks cross-origin browser access without breaking
      // same-origin requests (which do not require CORS response headers).
      return callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

// Vercel functions are stateless: require durable MongoDB storage in production.
app.use('/api', async (req, res, next) => {
  if (process.env.NODE_ENV !== 'production') return next();
  try {
    const connected = isMongoConnected() || await connectDB();
    if (!connected) {
      return res.status(503).json({
        success: false,
        message: 'Persistent database is unavailable. Check MONGODB_URI and Atlas network access.'
      });
    }
    return next();
  } catch (error) {
    console.error('Production database initialization failed:', error.message);
    return res.status(503).json({ success: false, message: 'Persistent database is unavailable.' });
  }
});

// Root welcome route
app.get('/', (req, res) => {
  res.json({ app: 'OCTO AI', status: 'online', apiDocs: '/api/status' });
});

// API Routes
app.use('/api/chat', chatRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api', configRoutes);

// Error handlers
app.use(notFoundHandler);
app.use(globalErrorHandler);

// Local development only. On Vercel, the platform invokes the exported app directly.
if (process.env.VERCEL !== '1') {
  connectDB().then(() => {
    app.listen(config.port, () => {
      console.log(`OCTO AI API listening on http://localhost:${config.port}`);
      console.log(`Configured AI provider: ${config.aiProvider}`);
    });
  }).catch((error) => {
    console.error('Backend startup failed:', error);
    process.exitCode = 1;
  });
}

export default app;
