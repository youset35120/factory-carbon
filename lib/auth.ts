// lib/auth.ts
import { cookies } from 'next/headers'
import prisma from './prisma'

// ฟังก์ชันดึง ID ของ User ที่กำลัง Login อยู่จาก Cookie
export async function getCurrentUserId() {
  const cookieStore = await cookies()
  const userId = cookieStore.get('userId')?.value
  return userId
}

// ฟังก์ชันดึงข้อมูล User ทั้งหมด
export async function getCurrentUser() {
  const userId = await getCurrentUserId()
  if (!userId) return null

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { 
      id: true, 
      factoryName: true, 
      email: true,
      logo: true,
      role: true,
      monthlyTarget: true // <--- เพิ่มบรรทัดนี้เพื่อดึงค่าเป้าหมายการลดก๊าซ
    }
  })
  return user
}

// ฟังก์ชันสำหรับ Logout (ฝั่ง Client)
export async function logout(): Promise<void> {
  const res = await fetch('/api/auth/logout', { method: 'POST' })
  if (res.ok) {
    window.location.href = '/login'
  }
}