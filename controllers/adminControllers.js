const bcrypt=require('bcrypt')
const { uploadImagesToCloudinary } = require('../helpers/uploadToCloud');
const Admin=require('../models/adminSchema')
const User=require('../models/userSchema')
const Product=require('../models/productSchema')
const Category=require('../models/categorySchema')

const handleEntry=(req,res)=>{
  try{
    return res.redirect('/admin/login')
  }catch(er){
    res.status(500).send('internal erro n entry handle'+er.message)
  }
}

//SHOW LOGIN
const showLogin=(req,res)=>{
  try{
    return res.render('adminPages/login')
  }catch(error){
    res.status(500).send(error.message)
  }
}

//HANDLE LOGIN
const handleLogin=async(req,res)=>{
  const {email,password}=req.body;
  console.log(email+password);
  try{
    //validate input
    if(!email||!password) {
      req.flash('error','Email and password is required')
      return res.redirect('/admin/login')
    }
    //find admin by email
    const admin=await Admin.findOne({email})
    if(!admin){
      req.flash('error','invald credentials')
      return res.redirect('/admin/login')
    }
    const isMatch=await bcrypt.compare(password,admin.password)
    if(!isMatch){
         req.flash('error','invald credentials')
      return res.redirect('/admin/login')
    }
    if(!admin.isActive){
      req.flash('error', 'Account is not active.');
      return res.redirect('/admin/login');
    }
    //session create
     req.session.admin = {
      id: admin._id,
      email: admin.email,
      role: admin.role
    }
    req.flash('success','logged in successfully')
    res.redirect('/admin/dashboard')
  }catch(err){
    res.status(500).send(err)
  }
}

const showDashboard=(req,res)=>{
  try{
    return res.render('adminPages/dashboard',{page:'dashboard'})
  }catch(er){
    res.status(500).send(er.message)
  }
}

const showOrders = async (req, res) => {
  try {
    return res.render('adminPages/orders', { page: 'orders' })
  } catch (er) {
    res.status(500).send(er.message)
  }
}



const showProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 7;

    const totalProducts = await Product.countDocuments({ isDeleted: false });

    const products = await Product.find({ isDeleted: false })
      .populate('category', 'name')
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const productVariants = products.map(product => {
      const totalStock = product.variants.reduce((acc, v) => acc + (v.stock || 0), 0);
      const basePrice = product.variants.length > 0 ? product.variants[0].basePrice : 0;

      return {
        _id: product._id,
        name: product.name,
        categoryName: product.category ? product.category.name : 'N/A',
        basePrice,
        totalStock,
        addedOn: product.createdAt ? product.createdAt.toLocaleDateString() : 'N/A',
        variantLabel: `${product.variants.length}-${product.variants[0].volume}ml`,
        isAvailable:product.isAvailable
        // imageCount: product.images.length,
        // thumbnail: product.images.length > 0 ? product.images[0] : null // first image
      };
    });

    const totalPages = Math.ceil(totalProducts / limit);
    return res.render('adminPages/products', {
      page: 'products',
      products: productVariants,
      currentPage: page,
      totalPages,
      limit,
      count: '0'
    });
  } catch (err) {
    res.status(500).send('Error in product list page: ' + err.message);
  }
};


const deleteProduct = async (req, res) => {
  try {
    const {id}=req.params
     if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      req.flash('error', 'Invalid product id');
      return res.redirect('/admin/products');
    }
    const product = await Product.findByIdAndUpdate(
      id,
      { $set: { isDeleted: true } },
      { new: true }
    );
    if (!product) {
      req.flash('error', 'Product not found');
      return res.redirect('/admin/products');
    }
    req.flash('success','product removed')
    return res.redirect('/admin/products');
  } catch (err) {
    res.status(500).send(err.message);
  }
}
const showAddProduct = async (req, res) => {
  try {
    const categories=await Category.find()
    return res.render('adminPages/addProduct',{page:'products',categories});
  } catch (err) {
    res.status(500).send(err.message);
  }
}


