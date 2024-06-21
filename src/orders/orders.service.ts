import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { Orders, Status } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(private prisma: DatabaseService) {}

  async createOrder(userId: number): Promise<Orders> {
    // Check if user exists
    const user = await this.prisma.users.findUnique({
      where: { userId },
      include: {
        cart: { include: { products: { include: { product: true } } } },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.cart || user.cart.products.length === 0) {
      throw new NotFoundException('No products in the cart');
    }

    // Calculate total cost
    const totalCost = user.cart.products.reduce((total, cartProduct) => {
      return total + cartProduct.quantity * cartProduct.product.price;
    }, 0);

    // Create a new order
    const order = await this.prisma.orders.create({
      data: {
        user: {
          connect: { userId },
        },
        status: Status.ORDERED,
        totalCost,
        products: {
          create: user.cart.products.map((cartProduct) => ({
            productId: cartProduct.productId,
            quantity: cartProduct.quantity,
          })),
        },
      },
    });

    // Optionally, clear the user's cart
    await this.prisma.cartProduct.deleteMany({
      where: { cartId: user.cart.cartId },
    });

    return order;
  }

  async getOrderById(orderId: number): Promise<Orders> {
    const order = await this.prisma.orders.findUnique({
      where: { orderId },
      include: {
        products: {
          include: {
            product: true,
          },
        },
        user: {
          select: {
            name: true,
            address: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async updateOrderStatus(orderId: number, status: Status): Promise<Orders> {
    const order = await this.prisma.orders.findUnique({
      where: { orderId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (!Object.values(Status).includes(status)) {
      throw new BadRequestException('Invalid status');
    }

    return this.prisma.orders.update({
      where: { orderId },
      data: { status },
    });
  }

  async applyCoupon(orderId: number, discount: number) {
    if (discount < 0 || discount > 1) {
      throw new BadRequestException('Discount must be between 0 and 1');
    }
    const order = await this.prisma.orders.findUnique({
      where: { orderId },
      include: { products: true },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    const totalCostAfterDiscount = order.totalCost * (1 - discount);

    return this.prisma.orders.update({
      where: { orderId },
      data: {
        discount,
        totalCostAfterDiscount,
      },
    });
  }
}
