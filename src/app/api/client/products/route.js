import prisma from '@/lib/prisma';

/**
 * GET /api/products?page=1&limit=9&categoryId=1
 * Lấy danh sách products với pagination
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '9');
    const categoryId = searchParams.get('categoryId');
    const search = searchParams.get('search') || '';
    const skip = (page - 1) * limit;
    
    const where = {
      isActive: true
    };
    let products, totalCount;
    
    if (search) {
      const searchLower = search.toLowerCase();
      const allProducts = await prisma.product.findMany({
        where,
        include: {
          category: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      
      const filtered = allProducts.filter(p => 
        p.name?.toLowerCase().includes(searchLower) ||
        p.description?.toLowerCase().includes(searchLower) ||
        p.shortDescription?.toLowerCase().includes(searchLower)
      );
      
      totalCount = filtered.length;
      products = filtered.slice(skip, skip + limit);
    } else {
      [products, totalCount] = await Promise.all([
        prisma.product.findMany({
          where,
          skip,
          take: limit,
          orderBy: {
            createdAt: 'desc'
          },
          include: {
            category: true
          }
        }),
        prisma.product.count({ where })
      ]);
    }
    const productsWithDiscount = products.map(product => {
      const price = parseFloat(product.price);
      const originalPrice = product.originalPrice ? parseFloat(product.originalPrice) : null;
      
      let discount = 0;
      if (originalPrice && originalPrice > price) {
        discount = Math.round(((originalPrice - price) / originalPrice) * 100);
      }

      return {
        id: product.id,
        name: product.name,
        brand: product.shortDescription || product.category?.name || 'Brand',
        price: price,
        originalPrice: originalPrice,
        discount: discount,
        rating: 5, 
        reviews: 43,
        image: product.image || '/assets/images/placeholder.png',
        isWishlisted: false,
        stock: product.stock
      };
    });

    const totalPages = Math.ceil(totalCount / limit);

    return Response.json({
      success: true,
      products: productsWithDiscount,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        limit,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Error fetching products:', error);
    return Response.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
