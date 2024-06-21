import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class UsersService {
  constructor(private prisma: DatabaseService) {}

  async getOrdersByUserId(userId: number) {
    return this.prisma.orders.findMany({
      where: { userId },
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
  }
}
