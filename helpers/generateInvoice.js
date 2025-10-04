const PDFDocument = require("pdfkit");
const fs = require("fs");

function generateInvoicePDF(order, res) {
  const doc = new PDFDocument({ size: "A4", margin: 50 });
  const shipping = order.shippingAddress || {};
  const user = order.userId || {};
  const items = order.products || [];

  // Configure output
  if (res) {
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename=invoice-${order.orderId}.pdf`
    );
    doc.pipe(res);
  } else {
    doc.pipe(fs.createWriteStream(`invoice-${order.orderId}.pdf`));
  }

  // Styling constants
  const COLORS = {
    primary: "#000000",
    secondary: "#333333",
    accent: "#ffffff",
    tableAlt: "#f5f5f5"
  };
  const FONTS = {
    regular: "Helvetica",
    bold: "Helvetica-Bold",
    italic: "Helvetica-Oblique"
  };
  const SIZES = {
    title: 24,
    subtitle: 14,
    regular: 10,
    small: 8
  };

  // ---------- HEADER ----------
  function drawHeader() {
    doc.font(FONTS.bold)
       .fontSize(SIZES.title)
       .fillColor(COLORS.primary)
       .text("VENICARA", 50, 40, { align: "center" });
    doc.font(FONTS.bold)
       .fontSize(SIZES.subtitle)
       .text("INVOICE", 50, 70, { align: "center" });
    doc.moveTo(50, 100)
       .lineTo(545, 100)
       .lineWidth(0.5)
       .strokeColor(COLORS.primary)
       .stroke();
  }

  // ---------- CUSTOMER INFO ----------
  function drawCustomerInfo(startY) {
    const leftX = 50;
    const rightX = 320;
    const rowHeight = 18;

    const infoLeft = [
      ["Invoice Date:", order.createdAt?.toISOString().split("T")[0] || "-"],
      ["Order ID:", order.orderId || "-"],
      ["Customer:", user.name || "-"],
      ["Phone:", shipping.mobile || "-"],
      ["Email:", user.email || "-"]
    ];

    const infoRight = [
      ["Ship To:", shipping.fullName || "-"],
      ["Street:", shipping.street || "-"],
      ["City:", shipping.city || "-"],
      ["State:", shipping.state || "-"],
      ["PIN:", shipping.pin || "-"]
    ];

    doc.font(FONTS.bold).fontSize(SIZES.regular);
    infoLeft.forEach(([label, value], i) => {
      const y = startY + i * rowHeight;
      doc.text(label, leftX, y)
         .font(FONTS.regular)
         .text(value, leftX + 80, y);
    });

    doc.font(FONTS.bold);
    infoRight.forEach(([label, value], i) => {
      const y = startY + i * rowHeight;
      doc.text(label, rightX, y)
         .font(FONTS.regular)
         .text(value, rightX + 80, y);
    });

    return startY + infoLeft.length * rowHeight + 25;
  }

  // ---------- PRODUCTS TABLE ----------
function drawProductsTable(startY) {
  const tableTop = startY;
  // column positions (shifted to fit new "VOLUME" column)
  const colX = { product: 50, volume: 250, qty: 320, unit: 380, total: 470 };
  const tableWidth = 530;
  const rowHeight = 24;

  // Table header background
  doc.rect(colX.product, tableTop, tableWidth, rowHeight)
     .fill(COLORS.primary);

  // Table header text
  doc.fillColor(COLORS.accent)
     .font(FONTS.bold)
     .fontSize(SIZES.regular)
     .text("PRODUCT", colX.product + 8, tableTop + 8, { width: 180 })
     .text("VOLUME", colX.volume + 8, tableTop + 8, { width: 60, align: "center" })
     .text("QTY", colX.qty + 8, tableTop + 8, { width: 40, align: "center" })
     .text("UNIT PRICE", colX.unit + 8, tableTop + 8, { width: 80, align: "right" })
     .text("SUBTOTAL", colX.total + 8, tableTop + 8, { width: 80, align: "right" });

  let y = tableTop + rowHeight;

  // Table rows
  items.forEach((item, i) => {
    const fillColor = i % 2 === 0 ? COLORS.tableAlt : COLORS.accent;
    doc.rect(colX.product, y, tableWidth, rowHeight).fill(fillColor);

    doc.fillColor(COLORS.primary)
       .font(FONTS.regular)
       .fontSize(SIZES.regular)
       .text(item.productName || "-", colX.product + 8, y + 8, { width: 180 })
       .text(item.volume || "-", colX.volume + 8, y + 8, { width: 60, align: "center" })
       .text(item.quantity || 0, colX.qty + 8, y + 8, { width: 40, align: "center" })
       .text(`Rs.${(item.finalAmount || 0).toFixed(2)}`, colX.unit + 8, y + 8, { width: 80, align: "right" })
       .text(`Rs.${(item.subtotal || 0).toFixed(2)}`, colX.total + 8, y + 8, { width: 80, align: "right" });

    y += rowHeight;
  });

  // Table border
  doc.lineWidth(0.5)
     .rect(colX.product, tableTop, tableWidth, y - tableTop)
     .strokeColor(COLORS.primary)
     .stroke();

  return y + 20;
}

  // ---------- SUMMARY ----------
  function drawSummary(startY) {
    const colX = 350;
    const valX = 500;
    const rowHeight = 18;

    const summary = [
      ["Total Amount", `Rs.${(order.totalOrderPrice || 0).toFixed(2)}`],
      ["Discount", `${order.couponDiscount || 0}%`]
    ];

    if (order.deliveryCharge) {
      summary.push(["Delivery Charge", `Rs.${order.deliveryCharge.toFixed(2)}`]);
    }

    summary.push(
      ["Final Total", `Rs.${(order.finalAmount || 0).toFixed(2)}`],
      ["Status", order.status || "-"]
    );

    doc.fontSize(SIZES.regular);
    summary.forEach(([label, value], i) => {
      const y = startY + i * rowHeight;
      doc.font(FONTS.bold)
         .text(label, colX, y, { width: 140 })
         .font(FONTS.regular)
         .text(value, valX - 50, y, { width: 90, align: "right" });
    });

    return startY + summary.length * rowHeight + 25;
  }

  // ---------- FOOTER ----------
  function drawFooter(startY) {
    doc.font(FONTS.italic)
       .fontSize(SIZES.regular)
       .fillColor(COLORS.secondary)
       .text("Thank you for your business!", 50, startY, { align: "center", width: 495 });
  }

  // ---------- EXECUTION ----------
  drawHeader();
  let y = 120;
  y = drawCustomerInfo(y);
  y = drawProductsTable(y);
  y = drawSummary(y);
  drawFooter(y);

  doc.end();
}

module.exports = generateInvoicePDF;