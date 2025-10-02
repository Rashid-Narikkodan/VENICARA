const Product = require('../../models/Product');
const Review = require('../../models/Review');
const handleError = require('../../helpers/handleError');

const searchProducts = async (req, res) => {
  try {
    const search = req.query.search || "";
    let filter = { isDeleted: false, isAvailable: true };

    if (search) {
      filter.name = { $regex: search, $options: "i" }; // case-insensitive
    }

    const searchedProducts = await Product.find(filter, { name: 1, images: 1 });
    return res.json({ products: searchedProducts });
  } catch (err) {
    handleError(res, "searchProducts", err);
  }
};

const showProductDetails = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      req.flash("error", "Invalid product id");
      return res.redirect("/shop");
    }

    const product = await Product.findOne({
      _id: id,
      isDeleted: false,
      isAvailable: true,
    })
      .populate("category")
      .lean();

    if (!product) {
      req.flash("error", "Product not found or unavailable");
      return res.redirect("/shop");
    }

    const reviews = await Review.find({productId:product._id})
    let averageRating = 0;
    let ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

    if (reviews.length > 0) {
      
      const total = reviews.reduce((acc, r) => acc + r.rating, 0);
      averageRating = total / reviews.length;

      reviews.forEach(r => {
        ratingCounts[r.rating] = (ratingCounts[r.rating] || 0) + 1;
      });
    } else {
      averageRating = 0;
    }

    // Convert counts to percentages
    const ratingPercentages = {};
    for (let i = 5; i >= 1; i--) {
      ratingPercentages[i] = reviews.length > 0 ? ((ratingCounts[i] / reviews.length) * 100).toFixed(0) : 0;
    }


    const relatedProducts = await Product.find({
      category: product.category._id,
      _id: { $ne: product._id },
      isDeleted: false,
      isAvailable: true,
    })
      .populate("category")
      .limit(8)
      .lean();

    return res.render("userPages/productDetails", {
      product,
      relatedProducts,
      reviews,
      averageRating:averageRating.toFixed(1),
      ratingPercentages,
    });
  } catch (err) {
    handleError(res, "showProductDetails", err);
  }
};

module.exports = {
  searchProducts,
  showProductDetails,
};
