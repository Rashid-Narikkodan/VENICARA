const Order = require('../models/Order')

async function getChartData(filter, field) {
  const now = new Date();
  let labels = [];
  let data = [];

  // helper: build pipeline per iteration
  function buildPipeline(start, end) {
    const pipeline = [{ $match: { createdAt: { $gte: start, $lte: end } } }];
    if (field === "finalAmount") {
      pipeline.push({ $group: { _id: null, count: { $sum: `$${field}` } } });
    } else {
      pipeline.push({ $unwind: "$products" });
      pipeline.push({ $group: { _id: null, count: { $sum: `$${field}` } } });
    }
    return pipeline;
  }

  switch (filter) {
    case "daily": {
      labels = Array.from({ length: 24 }, (_, i) => `${i}h`);
      for (let i = 0; i < 24; i++) {
        const start = new Date(now);
        start.setHours(i, 0, 0, 0);

        const end = new Date(now);
        end.setHours(i, 59, 59, 999);

        const result = await Order.aggregate(buildPipeline(start, end));
        data.push(result[0]?.count || 0);
      }
      break;
    }

    case "weekly": {
      for (let i = 6; i >= 0; i--) {
        const day = new Date(now);
        day.setDate(now.getDate() - i);

        const start = new Date(day.setHours(0, 0, 0, 0));
        const end = new Date(day.setHours(23, 59, 59, 999));

        labels.push(day.toLocaleDateString('en-US', { weekday: 'short' }));

        const result = await Order.aggregate(buildPipeline(start, end));
        data.push(result[0]?.count || 0);
      }
      break;
    }

    case "monthly": {
      const year = now.getFullYear();
      const month = now.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();

      for (let i = 1; i <= daysInMonth; i++) {
        labels.push(`${i}`);

        const start = new Date(year, month, i, 0, 0, 0, 0);
        const end = new Date(year, month, i, 23, 59, 59, 999);

        const result = await Order.aggregate(buildPipeline(start, end));
        data.push(result[0]?.count || 0);
      }
      break;
    }

    case "yearly": {
      const thisYear = now.getFullYear();

      for (let month = 0; month < 12; month++) {
        const label = new Date(thisYear, month).toLocaleString("en-US", { month: "short" });
        labels.push(label);

        const start = new Date(thisYear, month, 1, 0, 0, 0, 0);
        const end = new Date(thisYear, month + 1, 0, 23, 59, 59, 999);

        const result = await Order.aggregate(buildPipeline(start, end));
        data.push(result[0]?.count || 0);
      }
      break;
    }
  }

  return { labels, data };
}

module.exports = getChartData;
