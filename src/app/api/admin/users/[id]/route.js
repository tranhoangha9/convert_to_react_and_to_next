import prisma from '@/lib/prisma'
import { requireAuth } from '@/lib/authMiddleware'

const SECOND_LEVEL_PASSWORD = process.env.ADMIN_SECOND_PASSWORD || 'okadmindeptrai';

export async function PUT(request, { params }) {
  try {
    const authResult = requireAuth(request, ['admin', 'staff']);
    if (authResult.error) return authResult.error;
    const adminUser = authResult.user;

    const { id } = params
    const { name, email, role, isActive, phone, address, adminPassword } = await request.json()

    const existingUser = await prisma.user.findUnique({
      where: { id: parseInt(id) }
    })

    if (!existingUser) {
      return Response.json({
        success: false,
        error: 'User không tồn tại'
      }, { status: 404 })
    }

    if (adminUser.role === 'staff') {
      return Response.json({
        success: false,
        error: 'Bạn không có quyền chỉnh sửa người dùng'
      }, { status: 403 })
    }

    if (existingUser.role === 'admin' && adminUser.role !== 'admin') {
      return Response.json({
        success: false,
        error: 'Bạn không có quyền sửa admin'
      }, { status: 403 })
    }

    const isEditingOtherAdmin = existingUser.role === 'admin' && adminUser.role === 'admin' && parseInt(adminUser.id) !== parseInt(id)
    const isPromotingToAdmin = existingUser.role === 'staff' && role === 'admin'
    const isDemotingToStaff = existingUser.role === 'admin' && role === 'staff'
    const requiresSecondPassword = isEditingOtherAdmin || isPromotingToAdmin || isDemotingToStaff

    if (requiresSecondPassword) {
      if (!adminPassword) {
        return Response.json({
          success: false,
          error: 'Vui lòng nhập mật khẩu cấp 2'
        }, { status: 403 })
      }

      if (adminPassword !== SECOND_LEVEL_PASSWORD) {
        return Response.json({
          success: false,
          error: 'Mật khẩu cấp 2 không đúng'
        }, { status: 403 })
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: parseInt(id) },
      data: {
        name,
        email,
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
      user: updatedUser,
      message: 'Cập nhật user thành công'
    })

  } catch (error) {
    console.error('Error updating user:', error)
    return Response.json({
      success: false,
      error: 'Có lỗi xảy ra khi cập nhật user'
    }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const authResult = requireAuth(request, ['admin']);
    if (authResult.error) return authResult.error;
    const adminUser = authResult.user;

    const { id } = params

    const existingUser = await prisma.user.findUnique({
      where: { id: parseInt(id) }
    })

    if (!existingUser) {
      return Response.json({
        success: false,
        error: 'User không tồn tại'
      }, { status: 404 })
    }

    if (adminUser.role === 'staff') {
      return Response.json({
        success: false,
        error: 'Bạn không có quyền xóa người dùng'
      }, { status: 403 })
    }
    if (existingUser.role === 'admin') {
      return Response.json({
        success: false,
        error: 'Không thể xóa admin'
      }, { status: 403 })
    }

    await prisma.user.update({
      where: { id: parseInt(id) },
      data: { isActive: false }
    })

    return Response.json({
      success: true,
      message: 'Đã tắt kích hoạt user'
    })

  } catch (error) {
    console.error('Error deleting user:', error)
    return Response.json({
      success: false,
      error: 'Có lỗi xảy ra khi xóa user'
    }, { status: 500 })
  }
}
