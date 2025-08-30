const Product = require('../../models/Product')

const searchProducts = async (req, res) => {
  try {
    const search = req.query.search || "";
    let filter = { isDeleted: false, isAvailable: true };
    if (search) {
      filter.name = { $regex: search, $options: "i" }; // case-insensitive search
    }
    const searchedProducts = await Product.find(filter,{name:1,images:1});
    return res.json({ products: searchedProducts })
  } catch (err) {
    console.log(err.message)
    res.status(500).send(err.message)
  }
}
const showProductDetails = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      req.flash('error', 'Invalid product id');
      return res.redirect('/shop');
    }

    // Fetch product
    const product = await Product.findOne({
      _id: id,
      isDeleted: false,
    }).populate('category').lean();

    if (!product) {
      req.flash('error', 'Product not found or unavailable');
      return res.redirect('/shop');
    }

    // Calculate discount info if discountPrice exists
    if (product.discountPrice && product.price) {
      product.discountPercent = Math.round(
        ((product.price - product.discountPrice) / product.price) * 100
      );
    }

    // Fetch related products (same category, excluding current product)
    const relatedProducts = await Product.find({
      category: product.category._id,
      _id: { $ne: product._id },
      isDeleted: false,
      isAvailable: true,
    }).populate('category').limit(4).lean();

    return res.render('userPages/productDetails', {
      product,
      relatedProducts
    });
  } catch (err) {
    console.log(err.message);
    res.status(500).send(err.message);
  }
};

module.exports={
  searchProducts,
  showProductDetails,  
}