import nextConnect from 'next-connect';
import dbConnect from 'core/config/db.config';
import leadsController from 'core/controllers/leads.controller';
import { authenticateTokenMiddleware } from 'core/middleware/auth.middleware';
import multer from 'multer';

const handler = nextConnect();

// Use dbConnect middleware
handler.use(async (req, res, next) => {
  try {
    await dbConnect(req, res, next);
    next();
  } catch (err) {
    next(err);
  }
});

// Use authentication middleware
handler.use((req, res, next) => {
  authenticateTokenMiddleware(req, res, (err) => {
    if (err) {
      return next(err);
    }
    next();
  });
});

// Configure multer for memory storage
const uploadMiddleware = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 40 * 1024 * 1024, // 40MB limit
  },
});

// Support both POST and PUT methods for both JSON and file uploads
const fileFields = [
  // Image fields
  { name: 'car_front', maxCount: 1 },
  { name: 'car_back', maxCount: 1 },
  { name: 'car_left', maxCount: 1 },
  { name: 'car_right', maxCount: 1 },
  { name: 'car_interior_front', maxCount: 1 },
  { name: 'car_frontside_left', maxCount: 1 },
  { name: 'car_frontside_right', maxCount: 1 },
  { name: 'car_backside_right', maxCount: 1 },
  { name: 'car_backside_left', maxCount: 1 },
  { name: 'car_interior_back', maxCount: 1 },
  { name: 'odometer', maxCount: 1 },
  // PDF fields
  { name: 'rc', maxCount: 1 },
  { name: 'puc', maxCount: 1 },
  { name: 'insurance', maxCount: 1 },
  { name: 'service_history', maxCount: 1 }
];

// PUT method handler
handler.put(
  uploadMiddleware.fields(fileFields),
  (req, res, next) => {
    leadsController.updateLeadVehicle(req, res, next);
  }
);

export const config = {
  api: {
    bodyParser: false, // Disable bodyParser for file uploads
  },
};

export default handler;
