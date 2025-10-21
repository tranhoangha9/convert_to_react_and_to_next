// Script để hash lại mật khẩu trong database
import { PrismaClient } from '@prisma/client'
import crypto from 'crypto'

const prisma = new PrismaClient()

async function hashExistingPasswords() {
  try {
    // Lấy tất cả users có mật khẩu chưa được hash (giả sử mật khẩu là text thường)
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        password: true,
        name: true
      }
    })

    console.log(`Tìm thấy ${users.length} users`)

    for (const user of users) {
      // Kiểm tra xem mật khẩu có phải là hash chưa (kiểm tra độ dài)
      if (user.password.length < 64) { // SHA256 hash thường dài 64 ký tự hex
        const hashedPassword = crypto.createHash('sha256').update(user.password + 'salt123').digest('hex')

        await prisma.user.update({
          where: { id: user.id },
          data: { password: hashedPassword }
        })

        console.log(`Đã hash mật khẩu cho user: ${user.email}`)
      }
    }

    console.log('Hoàn thành hash mật khẩu!')
  } catch (error) {
    console.error('Lỗi khi hash mật khẩu:', error)
  } finally {
    await prisma.$disconnect()
  }
}

hashExistingPasswords()
