import prisma from '@/lib/prisma'

export async function GET(request) {
  try {
    const topProducts = await prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: {
        quantity: true,
        price: true
      },
      orderBy: {
        _sum: {
          quantity: 'desc'
        }
      },
      take: 5
    });

    const productIds = topProducts.map(item => item.productId);
    const products = await prisma.product.findMany({
      where: {
        id: {
          in: productIds
        }
      },
      select: {
        id: true,
        name: true
      }
    });

    const productsMap = products.reduce((acc, product) => {
      acc[product.id] = product.name;
      return acc;
    }, {});

    const result = topProducts.map(item => ({
      name: productsMap[item.productId] || `Product #${item.productId}`,
      sales: item._sum.quantity || 0,
      revenue: `$${(item._sum.price || 0).toFixed(2)}`
    }));

    return Response.json({
      success: true,
      products: result
    })
  } catch (error) {
    console.error('Error fetching top products:', error);
    return Response.json({
      success: false,
      error: 'Error loading top products'
    }, { status: 500 })
  }
}
