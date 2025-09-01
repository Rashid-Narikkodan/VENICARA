const Product = require("../../models/Product");
const Category = require("../../models/Category");
const processImages = require("../../helpers/imgProcess");
const getDiscountPercent = require("../../helpers/discPercent");

const showProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const search = req.query.search || "";
    // Filter object
    let filter = { isDeleted: false };
    if (search) {
      filter.name = { $regex: search, $options: "i" }; // case-insensitive search
    }
    const totalProducts = await Product.countDocuments(filter);

    const products = await Product.find(filter)
      .populate("category", "name")
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean();
    const productVariants = products.map((product) => {
      const totalStock = product.variants
        .filter((v) => v)
        .reduce((acc, v) => acc + (v.stock || 0), 0);
      const lowestVariant = product.variants
        .filter((v) => v)
        .reduce((min, v) => (Number(v.volume) < Number(min.volume) ? v : min));
      const basePrice = lowestVariant.basePrice;
      const image = product.images.length > 0 ? product.images[0] : null;
      return {
        _id: product._id,
        name: product.name,
        categoryName: product.category ? product.category.name : "N/A",
        basePrice,
        totalStock,
        addedOn: product.createdAt
          ? product.createdAt.toLocaleDateString()
          : "N/A",
        variantLabel: `${product.variants.length}- volume`,
        isAvailable: product.isAvailable,
        image, // first image
      };
    });
    const totalPages = Math.ceil(totalProducts / limit);

    return res.render("adminPages/products", {
      page: "products",
      products: productVariants,
      currentPage: page,
      totalPages,
      limit,
      search,
      count: "0",
    });
  } catch (err) {
    res.status(500).send("Error in product list page: " + err);
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      req.flash("error", "Invalid product id");
      return res.redirect("/admin/products");
    }
    const product = await Product.findByIdAndUpdate(
      id,
      { $set: { isDeleted: true } },
      { new: true }
    );
    if (!product) {
      req.flash("error", "Product not found");
      return res.redirect("/admin/products");
    }
    req.flash("success", "product removed");
    return res.redirect("/admin/products");
  } catch (err) {
    res.status(500).send(err.message);
  }
};
const showAddProduct = async (req, res) => {
  try {
    const categories = await Category.find({
      isDeleted: false,
      isActive: true,
    }); //to list existing categories in addProduct.js
    return res.render("adminPages/addProduct", {
      page: "products",
      categories,
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
};

const addProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      categoryId,
      tags,
      basePrice,
      discountPrice,
      stock,
      volume,
    } = req.body;

    const images = await processImages(req.files);

    // Handle variants
    const variants = Array.isArray(volume)
      ? volume.map((vol, i) => {
          const bp = Number(basePrice?.[i] || 0);
          const dp = Number(discountPrice?.[i] || 0);

          if (!vol) {
            req.flash("error", `Variant ${i + 1}: Volume is required`);
            return res.redirect("/admin/products/add");
          }

          return {
            volume: vol,
            basePrice: bp,
            discount: dp,
            discountPercentage: bp > 0 ? getDiscountPercent(bp, dp) : 0,
            stock: Number(stock?.[i] || 0),
          };
        })
      : [
          {
            volume,
            basePrice: Number(basePrice || 0),
            discount: Number(discountPrice || 0),
            discountPercentage:
              basePrice > 0 ? getDiscountPercent(basePrice, discountPrice) : 0,
            stock: Number(stock || 0),
          },
        ];

    const tagsArray = tags?.split(",").map((tag) => tag.trim()) || [];
    const product = new Product({
      name,
      description,
      category: categoryId,
      images,
      tags: tagsArray,
      variants,
      isAvailable: true,
      isDeleted: false,
    });

    await product.save();

    req.flash("success", "Product added successfully");
    res.redirect("/admin/products");
  } catch (err) {
    console.error("Error adding product:", err);
    res.status(500).send("Internal Server Error :- " + err);
  }
};

const showEditProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("category");
    const categories = await Category.find({
      isDeleted: false,
      isActive: true,
    });
    const variants = product.variants;
    res.render("adminPages/editProduct", {
      page: "products",
      product,
      categories,
      variants,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
};

const editProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findById(productId);
    if (!product) {
      req.flash("error", "Product not found.");
      return res.redirect("/admin/products");
    }

    const {
      name,
      description,
      categoryId,
      tags,
      basePrice,
      discountPrice,
      stock,
      volume,
    } = req.body;
    const update = {};
    let variants = [];
    let images = [];
    const volumes = Array.isArray(volume) ? volume : [volume];
    const basePrices = Array.isArray(basePrice) ? basePrice : [basePrice];
    const discountPrices = Array.isArray(discountPrice)
      ? discountPrice
      : [discountPrice];
    const stocks = Array.isArray(stock) ? stock : [stock];

    // Build variants
    for (let i = 0; i < volumes.length; i++) {
      if (!volumes[i] && !basePrices[i] && !discountPrices[i] && !stocks[i])
        continue;
      variants.push({
        volume: volumes[i] || product.variants[i]?.volume || "",
        basePrice: Number(basePrices[i] || product.variants[i]?.basePrice || 0),
        discount: Number(
          discountPrices[i] || product.variants[i]?.discount || 0
        ),
        discountPercentage: getDiscountPercent(
          basePrice?.[i],
          discountPrice?.[i]
        ),
        stock: Number(stocks[i] || product.variants[i]?.stock || 0),
      });
    }

    // Check for duplicate volumes
    const isDuplicateVariant =
      new Set(variants.map((v) => v.volume)).size !== variants.length;
    if (isDuplicateVariant) {
      req.flash("error", "Duplicate variant volumes are not allowed.");
      return res.redirect(`/admin/products/edit/${productId}`);
    }

    // Process images if uploaded
    if (req.files?.length) images = await processImages(req.files);
    if (images.length) update.images = product.images.concat(images);

    // Add other updates if provided
    if (name) update.name = name;
    if (description) update.description = description;
    if (categoryId) update.category = categoryId;
    if (tags) update.tags = tags.split(",").map((v) => v.trim());
    update.variants = variants;

    await Product.findByIdAndUpdate(productId, update, { new: true });
    req.flash("success", "Product updated successfully");
    res.redirect("/admin/products");
  } catch (err) {
    console.error("Error in editProduct:", err);
    res.status(500).send(err.message);
  }
};

const removeImage = async (req, res) => {
  try {
    const { image, index } = req.body;
    const productId = req.params.id;
    const product = await Product.findById(productId);
    if (!product) {
      req.flash("error", "product not found");
      return res.redirect("/admin/products/edit/" + productId);
    }
    product.images.splice(index, 1);
    await product.save();
    return res.json({ success: true });
  } catch (er) {
    console.log(er.message);
    res.status(500).send(er.message);
  }
};

const toggleProductActive = async (req, res) => {
  try {
    const id = req.params.id;
    const product = await Product.findById(id);
    if (!product) {
      req.flash("error", "product not found");
      return res.redirect("/admin/products");
    }
    product.isAvailable = !product.isAvailable;
    await product.save();
    req.flash("success", "status updated successfully");
    return res.redirect(`/admin/products`);
  } catch (er) {
    res.status(500).send(er.message);
  }
};
module.exports = {
  showProducts,
  deleteProduct,
  showAddProduct,
  addProduct,
  showEditProduct,
  editProduct,
  toggleProductActive,
  removeImage,
};
