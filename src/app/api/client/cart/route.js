import { prisma } from '../../../lib/prisma';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return Response.json({
        success: false,
        error: 'User ID is required'
      }, { status: 400 });
    }

    const cart = await prisma.cart.findUnique({
      where: { userId: parseInt(userId) },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    const cartItems = cart?.items.map(item => ({
      id: item.product.id,
      name: item.product.name,
      price: parseFloat(item.product.price),
      image: item.product.image,
      quantity: item.quantity,
      brand: item.product.shortDescription || '',
      description: item.product.description || ''
    })) || [];

    return Response.json({
      success: true,
      cartItems
    });

  } catch (error) {
    console.error('Error fetching cart:', error);
    return Response.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

/**
 * POST /api/cart
 * Lưu giỏ hàng của user vào DB
 */
export async function POST(request) {
  try {
    const { userId, cartItems } = await request.json();

    if (!userId) {
      return Response.json({
        success: false,
        error: 'User ID is required'
      }, { status: 400 });
    }

    if (!Array.isArray(cartItems)) {
      return Response.json({
        success: false,
        error: 'Cart items must be an array'
      }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) }
    });

    if (!user) {
      return Response.json({
        success: false,
        error: 'User not found'
      }, { status: 404 });
    }

    let cart = await prisma.cart.findUnique({
      where: { userId: parseInt(userId) }
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: {
          userId: parseInt(userId)
        }
      });
    }

    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id }
    });

    if (cartItems.length > 0) {
      await prisma.cartItem.createMany({
        data: cartItems.map(item => ({
          cartId: cart.id,
          productId: item.id,
          quantity: item.quantity
        }))
      });
    }

    return Response.json({
      success: true,
      message: 'Cart saved successfully'
    });

  } catch (error) {
    console.error('Error saving cart:', error);
    return Response.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return Response.json({
        success: false,
        error: 'User ID is required'
      }, { status: 400 });
    }

    const cart = await prisma.cart.findUnique({
      where: { userId: parseInt(userId) }
    });

    if (cart) {
      await prisma.cartItem.deleteMany({
        where: { cartId: cart.id }
      });
    }

    return Response.json({
      success: true,
      message: 'Cart cleared successfully'
    });

  } catch (error) {
    console.error('Error clearing cart:', error);
    return Response.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
