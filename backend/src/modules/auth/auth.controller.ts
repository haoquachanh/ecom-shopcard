import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import {
  loginSchema,
  refreshTokenSchema,
  registerSchema,
  LoginInput,
  RegisterInput,
} from './auth.schemas';
import { AuthService } from './auth.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register new user account' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['email', 'password'],
      properties: {
        email: { type: 'string', format: 'email' },
        password: { type: 'string', minLength: 8 },
        name: { type: 'string' },
        phone: { type: 'string' },
        address: { type: 'string' },
      },
    },
  })
  register(@Body(new ZodValidationPipe(registerSchema)) payload: RegisterInput) {
    return this.authService.register(payload);
  }

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Login with email/password' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['email', 'password'],
      properties: {
        email: { type: 'string', format: 'email' },
        password: { type: 'string' },
      },
    },
  })
  login(@Body(new ZodValidationPipe(loginSchema)) payload: LoginInput) {
    return this.authService.login(payload);
  }

  @Public()
  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['refresh_token'],
      properties: {
        refresh_token: { type: 'string' },
      },
    },
  })
  refresh(
    @Body(new ZodValidationPipe(refreshTokenSchema))
    payload: { refresh_token: string },
  ) {
    return this.authService.refresh(payload.refresh_token);
  }

  @Public()
  @Post('logout')
  @ApiOperation({ summary: 'Logout (stateless, client clears token)' })
  logout() {
    return this.authService.logout();
  }
}
