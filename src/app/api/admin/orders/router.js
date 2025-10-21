import { prisma } from '@/lib/prisma'

export async function GET(request){
    try {
     const authHeader = request.headers.get('authorization');
     if ( !authHeader || !authHeader.startsWith('Bearer')){
        return Response.json ({ success: false, error: 'Unauthorized'}, {status: 401})
     }

     const { searchParams } = new URL(request.url);
     const page = parseInt(searchParams.get('page')) || 1;
     const limit = parseInt(searchParams.get('limit')) || 10;
     const status = searchParams.get('status') || 'all';
     const search = searchParams.get('search') || '';

     const skip = (page-1) * limit;

     // Build where clause for Prisma
     let where = {};
     if(status !== 'all') {
        where.status = status;
     }

     if(search){
        where.OR = [
            { customerInfo: { contains: search, mode: 'insensitive' } },
            { id: { equals: isNaN(parseInt(search)) ? undefined : parseInt(search) } }
        ].filter(condition => condition.id !== undefined || Object.keys(condition).length > 0);
     }

     const orders = await prisma.order.findMany({
        where,
        include: {
           user: {
              select: { name: true, email: true }
           }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
     });

     const totalCount = await prisma.order.count({ where });
     const totalPages = Math.ceil(totalCount / limit);

     return Response.json({
        success: true,
        orders: orders.map(order => ({
            id: `#${order.id.toString().padStart(3, '0')}`,
            customer: order.user?.name || 'N/A',
            email: order.user?.email || 'N/A',
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
        return Response.json ({
            success: false,
            error: 'Lỗi khi tải danh sách đơn hàng'
        }, {status: 500})
    }
}