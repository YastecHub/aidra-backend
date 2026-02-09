import 'dotenv/config';
import { connectDB } from './config/database';
import logger from './config/logger';
import app from './app';

connectDB();

const PORT = process.env.PORT || 5000;
const isProduction = process.env.NODE_ENV === 'production' || process.env.RENDER === 'true';
const BASE_URL = isProduction
  ? 'https://aidra-backend-u8qq.onrender.com'
  : `http://localhost:${PORT}`;

app.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
  logger.info(`📚 API Docs available at ${BASE_URL}/api-docs`);
});
