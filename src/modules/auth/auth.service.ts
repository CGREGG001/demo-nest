import { Injectable } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  login(dto: LoginDto) {
    // Implémentation à venir
    return { message: 'login not implemented yet', dto };
  }

  register(dto: RegisterDto) {
    // Implémentation à venir
    return { message: 'register not implemented yet', dto };
  }
}
