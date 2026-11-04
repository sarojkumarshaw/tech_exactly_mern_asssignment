import request from 'supertest';
import app from '../src/app.js';
import { User } from '../src/models/user.model.js';
import { Post } from '../src/models/post.model.js';
import './setup.js';

describe('RBAC & Admin Panel Integration Tests', () => {
  let adminToken;
  let userToken;
  let regularUserId;

  beforeEach(async () => {
    await Post.deleteMany({});
    await User.deleteMany({});

    // First user becomes admin automatically per AuthService logic
    const adminRes = await request(app).post('/api/v1/auth/register').send({
      name: 'System Admin',
      email: 'admin_test@test.com',
      password: 'AdminPassword123!'
    });
    adminToken = adminRes.body.data.tokens.accessToken;

    // Second user becomes regular user
    const userRes = await request(app).post('/api/v1/auth/register').send({
      name: 'Regular Member',
      email: 'regular_test@test.com',
      password: 'UserPassword123!'
    });
    userToken = userRes.body.data.tokens.accessToken;
    regularUserId = userRes.body.data.user.id;
  });

  test('GET /api/v1/admin/stats - should forbid regular user with 403', async () => {
    const res = await request(app)
      .get('/api/v1/admin/stats')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  test('GET /api/v1/admin/stats - should permit admin user with metrics', async () => {
    const res = await request(app)
      .get('/api/v1/admin/stats')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.stats.totalUsers).toBe(2);
  });

  test('PATCH /api/v1/admin/users/:id/role - admin can promote regular user to admin', async () => {
    const res = await request(app)
      .patch(`/api/v1/admin/users/${regularUserId}/role`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ role: 'admin' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.role).toBe('admin');
  });

  test('Admin can restore a soft-deleted post', async () => {
    // Create a post as regular user
    const createRes = await request(app)
      .post('/api/v1/posts')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        title: 'Post to be soft deleted then restored',
        content: 'Content that will be soft deleted then restored by admin.'
      });
    const postId = createRes.body.data._id;

    // Soft delete it
    await request(app)
      .delete(`/api/v1/posts/${postId}`)
      .set('Authorization', `Bearer ${userToken}`);

    // Admin restores it
    const restoreRes = await request(app)
      .patch(`/api/v1/posts/${postId}/restore`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(restoreRes.status).toBe(200);
    expect(restoreRes.body.success).toBe(true);
    expect(restoreRes.body.data.isDeleted).toBe(false);
  });
});
