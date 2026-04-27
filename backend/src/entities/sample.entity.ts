import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ProductType } from './product-type.entity';

@Entity('samples')
@Index('idx_samples_product_type', ['productTypeId'])
export class Sample {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'product_type_id' })
  productTypeId: number;

  @ManyToOne(() => ProductType, (productType) => productType.samples, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'product_type_id' })
  productType: ProductType;

  @Column({ length: 200 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'image_url', length: 500, nullable: true })
  imageUrl: string | null;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

}
