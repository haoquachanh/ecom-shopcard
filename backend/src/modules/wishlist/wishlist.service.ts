import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductType } from '../../entities/product-type.entity';
import { Wishlist } from '../../entities/wishlist.entity';
import { RequestUser } from '../../common/interfaces/request-user.interface';

@Injectable()
export class WishlistService {
  constructor(
    @InjectRepository(Wishlist)
    private readonly wishlistRepository: Repository<Wishlist>,
    @InjectRepository(ProductType)
    private readonly productTypeRepository: Repository<ProductType>,
  ) {}

  getWishlist(user: RequestUser) {
    return this.wishlistRepository.find({
      where: { userId: user.id },
      relations: ['productType'],
      order: { createdAt: 'DESC' },
    });
  }

  async add(user: RequestUser, productTypeId: number) {
    const productType = await this.productTypeRepository.findOne({
      where: { id: productTypeId, isActive: true },
    });

    if (!productType) {
      throw new NotFoundException('Product type not found');
    }

    const exists = await this.wishlistRepository.findOne({
      where: {
        userId: user.id,
        productTypeId,
      },
    });

    if (exists) {
      throw new ConflictException('Product type already in wishlist');
    }

    const entry = this.wishlistRepository.create({
      userId: user.id,
      productTypeId,
    });

    await this.wishlistRepository.save(entry);
    return this.getWishlist(user);
  }

  async remove(user: RequestUser, productTypeId: number) {
    const entry = await this.wishlistRepository.findOne({
      where: { userId: user.id, productTypeId },
    });

    if (!entry) {
      throw new NotFoundException('Wishlist item not found');
    }

    await this.wishlistRepository.delete({ id: entry.id });
    return this.getWishlist(user);
  }
}
