import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UserEntity } from '@modules/users/entities/user.entity';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'User login to receive JWT' })
  @ApiCreatedResponse({
    description: 'JWT access token generated successfully.',
    // On peut même définir la forme de la réponse pour Swagger
    schema: {
      example: {
        message: 'Login successful',
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: { id: 'uuid', email: 'user@example.com' },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Invalid payload (missing email or password).' })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials (wrong email or password).' })
  async login(@Body() loginDto: LoginDto) {
    return await this.authService.login(loginDto);
  }

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiCreatedResponse({ description: 'User successfully created', type: UserEntity })
  @ApiBadRequestResponse({ description: 'Invalid payload.' })
  @ApiConflictResponse({ description: 'Email already exists.' })
  async register(@Body() registerDto: RegisterDto): Promise<UserEntity> {
    return await this.authService.register(registerDto);
  }
}
