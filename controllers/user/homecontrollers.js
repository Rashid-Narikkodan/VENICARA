const Product = require("../../models/Product");
const Category = require("../../models/Category");
const mongoose = require("mongoose");
const handleError = require("../../helpers/handleError");
const Wishlist = require("../../models/Wishlist");
const Cart = require("../../models/Cart");

const landingPage = async (req, res) => {
  try {
    const categories = await Category.find(
      { isDeleted: false, isActive: true },
      { _id: 1, name: 1 }
    );

    if (categories.length >= 3) {
      categories[0].img = "/images/category-MEN.avif";
      categories[1].img = "/images/category-unisex.avif";
      categories[2].img = "/images/category-women.avif";
    }

    const products = await Product.find({
      isDeleted: false,
      isAvailable: true,
      isFeatured: true,
    });

    return res.render("userPages/landing", { products, categories });
  } catch (err) {
    handleError(res, "landingPage", err);
  }
};

const showHome = async (req, res) => {
  try {
    const categories = await Category.find(
      { isDeleted: false, isActive: true },
      { _id: 1, name: 1 }
    );

    if (categories.length >= 3) {
      categories[0].img = "/images/category-MEN.avif";
      categories[1].img = "/images/category-unisex.avif";
      categories[2].img = "/images/category-women.avif";
    }

    const products = await Product.find({
      isDeleted: false,
      isAvailable: true,
      isFeatured: true,
    });

    return res.render("userPages/home", { products, categories });
  } catch (err) {
    handleError(res, "showHome", err);
  }
};

const showShop = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 9;
    let { maxPrice, minPrice, sort, category, search} = req.query;



    //if queries not exists
    if (Object.keys(req.query).length === 0) {
      const [products, categories] = await Promise.all([
        Product.find({ isDeleted: false, isAvailable: true })
          .populate("category")
          .skip((page - 1) * limit)
          .limit(limit)
          .sort({ createdAt: -1 }),
        Category.find({ isDeleted: false, isActive: true }),
      ]);

      const totalProducts = await Product.countDocuments({
        isDeleted: false,
      });
      const totalPages = Math.ceil(totalProducts / limit);

      let wishlist=null;
      let wishlistIds=[];
      let user = req.session.user.id || null
      if(user){
         wishlist = await Wishlist.find({
          userId: req.session.user?.id,
        }).lean();
         wishlistIds = wishlist.map((item) => item.variantId.toString());
      }

      return res.render("userPages/shop", {
        products,
        categories,
        minPrice,
        maxPrice,
        sort,
        search,
        selectedCategory: category,
        currentPage: page,
        totalPages,
        limit,
        wishlistIds,
        user,
        buildQuery: (extra) => {
          const params = { ...req.query, ...extra };
          return Object.entries(params)
            .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
            .join("&");
        },
      });
    }
    //////////////////////////////////////////////////////////////////////////


    const selectedCategory =
      category && category !== "all" && mongoose.isValidObjectId(category)
        ? new mongoose.Types.ObjectId(category)
        : null;

    const selectedMinPrice = Number(minPrice) || 0;
    const selectedMaxPrice = Number(maxPrice) || Infinity;

    const sortOptions = {
      az: { name: 1 },
      za: { name: -1 },
      asc: { lowestPrice: 1 },
      desc: { lowestPrice: -1 },
      newest: { createdAt: -1 },
    };
    const selectedSort = sortOptions[sort] || sortOptions.newest;

    const pipeline = [
      {
        $match: {
          isDeleted: false,
          isAvailable: true,
          ...(selectedCategory ? { category: selectedCategory } : {}),
        },
      },
      {
        $addFields: {
          variantPrices: {
            $map: {
              input: "$variants",
              as: "v",
              in: "$$v.finalAmount",
            },
          },
        },
      },
      {
        $addFields: {
          lowestPrice: { $min: "$variantPrices" },
        },
      },
      {
        $match: {
          lowestPrice: { $gte: selectedMinPrice, $lte: selectedMaxPrice },
        },
      },
      {
        $facet: {
          data: [
            { $sort: selectedSort },
            { $skip: (page - 1) * limit },
            { $limit: limit },
          ],
          totalCount: [{ $count: "total" }],
        },
      },
    ];

if (search && search.trim().length > 0) {
  const sanitizedSearch = search.trim();

  // Ensure $match exists
  if (!pipeline[0].$match) pipeline[0].$match = {};

  // Add regex search
  pipeline[0].$match.name = { $regex: sanitizedSearch, $options: "i" };
}


    let wishlist = null
    let wishlistIds = []

    if(req.session.user){
       wishlist = await Wishlist.find({
        userId: req.session.user?.id,
      }).lean();
       wishlistIds = wishlist.map((item) => item.variantId.toString());
    }

    const result = await Product.aggregate(pipeline);
    let products = result[0].data;
    products = await Product.populate(products, { path: "category" });

    const totalProducts = result[0].totalCount[0]?.total || 0;
    const totalPages = Math.ceil(totalProducts / limit);

    const categories = await Category.find({
      isActive: true,
      isDeleted: false,
    });

    return res.render("userPages/shop", {
      products,
      categories,
      minPrice,
      maxPrice,
      sort,
      search,
      selectedCategory: category,
      currentPage: page,
      totalPages,
      limit,
      query: req.query,
      wishlistIds,
      buildQuery: (extra) => {
        const params = { ...req.query, ...extra };
        return Object.entries(params)
          .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
          .join("&");
      },
    });
  } catch (err) {
    handleError(res, "showShop", err);
  }
};

const cartCount = async (req,res)=>{
  try{
    const count = await Cart.countDocuments({userId:req.session.user?.id})
    res.json({count})
  }catch(error){
    res.json({count:0})
  }
}

module.exports = {
  landingPage,
  showHome,
  showShop,
  cartCount
};
