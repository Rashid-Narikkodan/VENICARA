const Category = require("../../models/Category");
const handleError = require("../../helpers/handleError");
const Product = require("../../models/Product");
const finalAmount = require("../../helpers/finalPrice");
const finalPercentage = require("../../helpers/finalPercentage");

const showCategory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const search = req.query.search || "";

    let filter = { isDeleted: false };
    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }

    const totalCategories = await Category.countDocuments(filter);

    const categories = await Category.find(filter)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean();

    const totalPages = Math.ceil(totalCategories / limit);

    return res.render("adminPages/categories", {
      page: "categories",
      categories,
      currentPage: page,
      totalPages,
      limit,
      search,
      count: (page - 1) * limit,
    });
  } catch (err) {
    handleError(res, "showCategory", err);
  }
};

const deleteCategory = async (req, res) => {
  try {
    await Category.findByIdAndUpdate(req.params.id, { isDeleted: true });
    req.flash("success", "Category deleted successfully");
    return res.redirect("/admin/categories");
  } catch (err) {
    handleError(res, "deleteCategory", err);
  }
};

const showAddCategory = async (req, res) => {
  try {
    res.render("adminPages/addCategory", { page: "categories" });
  } catch (err) {
    handleError(res, "showAddCategory", err);
  }
};

const addCategory = async (req, res) => {
  try {
    let { name, discount, description } = req.body;
    discount = discount ? parseFloat(discount) : 0;
    if (!name || !description) {
      req.flash("error", "Name and description are required");
      return res.redirect("/admin/categories/add");
    }
    const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const category = await Category.findOne({
      name: { $regex: `^${escapedName}$`, $options: "i" },
    });
    if (isNaN(discount)) {
      req.flash("error", "Discount should be number");
      return res.redirect("/admin/categories/add");
    }
    if (discount >= 100) {
      req.flash("error", "Discount should be less than 100 (percentage)");
      return res.redirect("/admin/categories/add");
    }

    if (category) {
      if (category.isDeleted) {
        category.isDelete = false;
        category.save();
      } else {
        req.flash("error", "This category already exists");
        return res.redirect("/admin/categories/add");
      }
    } else {
      await new Category({ name, discount, description }).save();
    }

    req.flash("success", "New category created successfully");
    return res.redirect("/admin/categories");
  } catch (err) {
    handleError(res, "addCategory", err);
  }
};

const showEditCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    return res.render("adminPages/editCategory", {
      page: "categories",
      category,
    });
  } catch (err) {
    handleError(res, "showEditCategory", err);
  }
};

const editCategory = async (req, res) => {
  try {
    const { name, discount, description } = req.body;
    const { id } = req.params;
    const filteredName = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const existing = await Category.findOne({
      $and: [
        { name: { $regex: `^${filteredName}$`, $options: "i" } },
        { _id: { $ne: req.params.id } },
      ],
    });

    if (existing) {
      req.flash("error", "This category already exists");
      return res.redirect("/admin/categories");
    }

    const update = {};
    if (name) update.name = name;
    if (description) update.description = description;
    if (discount) update.discount = parseFloat(discount);

    await Category.findByIdAndUpdate(id, update);

    const products = await Product.find({ category: id });
    console.log(products);
    products.forEach(async (p) => {
      p.variants.forEach(async (v, index) => {
        await Product.updateOne(
          { _id: p._id, "variants._id": v._id },
          {
            $set: {
              "variants.$.finalDiscount":
               await finalAmount(v.basePrice,v.productDiscount,id),
              "variants.$.finalDiscountPerc":
               await finalPercentage(v.basePrice,v.productDiscount,id),
            },
          }
        );
      });
    });

    req.flash("success", "Category updated successfully");
    return res.redirect("/admin/categories");
  } catch (err) {
    handleError(res, "editCategory", err);
  }
};

const activeCategory = async (req, res) => {
  try {
    const id = req.params.id;
    const category = await Category.findById(id);

    if (!category) {
      req.flash("error", "Category not found");
      return res.redirect("/admin/categories");
    }

    category.isActive = !category.isActive;
    await category.save();

    req.flash("success", "Category status updated successfully");
    return res.redirect(`/admin/categories/edit/${id}`);
  } catch (err) {
    handleError(res, "activeCategory", err);
  }
};

module.exports = {
  showCategory,
  deleteCategory,
  showAddCategory,
  addCategory,
  showEditCategory,
  editCategory,
  activeCategory,
};
