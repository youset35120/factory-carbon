// app/privacy/page.tsx
import Link from "next/link";

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-white font-sans text-gray-800">
      <div className="max-w-3xl mx-auto px-6 py-16 md:py-24">
        <Link href="/" className="text-blue-600 hover:underline mb-8 inline-block">&larr; กลับหน้าแรก</Link>
        <h1 className="text-3xl md:text-4xl font-bold mb-8 text-gray-900">นโยบายความเป็นส่วนตัย (Privacy Policy)</h1>
        <p className="text-sm text-gray-500 mb-10">อัปเดตล่าสุด: 1 มกราคม 2024</p>

        <div className="space-y-8 leading-relaxed text-gray-600">
          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-3">1. บทนำ</h2>
            <p>ระบบ CarbonTax ("เรา") เคารพความเป็นส่วนตัวของผู้ใช้งาน ("คุณ") นโยบายนี้อธิบายวิธีการที่เราเก็บรวบรวม ใช้ และเปิดเผยข้อมูลส่วนบุคคลของคุณ เมื่อคุณใช้บริการแพลตฟอร์มคำนวณคาร์บอนฟุตพริ้นต์ของเรา</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-3">2. ข้อมูลที่เราเก็บรวบรวม</h2>
            <p>เพื่อให้บริการคำนวณและจัดทำรายงานคาร์บอนฟุตพริ้นต์ เราจำเป็นต้องเก็บข้อมูลดังต่อไปนี้:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li><strong>ข้อมูลบัญชี:</strong> ชื่อโรงงาน/บริษัท, ที่อยู่อีเมล, รหัสผ่าน (ที่เข้ารหัสแล้ว)</li>
              <li><strong>ข้อมูลการดำเนินงาน:</strong> ข้อมูลการใช้พลังงาน (ค่าไฟฟ้า, น้ำ), การใช้เชื้อเพลิง (ดีเซล, LPG), ปริมาณของเสีย, วัตถุดิบ และการขนส่ง</li>
              <li><strong>ข้อมูลการใช้งาน:</strong> บันทึกการเข้าสู่ระบบและการใช้งานฟีเจอร์ต่างๆ ในระบบ</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-3">3. วิธีการที่เราใช้ข้อมูล</h2>
            <p>เราใช้ข้อมูลของคุณเพื่อวัตถุประสงค์ดังนี้:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>เพื่อคำนวณปริมาณการปล่อยก๊าซเรือกระจก (Carbon Footprint) และภาษีคาร์บอนประมาณการ</li>
              <li>เพื่อสร้างและจัดเก็บรายงาน (PDF/Excel) สำหรับยื่นหน่วยงานราชการหรือใช้ภายในองค์กร</li>
              <li>เพื่อปรับปรุงประสิทธิภาพของระบบและพัฒนาฟีเจอร์ใหม่ๆ</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-3">4. การรักษาความปลอดภัยของข้อมูล</h2>
            <p>เราใช้มาตรการรักษาความปลอดภัยตามมาตรฐานอุตสาหกรรม เช่น การเข้ารหัสข้อมูลด้วย bcrypt และการจัดเก็บฐานข้อมูลบน Cloud ที่ได้รับการรับรองมาตรฐานความปลอดภัย (เช่น Supabase/PostgreSQL) เพื่อป้องกันการเข้าถึงข้อมูลโดยไม่ได้รับอนุญาต</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-3">5. การติดต่อ</h2>
            <p>หากคุณมีคำถามเกี่ยวกับนโยบายความเป็นส่วนตัวนี้ สามารถติดต่อเราได้ที่อีเมล support@carbontax.com</p>
          </section>
        </div>
      </div>
    </main>
  );
}