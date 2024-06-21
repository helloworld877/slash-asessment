import { Controller, Post, Body, Get, Param, Put } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { Status } from '@prisma/client';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Orders')
@Controller('api/orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @ApiOperation({ summary: "Create an order for user's items" })
  @ApiCreatedResponse({ description: "Order for user's items created" })
  @ApiBody({
    schema: { type: 'object', properties: { userId: { type: 'number' } } },
  })
  @Post()
  async createOrder(@Body('userId') userId: number) {
    return this.ordersService.createOrder(userId);
  }

  @ApiOperation({ summary: 'Get order details by orderId' })
  @ApiOkResponse({ description: 'The order with the respective id is fetched' })
  @ApiParam({ name: 'orderId', type: 'number' })
  @Get(':orderId')
  async getOrderById(@Param('orderId') orderId: number) {
    return this.ordersService.getOrderById(Number(orderId));
  }

  @ApiOperation({ summary: 'Update the status of an order' })
  @ApiOkResponse({ description: 'The order status is changed' })
  @ApiParam({ name: 'orderId', type: 'number' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: ['ORDERED', 'ACCEPTED', 'SHIPPING', 'DELIVERED'],
        },
      },
    },
  })
  @Put(':orderId/status')
  async updateOrderStatus(
    @Param('orderId') orderId: number,
    @Body('status') status: Status,
  ) {
    return this.ordersService.updateOrderStatus(Number(orderId), status);
  }

  @ApiOkResponse({ description: 'added the coupon discount successfully' })
  @ApiOperation({ summary: 'Apply a coupon to an order' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        orderId: { type: 'number', description: 'Order ID' },
        discount: {
          type: 'number',
          description: 'Discount rate (must be between 0 and 1)',
        },
      },
    },
  })
  @Post('/apply-coupon')
  async applyCoupon(
    @Body('orderId') orderId: number,
    @Body('discount') discount: number,
  ) {
    return this.ordersService.applyCoupon(orderId, discount);
  }
}
