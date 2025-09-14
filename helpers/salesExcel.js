const ExcelJS = require("exceljs");

async function exportSalesExcel(req, res, data, orders, filter, startDate, endDate) {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Sales Report");

    // ---- Set column widths ----
    worksheet.columns = [
      { key: "orderId", width: 15 },
      { key: "date", width: 15 },
      { key: "customer", width: 20 },
      { key: "products", width: 12 },
      { key: "payment", width: 15 },
      { key: "status", width: 15 },
      { key: "subtotal", width: 15 },
      { key: "discount", width: 15 },
      { key: "coupon", width: 18 },
      { key: "total", width: 15 },
    ];

    // ---- Title ----
    worksheet.mergeCells("A1:J1");
    worksheet.getCell("A1").value = "Sales Report";
    worksheet.getCell("A1").font = { size: 16, bold: true };
    worksheet.getCell("A1").alignment = { horizontal: "center" };

    // ---- Duration ----
    worksheet.mergeCells("A2:J2");
    worksheet.getCell("A2").value =
      filter === "custom"
        ? `Duration: ${startDate || "-"} to ${endDate || "-"}`
        : `Duration: ${filter ? filter.toUpperCase() : "ALL"}`;
    worksheet.getCell("A2").font = { italic: true };
    worksheet.getCell("A2").alignment = { horizontal: "center" };

    // ---- Summary Data ----
    worksheet.addRow([]);
    const summaryRows = [
      ["Total Orders", data.totalOrders],
      ["Products Sold", data.totalProductSold],
      ["Customers", data.totalCustomers],
      ["Cancelled Orders", data.totalCancelled],
      ["Returned Orders", data.totalReturned],
      ["Cancelled (Product)", data.totalProductCancelled],
      ["Returned (Products)", data.totalProductReturned],
      ["Discounts (Product)", `₹${data.totalDiscountPerProduct.toFixed(2)}`],
      ["Discounts (Order)", `₹${data.totalDiscountPerOrder.toFixed(2)}`],
      ["Total Revenue", `₹${data.totalRevenue.toFixed(2)}`],
      ["Total Refunds", `₹${data.totalRefund.toFixed(2)}`],
      ["AOV", `₹${data.AverageOrderValue.toFixed(2)}`],
    ];
    summaryRows.forEach((row) => worksheet.addRow(row));

    // ---- Gap ----
    worksheet.addRow([]);
    worksheet.addRow(["Detailed Orders"]);
    worksheet.addRow([]);

    // ---- Table Header ----
    worksheet
      .addRow([
        "Order ID",
        "Date",
        "Customer",
        "Products",
        "Payment",
        "Status",
        "Subtotal",
        "Discount",
        "Coupon Off",
        "Total",
      ])
      .eachCell((cell) => {
        cell.font = { bold: true };
        cell.alignment = { horizontal: "center" };
      });

    // ---- Table Rows ----
    orders.forEach((order) => {
      const orderDate = order.createdAt
        ? new Date(order.createdAt).toLocaleDateString("en-US", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })
        : "-";

      const subtotal = order.products.reduce(
        (s, p) => s + (p.basePrice || 0) * (p.quantity || 0),
        0
      );

      worksheet.addRow([
        order.orderId || "-",
        orderDate,
        order.userId?.name || "-",
        order.products.reduce((s, p) => s + (p.quantity || 0), 0),
        order.payment?.method || "-",
        order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : "-",
        `₹${subtotal.toFixed(2)}`,
        `₹${(order.discountAmount || 0).toFixed(2)}`,
        order.couponDiscount ? `₹${order.couponDiscount.toFixed(2)}` : "No Coupon",
        `₹${(order.totalAmount || 0).toFixed(2)}`,
      ]);
    });

    // ---- Response ----
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", "attachment; filename=sales-report.xlsx");

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error("Excel export error:", err);
    res.status(500).send("Failed to export Excel");
  }
}

module.exports = exportSalesExcel;
