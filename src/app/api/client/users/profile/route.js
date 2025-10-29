import prisma from '@/lib/prisma';
import path from 'path';
import { unlink } from 'fs/promises';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return Response.json({
        success: false,
        error: 'User ID is required'
      }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
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

    if (!user) {
      return Response.json({
        success: false,
        error: 'User not found'
      }, { status: 404 });
    }

    return Response.json({
      success: true,
      user
    });

  } catch (error) {
    console.error('Error fetching user profile:', error);
    return Response.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const { userId, ...updateData } = await request.json();

    if (!userId) {
      return Response.json({
        success: false,
        error: 'User ID is required'
      }, { status: 400 });
    }

    const parsedUserId = parseInt(userId);

    if (Number.isNaN(parsedUserId)) {
      return Response.json({
        success: false,
        error: 'User ID không hợp lệ'
      }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { id: parsedUserId },
      select: { email: true, avatar: true }
    });

    if (!existingUser) {
      return Response.json({
        success: false,
        error: 'User không tồn tại'
      }, { status: 404 });
    }

    const allowedFields = ['name', 'phone', 'address', 'avatar'];
    const filteredData = {};

    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        filteredData[field] = updateData[field];
      }
    }

    if (updateData.email !== undefined) {
      const newEmail = String(updateData.email).trim();

      if (!newEmail) {
        return Response.json({
          success: false,
          error: 'Email không được để trống'
        }, { status: 400 });
      }

      if (newEmail !== existingUser.email) {
        const emailInUse = await prisma.user.findFirst({
          where: {
            email: newEmail,
            id: { not: parsedUserId }
          },
          select: { id: true }
        });

        if (emailInUse) {
          return Response.json({
            success: false,
            error: 'Email đã được sử dụng'
          }, { status: 409 });
        }
      }

      filteredData.email = newEmail;
    }

    const updatedUser = await prisma.user.update({
      where: { id: parsedUserId },
      data: filteredData,
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

    if (
      filteredData.avatar &&
      existingUser.avatar &&
      existingUser.avatar.startsWith('/uploads/') &&
      existingUser.avatar !== filteredData.avatar
    ) {
      const isProduction = process.env.NODE_ENV === 'production';
      const uploadDir = isProduction
        ? '/var/www/nextapp/uploads'
        : path.join(process.cwd(), 'public', 'uploads');

      const oldFilename = path.basename(existingUser.avatar);
      const oldFilePath = path.join(uploadDir, oldFilename);

      try {
        await unlink(oldFilePath);
      } catch (error) {
        console.warn('Không thể xoá avatar cũ:', error);
      }
    }

    return Response.json({
      success: true,
      user: updatedUser
    });

  } catch (error) {
    console.error('Error updating user profile:', error);
    return Response.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
