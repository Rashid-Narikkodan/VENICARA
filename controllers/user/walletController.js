const crypto = require("crypto");
const Wallet = require("../../models/Wallet");
const WalletTransaction = require("../../models/WalletTransaction"); // separate transaction log
const razorpay = require("../../config/payment"); // configured Razorpay instance
const handleError = require("../../helpers/handleError");

const showWallet = async (req, res) => {
  try {
    let wallet = await Wallet.findOne({ userId: req.session.user.id });
    if (!wallet)
      wallet = await Wallet.create({ userId: req.session.user.id, balance: 0 });

    res.render("userPages/wallet", { wallet });
  } catch (err) {
    handleError(res, "showWallet", err);
  }
};

const addToWallet = async (req, res) => {
  try {
    let { amount } = req.body;
    amount = parseInt(amount);
    if (!amount || isNaN(amount) || amount <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid amount" });
    }

    const options = {
      amount: amount * 100, // convert to paise
      currency: "INR",
      receipt: "wallet_txn_" + Date.now(),
    };

    const order = await razorpay.orders.create(options);

    await WalletTransaction.create({
      userId: req.session.user.id,
      razorpayId: order.id,
      amount: options.amount,
      type: "credit",
      status: "pending",
    });

    res.json({ success: true, order });
  } catch (error) {
    handleError(res, "addToWallet", error);
  }
};

const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res
        .status(400)
        .json({ status: false, message: "Missing payment details" });
    }

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res
        .status(400)
        .json({ status: false, message: "Invalid payment signature" });
    }

    // Step 2: Find pending wallet transaction
    const txn = await WalletTransaction.findOne({
      razorpayId: razorpay_order_id,
    });
    if (!txn) {
      return res
        .status(404)
        .json({ status: false, message: "Transaction not found" });
    }
    if (txn.status === "success") {
      return res.json({ status: true, message: "Already verified" });
    }

    const amountInINR = txn.amount / 100; // convert paise → INR
    const balance = await Wallet.findOne({ userId: req.session.user.id });
    const lastBalance = balance.balance + amountInINR;

    // Step 3: Update wallet balance
    await Wallet.updateOne(
      { userId: req.session.user.id },
      { $inc: { balance: amountInINR } },
      { upsert: true }
    );

    txn.status = "success";
    txn.lastBalance = lastBalance
    await txn.save();

    res.json({
      status: true,
      message: "Wallet updated successfully",
      balance: lastBalance,
    });
  } catch (err) {
    console.error("verifyPayment error:", err);
    res.status(500).json({ status: false, message: "Server error" });
  }
};

const showTransactionHistory = async (req, res) => {
  try {

    let page=parseInt(req.query.page)||1;
    let limit=parseInt(req.query.limit)||6;
    let search=req.query.search||null

    let filter={
      userId: req.session.user.id,
    }

    
    const transactions = await WalletTransaction.find(filter)
    .skip((page-1)*limit)
    .limit(limit)
    .sort({ createdAt: -1 })
    .lean();
    
    const totalTransactions = await WalletTransaction.countDocuments(filter)
    const totalPages = Math.ceil(totalTransactions/limit)

    res.render("userPages/walletTransaction", {
       transactions,
       search:null,
       count:(page-1)*limit,
       totalPages,
       page,
       limit,
      });
  } catch (error) {
    handleError(res, "showTransactionHistory", error);
  }
};

module.exports = {
  showWallet,
  addToWallet,
  verifyPayment,
  showTransactionHistory,
};
