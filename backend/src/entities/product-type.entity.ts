import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { BasePrice } from './base-price.entity';
import { Sample } from './sample.entity';
import { Wishlist } from './wishlist.entity';

@Entity('product_types')
export class ProductType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100, unique: true })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'image_url', length: 500, nullable: true })
  imageUrl: string | null;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'sort_order', default: 0 })
  sortOrder: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => Sample, (sample) => sample.productType)
  samples: Sample[];

  @OneToMany(() => BasePrice, (basePrice) => basePrice.productType)
  basePrices: BasePrice[];

  @OneToMany(() => Wishlist, (wishlist) => wishlist.productType)
  wishlist: Wishlist[];

}
