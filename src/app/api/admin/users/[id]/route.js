import { prisma } from '@/lib/prisma'

export async function PUT(request, { params }) {
  try {
    const { id } = params
    const { name, email, role, isActive, phone, address } = await request.json()

    const existingUser = await prisma.user.findUnique({
      where: { id: parseInt(id) }
    })

    if (!existingUser) {
      return Response.json({
        success: false,
        error: 'User không tồn tại'
      }, { status: 404 })
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

    await prisma.user.delete({
      where: { id: parseInt(id) }
    })

    return Response.json({
      success: true,
      message: 'Xóa user thành công'
    })

  } catch (error) {
    console.error('Error deleting user:', error)
    return Response.json({
      success: false,
      error: 'Có lỗi xảy ra khi xóa user'
    }, { status: 500 })
  }
}
