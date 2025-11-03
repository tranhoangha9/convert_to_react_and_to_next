import prisma from '@/lib/prisma'

export async function GET(request) {
  try {

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const status = searchParams.get('status') || 'all';
    const search = searchParams.get('search') || '';
    const sortParam = searchParams.get('sort');
    const sortOrder = sortParam === 'asc' ? 'asc' : 'desc';

    const skip = (page - 1) * limit;

    const where = {};
    if (status !== 'all') {
      where.status = status;
    }

    const searchValue = search.trim();
    if (searchValue) {
      const searchNumber = parseInt(searchValue, 10);
      const orConditions = [
        {
          user: {
            OR: [
              { name: { contains: searchValue } },
              { email: { contains: searchValue } },
              { phone: { contains: searchValue } }
            ]
          }
        }
      ];

      if (!isNaN(searchNumber)) {
        orConditions.push({ id: searchNumber });
      }

      where.AND = [
        ...(where.AND || []),
        { OR: orConditions }
      ];
    }

    const [orders, totalCount] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          user: {
            select: { name: true, phone: true, email: true }
          },
          orderItems: {
            select: { quantity: true }
          }
        },
        orderBy: { id: sortOrder },
        skip,
        take: limit
      }),
      prisma.order.count({ where })
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return Response.json({
      success: true,
      orders: orders.map(order => ({
        id: `#${order.id.toString().padStart(3, '0')}`,
        customer: order.user?.name || 'N/A',
        phone: order.user?.phone || 'N/A',
        status: order.status,
        amount: order.totalAmount.toNumber(),
        date: order.createdAt.toISOString().split('T')[0],
        items: order.orderItems?.length || 0,
        paymentMethod: order.paymentMethod || 'N/A',
      })),
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching orders', error);
    return Response.json({
      success: false,
      error: 'Error loading orders'
    }, { status: 500 })
  }
}
