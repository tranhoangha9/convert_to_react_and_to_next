import { prisma } from '../../../../../lib/prisma';

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

    const allowedFields = ['name', 'phone', 'address', 'avatar'];
    const filteredData = {};
    
    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        filteredData[field] = updateData[field];
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: parseInt(userId) },
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
