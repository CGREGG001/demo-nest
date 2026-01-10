import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UserEntity } from './entities/user.entity';

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
}
