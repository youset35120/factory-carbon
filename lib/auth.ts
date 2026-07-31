// lib/auth.ts
import { cookies } from 'next/headers'
import prisma from './prisma'

export async function getCurrentUserId() {
  const cookieStore = await cookies()
  const userId = cookieStore.get('userId')?.value
  return userId
}

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
      monthlyTarget: true,
      plan: true 
    }
  })
  return user
}

export async function logout(): Promise<void> {
  const res = await fetch('/api/auth/logout', { method: 'POST' })
  if (res.ok) {
    window.location.href = '/login'
  }
}