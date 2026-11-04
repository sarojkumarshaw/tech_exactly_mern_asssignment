import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { User } from '../models/user.model.js';
import { Post } from '../models/post.model.js';
import { Comment } from '../models/comment.model.js';
import { ActivityLog } from '../models/activityLog.model.js';
import { generateUniqueSlug } from '../utils/slugify.js';

const seedDatabase = async () => {
  try {
    console.log('Connecting to database for seeding...');
    await mongoose.connect(env.MONGODB_URI);
    console.log('Connected to MongoDB.');

    // Clear existing collections
    console.log('Clearing old collections...');
    await Promise.all([
      User.deleteMany({}),
      Post.deleteMany({}),
      Comment.deleteMany({}),
      ActivityLog.deleteMany({})
    ]);

    console.log('Creating demo users...');
    const admin = await User.create({
      name: 'System Administrator',
      email: 'admin@example.com',
      password: 'AdminPassword123!',
      role: 'admin',
      isActive: true,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
    });

    const user1 = await User.create({
      name: 'Alex Johnson',
      email: 'alex@example.com',
      password: 'UserPassword123!',
      role: 'user',
      isActive: true,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
    });

    const user2 = await User.create({
      name: 'Sophia Chen',
      email: 'sophia@example.com',
      password: 'UserPassword123!',
      role: 'user',
      isActive: true,
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'
    });

    console.log('Creating demo blog posts...');
    const post1Slug = await generateUniqueSlug('Mastering Modern MERN Stack Architecture');
    const post1 = await Post.create({
      title: 'Mastering Modern MERN Stack Architecture',
      slug: post1Slug,
      excerpt: 'Discover best practices for building scalable, secure, and production-ready full-stack applications with Node.js, Express, React, and MongoDB.',
      content: `
Building production-grade web applications requires more than just connecting React to Express and MongoDB. In this article, we dive deep into the best architectural patterns for modern MERN development.

### Clean Architecture & Separation of Concerns
1. **Controllers**: Pure request parsers and HTTP responders.
2. **Services**: Business logic, data transformations, domain validation.
3. **Models**: Schema definition, indexing strategies, pre/post hooks.
4. **Middleware**: Reusable security, authentication, RBAC, and audit logging.

### Security First
- Always hash passwords with strong bcrypt salts (12+ rounds).
- Enforce JWT access token + refresh token rotation to minimize token exposure.
- Employ strict rate-limiting on sensitive authentication endpoints to prevent brute-force attacks.
- Sanitize inputs to mitigate NoSQL injection and XSS vulnerabilities.

### Database Performance Optimization
Ensure query performance by adding compound indexes on frequently queried fields like \`isDeleted\` and \`createdAt\`. Use projection (\`.select()\`) and lean queries (\`.lean()\`) when full Mongoose document instances are not required.
      `.trim(),
      category: 'Engineering',
      tags: ['nodejs', 'mongodb', 'react', 'architecture'],
      coverImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200',
      author: admin._id,
      viewsCount: 142
    });

    const post2Slug = await generateUniqueSlug('Why Soft Deletes are Essential in Modern Web Apps');
    const post2 = await Post.create({
      title: 'Why Soft Deletes are Essential in Modern Web Apps',
      slug: post2Slug,
      excerpt: 'Hard deletion permanently removes records, which can cause orphaned data and audit gaps. Learn how to implement soft deletes gracefully with Mongoose.',
      content: `
Data loss in production is one of the costliest incidents an engineering team can face. Soft deletion allows applications to mark records as deleted without physically removing them from storage.

### Advantages of Soft Deletion
- **Audit Trails**: Preserve history for compliance, analytics, and legal audits.
- **Accidental Deletion Recovery**: Administrators can restore records with a single click.
- **Data Integrity**: Prevents cascading foreign key breakages.

In our Mongoose model, we maintain \`isDeleted: Boolean\` and \`deletedAt: Date\`. Our query layer automatically filters out deleted records for normal users while allowing administrators to view and restore them.
      `.trim(),
      category: 'Database',
      tags: ['mongodb', 'best-practices', 'database'],
      coverImage: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=1200',
      author: user1._id,
      viewsCount: 88
    });

    const post3Slug = await generateUniqueSlug('Real-Time Web Apps with Socket.io & React');
    const post3 = await Post.create({
      title: 'Real-Time Web Apps with Socket.io & React',
      slug: post3Slug,
      excerpt: 'Explore how WebSockets enable real-time bidirectional communication for live comments, notifications, and collaborative dashboards.',
      content: `
Traditional REST APIs follow a request-response cycle. But modern user experiences demand instantaneous updates when another user interacts with content.

### Using Rooms for Targeted Messaging
With Socket.io rooms, we can easily scope events:
- \`user_<userId>\`: Private room for user-specific notifications (e.g. comment on their post).
- \`post_<postId>\`: Room for live comments feed on the open blog post.
- \`admin_room\`: Real-time system audit logs for active administrators.
      `.trim(),
      category: 'WebSockets',
      tags: ['socketio', 'realtime', 'react'],
      coverImage: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200',
      author: user2._id,
      viewsCount: 65
    });

    // Seed a soft-deleted post for demonstration of restore feature
    const post4Slug = await generateUniqueSlug('Archived Draft: Legacy API Migration Guide');
    const post4 = await Post.create({
      title: 'Archived Draft: Legacy API Migration Guide',
      slug: post4Slug,
      excerpt: 'This post has been soft-deleted and is only visible in the Admin Panel or to authorized managers.',
      content: 'This post is archived and soft-deleted. Admins can restore it from the Admin Panel.',
      category: 'Engineering',
      tags: ['legacy', 'migration'],
      coverImage: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200',
      author: user1._id,
      isDeleted: true,
      deletedAt: new Date(),
      viewsCount: 12
    });

    console.log('Creating demo comments...');
    await Comment.create({
      post: post1._id,
      author: user1._id,
      content: 'Fantastic article! The separation of concerns pattern between controllers and services has transformed our backend codebase.'
    });

    await Comment.create({
      post: post1._id,
      author: user2._id,
      content: 'Agreed! Adding compound indexes on isDeleted + createdAt is an absolute game changer for high-traffic feeds.'
    });

    await Comment.create({
      post: post2._id,
      author: admin._id,
      content: 'Great breakdown of soft deletes. The admin restore feature provides tremendous peace of mind.'
    });

    console.log('Recording initial audit logs...');
    await ActivityLog.create([
      {
        userId: admin._id,
        userEmail: admin.email,
        role: admin.role,
        action: 'SYSTEM_SEED',
        entityType: 'SYSTEM',
        method: 'CLI',
        endpoint: '/seeds/seed.js',
        details: { message: 'Database initialized with demo data' }
      },
      {
        userId: user1._id,
        userEmail: user1.email,
        role: user1.role,
        action: 'POST_CREATE',
        entityType: 'POST',
        entityId: post2._id,
        details: { title: post2.title, slug: post2.slug }
      }
    ]);

    console.log('----------------------------------------------------');
    console.log('Database Seeding Completed Successfully!');
    console.log('----------------------------------------------------');
    console.log('Demo Credentials:');
    console.log('  Admin User  : admin@example.com / AdminPassword123!');
    console.log('  Regular User: alex@example.com  / UserPassword123!');
    console.log('  Regular User: sophia@example.com / UserPassword123!');
    console.log('----------------------------------------------------');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Database seeding failed:', err);
    process.exit(1);
  }
};

seedDatabase();
