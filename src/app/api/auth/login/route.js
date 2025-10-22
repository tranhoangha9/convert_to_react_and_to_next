import prisma from '@/lib/prisma';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return Response.json({
        success: false,
        error: 'Email and password are required'
      }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        address: true,
        role: true,
        isActive: true,
        password: true
      }
    });

    if (!user) {
      return Response.json({
        success: false,
        error: 'Invalid email or password'
      }, { status: 401 });
    }

    if (!user.isActive) {
      return Response.json({
        success: false,
        error: 'Account is deactivated'
      }, { status: 401 });
    }

    if (user.password !== password) {
      return Response.json({
        success: false,
        error: 'Invalid email or password'
      }, { status: 401 });
    }

    const { password: _, ...userWithoutPassword } = user;

    return Response.json({
      success: true,
      user: {
        ...userWithoutPassword,
        loginTime: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return Response.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
