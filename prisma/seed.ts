import {
  PrismaClient,
  PostStatus,
  ReactionType,
  User,
  Post,
  Comment,
  Category,
  Reaction,
} from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clear existing data
  console.log('🔄 Clearing existing data...');
  await prisma.reaction.deleteMany({});
  await prisma.comment.deleteMany({});
  await prisma.post.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.user.deleteMany({});
  console.log('✅ Cleared existing data.');

  console.log('🌱 Seeding new data to database...');

  // Create categories
  const techCategory: Category = await prisma.category.create({
    data: {
      name: 'Technology',
      description: 'Posts about technology and programming',
    },
  });

  const lifestyleCategory: Category = await prisma.category.create({
    data: {
      name: 'Lifestyle',
      description: 'Posts about lifestyle and personal experiences',
    },
  });

  // Create users
  const users: User[] = [];
  const hashedPassword = await bcrypt.hash('password123', 10);

  for (let i = 1; i <= 10; i++) {
    const user: User = await prisma.user.create({
      data: {
        fullName: `User ${i}`,
        username: `user${i}`,
        email: `user${i}@example.com`,
        password: hashedPassword,
        profilePictureUrl: `https://images.unsplash.com/photo-${Math.floor(Math.random() * 1000)}?w=150&h=150&fit=crop&crop=face`,
      },
    });
    users.push(user);
  }

  // Create posts
  const posts: Post[] = [];
  for (let i = 1; i <= 10; i++) {
    const post: Post = await prisma.post.create({
      data: {
        title: `Post Title ${i}`,
        content: `This is the content of post number ${i}. It's a great post about various topics.`,
        authorId: users[Math.floor(Math.random() * users.length)].id, // Randomly assign an author
        status: PostStatus.PUBLISHED,
        tags: [`tag${i}`, 'example'],
        images: [
          `https://images.unsplash.com/photo-${Math.floor(Math.random() * 1000)}?w=800&h=400&fit=crop`,
        ],
        categories: {
          connect: [
            Math.random() > 0.5
              ? { id: techCategory.id }
              : { id: lifestyleCategory.id },
          ],
        },
      },
    });
    posts.push(post);
  }

  // Create comments
  for (let i = 0; i < posts.length; i++) {
    await prisma.comment.create({
      data: {
        content: `Comment for post ${i + 1}`,
        postId: posts[i].id,
        userId: users[Math.floor(Math.random() * users.length)].id, // Randomly assign a user
      },
    });
  }

  // Create reactions
  for (let i = 0; i < posts.length; i++) {
    await prisma.reaction.create({
      data: {
        postId: posts[i].id,
        userId: users[Math.floor(Math.random() * users.length)].id, // Randomly assign a user
        reactionType:
          Math.random() > 0.5 ? ReactionType.LIKE : ReactionType.LOVE,
      },
    });
  }

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
