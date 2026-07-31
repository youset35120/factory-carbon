// lib/reportGenerator.ts
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';
import { EMISSION_FACTORS } from "./emissionFactors";

export interface FactoryData {
  factoryName: string;
  month: string;
  electricity: number;
  water: number;
  lpg: number;
  diesel: number;
  gasoline: number;
  generalWaste: number;
  hazardousWaste: number;
  rawMaterial: number;
  transport: number;
  logo?: string;
}

export interface CarbonFootprintResult {
  scope1: number;
  scope2: number;
  scope3: number;
  total: number;
  carbonTax: number;
}

const CARBON_TAX_RATE = 0.20;

export function calculateCarbonFootprint(data: FactoryData): CarbonFootprintResult {
  const scope1 = 
    (Number(data.lpg) * EMISSION_FACTORS.lpg) + 
    (Number(data.diesel) * EMISSION_FACTORS.diesel) + 
    (Number(data.gasoline) * EMISSION_FACTORS.gasoline);
  
  const scope2 = 
    (Number(data.electricity) * EMISSION_FACTORS.electricity) + 
    (Number(data.water) * EMISSION_FACTORS.water);
  
  const scope3 = 
    (Number(data.generalWaste) * EMISSION_FACTORS.generalWaste) + 
    (Number(data.hazardousWaste) * EMISSION_FACTORS.hazardousWaste) + 
    (Number(data.rawMaterial) * EMISSION_FACTORS.rawMaterial) + 
    (Number(data.transport) * EMISSION_FACTORS.transport);
  
  const total = scope1 + scope2 + scope3;
  const carbonTax = total * CARBON_TAX_RATE;

  return { scope1, scope2, scope3, total, carbonTax };
}

