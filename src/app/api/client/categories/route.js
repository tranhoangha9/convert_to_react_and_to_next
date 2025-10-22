import prisma from '@/lib/prisma';

export async function GET(request) {
  try {
    const categories = await prisma.category.findMany({
      where: {
        isActive: true
      },
      orderBy: {
        id: 'asc'
      }
    });

    return Response.json({
      success: true,
      categories: categories
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return Response.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
