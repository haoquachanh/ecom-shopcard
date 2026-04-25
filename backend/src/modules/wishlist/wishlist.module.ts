import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductType } from '../../entities/product-type.entity';
import { Wishlist } from '../../entities/wishlist.entity';
import { WishlistController } from './wishlist.controller';
import { WishlistService } from './wishlist.service';

@Module({
  imports: [TypeOrmModule.forFeature([Wishlist, ProductType])],
  controllers: [WishlistController],
  providers: [WishlistService],
})
export class WishlistModule {}
