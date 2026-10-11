const express = require('express');
const request = require('supertest');
const rateLimit = require('express-rate-limit');

describe('Rate Limiter Middleware', () => {
  test('should return 429 when the request limit is exceeded', async () => {
    const app = express();

    app.use(
      rateLimit({
        windowMs: 60 * 1000,
        limit: 2,
        standardHeaders: false,
        legacyHeaders: false,
        message: {
          message: 'Too many requests',
        },
      })
    );

    app.get('/test', (req, res) => {
      res.status(200).json({ message: 'OK' });
    });

    await request(app).get('/test').expect(200);
    await request(app).get('/test').expect(200);

    const response = await request(app).get('/test');

    expect(response.status).toBe(429);
    expect(response.body.message).toBe('Too many requests');
  });
});