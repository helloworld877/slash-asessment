import { Controller, Get, Param } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { UsersService } from './users.service';

@ApiTags('Users')
@Controller('api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOkResponse({ description: "user's history received successfully" })
  @ApiOperation({ summary: 'Get order history of a specific user' })
  @ApiParam({ name: 'userId', type: 'number', description: 'User ID' })
  @Get(':userId/orders')
  async getOrdersByUserId(@Param('userId') userId: number) {
    return this.usersService.getOrdersByUserId(Number(userId));
  }
}
