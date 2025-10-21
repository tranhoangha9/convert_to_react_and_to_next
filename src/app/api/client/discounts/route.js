import { prisma } from '../../../lib/prisma';

export async function GET(request) {
  try {
    const discounts = await prisma.discount.findMany({
      where: {
        isActive: true
      },
      select: {
        id: true,
        code: true,
        name: true,
        value: true,
        isActive: true
      },
      orderBy: {
        id: 'desc'
      }
    });

    return Response.json({
      success: true,
      discounts: discounts
    });

  } catch (error) {
    console.error('Error fetching discounts:', error);
    return Response.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
