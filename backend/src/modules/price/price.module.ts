import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BasePrice } from '../../entities/base-price.entity';
import { QuantityTier } from '../../entities/quantity-tier.entity';
import { Sample } from '../../entities/sample.entity';
import { PriceController } from './price.controller';
import { PriceService } from './price.service';

@Module({
  imports: [TypeOrmModule.forFeature([BasePrice, QuantityTier, Sample])],
  controllers: [PriceController],
  providers: [PriceService],
  exports: [PriceService],
})
export class PriceModule {}
