const Product = require('../../models/Product');
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

    if (product.discountPrice && product.price) {
      product.discountPercent = Math.round(
        ((product.price - product.discountPrice) / product.price) * 100
      );
    }

    const relatedProducts = await Product.find({
      category: product.category._id,
      _id: { $ne: product._id },
      isDeleted: false,
      isAvailable: true,
    })
      .populate("category")
      .limit(4)
      .lean();

    return res.render("userPages/productDetails", {
      product,
      relatedProducts,
    });
  } catch (err) {
    handleError(res, "showProductDetails", err);
  }
};

module.exports = {
  searchProducts,
  showProductDetails,
};
