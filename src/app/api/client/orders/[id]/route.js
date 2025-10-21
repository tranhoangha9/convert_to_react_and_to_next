import { prisma } from '../../../../../lib/prisma';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');

    if (!orderId) {
      return Response.json({
        success: false,
        error: 'Order ID is required'
      }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: parseInt(orderId) },
      include: {
        orderItems: {
          include: {
            product: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!order) {
      return Response.json({
        success: false,
        error: 'Order not found'
      }, { status: 404 });
    }

    return Response.json({
      success: true,
      order: {
        id: order.id,
        totalAmount: order.totalAmount,
        discountId: order.discountId,
        discount: order.discount ? {
          id: order.discount.id,
          code: order.discount.code,
          name: order.discount.name,
          value: order.discount.value
        } : null,
        paymentMethod: order.paymentMethod,
        status: order.status,
        createdAt: order.createdAt,
        customerInfo: order.customerInfo,
        paymentInfo: order.paymentInfo,
        shippingAddress: order.shippingAddress,
        orderItems: order.orderItems.map(item => ({
          id: item.id,
          quantity: item.quantity,
          price: item.price,
          product: {
            id: item.product.id,
            name: item.product.name,
            image: item.product.image
          }
        }))
      }
    });

  } catch (error) {
    console.error('Error fetching order:', error);
    return Response.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
