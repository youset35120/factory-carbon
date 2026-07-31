// app/api/auth/update/route.ts
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function PUT(req: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { factoryName, logo, monthlyTarget, plan } = await req.json()

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        factoryName: factoryName || user.factoryName,
        logo: logo !== undefined ? logo : user.logo,
        monthlyTarget: monthlyTarget !== undefined ? Number(monthlyTarget) : user.monthlyTarget,
        plan: plan || user.plan // <--- เพิ่มบรรทัดนี้
      }
    })

    return NextResponse.json({ message: 'อัปเดตข้อมูลสำเร็จ', user: updatedUser })
  } catch (error) {
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการอัปเดต' }, { status: 500 })
  }
}