// เพิ่มพารามิเตอร์ status เข้ามา
export function generatePDFReport(
  data: FactoryData, 
  result: CarbonFootprintResult, 
  mode: 'monthly' | 'annual' = 'monthly',
  allReports: any[] = [],
  status: string = 'PENDING' // <--- เพิ่มตรงนี้
) {
  const doc = new jsPDF();
  const num = (val: any) => Number(val) || 0;
  const year = data.month ? data.month.split('-')[0] : new Date().getFullYear();
  
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  const title = mode === 'annual' ? `Annual Carbon Footprint & Tax Report (${year})` : "Carbon Footprint & Tax Assessment Report";
  doc.text(title, 105, 20, { align: "center" });
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Based on ISO 14064-1, GHG Protocol Standards", 105, 27, { align: "center" });

  if (data.logo) {
    try {
      doc.addImage(data.logo, 'PNG', 14, 10, 30, 15);
    } catch (e) {
      console.error("Error adding logo:", e);
    }
  }

  // แสดงสถานะที่มุมขวาบน
  doc.setFontSize(12);
  if (status === 'APPROVED') {
    doc.setTextColor(22, 160, 133); // สีเขียว
    doc.text("Status: VERIFIED", 196, 20, { align: "right" });
  } else if (status === 'REJECTED') {
    doc.setTextColor(231, 76, 60); // สีแดง
    doc.text("Status: REJECTED", 196, 20, { align: "right" });
  } else {
    doc.setTextColor(241, 196, 15); // สีเหลือง
    doc.text("Status: PENDING", 196, 20, { align: "right" });
  }
  doc.setTextColor(0, 0, 0); // รีสตาร์ทสีดำ

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Factory Information", 14, 40);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Factory Name: ${data.factoryName}`, 14, 48);
  doc.text(mode === 'annual' ? `Reporting Year: ${year}` : `Reporting Period: ${data.month}`, 14, 54);

  if (mode === 'annual') {
    if (allReports.length === 0) {
      doc.text("No data available for this year.", 14, 62);
    } else {
      const totalAnnualCO2 = allReports.reduce((sum, r) => sum + num(r.totalCO2), 0);
      const annualTax = totalAnnualCO2 * CARBON_TAX_RATE;
      
      const maxReport = allReports.reduce((max, r) => num(r.totalCO2) > num(max.totalCO2) ? r : max, allReports[0]);
      const minReport = allReports.reduce((min, r) => num(r.totalCO2) < num(min.totalCO2) ? r : min, allReports[0]);

      autoTable(doc, {
        startY: 62,
        head: [["Month", "Emissions (kgCO2e)", "Est. Carbon Tax (THB)", "Status"]], // เพิ่มคอลัมน์ Status
        body: allReports.map(r => [
          r.month, 
          num(r.totalCO2).toFixed(2), 
          (num(r.totalCO2) * CARBON_TAX_RATE).toFixed(2),
          r.status || 'PENDING' // เพิ่มสถานะในตาราง
        ]),
        theme: "striped",
        headStyles: { fillColor: [22, 160, 133] },
        foot: [["Total", totalAnnualCO2.toFixed(2), annualTax.toFixed(2), ""]],
        footStyles: { fillColor: [44, 62, 80], textColor: 255, fontStyle: "bold" }
      });

      let currentY = (doc as any).lastAutoTable.finalY + 15;
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text("Annual Summary & Tax Estimation:", 14, currentY);
      currentY += 7;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(`- Total Emissions: ${totalAnnualCO2.toFixed(2)} kgCO2e`, 14, currentY); currentY += 6;
      doc.text(`- Estimated Carbon Tax: ${annualTax.toFixed(2)} THB (Rate: 200 THB / Ton CO2e)`, 14, currentY); currentY += 6;
      doc.text(`- Highest Emission Month: ${maxReport.month} (${num(maxReport.totalCO2).toFixed(2)} kgCO2e)`, 14, currentY); currentY += 6;
      doc.text(`- Lowest Emission Month: ${minReport.month} (${num(minReport.totalCO2).toFixed(2)} kgCO2e)`, 14, currentY);

      doc.addPage();
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("Monthly Emissions Trend", 14, 20);

      const chartStartY = 40;
      const chartHeight = 100;
      const maxCO2 = Math.max(...allReports.map(r => num(r.totalCO2)), 1);
      const barWidth = 170 / allReports.length;

      allReports.forEach((r, index) => {
        const barHeight = (num(r.totalCO2) / maxCO2) * chartHeight;
        const x = 20 + (index * barWidth);
        const y = chartStartY + chartHeight - barHeight;
        
        doc.setFillColor(54, 162, 235);
        doc.rect(x, y, barWidth - 2, barHeight, 'F');
        
        doc.setFontSize(8);
        doc.text(r.month.substring(5), x, chartStartY + chartHeight + 5);
        doc.text(num(r.totalCO2).toFixed(0), x, y - 2);
      });
    }
  } else {
    autoTable(doc, {
      startY: 62,
      head: [["Activity Data", "Unit", "Quantity"]],
      body: [
        ["Electricity", "kWh", num(data.electricity).toString()],
        ["Water", "m3", num(data.water).toString()],
        ["LPG", "Liters", num(data.lpg).toString()],
        ["Diesel", "Liters", num(data.diesel).toString()],
        ["Gasoline", "Liters", num(data.gasoline).toString()],
        ["General Waste", "Kilograms", num(data.generalWaste).toString()],
        ["Hazardous Waste", "Kilograms", num(data.hazardousWaste).toString()],
        ["Raw Material", "Kilograms", num(data.rawMaterial).toString()],
        ["Transportation", "Kilometers", num(data.transport).toString()],
      ],
      theme: "striped",
      headStyles: { fillColor: [22, 160, 133] }
    });

    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 10,
      head: [["Description", "Amount"]],
      body: [
        ["Scope 1 (Direct Emissions)", `${num(result.scope1).toFixed(2)} kgCO2e`],
        ["Scope 2 (Indirect - Energy)", `${num(result.scope2).toFixed(2)} kgCO2e`],
        ["Scope 3 (Other Indirect)", `${num(result.scope3).toFixed(2)} kgCO2e`],
        ["Total Carbon Footprint", `${num(result.total).toFixed(2)} kgCO2e`],
        ["Estimated Carbon Tax Rate", "200 THB / Ton CO2e"],
        ["Estimated Carbon Tax to Pay", `${num(result.carbonTax).toFixed(2)} THB`],
      ],
      theme: "grid",
      headStyles: { fillColor: [41, 128, 185] },
      foot: [["Total Tax Estimation", `${num(result.carbonTax).toFixed(2)} THB`]],
      footStyles: { fillColor: [231, 76, 60], textColor: 255, fontStyle: "bold" }
    });
  }

  // ============ ส่วนของลายน้ำ (Watermark) ============
  if (status === 'APPROVED') {
    doc.setGState(new (doc as any).GState({ opacity: 0.2 })); // ทำให้โปร่งใส
    doc.setTextColor(22, 160, 133); // สีเขียวมรกต
    doc.setFontSize(80);
    doc.setFont("helvetica", "bold");
    // วาดกลางหน้ากระดาษแบบเอียง 45 องศา
    doc.text("VERIFIED", 105, 150, { align: "center", angle: 45 });
    
    // รีเซ็ตค่ากลับเพื่อไม่ให้ส่งผลกระทบต่อข้อความอื่นๆ
    doc.setGState(new (doc as any).GState({ opacity: 1 }));
    doc.setTextColor(0, 0, 0);
  }
  // ==========================================

  const finalY = mode === 'annual' ? 270 : (doc as any).lastAutoTable.finalY + 20;
  doc.text("Report Generated Date: " + new Date().toLocaleDateString(), 14, finalY);
  doc.text("Authorized Signature: ______________________", 14, finalY + 15);

  doc.save(`Carbon_Report_${data.factoryName}_${mode === 'annual' ? year : data.month}.pdf`);
}