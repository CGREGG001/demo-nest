import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UsersService } from './services/users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UserEntity } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserPasswordDto } from './dto/update-password.dto';

@ApiTags('users')
@Controller('users')
export class UsersController {
  // Injection de UsersService dans le constructeur
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiCreatedResponse({
    description: 'User successfully created',
    type: UserEntity,
  })
  @ApiBadRequestResponse({ description: 'Invalid payload.' })
  @ApiResponse({ status: 409, description: 'Email already exists.' })
  async create(@Body() createUserDto: CreateUserDto): Promise<UserEntity> {
    // On récupère la donnée brute du service
    return await this.usersService.create(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: 'Fetch all users' })
  @ApiOkResponse({
    description: 'List of all users',
    type: UserEntity, // Swagger gère le tableau via isArray ou le type [UserEntity]
    isArray: true,
  })
  async findAll(): Promise<UserEntity[]> {
    return await this.usersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by id' })
  @ApiOkResponse({ description: 'User retrieved', type: UserEntity })
  @ApiResponse({ status: 404, description: 'User not found' })
  // new ParseUUIDPipe() : Empêche l'exécution inutile d'une requête SQL si l'ID envoyé n'est pas un UUID.
  async findOne(@Param('id', new ParseUUIDPipe()) id: string): Promise<UserEntity> {
    return await this.usersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user profile' })
  @ApiOkResponse({ description: 'User updated', type: UserEntity })
  @ApiBadRequestResponse({ description: 'Invalid payload.' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async update(
    @Param('id', new ParseUUIDPipe()) id: string, // Envoi Exception si pas un UUID valide.
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserEntity> {
    return await this.usersService.update(id, updateUserDto);
  }

  @Patch(':id/password')
  @ApiOperation({ summary: 'Update user password' })
  @ApiOkResponse({ description: 'Password updated successfully.', type: UserEntity })
  @ApiBadRequestResponse({ description: 'Invalid payload.' })
  @ApiUnauthorizedResponse({ description: 'invalid current password.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @ApiResponse({ status: 400, description: 'New password must be different from old password.' })
  async updatePassword(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateUserPasswordDto: UpdateUserPasswordDto,
  ): Promise<UserEntity> {
    return await this.usersService.updatePassword(id, updateUserPasswordDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete user by id' })
  @ApiOkResponse({ description: 'User deleted', type: UserEntity })
  @ApiResponse({ status: 404, description: 'User not found' })
  async delete(@Param('id', new ParseUUIDPipe()) id: string): Promise<UserEntity> {
    return await this.usersService.delete(id);
  }
}
