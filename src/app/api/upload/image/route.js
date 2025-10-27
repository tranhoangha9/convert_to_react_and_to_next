import { writeFile, mkdir } from 'fs/promises';
import { NextResponse } from 'next/server';
import path from 'path';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('image');

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'Không có file được upload' },
        { status: 400 }
      );
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { success: false, error: 'Chỉ cho phép upload file ảnh' },
        { status: 400 }
      );
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: 'Kích thước file quá lớn (tối đa 5MB)' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const timestamp = Date.now();
    const extension = path.extname(file.name);
    const filename = `${timestamp}_${Math.random().toString(36).substring(2)}${extension}`;

    
    const isProduction = process.env.NODE_ENV === 'production';
    const uploadDir = isProduction 
      ? '/var/www/nextapp/uploads'  
      : path.join(process.cwd(), 'public', 'uploads'); 
    
    await mkdir(uploadDir, { recursive: true });

    const filepath = path.join(uploadDir, filename);
    await writeFile(filepath, buffer);
    const imageUrl = `/uploads/${filename}`;

    return NextResponse.json({
      success: true,
      imageUrl: imageUrl,
      filename: filename
    });

  } catch (error) {
    console.error('Error uploading image:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi khi upload ảnh' },
      { status: 500 }
    );
  }
}
