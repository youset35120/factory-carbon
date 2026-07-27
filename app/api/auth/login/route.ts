// app/api/auth/login/route.ts
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

const bcrypt = require('bcryptjs')

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return NextResponse.json({ error: 'ไม่พบบัญชีผู้ใช้นี้' }, { status: 400 })
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return NextResponse.json({ error: 'รหัสผ่านไม่ถูกต้อง' }, { status: 400 })
    }

    const res = NextResponse.json({ message: 'เข้าสู่ระบบสำเร็จ', factoryName: user.factoryName })
    res.cookies.set('userId', user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 7
    })

    return res
  } catch (error) {
    console.error("LOGIN ERROR:", error)
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ' }, { status: 500 })
  }
}