import { PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';

/**
 * DTO used when updating a User.
 * Inherits all properties from CreateUserDto but makes them optional.
 */
export class UpdateUserDto extends PartialType(CreateUserDto) {}
