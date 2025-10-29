import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { signToken } from '@/lib/jwt';

export async function POST(request) {
  try {
    const { email, password, target } = await request.json();
    const isAdminPortal = target === 'admin';

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

    if ((user.role === 'admin' || user.role === 'staff') && !isAdminPortal) {
      return Response.json({
        success: false,
        error: 'Tài khoản quản trị không thể đăng nhập ở giao diện khách hàng'
      }, { status: 403 });
    }

    let passwordValid = false;
    const isBcryptHash = user.password.startsWith('$2a$') || user.password.startsWith('$2b$');

    if (isBcryptHash) {
      passwordValid = await bcrypt.compare(password, user.password);
    } else {
      passwordValid = user.password === password;
      if (passwordValid) {
        const hashedPassword = await bcrypt.hash(password, 10);
        await prisma.user.update({
          where: { id: user.id },
          data: { password: hashedPassword }
        });
      }
    }

    if (!passwordValid) {
      return Response.json({
        success: false,
        error: 'Invalid email or password'
      }, { status: 401 });
    }

    const { password: _, ...userWithoutPassword } = user;

    const token = signToken({
      id: user.id,
      email: user.email,
      role: user.role
    });

    return Response.json({
      success: true,
      token,
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
