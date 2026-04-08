import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import { LoginInput, RegisterInput } from './auth.schemas';

@Injectable()
export class AuthService {
  private readonly accessExpiresIn = process.env.JWT_ACCESS_EXPIRES_IN || '15m';
  private readonly refreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '30d';
  private readonly refreshSecret = process.env.JWT_REFRESH_SECRET || 'refresh-secret';

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async register(input: RegisterInput) {
    const email = input.email.trim().toLowerCase();
    const existing = await this.userRepository.findOne({ where: { email } });
    if (existing) {
      throw new ConflictException('Email already exists');
    }

    const rounds = Number(process.env.BCRYPT_ROUNDS || 10);
    const hashedPassword = await bcrypt.hash(input.password, rounds);

    const user = this.userRepository.create({
      email,
      password: hashedPassword,
      name: input.name || null,
      phone: input.phone || null,
      address: input.address || null,
    });

    const saved = await this.userRepository.save(user);
    return this.buildAuthResponse(saved);
  }

  async login(input: LoginInput) {
    const email = input.email.trim().toLowerCase();
    const user = await this.userRepository.findOne({
      where: { email, isActive: true },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const matched = await bcrypt.compare(input.password, user.password);
    if (!matched) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.buildAuthResponse(user);
  }

  async refresh(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync<{
        sub: number;
        email: string;
        role: string;
      }>(refreshToken, {
        secret: this.refreshSecret,
      });

      const user = await this.userRepository.findOne({
        where: { id: payload.sub, isActive: true },
      });

      if (!user) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      return this.buildAuthResponse(user);
    } catch (_error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  logout() {
    return {
      message: 'Logged out successfully. Please clear tokens on client side.',
    };
  }

  private async buildAuthResponse(user: User) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, { expiresIn: this.accessExpiresIn }),
      this.jwtService.signAsync(payload, {
        secret: this.refreshSecret,
        expiresIn: this.refreshExpiresIn,
      }),
    ]);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      token_type: 'Bearer',
      expires_in: this.accessExpiresIn,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        address: user.address,
        role: user.role,
      },
    };
  }
}
