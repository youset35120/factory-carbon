// app/api/auth/register/route.ts
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

const bcrypt = require('bcryptjs')

export async function POST(req: Request) {
  try {
    const { email, password, factoryName, logo } = await req.json()

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json({ error: 'อีเมลนี้ถูกใช้งานแล้ว' }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        factoryName,
        logo: logo || null, // เก็บโลโก้ถ้ามี
      },
    })

    return NextResponse.json({ message: 'สมัครสมาชิกสำเร็จ', userId: user.id })
  } catch (error) {
    console.error("REGISTER ERROR:", error)
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการสมัครสมาชิก' }, { status: 500 })
  }
}