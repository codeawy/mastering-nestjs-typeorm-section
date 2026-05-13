import * as fs from 'fs';
import * as path from 'path';
import { faker } from '@faker-js/faker';
import { DataSource } from 'typeorm';
import { User } from './users/entities/user.entity';
import { UserProfile } from './users/entities/user-profile.entity';
import { Category } from './modules/products/entities/category.entity';
import { Tag } from './modules/products/entities/tag.entity';
import { Product } from './modules/products/entities/product.entity';

// Load .env.local
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach((line) => {
    if (line && !line.startsWith('#')) {
      const [key, value] = line.split('=');
      if (key && value) {
        process.env[key.trim()] = value.trim();
      }
    }
  });
}

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
  synchronize: false,
  logging: false,
});

async function seed() {
  try {
    // Initialize database connection
    await AppDataSource.initialize();
    console.log('✅ Database connection established');

    // Clear existing data
    await AppDataSource.query('TRUNCATE TABLE product_tags CASCADE');
    await AppDataSource.query('TRUNCATE TABLE products CASCADE');
    await AppDataSource.query('TRUNCATE TABLE tags CASCADE');
    await AppDataSource.query('TRUNCATE TABLE categories CASCADE');
    await AppDataSource.query('TRUNCATE TABLE user_profiles CASCADE');
    await AppDataSource.query('TRUNCATE TABLE users CASCADE');
    console.log('🗑️  Cleared existing data');

    const userRepository = AppDataSource.getRepository(User);
    const userProfileRepository = AppDataSource.getRepository(UserProfile);
    const categoryRepository = AppDataSource.getRepository(Category);
    const tagRepository = AppDataSource.getRepository(Tag);
    const productRepository = AppDataSource.getRepository(Product);

    // ===== SEED USERS =====
    console.log('\n🌱 Seeding users...');
    const users: User[] = [];

    for (let i = 0; i < 15; i++) {
      const user = userRepository.create({
        name: faker.person.fullName(),
        email: faker.internet.email().toLowerCase(),
        password: 'Password@123', // Will be hashed by @BeforeInsert
        role: faker.helpers.arrayElement(['admin', 'user', 'moderator']),
        isActive: faker.datatype.boolean({ probability: 0.9 }),
        metadata: {
          source: faker.helpers.arrayElement(['web', 'mobile', 'api']),
          lastLogin: faker.date.past(),
        },
      });
      users.push(user);
    }

    const savedUsers = await userRepository.save(users);
    console.log(`✅ Seeded ${savedUsers.length} users`);

    // ===== SEED USER PROFILES =====
    console.log('\n🌱 Seeding user profiles...');
    const profiles: UserProfile[] = [];

    for (const user of savedUsers) {
      const profile = userProfileRepository.create({
        bio: faker.lorem.paragraph(),
        avatar: faker.image.avatar(),
        phoneNumber: faker.phone.number(),
        location: `${faker.location.city()}, ${faker.location.country()}`,
        isVerified: faker.datatype.boolean({ probability: 0.7 }),
        user: user,
      });
      profiles.push(profile);
    }

    await userProfileRepository.save(profiles);
    console.log(`✅ Seeded ${profiles.length} user profiles`);

    // ===== SEED CATEGORIES =====
    console.log('\n🌱 Seeding categories...');
    const categoryNames = [
      'Electronics',
      'Clothing',
      'Books',
      'Home & Garden',
      'Sports',
      'Toys',
      'Health & Beauty',
      'Food & Drink',
    ];

    const categories: Category[] = [];
    for (const name of categoryNames) {
      const category = categoryRepository.create({
        name,
        description: faker.lorem.paragraph(),
        slug: name.toLowerCase().replace(/\s+/g, '-'),
      });
      categories.push(category);
    }

    const savedCategories = await categoryRepository.save(categories);
    console.log(`✅ Seeded ${savedCategories.length} categories`);

    // ===== SEED TAGS =====
    console.log('\n🌱 Seeding tags...');
    const tagNames = [
      'New',
      'Popular',
      'On Sale',
      'Limited Edition',
      'Bestseller',
      'Eco-Friendly',
      'Premium',
      'Budget',
      'Trending',
      'Featured',
    ];

    const tags: Tag[] = [];
    for (const name of tagNames) {
      const tag = tagRepository.create({
        name,
        description: `Products tagged as ${name}`,
      });
      tags.push(tag);
    }

    const savedTags = await tagRepository.save(tags);
    console.log(`✅ Seeded ${savedTags.length} tags`);

    // ===== SEED PRODUCTS =====
    console.log('\n🌱 Seeding products...');
    const products: Product[] = [];

    for (let i = 0; i < 50; i++) {
      const product = productRepository.create({
        title: faker.commerce.productName(),
        description: faker.commerce.productDescription(),
        price: parseFloat(faker.commerce.price({ min: 10, max: 500 })),
        isActive: faker.datatype.boolean({ probability: 0.95 }),
        category: faker.helpers.arrayElement(savedCategories),
        tags: faker.helpers.arrayElements(savedTags, {
          min: 1,
          max: 4,
        }),
      });
      products.push(product);
    }

    const savedProducts = await productRepository.save(products);
    console.log(`✅ Seeded ${savedProducts.length} products`);

    // ===== SUMMARY =====
    console.log('\n');
    console.log('═══════════════════════════════════════');
    console.log('✨ Database seeding completed! ✨');
    console.log('═══════════════════════════════════════');
    console.log(`📊 Summary:`);
    console.log(`   • Users: ${savedUsers.length}`);
    console.log(`   • User Profiles: ${profiles.length}`);
    console.log(`   • Categories: ${savedCategories.length}`);
    console.log(`   • Tags: ${savedTags.length}`);
    console.log(`   • Products: ${savedProducts.length}`);
    console.log('═══════════════════════════════════════\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

seed();
