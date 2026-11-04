import request from 'supertest';
import app from '../src/app.js';
import { User } from '../src/models/user.model.js';
import { Post } from '../src/models/post.model.js';
import { Comment } from '../src/models/comment.model.js';
import './setup.js';

describe('Comments Integration Tests', () => {
  let userToken;
  let postId;

  beforeEach(async () => {
    await Comment.deleteMany({});
    await Post.deleteMany({});
    await User.deleteMany({});

    const authRes = await request(app).post('/api/v1/auth/register').send({
      name: 'Commenter',
      email: 'commenter@test.com',
      password: 'Password123!'
    });
    userToken = authRes.body.data.tokens.accessToken;

    const postRes = await request(app)
      .post('/api/v1/posts')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        title: 'Post For Comment Testing',
        content: 'Testing comments functionality on this post.'
      });
    postId = postRes.body.data._id;
  });

  test('POST /api/v1/comments/post/:postId - should post a comment and reference post and author', async () => {
    const res = await request(app)
      .post(`/api/v1/comments/post/${postId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ content: 'This is an insightful article! Thanks for sharing.' });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.content).toBe('This is an insightful article! Thanks for sharing.');
    expect(res.body.data.post).toBe(postId);
  });

  test('GET /api/v1/comments/post/:postId - should retrieve all comments for the post', async () => {
    await request(app)
      .post(`/api/v1/comments/post/${postId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ content: 'Comment One' });

    await request(app)
      .post(`/api/v1/comments/post/${postId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ content: 'Comment Two' });

    const res = await request(app).get(`/api/v1/comments/post/${postId}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBe(2);
  });
});

