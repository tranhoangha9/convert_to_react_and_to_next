import { prisma } from '@/lib/prisma'

export async function POST(request) {
  try {
    const { name, email, password, role, isActive, phone, address } = await request.json()

    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return Response.json({
        success: false,
        error: 'Email đã tồn tại'
      }, { status: 400 })
    }

    const userPassword = password

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: userPassword,
        role,
        isActive,
        phone,
        address
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        phone: true,
        address: true,
        createdAt: true
      }
    })

    return Response.json({
      success: true,
      user: newUser,
      message: 'Tạo user thành công'
    })

  } catch (error) {
    console.error('Error creating user:', error)
    return Response.json({
      success: false,
      error: 'Có lỗi xảy ra khi tạo user'
    }, { status: 500 })
  }
}

export async function GET(request) {
    try {

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 10;
        const role = searchParams.get('role') || 'all';
        const status = searchParams.get('status') || 'all';
        const search = searchParams.get('search') || '';

        const skip = (page - 1) * limit;

        let where = {};
        if (role !== 'all') where.role = role;
        if (status !== 'all') where.isActive = status === 'active';

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } }
            ];
        }

        const users = await prisma.user.findMany({
            where,
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                isActive: true,
                phone: true,
                address: true,
                createdAt: true
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit
        });

        const totalCount = await prisma.user.count({ where });
        const totalPages = Math.ceil(totalCount / limit);

        return Response.json({
            success: true,
            users: users.map(user => ({
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                status: user.isActive ? 'active' : 'inactive',
                joinDate: user.createdAt.toISOString().split("T")[0],
                phone: user.phone,
                address: user.address,
                lastLogin: 'Never',
                ordersCount: 0,
                totalSpent: 0
            })),
            pagination: {
                currentPage: page,
                totalPages,
                totalCount,
                hasNext: page < totalPages,
                hasPrev: page > 1
            }
        })
    } catch (error) {
        console.error('Error fetching users: ', error);
        return Response.json({success: false, error: 'Lỗi khi tải danh sách người dùng'}, {status: 500})
    }
}
