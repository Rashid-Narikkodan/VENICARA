const Product=require('../../models/Product')
const Category=require('../../models/Category');
const mongoose=require('mongoose');
const landingPage = async (req, res) => {
  try {
    const search = req.query.search || "";
    // Filter object
    let filter = { isDeleted: false , isAvailable: true};
    if (search) {
      filter.name = { $regex: search, $options: "i" }; // case-insensitive search
    }

    const searchedProducts = await Product.find(filter);
    const products = await Product
    .find({ isDeleted: false, isAvailable: true })
    return res.render('userPages/landing',{products,searchedProducts})
  } catch (err) {
    console.log(err.message)
    res.status(500).send(err.message)
  }
}
const showHome = async (req, res) => {
  try {
    return res.render('userPages/home')
  } catch (err) {
    res.status(500).send(err.message)
  }
}

const showShop = async (req, res) => {
  try {
    let { maxPrice, minPrice, sort, category } = req.query;
    // Defaults & sanitization
    const selectedCategory = category && category !== "all" && mongoose.isValidObjectId(category)? new mongoose.Types.ObjectId(category) : null;
    const selectedMinPrice = Number(minPrice) || 0;
    const selectedMaxPrice = Number(maxPrice)|| 10000;
    console.log(req.query)
    // Sorting logic
    const sortOptions = {
      az: { "variants.name": 1 },
      za: { "variants.name": -1 },
      asc: { "variants.basePrice": 1 },
      desc: { "variants.basePrice": -1 },
      default: { createdAt: -1 },
    };
    const selectedSort = sortOptions[sort] || sortOptions.default;

    // Filter
    const filter = {
      isDeleted: false,
      isAvailable: true,
      "variants.basePrice": { $gte: selectedMinPrice, $lte: selectedMaxPrice },
    };
    if (selectedCategory) filter.category = selectedCategory;

    // Queries in parallel
    const [products, categories] = await Promise.all([
      Product.find(filter).populate("category").sort(selectedSort),
      Category.find({ isActive: true, isDeleted: false }),
    ]);

    return res.render("userPages/shop", {
      products,
      categories,
      minPrice,
      maxPrice,
      sort,
      selectedCategory: category, // keep raw id for UI use
    });
  } catch (err) {
    console.error("Error in showShop:", err);
    res.status(500).send("Internal server error"+err.message);
  }
};

const searchProducts = async (req, res) => {
  try {
    const search = req.query.search || "";
    // Filter object
    console.log(search)
    let filter = { isDeleted: false , isAvailable: true};
    if (search) {
      filter.name = { $regex: search, $options: "i" }; // case-insensitive search
    }
    const searchedProducts = await Product.find(filter);
    return res.json({products:searchedProducts})
  } catch (err) {
    console.log(err.message)
    res.status(500).send(err.message)
  }
}
// const showProductDetails = async (req, res) => {
//   try {
//     const {id}=req.params
//     if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
//       req.flash('error', 'Invalid product id');
//       return res.redirect('/shop');
//     }
//     const product = await Product.findOne({_id:id,isDeleted:false,isAvailable:true}).populate('category').lean();
//     if(!product){
//       req.flash('error', 'Product not found or unavailable');
//       return res.redirect('/shop');
//     }
//     console.log(product)
//     return res.render('userPages/productDetails',{product})
//   } catch (err) {
//     console.log(err.message)
//     res.status(500).send(err.message)
//   }
// }
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
      isBlocked: false
    }).limit(4).lean();

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
