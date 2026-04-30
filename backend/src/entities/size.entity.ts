import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { BasePrice } from './base-price.entity';

@Entity('sizes')
export class Size {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100, unique: true })
  name: string;

  @Column({ name: 'sort_order', default: 0 })
  sortOrder: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @OneToMany(() => BasePrice, (basePrice) => basePrice.size)
  basePrices: BasePrice[];

}
