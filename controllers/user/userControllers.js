const Product = require('../../models/Product')
const Category = require('../../models/Category');
const mongoose = require('mongoose');
const landingPage = async (req, res) => {
  try {
    const categories=await Category.find({isDeleted:false,isActive:true},{_id:1,name:1})
    categories[0].img='/images/category-women.avif'
    categories[1].img='/images/category-unisex.avif'
    categories[2].img='/images/category-MEN.avif'
    const products = await Product.find({ isDeleted: false, isAvailable: true, isFeatured:true })
    return res.render('userPages/landing', { products,categories })
  } catch (err) {
    console.log(err.message)
    res.status(500).send(err.message)
  }
}
const showHome = async (req, res) => {
  try {
    const categories=await Category.find({isDeleted:false,isActive:true},{_id:1,name:1})
    categories[0].img='/images/category-women.avif'
    categories[1].img='/images/category-unisex.avif'
    categories[2].img='/images/category-MEN.avif'
    const products = await Product.find({ isDeleted: false, isAvailable: true, isFeatured:true })
    return res.render('userPages/home', { products,categories })
  } catch (err) {
    console.log(err)
    res.status(500).send(err.message)
  }
}

const showShop = async (req, res) => {
  try {
    let { maxPrice, minPrice, sort, category } = req.query;
    if (Object.keys(req.query).length === 0) {
      const [products,categories]=await Promise.all([
        Product.find({isDeleted:false,isAvailable:true})
        .populate('category')
        .sort({createdAt:-1}),
        Category.find({isDeleted:false,isActive:true})
      ])
       return res.render("userPages/shop", {
      products,
      categories,
      minPrice,
      maxPrice,
      sort,
      selectedCategory: category,
    });
    }
    const selectedCategory = category && category !== "all" && mongoose.isValidObjectId(category)
      ? new mongoose.Types.ObjectId(category)
      : null;

    const selectedMinPrice = Number(minPrice) || 0;
    const selectedMaxPrice = Number(maxPrice) || 20000;

    // Sorting logic
    const sortOptions = {
      az: { "name": 1 },
      za: { "name": -1 },
      asc: { "lowestPrice": 1 },   // ascending price
      desc: { "lowestPrice": -1 }, // descending price
      newest: { createdAt: -1 },
    };
    const selectedSort = sortOptions[sort] || sortOptions.newest;
     const pipeline = [
      { $match: { isDeleted: false, isAvailable: true,...(selectedCategory && { category: selectedCategory })}},
      { $addFields: {lowestPrice: { $min: "$variants.discount" }}},
      { $match: {lowestPrice: { $gte: selectedMinPrice, $lte: selectedMaxPrice }}},
      { $sort: selectedSort }
    ];
    let products = await Product.aggregate(pipeline);
    products = await Product.populate(products, { path: "category" });

    
    const categories = await Category.find({ isActive: true, isDeleted: false });
    return res.render("userPages/shop", {
      products,
      categories,
      minPrice,
      maxPrice,
      sort,
      selectedCategory: category,
    });

  } catch (err) {
    console.error("Error in showShop:", err);
    res.status(500).send("Internal server error: " + err.message);
  }
};


const searchProducts = async (req, res) => {
  try {
    const search = req.query.search || "";
    // Filter object
    console.log(search)
    let filter = { isDeleted: false, isAvailable: true };
    if (search) {
      filter.name = { $regex: search, $options: "i" }; // case-insensitive search
    }
    const searchedProducts = await Product.find(filter);
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
      isAvailable: true,
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

module.exports = {
  landingPage,
  showHome,
  showShop,
  searchProducts,
  showProductDetails,

}
