import { TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';

export const typeOrmConfig: TypeOrmModuleAsyncOptions = {
  useFactory: () => {
    const databaseUrl = process.env.DATABASE_URL;
    const shouldUseSsl =
      (process.env.DB_SSL || '').toLowerCase() === 'true' ||
      Boolean(databaseUrl?.includes('supabase.com'));

    const common = {
      type: 'postgres' as const,
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      synchronize: (process.env.DB_SYNCHRONIZE || 'false') === 'true',
      logging: (process.env.DB_LOGGING || 'false') === 'true',
      ssl: shouldUseSsl ? { rejectUnauthorized: false } : false,
    };

    if (databaseUrl) {
      return {
        ...common,
        url: databaseUrl,
      };
    }

    return {
      ...common,
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT || 5432),
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASS || 'postgres',
      database: process.env.DB_NAME || 'ecom_shopcard',
    };
  },
};
