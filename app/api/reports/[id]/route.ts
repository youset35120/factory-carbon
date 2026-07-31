// app/api/reports/[id]/route.ts
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

// API สำหรับลบข้อมูล
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'ไม่มีสิทธิ์ในการลบข้อมูล' }, { status: 403 })
    }

    const { id } = await params 
    await prisma.report.delete({ where: { id } })

    return NextResponse.json({ message: 'ลบข้อมูลสำเร็จ' })
  } catch (error) {
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการลบข้อมูล' }, { status: 500 })
  }
}

// API สำหรับอัปเดตสถานะ (อนุมัติ / ตีกลับ) - สำหรับ Admin
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'ไม่มีสิทธิ์ในการอนุมัติข้อมูล' }, { status: 403 })
    }

    const { id } = await params
    const { status } = await req.json() // รับค่า status มา (APPROVED หรือ REJECTED)

    if (!["APPROVED", "REJECTED", "PENDING"].includes(status)) {
      return NextResponse.json({ error: 'สถานะไม่ถูกต้อง' }, { status: 400 })
    }

    const updatedReport = await prisma.report.update({
      where: { id },
      data: { status }
    })

    return NextResponse.json({ message: 'อัปเดตสถานะสำเร็จ', report: updatedReport })
  } catch (error) {
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการอัปเดตสถานะ' }, { status: 500 })
  }
}