import 'dotenv/config';
import { connectDB } from './config/database';
import logger from './config/logger';
import app from './app';

connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
  logger.info(`📚 API Docs available at http://localhost:${PORT}/api-docs`);
});
