import prisma from '@/lib/prisma';

export async function POST(request) {
  try {
    const { customerInfo, paymentInfo, cartItems, total, userId, discount, discountCode } = await request.json();

    if (!customerInfo || !paymentInfo || !cartItems || cartItems.length === 0 || !userId) {
      return Response.json({
        success: false,
        error: 'Missing required information'
      }, { status: 400 });
    }

    if (!customerInfo.fullName || !customerInfo.mobileNumber || !customerInfo.state || !customerInfo.city) {
      return Response.json({
        success: false,
        error: 'Missing customer information'
      }, { status: 400 });
    }

    if (paymentInfo.method === 'card') {
      if (!paymentInfo.cardNumber || !paymentInfo.expiryDate || !paymentInfo.cvv || !paymentInfo.cardHolderName) {
        return Response.json({
          success: false,
          error: 'Missing payment information'
        }, { status: 400 });
      }
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true }
    });

    if (!user) {
      return Response.json({
        success: false,
        error: 'User not found'
      }, { status: 401 });
    }

    const shippingAddress = `${customerInfo.fullName}, ${customerInfo.mobileNumber}, ${customerInfo.state}, ${customerInfo.city}${customerInfo.pinCode ? ', ' + customerInfo.pinCode : ''}`;

    let discountId = null;
    if (discount && discount > 0 && discountCode) {
      const discountRecord = await prisma.discount.findFirst({
        where: {
          code: discountCode,
          isActive: true
        }
      });

      if (!discountRecord) {
        return Response.json({
          success: false,
          error: 'Invalid discount code'
        }, { status: 400 });
      }

      discountId = discountRecord.id;
    }

    for (const item of cartItems) {
      const product = await prisma.product.findUnique({
        where: { id: item.id },
        select: { stock: true, name: true }
      });

      if (!product || product.stock < item.quantity) {
        const productName = product?.name || `Product #${item.id}`;
        const remaining = product?.stock ?? 0;
        return Response.json({
          success: false,
          error: `Product "${productName}" has only ${remaining} item(s) left`
        }, { status: 400 });
      }
    }

    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          userId: user.id,
          totalAmount: total,
          discountId: discountId,
          paymentMethod: paymentInfo.method,
          status: 'pending',
          customerInfo: JSON.stringify(customerInfo),
          paymentInfo: JSON.stringify(paymentInfo),
          shippingAddress: shippingAddress,
          notes: null
        }
      });

      const orderItemsData = cartItems.map(item => ({
        orderId: newOrder.id,
        productId: item.id,
        quantity: item.quantity,
        price: item.price
      }));

      await tx.orderItem.createMany({
        data: orderItemsData
      });

      for (const item of cartItems) {
        await tx.product.update({
          where: { id: item.id },
          data: {
            stock: {
              decrement: item.quantity
            }
          }
        });
      }

      return newOrder;
    });

    return Response.json({
      success: true,
      orderId: order.id,
      message: 'Order placed successfully'
    });

  } catch (error) {
    console.error('Order creation error:', error);
    return Response.json({
      success: false,
      error: error.message || 'Internal server error'
    }, { status: 500 });
  }
}
