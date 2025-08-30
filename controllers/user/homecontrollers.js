const Product = require('../../models/Product')
const Category = require('../../models/Category');
const mongoose = require('mongoose');
const landingPage = async (req, res) => {
  try {
    const categories = await Category.find({ isDeleted: false, isActive: true }, { _id: 1, name: 1 })
    categories[0].img = '/images/category-women.avif'
    categories[1].img = '/images/category-unisex.avif'
    categories[2].img = '/images/category-MEN.avif'
    const products = await Product.find({ isDeleted: false, isAvailable: true, isFeatured: true })
    return res.render('userPages/landing', { products, categories })
  } catch (err) {
    console.log(err.message)
    res.status(500).send(err.message)
  }
}
const showHome = async (req, res) => {
  try {
    const categories = await Category.find({ isDeleted: false, isActive: true }, { _id: 1, name: 1 })
    categories[0].img = '/images/category-women.avif'
    categories[1].img = '/images/category-unisex.avif'
    categories[2].img = '/images/category-MEN.avif'
    const products = await Product.find({ isDeleted: false, isAvailable: true, isFeatured: true })
    return res.render('userPages/home', { products, categories })
  } catch (err) {
    console.log(err)
    res.status(500).send(err.message)
  }
}

const showShop = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 6;
    let { maxPrice, minPrice, sort, category } = req.query;

    if (Object.keys(req.query).length === 0) {
      const [products, categories] = await Promise.all([
        Product.find({ isDeleted: false })
          .populate('category')
          .skip((page - 1) * limit)
          .limit(limit)
          .sort({ createdAt: -1 }),
        Category.find({ isDeleted: false, isActive: true })
      ])
      const totalProducts = await Product.countDocuments({ isDeleted: false })
      const totalPages = Math.ceil(totalProducts / limit);
      return res.render("userPages/shop", {
        products,
        categories,
        minPrice,
        maxPrice,
        sort,
        selectedCategory: category,
        currentPage: page,
        totalPages,
        limit,
        query:req.query
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
      { $match: { isDeleted: false, ...(selectedCategory && { category: selectedCategory }) } },
      { $addFields: { lowestPrice: { $min: "$variants.discount" } } },
      { $match: { lowestPrice: { $gte: selectedMinPrice, $lte: selectedMaxPrice } } },
      {
        $facet: {
          data: [
            { $sort: selectedSort },
            { $skip: (page - 1) * limit },
            { $limit: limit }
          ],
          totalCount: [
            { $count: "total" }
          ]
        }
      },


    ];
    
    //count of products
    const result = await Product.aggregate(pipeline);
    let products = result[0].data;
    products = await Product.populate(products, { path: "category" });
    const totalProducts = result[0].totalCount[0]?.total || 0;
    const totalPages = Math.ceil(totalProducts / limit);

    const categories = await Category.find({ isActive: true, isDeleted: false });
    return res.render("userPages/shop", {
      products,
      categories,
      minPrice,
      maxPrice,
      sort,
      selectedCategory: category,
      currentPage: page,
      totalPages,
      limit,
      query:req.query
    });

  } catch (err) {
    console.error("Error in showShop:", err);
    res.status(500).send("Internal server error: " + err.message);
  }
};

module.exports = {
  landingPage,
  showHome,
  showShop,
}