const addProduct = async (req, res) => {
  try {
    const { name, description, categoryId, tags, basePrice, discountPrice, stock, volume } = req.body;

    // 1. Images - using Sharp + Cloudinary
    // 2. Variants - handle single variant from form
    const variants = [{
      volume: volume,
      basePrice: Number(basePrice),
      discount: Number(discountPrice || 0),
      stock: Number(stock || 0)
    }];

    // 3. Tags
    const tagsArray = tags ? tags.split(',').map(tag => tag.trim()) : [];

    // 4. Create Product
    const product = new Product({
      name,
      description,
      category: categoryId,
      images: [1],
      tags: tagsArray,
      variants,
      isAvailable: true,
      isDeleted: false
    });

    await product.save();
    req.flash('success', 'Product added successfully');
    res.redirect('/admin/products');

  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
};


const showEditProduct = async (req, res) => {
  try {
    const id = req.params.id;
    const product = await Product.findById(id).populate('category').lean();
    // const variants = await Variant.find({ productId: id }).lean();
    const categories = await Category.find().lean();
    return res.render('adminPages/editProduct', {
      page: 'products',
      product,
      // variants,
      categories
    });
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
};

const editProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const { 
      name, 
      description, 
      categoryId, 
      tags, 
      basePrice, 
      discountPrice, 
      stock, 
      volume 
    } = req.body;

    const basePriceNum = Number(basePrice);
    const discountPriceNum = Number(discountPrice);
    const stockNum = Number(stock);

    if (isNaN(basePriceNum) || isNaN(discountPriceNum) || isNaN(stockNum)) {
      req.flash("error", "Invalid number values for price or stock");
      return res.redirect(`/admin/products/edit/${productId}`);
    }
    const productUpdate = {
      name,
      description,
      category: categoryId,
      tags: tags ? tags.split(",").map(tag => tag.trim()) : []
    };

    if (req.files && req.files.length > 0) {
      const processedPath = await processImages(req.files);
      productUpdate.images = processedPath;
    }
    await Product.findByIdAndUpdate(productId, productUpdate, { new: true });
    // await Variant.findOneAndUpdate(
    //   { productId: productId },
    //   {
    //     basePrice: basePriceNum,
    //     discountPrice: discountPriceNum,
    //     stock: stockNum,
    //     volume
    //   },
    //   { new: true }
    // );
    req.flash("success", "Product updated successfully");
    res.redirect("/admin/products");

  } catch (err) {
    console.error("Error in editProduct:", err);
    res.status(500).send(err.message);
  }
};




const showSalesReport = async (req, res) => {
  try {
    return res.render('adminPages/salesReport', { page: 'salesReport' })
  } catch (er) {
    res.status(500).send(er.message)
  }
}

const showCustomers=async(req,res)=>{
  try{
    const user=await User.find({},{password:-1}).sort({createdAt:-1})
    return res.render('adminPages/customers',{page:'customers',user})
  }catch(er){
    res.status(500).send(er.message)
  }
}

const showCoupons = async (req, res) => {
  try {
    return res.render('adminPages/coupons', { page: 'coupons' })
  } catch (er) {
    res.status(500).send(er.message)
  }
}

const showCategory = async (req, res) => {
  try {
    return res.render('adminPages/categories', { page: 'categories' })
  } catch (er) {
    res.status(500).send(er.message)
  }
}
const addCategory= async (req,res)=>{
  try{
    await Category.create({
      name:'unisex',
      description:'its the perfumes categorized to unisex'
    })
    res.send('add new category')
  }catch(er){
    res.status(500).send('addCategory'+er.message)
  }
}

const showReturnRefund = async (req, res) => {
  try {
    return res.render('adminPages/returnRefund', { page: 'returnRefund' })
  } catch (er) {
    res.status(500).send(er.message)
  }
}

const showBanners = async (req, res) => {
  try {
    return res.render('adminPages/banners', { page: 'banners' })
  } catch (er) {
    res.status(500).send(er.message)
  }
}

const showReferrals = async (req, res) => {
  try {
    return res.render('adminPages/referrals', { page: 'referrals' })
  } catch (er) {
    res.status(500).send(er.message)
  }
}


const handleLogout=(req,res)=>{
  req.session.destroy((err)=>{
    if(err){
      res.flash('error','not abled to logout due to server issues')
      return res.redirect('/admin/dashboard')
    }
    res.clearCookie('connect.sid')
    res.redirect('/admin/login')
  })
}

module.exports = {
  handleEntry,
  showLogin,
  handleLogin,
  showDashboard,
  showCustomers,
  showOrders,
  showProducts,
  deleteProduct,
  showAddProduct,
  addProduct,
  showEditProduct,
  editProduct,
  showSalesReport,
  showCoupons,
  showCategory,
  addCategory,
  showReturnRefund,
  showBanners,
  showReferrals,
  handleLogout
}
