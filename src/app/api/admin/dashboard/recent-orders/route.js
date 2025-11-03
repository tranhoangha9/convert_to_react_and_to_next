import prisma from '@/lib/prisma'

export async function GET(request) {
  try {
    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { name: true, email: true }
        }
      }
    });

    return Response.json({
      success: true,
      orders: recentOrders.map(order => ({
        id: `#${order.id.toString().padStart(3, '0')}`,
        customer: order.user?.name || 'N/A',
        amount: order.totalAmount.toNumber(),
        status: order.status,
        date: order.createdAt.toISOString().split('T')[0]
      }))
    })
  } catch (error) {
    console.error('Error fetching recent orders:', error);
    return Response.json({
      success: false,
      error: 'Error loading recent orders'
    }, { status: 500 })
  }
}
