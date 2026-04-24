import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { BasePrice } from './base-price.entity';

@Entity('materials')
export class Material {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100, unique: true })
  name: string;

  @Column({ name: 'display_order', default: 0 })
  displayOrder: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @OneToMany(() => BasePrice, (basePrice) => basePrice.material)
  basePrices: BasePrice[];

}
