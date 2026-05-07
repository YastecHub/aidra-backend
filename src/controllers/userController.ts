import { Response } from 'express';
import { AuthRequest } from '../types';
import * as userService from '../services/userService';
import { uploadBase64KYCToCloudinary, uploadKYCFilesToCloudinary } from '../middleware/upload';

export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await userService.getProfile(req.user!.userId);
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await userService.updateProfile(req.user!.userId, req.body);
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

export const changePassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { oldPassword, newPassword } = req.body;
    const result = await userService.changePassword(req.user!.userId, oldPassword, newPassword);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

export const submitKYC = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    let documentPaths: string[] = [];

    const hasMultipart = !!req.files && (Array.isArray(req.files)
      ? req.files.length > 0
      : Object.keys(req.files).length > 0);

    if (hasMultipart) {
      const fileArray = Array.isArray(req.files) ? req.files : Object.values(req.files!).flat();
      documentPaths = await uploadKYCFilesToCloudinary(fileArray as Express.Multer.File[]);
    } else if (Array.isArray(req.body?.documents) && req.body.documents.length > 0) {
      documentPaths = await uploadBase64KYCToCloudinary(req.body.documents);
    } else {
      res.status(400).json({ error: 'At least one document is required' });
      return;
    }

    const result = await userService.submitKYC(req.user!.userId, documentPaths);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

export const getKYCStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const status = await userService.getKYCStatus(req.user!.userId);
    res.json(status);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};
