// app/page.tsx
"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export default function LandingPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // เช็คเฉยๆ ว่าล็อกอินแล้วหรือยัง (ไม่ได้บังคับเปลี่ยนเส้นทาง)
    fetch("/api/auth/me").then(res => {
      if (res.ok) setIsLoggedIn(true);
    }).catch(() => {});
  }, []);

  return (
    <main className="min-h-screen bg-white font-sans text-gray-800">
      
      {/* ===== ส่วนเมนูนำทาง (Navbar) ===== */}
      <nav className="absolute top-0 left-0 right-0 z-10 flex justify-between items-center p-6 md:px-12">
        <div className="text-2xl font-bold text-gray-900">Carbon<span className="text-blue-600">Tax</span></div>
        <div className="flex gap-4 items-center">
          <a href="#pricing" className="text-gray-600 hover:text-blue-600 hidden md:block">ราคา</a>
          <a href="#features" className="text-gray-600 hover:text-blue-600 hidden md:block">ฟีเจอร์</a>
          {isLoggedIn ? (
            <Link href="/calculator" className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 font-semibold text-sm">เข้าสู่ระบบ</Link>
          ) : (
            <Link href="/login" className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 font-semibold text-sm">เริ่มต้นใช้งาน</Link>
          )}
        </div>
      </nav>

      {/* ===== ส่วนหัวของหน้า (Hero Section) ===== */}
      <header className="relative pt-40 pb-24 md:pt-48 md:pb-32 text-center overflow-hidden bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-4xl mx-auto px-6">
          <div className="inline-block mb-4 px-4 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
            🌍 รองรับมาตรฐาน ISO 14064-1 และ GHG Protocol
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
            จัดการ Carbon Footprint<br/>และ <span className="text-blue-600">ภาษีคาร์บอน</span> ของโรงงานคุณ
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            ระบบคำนวณอัตโนมัติ สร้างรายงาน PDF มาตรฐานสากล พร้อมแดชบอร์ดวิเคราะห์แนวโน้มการปล่อยก๊าซ ลดภาระภาษี CBAM ได้แบบครบวงจร
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Link href="/login" className="bg-blue-600 text-white font-bold py-4 px-8 rounded-lg hover:bg-blue-700 text-lg shadow-lg transition-transform hover:scale-105">
              ทดลองใช้งานฟรี 30 วัน
            </Link>
            <a href="#features" className="bg-white text-gray-800 font-bold py-4 px-8 rounded-lg border-2 border-gray-200 hover:border-gray-300 text-lg">
              ดูฟีเจอร์ทั้งหมด
            </a>
          </div>
        </div>
      </header>

      {/* ===== ส่วนฟีเจอร์ (Features Section) ===== */}
      <section id="features" className="py-20 px-6 md:px-12 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">ทำไมต้องใช้ระบบของเรา?</h2>
          <p className="text-gray-500 text-lg">เครื่องมือที่จะช่วยให้โรงงานของคุณก้าวสู่ Net Zero ได้อย่างมั่นใจ</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* การ์ด 1 */}
          <div className="p-8 bg-gray-50 rounded-2xl border border-gray-100 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-5 text-2xl">📊</div>
            <h3 className="text-xl font-bold mb-3">คำนวณอัตโนมัติ</h3>
            <p className="text-gray-600 leading-relaxed">กรอกค่าไฟ น้ำมัน ขยะ และการขนส่ง ระบบจะคำนวณออกมาเป็น kgCO2e แยกตาม Scope 1, 2, 3 ให้ทันที</p>
          </div>
          {/* การ์ด 2 */}
          <div className="p-8 bg-gray-50 rounded-2xl border border-gray-100 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-5 text-2xl">📄</div>
            <h3 className="text-xl font-bold mb-3">รายงาน PDF มาตรฐาน</h3>
            <p className="text-gray-600 leading-relaxed">สร้างรายงานประจำเดือน/รายปี พร้อมลายน้ำ Verified พร้อมยื่นหน่วยงานรัฐและด่านศุลกากร (CBAM)</p>
          </div>
          {/* การ์ด 3 */}
          <div className="p-8 bg-gray-50 rounded-2xl border border-gray-100 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-5 text-2xl">💰</div>
            <h3 className="text-xl font-bold mb-3">ประเมินภาษีคาร์บอน</h3>
            <p className="text-gray-600 leading-relaxed">พรีวิวต้นทุนภาษีคาร์บอนที่อาจจะต้องเสียในอนาคต ช่วยให้ฝ่ายการเงินวางแผนงบประมาณได้แม่นยำ</p>
          </div>
        </div>
      </section>

      {/* ===== ส่วนราคา (Pricing Section) ===== */}
      <section id="pricing" className="py-20 px-6 md:px-12 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">แพ็กเกจที่คุ้มค่าสำหรับทุกโรงงาน</h2>
            <p className="text-gray-500 text-lg">เลือกแพ็กเกจที่เหมาะสมกับขนาดของธุรกิจคุณ</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* แพ็กเกจ Basic */}
            <div className="bg-white p-8 rounded-2xl border border-gray-200 flex flex-col">
              <h3 className="text-xl font-bold text-gray-800">Basic</h3>
              <p className="text-gray-500 text-sm mt-1">สำหรับโรงงานขนาดเล็กที่เริ่มต้น</p>
              <div className="my-6">
                <span className="text-4xl font-extrabold text-gray-900">0</span>
                <span className="text-gray-500"> บาท/เดือน</span>
              </div>
              <ul className="space-y-3 mb-8 text-gray-600 flex-1">
                <li className="flex items-center gap-2"><span className="text-green-500">✔</span> กรอกข้อมูลได้ 1 โรงงาน</li>
                <li className="flex items-center gap-2"><span className="text-green-500">✔</span> ดาวน์โหลด PDF ได้ไม่จำกัด</li>
                <li className="flex items-center gap-2"><span className="text-green-500">✔</span> Dashboard สรุปผลรายเดือน</li>
                <li className="flex items-center gap-2 text-gray-400"><span className="text-gray-300">✖</span> ระบบอนุมัติ (Approval)</li>
                <li className="flex items-center gap-2 text-gray-400"><span className="text-gray-300">✖</span> เปรียบเทียบข้ามปี (YoY)</li>
              </ul>
              <Link href="/login" className="w-full bg-white text-blue-600 border-2 border-blue-600 py-3 rounded-lg font-bold text-center hover:bg-blue-50">
                เริ่มทดลองใช้ฟรี
              </Link>
            </div>

            {/* แพ็กเกจ Pro (Highlight) */}
            <div className="bg-white p-8 rounded-2xl border-2 border-blue-600 flex flex-col relative shadow-xl scale-105 z-10">
              <div className="absolute top-0 right-6 -translate-y-1/2 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">ยอดนิยม</div>
              <h3 className="text-xl font-bold text-blue-600">Professional</h3>
              <p className="text-gray-500 text-sm mt-1">สำหรับโรงงานที่ต้องการวางแผนระยะยาว</p>
              <div className="my-6">
                <span className="text-4xl font-extrabold text-gray-900">2,900</span>
                <span className="text-gray-500"> บาท/เดือน</span>
              </div>
              <ul className="space-y-3 mb-8 text-gray-600 flex-1">
                <li className="flex items-center gap-2"><span className="text-green-500">✔</span> กรอกข้อมูลได้สูงสุด 5 สาขา</li>
                <li className="flex items-center gap-2"><span className="text-green-500">✔</span> ฟีเจอร์ครบทุกอย่างใน Basic</li>
                <li className="flex items-center gap-2"><span className="text-green-500">✔</span> ระบบอนุมัติ (Verified Watermark)</li>
                <li className="flex items-center gap-2"><span className="text-green-500">✔</span> เปรียบเทียบข้ามปี (YoY)</li>
                <li className="flex items-center gap-2"><span className="text-green-500">✔</span> ตั้งเป้าหมายการลดก๊าซ</li>
                <li className="flex items-center gap-2"><span className="text-green-500">✔</span> Export Excel (CSV)</li>
              </ul>
              <Link href="/login" className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold text-center hover:bg-blue-700">
                สมัครสมาชิก Pro
              </Link>
            </div>

            {/* แพ็กเกจ Enterprise */}
            <div className="bg-white p-8 rounded-2xl border border-gray-200 flex flex-col">
              <h3 className="text-xl font-bold text-gray-800">Enterprise</h3>
              <p className="text-gray-500 text-sm mt-1">สำหรับกลุ่มอุตสาหกรรมขนาดใหญ่</p>
              <div className="my-6">
                <span className="text-4xl font-extrabold text-gray-900">ติดต่อเรา</span>
              </div>
              <ul className="space-y-3 mb-8 text-gray-600 flex-1">
                <li className="flex items-center gap-2"><span className="text-green-500">✔</span> โรงงานไม่จำกัดจำนวน</li>
                <li className="flex items-center gap-2"><span className="text-green-500">✔</span> ฟีเจอร์ครบทุกอย่างใน Pro</li>
                <li className="flex items-center gap-2"><span className="text-green-500">✔</span> Admin Overview Dashboard</li>
                <li className="flex items-center gap-2"><span className="text-green-500">✔</span> ระบบแจ้งเตือน Real-time</li>
                <li className="flex items-center gap-2"><span className="text-green-500">✔</span> ดูแลโดยทีมงาน Dedicated</li>
              </ul>
              <a href="mailto:sales@yourcompany.com" className="w-full bg-gray-800 text-white py-3 rounded-lg font-bold text-center hover:bg-gray-900">
                ติดต่อฝ่ายขาย
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ===== ส่วนท้าย (Footer) ===== */}
      <footer className="py-12 bg-gray-900 text-gray-400 text-center">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-2xl font-bold text-white mb-2">Carbon<span className="text-blue-500">Tax</span></div>
          <p className="text-sm mb-6">ระบบบริหารจัดการคาร์บอนฟุตพริ้นต์สำหรับอุตสาหกรรม 4.0</p>
          <div className="flex justify-center gap-6 text-sm">
            <a href="/privacy" className="hover:text-white">นโยบายความเป็นส่วนตัว</a>
            <a href="/terms" className="hover:text-white">ข้อกำหนดการใช้งาน</a>
            <a href="mailto:sales@yourcompany.com" className="hover:text-white">ติดต่อเรา</a>
          </div>
          <div className="mt-8 text-xs text-gray-500">© 2024 CarbonTax System. All rights reserved.</div>
        </div>
      </footer>

    </main>
  );
}