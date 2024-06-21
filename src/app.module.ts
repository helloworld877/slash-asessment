import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { CartController } from './cart/cart.controller';
import { DatabaseService } from './database/database.service';
import { CartService } from './cart/cart.service';

@Module({
  imports: [DatabaseModule],
  controllers: [AppController, CartController],
  providers: [AppService, DatabaseService, CartService],
})
export class AppModule {}
