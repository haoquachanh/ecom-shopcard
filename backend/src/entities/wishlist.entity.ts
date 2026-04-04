import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { ProductType } from './product-type.entity';
import { User } from './user.entity';

@Entity('wishlist')
@Unique('uq_wishlist_user_product_type', ['userId', 'productTypeId'])
export class Wishlist {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @ManyToOne(() => User, (user) => user.wishlist, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'product_type_id' })
  productTypeId: number;

  @ManyToOne(() => ProductType, (productType) => productType.wishlist, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'product_type_id' })
  productType: ProductType;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
