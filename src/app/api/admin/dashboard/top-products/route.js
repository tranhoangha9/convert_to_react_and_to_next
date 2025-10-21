import { prisma } from '@/lib/prisma'

export async function GET(request) {
  try {
    const products = [];

    return Response.json({
      success: true,
      products: products.map((product, index) => ({
        name: product.name || `Product ${index + 1}`,
        sales: product.sales || 0,
        revenue: product.revenue || 0
      }))
    })
  } catch (error) {
    console.error('Error fetching top products:', error);
    return Response.json({
      success: false,
      error: 'Lỗi khi tải sản phẩm nổi bật'
    }, { status: 500 })
  }
}
