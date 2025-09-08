const Category = require('../../models/Category');
const handleError = require('../../helpers/handleError');

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

    return res.render('adminPages/categories', {
      page: 'categories',
      categories,
      currentPage: page,
      totalPages,
      limit,
      search,
      count: '0'
    });
  } catch (err) {
    handleError(res, "showCategory", err);
  }
};

const deleteCategory = async (req, res) => {
  try {
    await Category.findByIdAndUpdate(req.params.id, { isDeleted: true });
    req.flash('success', 'Category deleted successfully');
    return res.redirect('/admin/categories');
  } catch (err) {
    handleError(res, "deleteCategory", err);
  }
};

const showAddCategory = async (req, res) => {
  try {
    res.render('adminPages/addCategory', { page: 'categories' });
  } catch (err) {
    handleError(res, "showAddCategory", err);
  }
};

const addCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name || !description) {
      req.flash('error', 'Name and description are required');
      return res.redirect('/admin/categories');
    }

    const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const category = await Category.findOne({
      name: { $regex: `^${escapedName}$`, $options: 'i' }
    });

    if (category) {
      req.flash('error', 'This category already exists');
      return res.redirect('/admin/categories');
    }

    await new Category({ name, description }).save();

    req.flash('success', 'New category created successfully');
    return res.redirect('/admin/categories');
  } catch (err) {
    handleError(res, "addCategory", err);
  }
};

const showEditCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    return res.render('adminPages/editCategory', { page: 'categories', category });
  } catch (err) {
    handleError(res, "showEditCategory", err);
  }
};

const editCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    const filteredName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    const existing = await Category.findOne({
      $and: [
        { name: { $regex: `^${filteredName}$`, $options: 'i' } },
        { _id: { $ne: req.params.id } }
      ]
    });

    if (existing) {
      req.flash('error', 'This category already exists');
      return res.redirect('/admin/categories');
    }

    const update = {};
    if (name) update.name = name;
    if (description) update.description = description;

    await Category.findByIdAndUpdate(req.params.id, update);

    req.flash('success', 'Category updated successfully');
    return res.redirect('/admin/categories');
  } catch (err) {
    handleError(res, "editCategory", err);
  }
};

const activeCategory = async (req, res) => {
  try {
    const id = req.params.id;
    const category = await Category.findById(id);

    if (!category) {
      req.flash('error', 'Category not found');
      return res.redirect('/admin/categories');
    }

    category.isActive = !category.isActive;
    await category.save();

    req.flash('success', 'Category status updated successfully');
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
