import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { CartController } from './cart/cart.controller';
import { DatabaseService } from './database/database.service';
import { CartService } from './cart/cart.service';
import { OrdersController } from './orders/orders.controller';
import { OrdersService } from './orders/orders.service';
import { UsersController } from './users/users.controller';
import { UsersService } from './users/users.service';

@Module({
  imports: [DatabaseModule],
  controllers: [
    AppController,
    CartController,
    OrdersController,
    UsersController,
  ],
  providers: [
    AppService,
    DatabaseService,
    CartService,
    OrdersService,
    UsersService,
  ],
})
export class AppModule {}
