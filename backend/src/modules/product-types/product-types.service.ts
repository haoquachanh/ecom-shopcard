import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductType } from '../../entities/product-type.entity';

@Injectable()
export class ProductTypesService {
  constructor(
    @InjectRepository(ProductType)
    private readonly productTypeRepository: Repository<ProductType>,
  ) {}

  findAll() {
    return this.productTypeRepository.find({
      where: { isActive: true },
      order: { sortOrder: 'ASC', id: 'ASC' },
    });
  }

  async findOne(id: number) {
    const productType = await this.productTypeRepository.findOne({
      where: { id, isActive: true },
    });

    if (!productType) {
      throw new NotFoundException('Product type not found');
    }

    return productType;
  }
}
