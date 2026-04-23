import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sample } from '../../entities/sample.entity';

@Injectable()
export class SamplesService {
  constructor(
    @InjectRepository(Sample)
    private readonly sampleRepository: Repository<Sample>,
  ) {}

  findAll(productTypeId?: number) {
    const where: Record<string, unknown> = { isActive: true };
    if (productTypeId) {
      where.productTypeId = productTypeId;
    }

    return this.sampleRepository.find({
      where,
      relations: ['productType'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number) {
    const sample = await this.sampleRepository.findOne({
      where: { id, isActive: true },
      relations: ['productType'],
    });

    if (!sample) {
      throw new NotFoundException('Sample not found');
    }

    return sample;
  }
}
