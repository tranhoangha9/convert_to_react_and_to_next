import prisma from '../../../../../lib/prisma';

export async function PUT(request) {
  try {
    const { userId, newPassword } = await request.json();
    
    if (!userId || !newPassword) {
      return Response.json({
        success: false,
        error: 'User ID and new password are required'
      }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return Response.json({
        success: false,
        error: 'Password phải nhiều hơn hoặc bằng 6 ký tự'
      }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: parseInt(userId) },
      data: {
        password: newPassword,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        address: true,
        avatar: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return Response.json({
      success: true,
      message: 'Cap nhat password thanh cong'
    });

  } catch (error) {
    console.error('Error changing password:', error);
    return Response.json({
      success: false,
      error: 'Failed to change password'
    }, { status: 500 });
  }
}
