import { IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

/**
 * DTO used when creating a new User.
 * Includes validation rules and automatic transformations.
 */
export class CreateUserDto {
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

  @ApiProperty({
    description: 'Display name of the user (optional)',
    example: 'John-Doe',
    required: false,
  })
  @Transform(({ value }) => (value as string)?.trim())
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  name?: string | null;
}
