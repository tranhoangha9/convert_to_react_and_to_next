import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        skip,
        take: limit,
        include: {
          category: true
        },
        orderBy: {
          id: 'desc'
        }
      }),
      prisma.product.count()
    ]);

    return NextResponse.json({
      success: true,
      products,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        limit
      }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    const {
      name,
      price,
      originalPrice,
      description,
      shortDescription,
      image,
      sku,
      stock,
      categoryId,
      isActive,
      isFeatured
    } = data;

    if (!name || !price) {
      return NextResponse.json(
        { success: false, error: 'Tên và giá sản phẩm là bắt buộc' },
        { status: 400 }
      );
    }

    const product = await prisma.product.create({
      data: {
        name,
        price: parseFloat(price),
        originalPrice: originalPrice ? parseFloat(originalPrice) : null,
        description,
        shortDescription,
        image,
        sku,
        stock: parseInt(stock || 0),
        categoryId: categoryId ? parseInt(categoryId) : null,
        isActive: isActive !== undefined ? isActive : true,
        isFeatured: isFeatured !== undefined ? isFeatured : false
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Tạo sản phẩm thành công',
      product
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function PUT(request) {
  try {
    const data = await request.json();
    const {
      id,
      name,
      price,
      originalPrice,
      description,
      shortDescription,
      image,
      sku,
      stock,
      categoryId,
      isActive,
      isFeatured
    } = data;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID sản phẩm là bắt buộc' },
        { status: 400 }
      );
    }

    if (!name || !price) {
      return NextResponse.json(
        { success: false, error: 'Tên và giá sản phẩm là bắt buộc' },
        { status: 400 }
      );
    }

    const product = await prisma.product.update({
      where: { id: parseInt(id) },
      data: {
        name,
        price: parseFloat(price),
        originalPrice: originalPrice ? parseFloat(originalPrice) : null,
        description,
        shortDescription,
        image,
        sku,
        stock: parseInt(stock || 0),
        categoryId: categoryId ? parseInt(categoryId) : null,
        isActive: isActive !== undefined ? isActive : true,
        isFeatured: isFeatured !== undefined ? isFeatured : false
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Cập nhật sản phẩm thành công',
      product
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function PATCH(request) {
  try {
    const data = await request.json();
    const { id, isActive } = data;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID sản phẩm là bắt buộc' },
        { status: 400 }
      );
    }

    const product = await prisma.product.update({
      where: { id: parseInt(id) },
      data: { isActive }
    });

    return NextResponse.json({
      success: true,
      message: `Đã ${isActive ? 'kích hoạt' : 'tắt kích hoạt'} sản phẩm thành công`,
      product
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID sản phẩm là bắt buộc' },
        { status: 400 }
      );
    }

    const product = await prisma.product.update({
      where: { id: parseInt(id) },
      data: { isActive: false }
    });

    return NextResponse.json({
      success: true,
      message: 'Đã tắt kích hoạt sản phẩm thành công'
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
