import { NotFoundException, Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class CartService {
  private readonly prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }
  // viewing the cart
  async findCartByUserId(userId: number) {
    const user = await this.prisma.users.findUnique({
      where: { userId },
      include: {
        cart: {
          include: {
            products: {
              select: {
                quantity: true,
                productId: true,
                product: {
                  select: {
                    name: true,
                    description: true,
                    price: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      return { error: 'user not found' };
    }
    if (!user.cart) {
      return [];
    }

    return user.cart.products;
  }

  // updating the cart
  async canApplyQuantityChange(
    userId: number,
    productId: number,
    newQuantity: number,
  ): Promise<boolean> {
    try {
      const cartItem = await this.prisma.cart.findFirst({
        where: {
          userId,
        },
        include: {
          products: {
            where: {
              productId,
            },
          },
        },
      });

      if (!cartItem) {
        throw new NotFoundException(
          `Cart item for user ${userId} with product ${productId} not found`,
        );
      }

      const productEntry = cartItem.products.find(
        (prod) => prod.productId === productId,
      );

      if (!productEntry) {
        throw new NotFoundException(
          `Product ${productId} not found in cart for user ${userId}`,
        );
      }
      // Fetch the product details separately to check stock
      const product = await this.prisma.products.findUnique({
        where: {
          productId,
        },
      });

      if (!product) {
        throw new NotFoundException(`Product ${productId} not found`);
      }

      const currentQuantity = productEntry.quantity;
      const diff = newQuantity - currentQuantity;

      if (diff > product.stock) {
        return false; // Cannot apply change due to insufficient stock
      }

      return true; // Change can be applied
    } catch (error) {
      throw error; // Rethrow any error encountered
    }
  }

  async updateCartItem(userId: number, productId: number, quantity: number) {
    const cartItem = await this.prisma.cart.findFirst({
      where: {
        userId,
      },
      include: {
        products: {
          where: {
            productId,
          },
        },
      },
    });

    const cartProductItem = await this.prisma.cartProduct.findFirst({
      where: {
        cartId: cartItem.cartId,
        productId: productId,
      },
    });

    if (!cartItem) {
      throw new NotFoundException(
        `Cart item for user ${userId} with product ${productId} not found`,
      );
    }

    const productEntry = cartItem.products.find(
      (prod) => prod.productId === productId,
    );

    if (!productEntry) {
      throw new NotFoundException(
        `Product ${productId} not found in cart for user ${userId}`,
      );
    }

    const diff = cartProductItem.quantity - quantity;

    await this.prisma.cart.update({
      where: {
        cartId: cartItem.cartId,
      },
      data: {
        products: {
          updateMany: {
            where: {
              productId,
            },
            data: {
              quantity,
            },
          },
        },
      },
      include: {
        products: true,
      },
    });

    await this.adjustProductStock(productId, diff);

    const cartProductItem_check = await this.prisma.cartProduct.findFirst({
      where: {
        cart: {
          userId: userId,
        },
        AND: {
          quantity: 0,
        },
      },
    });

    if (cartProductItem_check) {
      const { cartId, productId } = cartProductItem_check;
      await this.prisma.cartProduct.delete({
        where: {
          cartId_productId: {
            cartId,
            productId,
          },
        },
      });
    }

    return await this.findCartByUserId(userId);
  }

  async adjustProductStock(productId: number, diff: number): Promise<void> {
    await this.prisma.products.update({
      where: {
        productId,
      },
      data: {
        stock: {
          increment: diff,
        },
      },
    });
  }

  // deleting product from cart
  async removeProductFromCart(userId: number, productId: number) {
    // Check if the user exists
    const user = await this.prisma.users.findUnique({
      where: { userId: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Check if the user has a cart
    const cart = await this.prisma.cart.findUnique({
      where: { userId: userId },
      include: {
        products: true,
      },
    });

    if (!cart) {
      throw new Error('Cart not found');
    }

    // Check if the product exists in the user's cart
    const cartProductItem = await this.prisma.cartProduct.findFirst({
      where: {
        cartId: cart.cartId,
        productId: productId,
      },
    });

    if (!cartProductItem) {
      throw new Error('Product not found in cart');
    }

    const productQuantity = cartProductItem.quantity;

    // Remove the product from the cart
    await this.prisma.cartProduct.delete({
      where: {
        cartId_productId: {
          cartId: cart.cartId,
          productId: productId,
        },
      },
    });

    await this.prisma.products.update({
      where: { productId: productId },
      data: { stock: { increment: productQuantity } }, // Increment the stock by the quantity removed
    });

    return this.findCartByUserId(userId);
  }
}
