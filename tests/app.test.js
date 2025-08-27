import request from 'supertest';
let app;
let sequelize;
beforeAll(async () => {
  // Ensure test env BEFORE loading modules that read NODE_ENV
  process.env.NODE_ENV = 'test';
  const db = await import('../dist/src/config/database.js');
  sequelize = db.sequelize;
  const srv = await import('../dist/src/server.js');
  app = srv.default || srv.app || srv;
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  await sequelize.close();
});

describe('Auth and analysis flow', () => {
  let token;

  it('registers a user', async () => {
    const res = await request(app).post('/api/auth/register').send({
      username: 'alice',
      email: 'alice@example.com',
      password: 'password123',
    });
    expect(res.status).toBe(201);
    expect(res.body.token).toBeTruthy();
    token = res.body.token;
  });

  it('logs in the user', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'alice@example.com',
      password: 'password123',
    });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeTruthy();
    token = res.body.token;
  });

  it('analyzes a product', async () => {
    const res = await request(app)
      .post('/api/products/analyze')
      .set('Authorization', `Bearer ${token}`)
      .send({ productUrl: 'https://store.example.com/products/123' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('productName');
    expect(res.body).toHaveProperty('averageRating');
    expect(res.body).toHaveProperty('totalReviews');
    expect(res.body).toHaveProperty('sentimentSummary');
    expect(res.body).toHaveProperty('sampleInsights');
  });

  it('gets dashboard summary', async () => {
    const res = await request(app)
      .get('/api/dashboard/summary')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.items)).toBe(true);
  });
});
