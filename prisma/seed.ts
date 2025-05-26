import { PrismaClient, PostStatus, ReactionType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  //   clear existing data
  console.log('🔄 Clearing existing data...');

  // Clear existing data
  await prisma.reaction.deleteMany({});
  await prisma.comment.deleteMany({});
  await prisma.post.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('✅ Cleared existing data.');

  // Create categories
  const techCategory = await prisma.category.create({
    data: {
      name: 'Technology',
      description: 'Posts about technology and programming',
    },
  });

  const lifestyleCategory = await prisma.category.create({
    data: {
      name: 'Lifestyle',
      description: 'Posts about lifestyle and personal experiences',
    },
  });

  // Create users
  //   const hashedPassword = await bcrypt.hash('password123', 10);

  const hashedPassword = 'password123';

  const user1 = await prisma.user.create({
    data: {
      username: 'johndoe',
      email: 'john@example.com',
      password: hashedPassword,
      profilePictureUrl:
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    },
  });

  const user2 = await prisma.user.create({
    data: {
      username: 'janedoe',
      email: 'jane@example.com',
      password: hashedPassword,
      profilePictureUrl:
        'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    },
  });

  // Create posts
  const post1 = await prisma.post.create({
    data: {
      title: 'Getting Started with NestJS',
      content:
        "NestJS is a progressive Node.js framework for building efficient and scalable server-side applications. In this post, we'll explore the basics of NestJS and how to get started with building your first application.",
      authorId: user1.id,
      status: PostStatus.PUBLISHED,
      tags: ['nestjs', 'nodejs', 'backend'],
      images: [
        'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=400&fit=crop',
      ],
      categories: {
        connect: [{ id: techCategory.id }],
      },
    },
  });

  const post2 = await prisma.post.create({
    data: {
      title: 'My Journey into Web Development',
      content:
        "Starting a career in web development can be overwhelming, but it's also incredibly rewarding. Here's my personal journey and the lessons I've learned along the way.",
      authorId: user2.id,
      status: PostStatus.PUBLISHED,
      tags: ['webdev', 'career', 'personal'],
      images: [
        'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=400&fit=crop',
      ],
      categories: {
        connect: [{ id: lifestyleCategory.id }],
      },
    },
  });

  // Create comments
  await prisma.comment.create({
    data: {
      content: 'Great post! Very helpful for beginners.',
      postId: post1.id,
      userId: user2.id,
    },
  });

  await prisma.comment.create({
    data: {
      content: 'Thanks for sharing your experience!',
      postId: post2.id,
      userId: user1.id,
    },
  });

  // Create reactions
  await prisma.reaction.create({
    data: {
      postId: post1.id,
      userId: user2.id,
      reactionType: ReactionType.LIKE,
    },
  });

  await prisma.reaction.create({
    data: {
      postId: post2.id,
      userId: user1.id,
      reactionType: ReactionType.LOVE,
    },
  });

  console.log('✅ Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
