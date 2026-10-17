import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createAuthMiddleware } from './middleware/authMiddleware.js';
import { createBuyerRoutes } from './routes/buyerRoutes.js';
import { createSellerRoutes } from './routes/sellerRoutes.js';
import { createAdminRoutes } from './routes/adminRoutes.js';
import { createNotificationRoutes } from './routes/notificationRoutes.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

const allowedOrigins = [
  'https://localhost',
  'capacitor://localhost',
  'http://localhost',
  'http://localhost:5173',
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Mobile native webviews, curl, or server-to-server requests have no origin header
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.includes(origin) ||
        origin.startsWith('https://localhost') ||
        origin.startsWith('capacitor://localhost') ||
        origin.startsWith('http://localhost:')
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);
app.use(express.json());

// Initialize backend auth middleware
const authMiddleware = createAuthMiddleware(null); // Passing null enables fallback demo verification

// Mount role-separated route modules
app.use('/api/buyer', createBuyerRoutes(authMiddleware));
app.use('/api/seller', createSellerRoutes(authMiddleware));
app.use('/api/admin', createAdminRoutes(authMiddleware));
app.use('/api/notifications', createNotificationRoutes(authMiddleware));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'PRABRIX AI Backend Auth & Security Gateway',
    time: new Date().toISOString(),
  });
});

// Serve frontend build from dist if available, or informative portal
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.resolve(__dirname, '../dist');

if (fs.existsSync(distPath) && fs.existsSync(path.join(distPath, 'index.html'))) {
  app.use(express.static(distPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>PRABRIX AI - Backend Service</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #060B18; color: #f8fafc; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; box-sizing: border-box; }
            .card { background: #0B132B; border: 1px solid #1C2541; padding: 36px; border-radius: 20px; max-width: 480px; width: 100%; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
            h1 { font-size: 24px; font-weight: 800; color: #fff; margin-bottom: 8px; }
            p { font-size: 14px; color: #94a3b8; line-height: 1.6; margin-bottom: 24px; }
            .badge { display: inline-block; background: rgba(20, 184, 166, 0.15); color: #2DD4BF; border: 1px solid rgba(20, 184, 166, 0.3); font-size: 12px; font-weight: bold; padding: 4px 12px; border-radius: 9999px; margin-bottom: 16px; }
            .btn { display: block; width: 100%; padding: 12px 20px; background: #0D9488; color: #fff; text-decoration: none; font-weight: bold; font-size: 14px; border-radius: 12px; transition: background 0.2s; box-sizing: border-box; margin-bottom: 12px; }
            .btn:hover { background: #14B8A6; }
            .btn-outline { background: transparent; border: 1px solid #334155; color: #cbd5e1; }
            .btn-outline:hover { background: #1E293B; }
          </style>
        </head>
        <body>
          <div class="card">
            <span class="badge">PORT 4000 ACTIVE</span>
            <h1>PRABRIX AI Backend Service</h1>
            <p>The Express security & auth gateway is online. For the interactive frontend interface, open the Vite dev server on port 5173.</p>
            <a class="btn" href="http://localhost:5173">Open PRABRIX AI App (Port 5173) &rarr;</a>
            <a class="btn btn-outline" href="/api/health">Check API Health Status</a>
          </div>
        </body>
      </html>
    `);
  });
}

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`[PRABRIX AI] Backend security service running on port ${port}`);
  });
}

export default app;
