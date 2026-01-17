import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

/**
 * DTO used when login
 */
export class LoginDto {
  @ApiProperty({
    description: 'Unique email address of the user',
    example: 'john.doe@example.com',
  })
  @Transform(({ value }) => (value as string)?.toLowerCase())
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Password with minimum 8 characters long',
    example: 'Password123!',
    minLength: 8,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  password: string;
}
