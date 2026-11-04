import request from 'supertest';
import app from '../src/app.js';
import { User } from '../src/models/user.model.js';
import { Post } from '../src/models/post.model.js';
import './setup.js';

describe('Post Management & Soft Delete Integration Tests', () => {
  let userToken;
  let otherUserToken;
  let userId;
  let otherUserId;

  beforeEach(async () => {
    await Post.deleteMany({});
    await User.deleteMany({});

    // Register primary user
    const res1 = await request(app).post('/api/v1/auth/register').send({
      name: 'Author One',
      email: 'author1@test.com',
      password: 'Password123!'
    });
    userToken = res1.body.data.tokens.accessToken;
    userId = res1.body.data.user.id;

    // Register second user
    const res2 = await request(app).post('/api/v1/auth/register').send({
      name: 'Author Two',
      email: 'author2@test.com',
      password: 'Password123!'
    });
    otherUserToken = res2.body.data.tokens.accessToken;
    otherUserId = res2.body.data.user.id;
  });

  test('POST /api/v1/posts - should create a blog post with automatic slug generation', async () => {
    const postPayload = {
      title: 'Deep Dive into MERN Clean Architecture',
      content: 'Here is detailed content about designing clean modular web applications.',
      category: 'Architecture',
      tags: ['nodejs', 'express']
    };

    const res = await request(app)
      .post('/api/v1/posts')
      .set('Authorization', `Bearer ${userToken}`)
      .send(postPayload);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.slug).toBe('deep-dive-into-mern-clean-architecture');
    expect(res.body.data.author._id).toBe(userId);
    expect(res.body.data.isDeleted).toBe(false);
  });

  test('GET /api/v1/posts/:slug - should fetch post by slug and increment views', async () => {
    const createRes = await request(app)
      .post('/api/v1/posts')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        title: 'Slug Routing in React and Express',
        content: 'Explaining clean slug URL structures for SEO and readability.'
      });

    const slug = createRes.body.data.slug;

    const res = await request(app).get(`/api/v1/posts/${slug}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('Slug Routing in React and Express');
  });

  test('DELETE /api/v1/posts/:id - should soft-delete post and exclude from public listings', async () => {
    const createRes = await request(app)
      .post('/api/v1/posts')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        title: 'Post to be Soft Deleted',
        content: 'This post will be soft deleted to verify indexing and exclusion.'
      });

    const postId = createRes.body.data._id;

    // Soft delete
    const deleteRes = await request(app)
      .delete(`/api/v1/posts/${postId}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(deleteRes.status).toBe(200);
    expect(deleteRes.body.message).toContain('soft deleted');

    // Verify it is excluded from public GET /api/v1/posts
    const publicList = await request(app).get('/api/v1/posts');
    const found = publicList.body.data.some((p) => p._id === postId);
    expect(found).toBe(false);
  });

  test('RBAC - user cannot edit or delete someone else post', async () => {
    const createRes = await request(app)
      .post('/api/v1/posts')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        title: 'Original User Post',
        content: 'Only original user should be able to edit this.'
      });

    const postId = createRes.body.data._id;

    // Second user tries to update
    const updateRes = await request(app)
      .put(`/api/v1/posts/${postId}`)
      .set('Authorization', `Bearer ${otherUserToken}`)
      .send({ title: 'Hacked Title Attempt' });

    expect(updateRes.status).toBe(403);
    expect(updateRes.body.success).toBe(false);
  });
});

