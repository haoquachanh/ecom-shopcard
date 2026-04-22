import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { numericTransformer } from '../database/transformers/numeric.transformer';
import { Effect } from './effect.entity';
import { Material } from './material.entity';
import { ProductType } from './product-type.entity';
import { QuantityTier } from './quantity-tier.entity';
import { Side } from './side.entity';
import { Size } from './size.entity';

@Entity('base_prices')
@Unique('uq_base_prices_combo', [
  'productTypeId',
  'materialId',
  'sizeId',
  'sideId',
  'effectId',
])
@Index('idx_base_prices_lookup', ['productTypeId', 'materialId', 'sizeId', 'sideId', 'effectId'])
export class BasePrice {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'product_type_id', nullable: true })
  productTypeId: number | null;

  @ManyToOne(() => ProductType, (productType) => productType.basePrices, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'product_type_id' })
  productType: ProductType | null;

  @Column({ name: 'material_id' })
  materialId: number;

  @ManyToOne(() => Material, (material) => material.basePrices, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'material_id' })
  material: Material;

  @Column({ name: 'size_id' })
  sizeId: number;

  @ManyToOne(() => Size, (size) => size.basePrices, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'size_id' })
  size: Size;

  @Column({ name: 'side_id' })
  sideId: number;

  @ManyToOne(() => Side, (side) => side.basePrices, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'side_id' })
  side: Side;

  @Column({ name: 'effect_id', nullable: true })
  effectId: number | null;

  @ManyToOne(() => Effect, (effect) => effect.basePrices, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'effect_id' })
  effect: Effect | null;

  @Column({
    name: 'unit_price',
    type: 'decimal',
    precision: 12,
    scale: 2,
    transformer: numericTransformer,
  })
  unitPrice: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => QuantityTier, (tier) => tier.basePrice)
  quantityTiers: QuantityTier[];
}
