import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { requireAuth } from '@/lib/authMiddleware'

export async function POST(request) {
  try {
    const authResult = requireAuth(request, ['admin']);
    if (authResult.error) return authResult.error;
    const adminUser = authResult.user;

    const { name, email, password, role, isActive, phone, address } = await request.json()

    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return Response.json({
        success: false,
        error: 'Email already exists'
      }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
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
      message: 'User created successfully'
    })

  } catch (error) {
    console.error('Error creating user:', error)
    return Response.json({
      success: false,
      error: 'An error occurred while creating user'
    }, { status: 500 })
  }
}

export async function GET(request) {
    try {
        const authResult = requireAuth(request, ['admin', 'staff']);  
        if (authResult.error) return authResult.error;

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 10;
        const roleGroup = searchParams.get('roleGroup') || 'all';
        const roleParam = searchParams.get('role') || 'all';
        const status = searchParams.get('status') || 'all';
        const search = searchParams.get('search') || '';

        const skip = (page - 1) * limit;

        const baseWhere = {};
        if (roleParam !== 'all') baseWhere.role = roleParam;
        if (roleGroup === 'admins') {
          baseWhere.role = { in: ['admin', 'staff'] };
          baseWhere.isActive = true;
        }
        if (status !== 'all') baseWhere.isActive = status === 'active';

        const where = { ...baseWhere };

        const searchValue = search.trim();
        if (searchValue) {
          const orConditions = [
            { email: { contains: searchValue } },
            { phone: { contains: searchValue } }
          ];

          where.AND = [
            ...(where.AND || []),
            { OR: orConditions }
          ];
        }

        const selectedFields = {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
          phone: true,
          address: true,
          createdAt: true
        };

        const [users, totalCount] = await Promise.all([
          prisma.user.findMany({
            where,
            select: selectedFields,
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit
          }),
          prisma.user.count({ where })
        ]);

        const totalPages = Math.max(1, Math.ceil(totalCount / limit));

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
        return Response.json({success: false, error: 'Error loading user list'}, {status: 500})
    }
}
