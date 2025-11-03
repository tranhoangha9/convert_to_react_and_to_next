import prisma from '@/lib/prisma'

export async function GET(request){
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer')){
      return Response.json({success: false, error:"Unauthorized"}, {status: 401})
    }

    const totalProducts = await prisma.product.count({ where: { isActive: true } });
    const totalOrders = await prisma.order.count();
    const totalUsers = await prisma.user.count({ where: { isActive: true } });

    const revenueResult = await prisma.order.aggregate({
      where: { status: 'completed' },
      _sum: { totalAmount: true }
    });
    const totalRevenue = revenueResult._sum.totalAmount?.toNumber() || 0;
    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { name: true, email: true }
        }
      }
    });

    const topProducts = [];
    return Response.json({
      success: true,
      stats: {
        totalProducts,
        totalOrders,
        totalUsers,
        totalRevenue
      },
      recentOrders: recentOrders.map(order => ({
        id: `#${order.id.toString().padStart(3, '0')}`,
        customer: order.user?.name || 'N/A',
        amount: order.totalAmount.toNumber(),
        status: order.status,
        date: order.createdAt.toISOString().split('T')[0]
      })),
      topProducts: topProducts
    })
  } catch (error) {
    console.error(error);
    return Response.json({success: false, error: "Error loading dashboard data"}, {status: 500})
  }
}
