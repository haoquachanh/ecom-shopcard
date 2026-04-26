import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { numericTransformer } from '../database/transformers/numeric.transformer';
import { BasePrice } from './base-price.entity';

@Entity('quantity_tiers')
@Index('idx_quantity_tiers_base_price', ['basePriceId'])
export class QuantityTier {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'base_price_id' })
  basePriceId: number;

  @ManyToOne(() => BasePrice, (basePrice) => basePrice.quantityTiers, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'base_price_id' })
  basePrice: BasePrice;

  @Column({ name: 'min_quantity', type: 'int' })
  minQuantity: number;

  @Column({ name: 'max_quantity', type: 'int', nullable: true })
  maxQuantity: number | null;

  @Column({
    name: 'price_per_unit',
    type: 'decimal',
    precision: 12,
    scale: 2,
    transformer: numericTransformer,
  })
  pricePerUnit: number;
}
