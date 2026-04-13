import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { BasePrice } from '../../entities/base-price.entity';
import { QuantityTier } from '../../entities/quantity-tier.entity';
import { Sample } from '../../entities/sample.entity';
import { CalculatePriceInput } from './price.schemas';

@Injectable()
export class PriceService {
  constructor(
    @InjectRepository(BasePrice)
    private readonly basePriceRepository: Repository<BasePrice>,
    @InjectRepository(QuantityTier)
    private readonly quantityTierRepository: Repository<QuantityTier>,
    @InjectRepository(Sample)
    private readonly sampleRepository: Repository<Sample>,
  ) {}

  async calculate(payload: CalculatePriceInput) {
    const sample = await this.sampleRepository.findOne({
      where: { id: payload.sample_id, isActive: true },
    });

    if (!sample) {
      throw new NotFoundException('Sample not found');
    }

    if (sample.productTypeId !== payload.product_type_id) {
      throw new BadRequestException('sample_id does not belong to product_type_id');
    }

    const effectId = payload.effect_id ?? null;

    const qb = this.basePriceRepository
      .createQueryBuilder('bp')
      .where('bp.material_id = :materialId', { materialId: payload.material_id })
      .andWhere('bp.size_id = :sizeId', { sizeId: payload.size_id })
      .andWhere('bp.side_id = :sideId', { sideId: payload.side_id })
      .andWhere(
        effectId === null ? 'bp.effect_id IS NULL' : 'bp.effect_id = :effectId',
        effectId === null ? {} : { effectId },
      )
      .andWhere(
        new Brackets((subQb) => {
          subQb
            .where('bp.product_type_id = :productTypeId', {
              productTypeId: payload.product_type_id,
            })
            .orWhere('bp.product_type_id IS NULL');
        }),
      )
      .orderBy(
        'CASE WHEN bp.product_type_id = :productTypeId THEN 0 ELSE 1 END',
        'ASC',
      )
      .addOrderBy('bp.id', 'ASC')
      .setParameter('productTypeId', payload.product_type_id)
      .limit(1);

    const basePrice = await qb.getOne();

    if (!basePrice) {
      throw new NotFoundException('Base price configuration not found');
    }

    const tier = await this.quantityTierRepository
      .createQueryBuilder('qt')
      .where('qt.base_price_id = :basePriceId', { basePriceId: basePrice.id })
      .andWhere('qt.min_quantity <= :quantity', { quantity: payload.quantity })
      .andWhere('(qt.max_quantity IS NULL OR qt.max_quantity >= :quantity)', {
        quantity: payload.quantity,
      })
      .orderBy('qt.min_quantity', 'DESC')
      .getOne();

    const unitPrice = tier?.pricePerUnit ?? basePrice.unitPrice;
    const totalPrice = Number(unitPrice) * Number(payload.quantity);

    return {
      unit_price: Number(unitPrice),
      total_price: totalPrice,
      currency: 'VND',
      quantity: payload.quantity,
      base_price_id: basePrice.id,
      quantity_tier_id: tier?.id ?? null,
    };
  }
}
