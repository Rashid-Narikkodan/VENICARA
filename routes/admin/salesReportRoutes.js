const express = require("express");
const router = express.Router();
const { salesReportController } = require("../../controllers/admin/index");

router.route("/").get(salesReportController.showSalesReport);
router.post(
  "/export/pdf/:id",
  salesReportController.exportSalesPDF
);
router.post(
  "/export/excel/:id",
  salesReportController.exportSalesExcel
);

module.exports = router;
