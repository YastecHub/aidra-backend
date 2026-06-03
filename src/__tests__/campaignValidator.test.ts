import express, { NextFunction, Request, Response } from 'express';
import request from 'supertest';
import { validate } from '../middleware/validate';
import { createCampaignValidator } from '../validators/campaignValidator';

const app = express();

app.use(express.json({ limit: '2mb' }));

app.post('/campaigns', createCampaignValidator, validate, (req: Request, res: Response) => {
  res.status(204).send();
});

app.post(
  '/campaigns/file',
  (req: Request, res: Response, next: NextFunction) => {
    req.file = {
      fieldname: 'image',
      originalname: 'campaign.jpg',
      encoding: '7bit',
      mimetype: 'image/jpeg',
      size: 12,
      buffer: Buffer.from('test'),
      stream: undefined as never,
      destination: '',
      filename: '',
      path: ''
    };
    next();
  },
  createCampaignValidator,
  validate,
  (req: Request, res: Response) => {
    res.status(204).send();
  }
);

describe('Campaign image validation', () => {
  const baseCampaign = {
    title: 'Water project',
    description: 'Clean water for the community',
    goalAmount: 500
  };

  it('accepts a base64 image data URI', async () => {
    const res = await request(app)
      .post('/campaigns')
      .send({
        ...baseCampaign,
        image: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQABAQ=='
      });

    expect(res.status).toBe(204);
  });

  it('accepts an uploaded campaign image file', async () => {
    const res = await request(app)
      .post('/campaigns/file')
      .send({
        ...baseCampaign
      });

    expect(res.status).toBe(204);
  });

  it('rejects a missing campaign image', async () => {
    const res = await request(app)
      .post('/campaigns')
      .send(baseCampaign);

    expect(res.status).toBe(400);
    expect(res.body.errors[0].msg).toBe('Image is required');
  });
});
