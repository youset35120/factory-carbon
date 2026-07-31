// app/api/auth/forgot-password/route.ts
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import crypto from 'crypto'

export async function POST(req: Request) {
  try {
    const { email } = await req.json()

    const user = await prisma.user.findUnique({ where: { email } })
    
    // ข้อความนี้จะแสดงเหมือนกันไม่ว่าอีเมลจะมีอยู่จริงหรือไม่ (เพื่อป้องกันการสุ่มอีเมล)
    if (!user) {
      return NextResponse.json({ message: 'หากอีเมลนี้มีอยู่ในระบบ เราได้ส่งลิงก์รีเซ็ตรหัสผ่านให้คุณแล้ว' })
    }

    // สร้าง Token แบบสุ่ม
    const resetToken = crypto.randomBytes(32).toString('hex')
    // ตั้งเวลาหมดอายุ 1 ชั่วโมง
    const resetTokenExpiry = new Date(Date.now() + 3600000)

    // บันทึก Token ลง Database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry
      }
    })

    // ===== จุดที่จะเสียบระบบส่งอีเมลจริง =====
    // ตอนนี้เราจะปริ้นลิงก์ออกมาใน Terminal ของ VS Code แทนการส่งอีเมล
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`
    console.log("====================================================")
    console.log("RESET PASSWORD LINK (สำหรับทดสอบ):")
    console.log(resetUrl)
    console.log("====================================================")

    return NextResponse.json({ message: 'หากอีเมลนี้มีอยู่ในระบบ เราได้ส่งลิงก์รีเซ็ตรหัสผ่านให้คุณแล้ว' })
  } catch (error) {
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในระบบ' }, { status: 500 })
  }
}