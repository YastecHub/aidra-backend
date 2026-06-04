import request from 'supertest';
import app from '../app';

describe('Health Check', () => {
  it('should return OK status', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      success: true,
      statusCode: 200,
      message: 'Service is healthy',
      data: {
        status: 'OK'
      }
    });
    expect(res.body.timestamp).toEqual(expect.any(String));
  });
});
