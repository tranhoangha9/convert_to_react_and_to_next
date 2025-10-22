import prisma from '@/lib/prisma'

export async function GET(request) {
  try {
    const totalProducts = await prisma.product.count({ where: { isActive: true } });
    const totalOrders = await prisma.order.count();
    const totalUsers = await prisma.user.count({ where: { isActive: true } });

    const revenueResult = await prisma.order.aggregate({
      where: { status: 'completed' },
      _sum: { totalAmount: true }
    });
    const totalRevenue = revenueResult._sum.totalAmount?.toNumber() || 0;

    const recentOrdersCount = await prisma.order.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      }
    });

    const newUsersCount = await prisma.user.count({
      where: {
        isActive: true,
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      }
    });

    return Response.json({
      success: true,
      stats: {
        totalProducts,
        totalOrders,
        totalUsers,
        totalRevenue,
        recentOrdersCount,
        newUsersCount
      }
    })
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return Response.json({
      success: false,
      error: 'Lỗi khi tải thống kê dashboard'
    }, { status: 500 })
  }
}
