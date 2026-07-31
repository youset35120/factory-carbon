// app/not-found.tsx
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 font-sans text-center">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg border border-gray-100">
        <h1 className="text-6xl font-extrabold text-blue-600 mb-4">404</h1>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">หน้าเว็บไม่พบ</h2>
        <p className="text-gray-500 mb-8">
          ขออภัยด้วยครับ ไม่พบหน้าเว็บที่คุณกำลังมองหา อาจจะถูกลบไปแล้ว หรือคุณอาจจะพิมพ์ URL ผิดพลาด
        </p>
        <div className="flex flex-col gap-3">
          <Link href="/" className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors">
            กลับหน้าแรก
          </Link>
          <Link href="/login" className="w-full bg-gray-200 text-gray-700 font-bold py-3 rounded-lg hover:bg-gray-300 transition-colors">
            เข้าสู่ระบบ
          </Link>
        </div>
      </div>
    </main>
  );
}