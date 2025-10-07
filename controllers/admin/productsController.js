const Product = require("../../models/Product");
const Category = require("../../models/Category");
const processImages = require("../../helpers/imgProcess");
const getDiscountPercent = require("../../helpers/discPercent");
const handleError = require("../../helpers/handleError");
const finalAmount = require('../../helpers/finalPrice')
const finalPercentage = require('../../helpers/finalPercentage')

const showProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 6;
    const search = req.query.search || "";

    let filter = { isDeleted: false };
    if (search) filter.name = { $regex: search, $options: "i" };

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
        image,
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
      count: (page - 1) * limit,
    });
  } catch (err) {
    handleError(res, "showProducts", err);
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
    handleError(res, "deleteProduct", err);
  }
};

const showAddProduct = async (req, res) => {
  try {
    const categories = await Category.find({
      isDeleted: false,
      isActive: true,
    });
    return res.render("adminPages/addProduct", {
      page: "products",
      categories,
    });
  } catch (err) {
    handleError(res, "showAddProduct", err);
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
      discount,
      stock,
      volume,
    } = req.body;
    
    
    const category=await Category.findById(categoryId)
    if (!category || category.isDeleted || !category.isActive) {
      req.flash("error", "Category not found or inactive");
      return res.redirect("/admin/products/add");
    }
    if (!name || typeof name !== "string" || name.length > 100) {
      req.flash("error", "Product name is required and max 100 chars");
      return res.redirect("/admin/products/add");
    }
    if (description && description.length > 500) {
      req.flash("error", "Description max 500 chars");
      return res.redirect("/admin/products/add");
    }
    if(discount&&discount>50){
      req.flash("error", "discount should be less than 50%");
      return res.redirect("/admin/products/add");
    }
    let tagsArray = tags?.split(",").map((tag) => tag.trim()) || [];
    if (tags) {
      tagsArray = tags.split(",").map((t) => t.trim()).filter(Boolean);
      if (tagsArray.length > 10) {
        req.flash("error", "Maximum 10 tags allowed");
        return res.redirect("/admin/products/add");
      }
    }
    if(!req.files||!req.files.length){
      req.flash("error", "Atleast One image is neccessary");
      return res.redirect("/admin/products/add");
    }
    
    const images = await processImages(req.files);
    const variants = Array.isArray(volume)
      ? volume.map((vol, i) => {
          const bp = Number(basePrice?.[i] || 0);
          const disc = Number(discount?.[i] || 0);
          if (!vol) {
            req.flash("error", `Variant ${i + 1}: Volume is required`);
            return res.redirect("/admin/products/add");
          }
          return {
            volume: vol,
            stock: Number(stock?.[i] || 0),
            basePrice: bp,
            discount: disc,
            finalDiscount:disc<category.discount?category.discount:disc,
            finalAmount: parseInt(bp - (bp * (disc < category.discount ? category.discount : disc)) / 100)
          };
        })
      : [
          {
            volume,
            stock: Number(stock || 0),
            basePrice: Number(basePrice || 0),
            discount: parseInt(discount || 0),
            finalDiscount: parseInt(discount < category.discount ? category.discount : discount),
            finalAmount: parseInt(basePrice - (basePrice * (discount < category.discount ? category.discount : discount)) / 100)
          },
        ];

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
    handleError(res, "addProduct", err);
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
    handleError(res, "showEditProduct", err);
  }
};

const  editProduct = async (req, res) => {
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
      discount,
      stock,
      volume,
    } = req.body;
    const update = {};
    let variants = [];
    let images = [];
    const volumes = Array.isArray(volume) ? volume : [volume];
    const stocks = Array.isArray(stock) ? stock : [stock];
    const basePrices = Array.isArray(basePrice) ? basePrice : [basePrice];
    const disc = Array.isArray(discount)? discount : [discount];
    const category=await Category.findById(categoryId)

    for (let i = 0; i < volumes.length; i++) {
      if (!volumes[i] && !basePrices[i] && !disc[i] && !stocks[i])
        continue;
      variants.push({
        _id:product.variants[i]?._id,
        volume: volumes[i] || product.variants[i]?.volume || "",
        stock: Number(stocks[i] || product.variants[i]?.stock || 0),
        basePrice: Number(basePrices[i] || product.variants[i]?.basePrice || 0),
        discount: Number(disc[i] || product.variants[i]?.discount || 0),
        finalDiscount: Number(disc[i]<category.discount?category.discount:disc[i] || product.variants[i]?.finalDiscount || 0),
        finalAmount: parseInt(basePrices[i] - (basePrice[i] * (disc[i] < category.discount ? category.discount : disc[i])) / 100||product.variants[i]?.finalAmount || 0)
      });
    }

    const isDuplicateVariant =
      new Set(variants.map((v) => v.volume)).size !== variants.length;
    if (isDuplicateVariant) {
      req.flash("error", "Duplicate variant volumes are not allowed.");
      return res.redirect(`/admin/products/edit/${productId}`);
    }

    if (req.files?.length) images = await processImages(req.files);
    if (images.length) update.images = product.images.concat(images);

    if (name) update.name = name;
    if (description) update.description = description;
    if (categoryId) update.category = categoryId;
    if (tags) update.tags = tags.split(",").map((v) => v.trim());
    update.variants = variants;

    await Product.findByIdAndUpdate(productId, update, { new: true });
    req.flash("success", "Product updated successfully");
    res.redirect("/admin/products");
  } catch (err) {
    handleError(res, "editProduct", err);
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
  } catch (err) {
    handleError(res, "removeImage", err);
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
  } catch (err) {
    handleError(res, "toggleProductActive", err);
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
