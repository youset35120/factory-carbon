// app/api/auth/reset-password/route.ts
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

const bcrypt = require('bcryptjs')

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json()

    // หา User จาก Token และเช็คว่ายังไม่หมดอายุ
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: { gt: new Date() } // gt = greater than (ยังไม่หมดเวลา)
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'ลิงก์รีเซ็ตรหัสผ่านไม่ถูกต้องหรือหมดอายุแล้ว' }, { status: 400 })
    }

    // เข้ารหัสรหัสผ่านใหม่
    const hashedPassword = await bcrypt.hash(password, 10)

    // อัปเดตรหัสผ่าน และลบ Token ทิ้ง
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null
      }
    })

    return NextResponse.json({ message: 'ตั้งรหัสผ่านใหม่สำเร็จ! กรุณาเข้าสู่ระบบ' })
  } catch (error) {
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการบันทึกรหัสผ่านใหม่' }, { status: 500 })
  }
}