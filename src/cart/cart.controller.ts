import {
  Body,
  Controller,
  Post,
  NotFoundException,
  BadRequestException,
  Get,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service'; // Adjust this path based on your project structure
import { CartService } from './cart.service'; // Adjust this path based on your project structure
import {
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiProperty,
  ApiTags,
} from '@nestjs/swagger';

class AddToCartDto {
  @ApiProperty({ type: Number, description: 'The ID of the user' })
  userId: number;

  @ApiProperty({ type: Number, description: 'The ID of the product' })
  productId: number;
}

class UpdateCartItemDto {
  @ApiProperty({ type: Number, description: 'The ID of the user' })
  userId: number;

  @ApiProperty({ type: Number, description: 'The ID of the product' })
  productId: number;

  @ApiProperty({ type: Number, description: 'The new quantity of the product' })
  quantity: number;
}

class RemoveFromCartDto {
  @ApiProperty({ type: Number, description: 'The ID of the user' })
  userId: number;

  @ApiProperty({ type: Number, description: 'The ID of the product' })
  productId: number;
}

@ApiTags('cart')
@Controller('api/cart')
export class CartController {
  constructor(
    private readonly cartService: CartService,
    private readonly prisma: DatabaseService,
  ) {}

  @ApiCreatedResponse({
    description: 'item added to cart',
  })
  @Post('add')
  @ApiBody({ type: AddToCartDto })
  async addToCart(@Body() addToCartDto: AddToCartDto) {
    const { userId, productId } = addToCartDto;

    // Check if the user exists
    const user = await this.prisma.users.findUnique({
      where: { userId },
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Check if the product exists and has sufficient stock
    const product = await this.prisma.products.findUnique({
      where: { productId },
    });
    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }
    if (product.stock <= 0) {
      throw new BadRequestException(`Product ${product.name} is out of stock`);
    }

    // Check if the user already has a cart
    let cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: { products: true }, // Include products in cart to check existing items
    });

    // If cart doesn't exist, create a new one
    if (!cart) {
      cart = await this.prisma.cart.create({
        data: {
          userId,
        },
        include: { products: true },
      });
    }
    // Check if the product is already in the user's cart
    const existingCartItem = cart.products.find(
      (item) => item.productId === productId,
    );
    if (existingCartItem) {
      // Update quantity if product already exists in cart
      await this.prisma.cartProduct.update({
        where: {
          cartId_productId: {
            cartId: cart.cartId,
            productId,
          },
        },
        data: {
          quantity: {
            increment: 1,
          },
        },
      });
    } else {
      // Add new item to cart if it doesn't exist
      await this.prisma.cartProduct.create({
        data: {
          cartId: cart.cartId,
          productId,
          quantity: 1,
        },
      });
    }

    // Decrease product stock by 1 after adding to cart
    await this.prisma.products.update({
      where: { productId },
      data: {
        stock: {
          decrement: 1,
        },
      },
    });

    return { message: 'Product added to cart successfully' };
  }

  @ApiOkResponse({
    description: "items in the user's cart are shown ",
  })
  @Get(':userId')
  async getCart(@Param('userId') userId: string) {
    // Convert userId to a number if necessary
    const userIdNum = parseInt(userId, 10);

    // Retrieve the user's cart
    const cart = await this.cartService.findCartByUserId(userIdNum);

    return cart;
  }

  @ApiOkResponse({ description: 'quantity updated' })
  @Put('update')
  @ApiBody({ type: UpdateCartItemDto })
  async updateCartItem(@Body() updateCartItemDto: UpdateCartItemDto) {
    const { userId, productId, quantity } = updateCartItemDto;

    try {
      if (quantity < 0) {
        throw new BadRequestException("new quantity can't be negative");
      }
      // Check if the change in quantity can be applied
      const canApplyChange = await this.cartService.canApplyQuantityChange(
        userId,
        productId,
        quantity,
      );

      if (!canApplyChange) {
        throw new BadRequestException(
          `Cannot apply the requested change in quantity for product ${productId}`,
        );
      }

      const updatedCartItem = await this.cartService.updateCartItem(
        userId,
        productId,
        quantity,
      );
      return updatedCartItem;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error; // Rethrow NotFoundException or BadRequestException with original message
      }
      throw new NotFoundException(`Error updating cart item: ${error.message}`);
    }
  }

  @ApiOkResponse({ description: "Product removed from user's cart" })
  @Delete('remove')
  async removeFromCart(@Body() removeFromCartDto: RemoveFromCartDto) {
    try {
      const { userId, productId } = removeFromCartDto;
      const result = await this.cartService.removeProductFromCart(
        userId,
        productId,
      );
      return result;
    } catch (error) {
      throw new BadRequestException(`${error}`);
    }
  }
}
