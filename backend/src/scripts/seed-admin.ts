import 'reflect-metadata';
import 'dotenv/config';
import * as bcrypt from 'bcryptjs';
import { DataSource } from 'typeorm';
import { User, UserRole } from '../entities/user.entity';
import { ProductType } from '../entities/product-type.entity';
import { Sample } from '../entities/sample.entity';
import { Wishlist } from '../entities/wishlist.entity';
import { BasePrice } from '../entities/base-price.entity';
import { QuantityTier } from '../entities/quantity-tier.entity';
import { Material } from '../entities/material.entity';
import { Size } from '../entities/size.entity';
import { Side } from '../entities/side.entity';
import { Effect } from '../entities/effect.entity';

const isProduction = process.env.NODE_ENV === 'production';
const email = (process.env.ADMIN_EMAIL || 'admin@shopcard.local').trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD || (isProduction ? '' : 'Admin123456');
const databaseUrl = process.env.DATABASE_URL || process.env.DIRECT_URL;

if (!password) {
  throw new Error('ADMIN_PASSWORD is required when NODE_ENV=production');
}

const dataSource = new DataSource({
  type: 'postgres',
  ...(databaseUrl
    ? { url: databaseUrl }
    : {
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT || 5432),
        username: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASS || 'postgres',
        database: process.env.DB_NAME || 'ecom_shopcard',
      }),
  entities: [
    User,
    ProductType,
    Sample,
    Wishlist,
    BasePrice,
    QuantityTier,
    Material,
    Size,
    Side,
    Effect,
  ],
  synchronize: false,
  logging: false,
  ssl:
    (process.env.DB_SSL || 'false') === 'true' || Boolean(databaseUrl?.includes('supabase.com'))
      ? { rejectUnauthorized: false }
      : false,
});

async function main() {
  await dataSource.initialize();
  const users = dataSource.getRepository(User);
  const rounds = Number(process.env.BCRYPT_ROUNDS || 10);
  const hashedPassword = await bcrypt.hash(password, rounds);

  const existing = await users.findOne({ where: { email } });
  if (existing) {
    existing.password = hashedPassword;
    existing.role = UserRole.ADMIN;
    existing.isActive = true;
    existing.name = existing.name || 'ShopCard Admin';
    await users.save(existing);
    console.log(`Admin account updated: ${email}`);
  } else {
    await users.save(
      users.create({
        email,
        password: hashedPassword,
        name: 'ShopCard Admin',
        role: UserRole.ADMIN,
        isActive: true,
      }),
    );
    console.log(`Admin account created: ${email}`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  });
