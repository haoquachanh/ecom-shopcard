import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { BasePrice } from './base-price.entity';

@Entity('sides')
export class Side {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50, unique: true })
  name: string;

  @OneToMany(() => BasePrice, (basePrice) => basePrice.side)
  basePrices: BasePrice[];

}
