const PDFDocument = require("pdfkit");
const fs = require("fs");

function generateInvoicePDF(order, res) {
  const doc = new PDFDocument({ size: "A4", margin: 50 });

  // Pipe PDF to response or save locally
  if (res) {
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=invoice-${order.orderId}.pdf`
    );
    doc.pipe(res);
  } else {
    doc.pipe(fs.createWriteStream(`invoice-${order.orderId}.pdf`));
  }

  // ---- Header ----
  doc
    .fillColor("#2E7D32")
    .fontSize(24)
    .text("VENICARA", { align: "center" })
    .fontSize(16)
    .text("INVOICE", { align: "center" })
    .moveDown();

  // ---- Order & Customer Info Table ----
  const infoTableTop = 100;
  const labelX = 50;
  const valueX = 200;
  const labelX2 = 350;
  const valueX2 = 450;
  const rowHeight = 15;

  const infoData = [
    ["Date", order.createdAt?.toISOString().split("T")[0] || "-", "TO", order.shippingAddress?.fullName || "-"],
    ["Order ID", order.orderId, "Street", order.shippingAddress?.stree || "-"],
    ["Customer", order.userId?.name || "-", "City", order.shippingAddress?.city || "-"],
    ["Phone", order.shippingAddress?.mobile || "-", "State", order.shippingAddress?.state || "-"],
    ["Email", order.userId?.email || "-", "PIN", order.shippingAddress?.pin || "-"]
  ];

  doc.font("Helvetica-Bold").fillColor("#2E7D32").fontSize(10);
  infoData.forEach((row, index) => {
    const y = infoTableTop + index * rowHeight;
    doc.text(row[0], labelX, y);
    doc.text(row[1], valueX, y);
    doc.text(row[2], labelX2, y);
    doc.text(row[3], valueX2, y);
  });

  doc.moveDown(4);

  // ---- Products Table ----
  const tableTop = infoTableTop + infoData.length * rowHeight + 30;
  const descriptionX = 100;
  const quantityX = 50;
  const unitPriceX = 350;
  const lineTotalX = 450;

  // Table Header
  doc.rect(50, tableTop - 10, 500, 20).fillAndStroke("#C8E6C9", "#2E7D32");
  doc.fillColor("#555").font("Helvetica-Bold")
    .text("QTY", quantityX, tableTop - 5)
    .text("DESCRIPTION", descriptionX, tableTop - 5)
    .text("UNIT PRICE", unitPriceX, tableTop - 5)
    .text("LINE TOTAL", lineTotalX, tableTop - 5);

  doc.moveTo(50, tableTop + 10).lineTo(550, tableTop + 10).stroke();

  // Table Rows
  let position = tableTop + 20;
  const items = order.products || [];
  items.forEach((item, index) => {
    if (position > 700) {
      doc.addPage();
      position = 50;
    }
    if (index % 2 === 0) doc.rect(50, position - 5, 500, 15).fill("#f9f9f9");

    doc.fillColor("#000").font("Helvetica")
      .text(item.quantity || 0, quantityX, position)
      .text(item.productName || "-", descriptionX, position)
      .text((item.finalAmount || 0).toFixed(2), unitPriceX, position)
      .text((item.subtotal || 0).toFixed(2), lineTotalX, position);
    position += 20;
  });

  // ---- Summary Table ----
  const summaryTop = position + 20;
  const summaryData = [
    ["Total Amount", (order.totalOrderPrice).toFixed(2)],
    ["Discount", `${order.couponDiscount}%` || 0],
    ["Final Total", (order.finalAmount || 0).toFixed(2)],
    ["Status", order.status]
  ];

  summaryData.forEach((row, index) => {
    const y = summaryTop + index * rowHeight;
    doc.font("Helvetica-Bold").text(row[0], 400, y);
    doc.font("Helvetica").text(row[1], lineTotalX, y, { align: "right" });
  });

  // ---- Footer ----
  doc.font("Helvetica").fontSize(10)
    .text("Thank you for your business!", 50, 750, { align: "center", width: 500 });

  doc.end();
}

module.exports = generateInvoicePDF;
