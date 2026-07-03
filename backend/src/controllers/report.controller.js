import Invoice from "../models/Invoice.js";
import Farmer from "../models/Farmer.js";
import Product from "../models/Product.js";
import Transaction from "../models/Transaction.js";



// ================= SALES REPORT =================

export const salesReport = async (req, res) => {
  try {

    const invoices = await Invoice.aggregate([

      {
        $group: {

          _id: "$billingType",

          totalSales: {
            $sum: "$grandTotal",
          },

          totalInvoices: {
            $sum: 1,
          },
        },
      },
    ]);



    const overallSales = await Invoice.aggregate([

      {
        $group: {

          _id: null,

          totalRevenue: {
            $sum: "$grandTotal",
          },

          totalGST: {
            $sum: "$totalGST",
          },

          totalInvoices: {
            $sum: 1,
          },
        },
      },
    ]);



    res.status(200).json({
      success: true,

      billingTypeWiseSales: invoices,

      overallSales:
        overallSales[0] || {},
    });

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
};



// ================= FARMER DUE REPORT =================

export const farmerDueReport = async (req, res) => {
  try {

    const farmers = await Farmer.find({
      dueAmount: {
        $gt: 0,
      },
    }).sort({
      dueAmount: -1,
    });



    const totalDue = await Farmer.aggregate([

      {
        $group: {

          _id: null,

          totalPendingDue: {
            $sum: "$dueAmount",
          },
        },
      },
    ]);



    res.status(200).json({
      success: true,

      totalPendingDue:
        totalDue[0]?.totalPendingDue || 0,

      farmers,
    });

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
};



// ================= STOCK REPORT =================

export const stockReport = async (req, res) => {
  try {

    const products = await Product.find()
      .sort({
        quantity: 1,
      });



    const totalStockValue = await Product.aggregate([

      {
        $group: {

          _id: null,

          stockValue: {
            $sum: {
              $multiply: [
                "$quantity",
                "$purchasePrice",
              ],
            },
          },
        },
      },
    ]);



    res.status(200).json({
      success: true,

      totalStockValue:
        totalStockValue[0]?.stockValue || 0,

      products,
    });

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
};



// ================= VILLAGE REPORT =================

export const villageReport = async (req, res) => {
  try {

    const villages = await Farmer.aggregate([

      {
        $group: {

          _id: "$village",

          totalFarmers: {
            $sum: 1,
          },

          totalDue: {
            $sum: "$dueAmount",
          },

          activeFarmers: {
            $sum: {
              $cond: [
                {
                  $eq: [
                    "$status",
                    "active",
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },

      {
        $sort: {
          totalDue: -1,
        },
      },
    ]);



    res.status(200).json({
      success: true,
      villages,
    });

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
};



// ================= CHART ANALYTICS =================

export const chartAnalytics = async (req, res) => {
  try {

    // monthly sales chart

    const monthlySales =
      await Invoice.aggregate([

        {
          $group: {

            _id: {
              month: {
                $month: "$createdAt",
              },
            },

            totalSales: {
              $sum: "$grandTotal",
            },
          },
        },

        {
          $sort: {
            "_id.month": 1,
          },
        },
      ]);



    // transaction type chart

    const transactionTypes =
      await Transaction.aggregate([

        {
          $group: {

            _id: "$type",

            totalAmount: {
              $sum: "$amount",
            },

            totalTransactions: {
              $sum: 1,
            },
          },
        },
      ]);



    // category stock chart

    const categoryStock =
      await Product.aggregate([

        {
          $group: {

            _id: "$category",

            totalProducts: {
              $sum: 1,
            },

            totalQuantity: {
              $sum: "$quantity",
            },
          },
        },
      ]);



    res.status(200).json({
      success: true,

      monthlySales,

      transactionTypes,

      categoryStock,
    });

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
};



// ================= DASHBOARD SUMMARY =================

export const dashboardSummary = async (req, res) => {
  try {

    // ================= BASIC COUNTS =================

    const totalFarmers =
      await Farmer.countDocuments();

    const totalProducts =
      await Product.countDocuments();

    const totalInvoices =
      await Invoice.countDocuments();



    // ================= TOTAL SALES =================

    const totalSales =
      await Invoice.aggregate([
        {
          $group: {
            _id: null,

            sales: {
              $sum: "$grandTotal",
            },
          },
        },
      ]);



    // ================= PENDING PAYMENTS =================

    const pendingPayments =
      await Farmer.aggregate([
        {
          $group: {
            _id: null,

            totalDue: {
              $sum: "$dueAmount",
            },
          },
        },
      ]);



    // ================= LOW STOCK =================

    const lowStockProducts =
      await Product.find({
        $expr: {
          $lte: [
            "$quantity",
            "$lowStockThreshold",
          ],
        },
      });



    // ================= OVERDUE BILLS =================

    const today = new Date();

    const overdueBills =
      await Transaction.find({
        type: "credit",

        dueDate: {
          $lt: today,
        },
      });



    // ================= INTEREST EARNED =================

    const interestEarned =
      await Transaction.aggregate([

        {
          $match: {
            type: "interest",
          },
        },

        {
          $group: {

            _id: null,

            totalInterest: {
              $sum: "$amount",
            },
          },
        },
      ]);



    // ================= RECENT TRANSACTIONS =================

    const recentTransactions =
      await Transaction.find()
        .populate("farmer")
        .sort({
          createdAt: -1,
        })
        .limit(10);



    // ================= RESPONSE =================

    res.status(200).json({
      success: true,

      dashboard: {

        totalFarmers,

        totalProducts,

        totalInvoices,

        totalSales:
          totalSales[0]?.sales || 0,

        pendingPayments:
          pendingPayments[0]?.totalDue || 0,

        overdueBills:
          overdueBills.length,

        interestEarned:
          interestEarned[0]?.totalInterest || 0,

        lowStockAlerts:
          lowStockProducts.length,

        recentTransactions,
      },
    });

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
};