// lib/reportGenerator.ts
import { jsPDF } from "jspdf";
import 'jspdf-autotable'; // นำเข้าแบบนี้เพื่อเพิ่มคำสั่ง autoTable เข้าไปใน jsPDF
import { EMISSION_FACTORS } from "./emissionFactors";

export interface FactoryData {
  factoryName: string;
  month: string;
  electricity: number;
  fuelType: 'diesel' | 'benzene' | 'lpg';
  fuelAmount: number;
  wasteAmount: number;
}

export interface CarbonFootprintResult {
  scope1: number;
  scope2: number;
  scope3: number;
  total: number;
}

export function calculateCarbonFootprint(data: FactoryData): CarbonFootprintResult {
  const scope1 = data.fuelAmount * EMISSION_FACTORS[data.fuelType];
  const scope2 = data.electricity * EMISSION_FACTORS.electricity;
  const scope3 = data.wasteAmount * EMISSION_FACTORS.generalWaste;
  const total = scope1 + scope2 + scope3;
  return { scope1, scope2, scope3, total };
}

export function generatePDFReport(data: FactoryData, result: CarbonFootprintResult) {
  const doc = new jsPDF();
  
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("Carbon Footprint Assessment Report", 105, 20, { align: "center" });
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Based on ISO 14064-1 and GHG Protocol Standards", 105, 27, { align: "center" });
  
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Factory Information", 14, 40);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Factory Name: ${data.factoryName}`, 14, 48);
  doc.text(`Reporting Period: ${data.month}`, 14, 54);

  // ใช้ (doc as any).autoTable เพื่อหลีกเลี่ยงปัญหา TypeScript Error
  (doc as any).autoTable({
    startY: 62,
    head: [["Activity", "Unit", "Quantity"]],
    body: [
      ["Electricity Consumption", "kWh", data.electricity.toString()],
      [`Fuel Consumption (${data.fuelType})`, "Liters", data.fuelAmount.toString()],
      ["Waste Generated", "Kilograms", data.wasteAmount.toString()],
    ],
    theme: "striped",
    headStyles: { fillColor: [22, 160, 133] }
  });

  (doc as any).autoTable({
    startY: (doc as any).lastAutoTable.finalY + 10,
    head: [["GHG Scope", "Description", "Emission (kgCO2e)"]],
    body: [
      ["Scope 1", "Direct Emissions (Fuel)", result.scope1.toFixed(2)],
      ["Scope 2", "Indirect Emissions (Electricity)", result.scope2.toFixed(2)],
      ["Scope 3", "Other Indirect Emissions (Waste)", result.scope3.toFixed(2)],
      ["Total", "Total Carbon Footprint", result.total.toFixed(2)],
    ],
    theme: "grid",
    headStyles: { fillColor: [41, 128, 185] },
    foot: [["", "Total Emissions (kgCO2e)", result.total.toFixed(2)]],
    footStyles: { fillColor: [44, 62, 80], textColor: 255, fontStyle: "bold" }
  });

  const finalY = (doc as any).lastAutoTable.finalY + 20;
  doc.text("Report Generated Date: " + new Date().toLocaleDateString(), 14, finalY);
  doc.text("Authorized Signature: ______________________", 14, finalY + 15);

  doc.save(`Carbon_Report_${data.factoryName}_${data.month}.pdf`);
}