import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import path from 'path';
import { unlink } from 'fs/promises';

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
        { success: false, error: 'Product name and price are required' },
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
      message: 'Product created successfully',
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
        { success: false, error: 'Product ID is required' },
        { status: 400 }
      );
    }

    if (!name || !price) {
      return NextResponse.json(
        { success: false, error: 'Product name and price are required' },
        { status: 400 }
      );
    }

    const existingProduct = await prisma.product.findUnique({
      where: { id: parseInt(id) },
      select: { image: true }
    });

    if (!existingProduct) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    const oldImage = existingProduct.image;

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

    if (oldImage && oldImage.startsWith('/uploads/') && oldImage !== image) {
      const isProduction = process.env.NODE_ENV === 'production';
      const uploadDir = isProduction
        ? '/var/www/nextapp/uploads'
        : path.join(process.cwd(), 'public', 'uploads');

      const oldFilename = path.basename(oldImage);
      const oldFilePath = path.join(uploadDir, oldFilename);

      try {
        await unlink(oldFilePath);
      } catch (error) {
        console.warn('Unable to delete old product image:', error);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Product updated successfully',
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
      message: `Product has been ${isActive ? 'activated' : 'deactivated'} successfully`,
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
      message: 'Product has been deactivated successfully'
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
