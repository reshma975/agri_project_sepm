import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { connectDB } from './config/db.js';
import { seedDatabase } from './seed/seedDatabase.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import farmerRoutes from './routes/farmerRoutes.js';
import shopRoutes from './routes/shopRoutes.js';
import productRoutes from './routes/productRoutes.js';
import officerRoutes from './routes/officerRoutes.js';
import weatherRoutes from './routes/weatherRoutes.js';
import govtUpdatesRoutes from './routes/govtUpdatesRoutes.js';
import assistantRoutes from './routes/assistantRoutes.js';

import { notFound, errorHandler } from './middleware/errorMiddleware.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    platform: 'FarmSetu API',
    tagline: 'Connecting Farmers, Markets & Government',
    time: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/farmers', farmerRoutes);
app.use('/api/shops', shopRoutes);
app.use('/api/products', productRoutes);
app.use('/api/officer', officerRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/government-updates', govtUpdatesRoutes);
app.use('/api/assistant', assistantRoutes);

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Start Server
const startServer = async () => {
  try {
    await connectDB();
    await seedDatabase();

    app.listen(PORT, () => {
      console.log(`🌾 FarmSetu Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error(`❌ Server startup failed: ${error.message}`);
    process.exit(1);
  }
};

startServer();
