// app/api/auth/logout/route.ts
import { NextResponse } from 'next/server'

export async function POST() {
  const res = NextResponse.json({ message: 'ออกจากระบบสำเร็จ' })
  res.cookies.delete('userId')
  return res
}