// app/api/reports/route.ts
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getCurrentUserId } from '@/lib/auth'

// ดึงประวัติของโรงงานที่ Login อยู่
export async function GET() {
  try {
    const userId = await getCurrentUserId()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const reports = await prisma.report.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(reports)
  } catch (error) {
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูล' }, { status: 500 })
  }
}

// บันทึกข้อมูลใหม่ลง Database
export async function POST(req: Request) {
  try {
    const userId = await getCurrentUserId()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const data = await req.json()

    const report = await prisma.report.create({
      data: {
        userId,
        month: data.month,
        electricity: Number(data.electricity),
        water: Number(data.water),
        lpg: Number(data.lpg),
        diesel: Number(data.diesel),
        gasoline: Number(data.gasoline),
        generalWaste: Number(data.generalWaste),
        hazardousWaste: Number(data.hazardousWaste),
        rawMaterial: Number(data.rawMaterial),
        transport: Number(data.transport),
        totalCO2: Number(data.totalCO2),
      }
    })

    return NextResponse.json({ message: 'บันทึกข้อมูลสำเร็จ', report })
  } catch (error) {
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการบันทึก' }, { status: 500 })
  }
}