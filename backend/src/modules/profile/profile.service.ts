import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import { UpdateProfileInput } from './profile.schemas';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async getProfile(userId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId, isActive: true } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      address: user.address,
      role: user.role,
      created_at: user.createdAt,
      updated_at: user.updatedAt,
    };
  }

  async updateProfile(userId: number, input: UpdateProfileInput) {
    const user = await this.userRepository.findOne({ where: { id: userId, isActive: true } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.name = input.name ?? user.name;
    user.phone = input.phone ?? user.phone;
    user.address = input.address ?? user.address;

    await this.userRepository.save(user);
    return this.getProfile(userId);
  }
}
