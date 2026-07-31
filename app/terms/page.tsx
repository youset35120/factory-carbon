// app/terms/page.tsx
import Link from "next/link";

export default function TermsOfServicePage() {
  return (
    <main className="min-h-screen bg-white font-sans text-gray-800">
      <div className="max-w-3xl mx-auto px-6 py-16 md:py-24">
        <Link href="/" className="text-blue-600 hover:underline mb-8 inline-block">&larr; กลับหน้าแรก</Link>
        <h1 className="text-3xl md:text-4xl font-bold mb-8 text-gray-900">ข้อกำหนดการใช้งาน (Terms of Service)</h1>
        <p className="text-sm text-gray-500 mb-10">อัปเดตล่าสุด: 1 มกราคม 2024</p>

        <div className="space-y-8 leading-relaxed text-gray-600">
          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-3">1. การยอมรับข้อกำหนด</h2>
            <p>การสมัครสมาชิกและการใช้งานระบบ CarbonTax ถือว่าคุณได้ยอมรับข้อกำหนดและเงื่อนไขทั้งหมดที่ระบุไว้ในเอกสารฉบับนี้ หากคุณไม่เห็นด้วยกับข้อกำหนดใดๆ กรุณาหยุดใช้บริการของเรา</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-3">2. บัญชีผู้ใช้งาน</h2>
            <p>คุณมีหน้าที่รับผิดชอบในการรักษาความลับของรหัสผ่าน และรับผิดชอบต่อกิจกรรมทั้งหมดที่เกิดขึ้นภายใต้บัญชีของคุณ คุณตกลงที่จะแจ้งให้เราทราบทันทีหากมีการใช้บัญชีของคุณโดยไม่ได้รับอนุญาต</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-3">3. แพ็กเกจสมัครสมาชิกและการชำระเงิน</h2>
            <p>บริการของเราแบ่งเป็นแพ็กเกจต่างๆ (เช่น FREE, PRO) การใช้งานเกินขีดจำกัดของแพ็กเกจฟรีจะถูกจำกัดสิทธิ์ หากคุณเลือกอัปเกรดเป็นแพ็กเกจที่ชำระเงิน คุณตกลงที่จะชำระค่าธรรมเนียมตามรอบระยะเวลาที่กำหนดไว้ (รายเดือน/รายปี)</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-3">4. ความถูกต้องของข้อมูล</h2>
            <p>ผลการคำนวณ Carbon Footprint และภาษีคาร์บอนที่ได้จากระบบนี้ อ้างอิงจากข้อมูลที่คุณกรอก (Activity Data) และตัวคูณการปล่อยก๊าซเรือกระจก (Emission Factors) ตามมาตรฐานสากล เราไม่รับผิดชอบต่อความผิดพลาดใดๆ ที่เกิดจากการกรอกข้อมูลที่ไม่ถูกต้องจากผู้ใช้งาน</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-3">5. การจำกัดความรับผิด</h2>
            <p>บริการนี้จัดทำขึ้นเพื่อเป็นเครื่องมือช่วยประเมินและจัดทำรายงานเบื้องต้น ผลลัพธ์ที่ได้ไม่สามารถใช้เป็นข้อมูลทางการเงินหรือกฎหมายแต่เพียงอย่างเดียว ผู้ใช้งานควรปรึกษาผู้เชี่ยวชาญด้านภาษีและสิ่งแวดล้อมก่อนนำผลลัพธ์ไปใช้ในเชิงพาณิชย์อย่างเป็นทางการ</p>
          </section>
        </div>
      </div>
    </main>
  );
}