import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_FILTER } from '@nestjs/core';
import { AuthModule } from './modules/auth/auth.module';
import { ProfileModule } from './modules/profile/profile.module';
import { ProductTypesModule } from './modules/product-types/product-types.module';
import { SamplesModule } from './modules/samples/samples.module';
import { PriceModule } from './modules/price/price.module';
import { WishlistModule } from './modules/wishlist/wishlist.module';
import { typeOrmConfig } from './config/database.config';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { RequestIdMiddleware } from './common/middlewares/request-id.middleware';
import { RequestLoggingMiddleware } from './common/middlewares/request-logging.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // LoggerModule temporarily disabled to use Nest default logger
    TypeOrmModule.forRootAsync(typeOrmConfig),
    AuthModule,
    ProfileModule,
    ProductTypesModule,
    SamplesModule,
    PriceModule,
    WishlistModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestIdMiddleware, RequestLoggingMiddleware).forRoutes('*');
  }
}
