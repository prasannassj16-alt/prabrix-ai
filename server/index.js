import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
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

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`[PRABRIX AI] Backend security service running on port ${port}`);
  });
}

export default app;
