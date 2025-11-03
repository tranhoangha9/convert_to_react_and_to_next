import prisma from '@/lib/prisma';

export async function POST(request) {
  try {
    const { code, subtotal } = await request.json();

    if (!code || !subtotal) {
      return Response.json({
        success: false,
        error: 'Missing information'
      }, { status: 400 });
    }

    const discount = await prisma.discount.findFirst({
      where: {
        code: code,
        isActive: true
      }
    });

    if (!discount) {
      return Response.json({
        success: false,
        error: 'Invalid discount code'
      }, { status: 404 });
    }

    const discountPercentage = Number(discount.value);

    if (Number.isNaN(discountPercentage)) {
      return Response.json({
        success: false,
        error: 'Invalid discount value'
      }, { status: 400 });
    }

    const discountAmount = Number(subtotal) * (discountPercentage / 100);

    return Response.json({
      success: true,
      discount: {
        id: discount.id,
        code: discount.code,
        percentage: discountPercentage,
        amount: discountAmount
      }
    });

  } catch (error) {
    console.error('Validate coupon error:', error);
    return Response.json({
      success: false,
      error: 'Error validating discount code'
    }, { status: 500 });
  }
}
