import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

/**
 * DTO used when updating a User.
 */
export class UpdateUserDto {
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
