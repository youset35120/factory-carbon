// app/api/reports/route.ts
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

// ดึงประวัติข้อมูล
export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    let reports;
    // ถ้าเป็น ADMIN ให้ดึงข้อมูลทุกโรงงาน พร้อมชื่อโรงงานมาแสดงด้วย
    if (user.role === 'ADMIN') {
      reports = await prisma.report.findMany({
        include: {
          user: {
            select: { factoryName: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      })
    } else {
      // ถ้าเป็น USER ดึงได้แค่ข้อมูลตัวเอง
      reports = await prisma.report.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' }
      })
    }

    return NextResponse.json(reports)
  } catch (error) {
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูล' }, { status: 500 })
  }
}

// บันทึกข้อมูลใหม่ (ให้เฉพาะ USER หรือ ADMIN บันทึกของตัวเองได้)
export async function POST(req: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const data = await req.json()

    const report = await prisma.report.create({
      data: {
        userId: user.id,
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