import prisma from '@/lib/prisma';

export async function POST(request) {
  try {
    const { code, subtotal } = await request.json();

    if (!code || !subtotal) {
      return Response.json({
        success: false,
        error: 'Thiếu thông tin'
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
        error: 'Mã giảm giá không hợp lệ'
      }, { status: 404 });
    }

    const discountPercentage = Number(discount.value);

    if (Number.isNaN(discountPercentage)) {
      return Response.json({
        success: false,
        error: 'Giá trị mã giảm giá không hợp lệ'
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
      error: 'Lỗi khi kiểm tra mã giảm giá'
    }, { status: 500 });
  }
}
