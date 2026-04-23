import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { BasePrice } from './base-price.entity';

@Entity('effects')
export class Effect {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100, unique: true })
  name: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @OneToMany(() => BasePrice, (basePrice) => basePrice.effect)
  basePrices: BasePrice[];

}
