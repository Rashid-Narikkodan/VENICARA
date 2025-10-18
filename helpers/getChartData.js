const Order = require("../models/Order");

async function getChartData(filter, field) {
  const now = new Date();
  let labels = [];
  let data = [];

  // helper: build pipeline per iteration
  function buildPipeline(start, end) {
    let pipeline = [];
    if (field === "finalAmount") {
      pipeline = [
        {
          $match: {
            createdAt: { $gte: start, $lte: end },
          },
        },
        { $group: {
          _id: null,
          revenueCount: {
             $sum: {
              $cond:[{ $eq: ["$payment.status", "paid"] },`$${field}`,0]
             } 
            },
          refundCount : { $sum : '$refundAmount' }
        } 
      }];
    } else {
      pipeline = [
        {
          $match: {
            createdAt: { $gte: start, $lte: end },
          },
        },
        { $unwind: "$products" },
        {
          $group: {
            _id: null,
            soldCount: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $eq: ["$payment.status", "paid"] },
                      { $ne: ["$products.status", "returned"] },
                      { $ne: ["$products.status", "cancelled"] },
                    ],
                  }, // if not returned
                  "$products.quantity",
                  0,
                ],
              },
            },
            returnCount: {
              $sum: {
                $cond: [ { $eq: ["$products.status", "returned"] }, "$products.quantity", 0 ]
              }
            },
            cancelCount: {
              $sum: {
                $cond: [ { $eq: ["$products.status", "cancelled"] }, "$products.quantity", 0 ]
              }
            }
          }
        }
      ];
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

        if (field === "finalAmount") {
          data.push({
            revenueCount : result[0]?.revenueCount || 0,
            refundCount : result[0]?.refundCount || 0
          });
        } else {
          data.push({
            soldCount: result[0]?.soldCount || 0,
            returnCount: result[0]?.returnCount || 0,
            cancelCount: result[0]?.cancelCount || 0
          });
        }
      }
      break;
    }

    case "weekly": {
      for (let i = 6; i >= 0; i--) {
        const day = new Date(now);
        day.setDate(now.getDate() - i);

        const start = new Date(day.setHours(0, 0, 0, 0));
        const end = new Date(day.setHours(23, 59, 59, 999));

        labels.push(day.toLocaleDateString("en-US", { weekday: "short" }));

        const result = await Order.aggregate(buildPipeline(start, end));

        if (field === "finalAmount") {
          data.push({
            revenueCount : result[0]?.revenueCount || 0,
            refundCount : result[0]?.refundCount || 0
          });
        } else {
          data.push({
            soldCount: result[0]?.soldCount || 0,
            returnCount: result[0]?.returnCount || 0,
            cancelCount: result[0]?.cancelCount || 0
          });
        }
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

        if (field === "finalAmount") {
          data.push({
            revenueCount : result[0]?.revenueCount || 0,
            refundCount : result[0]?.refundCount || 0
          });
        } else {
          data.push({
            soldCount: result[0]?.soldCount || 0,
            returnCount: result[0]?.returnCount || 0,
            cancelCount: result[0]?.cancelCount || 0           
          });
        }
      }
      break;
    }

    case "yearly": {
      const thisYear = now.getFullYear();

      for (let month = 0; month < 12; month++) {
        const label = new Date(thisYear, month).toLocaleString("en-US", {
          month: "short",
        });
        labels.push(label);

        const start = new Date(thisYear, month, 1, 0, 0, 0, 0);
        const end = new Date(thisYear, month + 1, 0, 23, 59, 59, 999);

        const result = await Order.aggregate(buildPipeline(start, end));

        if (field === "finalAmount") {
          data.push({
            revenueCount : result[0]?.revenueCount || 0,
            refundCount : result[0]?.refundCount || 0
          });
        } else {
          data.push({
            soldCount: result[0]?.soldCount || 0,
            returnCount: result[0]?.returnCount || 0,
            cancelCount: result[0]?.cancelCount || 0
          });
        }
      }
      break;
    }
  }

  return { labels, data };
}

module.exports = getChartData;
