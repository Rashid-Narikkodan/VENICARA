const PDFDocument = require("pdfkit");

const generateInvoice = (order, res) => {
  // Create a new PDF document with A4 size and 50px margins
  const doc = new PDFDocument({ size: "A4", margin: 50 });

  // Set response headers for PDF download
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=invoice-${order.orderId}.pdf`
  );

  // Pipe the PDF content to the response
  doc.pipe(res);

  // --- Header Section ---
  doc
    .fillColor("rgba(246, 240, 58, 0.87)") // Dodger Blue for header
    .fontSize(24)
    .font("Helvetica-Bold")
    .text("VENICARA Pvt Ltd", { align: "center" });

  doc
    .fillColor("#555") // Dark Gray for details
    .fontSize(12)
    .font("Helvetica")
    .text("123 Market Street, Kochi, Kerala", { align: "center" })
    .text("GSTIN: 32XXXXXX1234Z5", { align: "center" });

  doc.moveDown(2);

  // --- Invoice Title ---
  doc
    .fillColor("#000") // Black for title
    .fontSize(20)
    .font("Helvetica-Bold")
    .text("INVOICE", { align: "center" });

  doc.moveDown(1);

  // --- Order Details ---
  doc
    .fontSize(12)
    .font("Helvetica")
    .text(`Invoice #: ${order.orderId}`, 50, doc.y, { width: 300 })
    .text(`Date: ${new Date(order.createdAt).toLocaleDateString("en-IN")}`, 350, doc.y, { width: 200, align: "right" });

  doc.moveDown(1);

  // --- Customer Information ---
  doc
    .fillColor("#000")
    .font("Helvetica-Bold")
    .text("Bill To:", 50, doc.y);

  doc
    .font("Helvetica")
    .fillColor("#333")
    .text(`${order.userId.name} (${order.userId.email})`, 50, doc.y + 20)
    .text(
      `${order.shippingAddress.fullName || ""}, ${order.shippingAddress.street || ""}, ${order.shippingAddress.city || ""}, ${order.shippingAddress.state || ""} - ${order.shippingAddress.pin || ""}`,
      50,
      doc.y + 35
    )
    .text(`Phone: ${order.shippingAddress.mobile || "-"}`, 50, doc.y + 50);

  doc.moveDown(2);

  // --- Products Table ---
  const tableTop = doc.y;
  const itemX = 50;
  const variantX = 250;
  const qtyX = 400;
  const priceX = 450;
  const subtotalX = 520;

  // Table Header with Background
  doc
    .fillColor("#b4b4b4ff")
    .rect(itemX, tableTop, 530, 25)
    .fill("#000000ff") // Dodger Blue background
    .fillColor("#c8c8c8ff");

  doc
    .font("Helvetica-Bold")
    .text("Item", itemX, tableTop + 5, { width: 200 })
    .text("Variant", variantX, tableTop + 5, { width: 150 })
    .text("Qty", qtyX, tableTop + 5, { width: 50 })
    .text("Price", priceX, tableTop + 5, { width: 70 })
    .text("Subtotal", subtotalX, tableTop + 5, { width: 80 });

  doc.moveDown(1.5);
  doc.fillColor("#000");

  // Table Rows
  order.products.forEach((p, i) => {
    const y = doc.y;
    doc
      .text(p.productName, itemX, y, { width: 200 })
      .text(p.volume || "-", variantX, y, { width: 150 })
      .text(p.quantity.toString(), qtyX, y, { width: 50 })
      .text(`${p.discountPrice.toFixed(2)}`, priceX, y, { width: 70 })
      .text(`${p.subtotal.toFixed(2)}`, subtotalX, y, { width: 80 });
    doc.moveDown();
  });

  // Draw Table Border
  const tableBottom = doc.y;
  doc
    .rect(itemX, tableTop, 530, tableBottom - tableTop + 5)
    .stroke("#999"); // Light Gray border

  doc.moveDown(1);

  // --- Totals Section ---
  doc
    .font("Helvetica-Bold")
    .fillColor("#000")
    .text(`Total Amount: ${order.totalAmount.toFixed(2)}`, 400, doc.y, { width: 180, align: "right" });

  doc
    .font("Helvetica")
    .fillColor("#333")
    .text(`Payment Method: ${order.payment.method}`, 400, doc.y + 20, { width: 180, align: "right" });
  doc
    .font("Helvetica")
    .fillColor("#333")
    .text(`Status: ${order.status}`, 400, doc.y + 20, { width: 180, align: "right" });

  // --- Footer ---
  doc
    .fillColor("#777") // Medium Gray for footer
    .fontSize(12)
    .text("Thank you for shopping with us!", 50, 750, { align: "center", width: 500 });

  // Finalize the PDF
  doc.end();
};

module.exports = generateInvoice;