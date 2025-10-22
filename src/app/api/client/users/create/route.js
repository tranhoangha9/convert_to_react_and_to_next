import prisma from '@/lib/prisma';

export async function POST(request) {
  try {
    const { email, name, password, phone, address } = await request.json();

    if (!email || !name || !password) {
      return Response.json({
        success: false,
        error: 'Email, name and password are required'
      }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return Response.json({
        success: false,
        error: 'Email already exists'
      }, { status: 400 });
    }

    const user = await prisma.user.create({
      data: {
        email,
        name,
        password,
        phone,
        address,
        role: 'user'
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        address: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return Response.json({
      success: true,
      user
    });

  } catch (error) {
    console.error('Error creating user:', error);
    return Response.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
