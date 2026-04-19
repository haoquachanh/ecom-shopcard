import { TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';

export const typeOrmConfig: TypeOrmModuleAsyncOptions = {
  useFactory: () => ({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 5432),
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASS || 'postgres',
    database: process.env.DB_NAME || 'ecom_shopcard',
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: (process.env.DB_SYNCHRONIZE || 'false') === 'true',
    logging: (process.env.DB_LOGGING || 'false') === 'true',
    ssl:
      (process.env.DB_SSL || 'false') === 'true'
        ? { rejectUnauthorized: false }
        : false,
  }),
};
