
const Product=require('../../models/Product')
const Category=require('../../models/Category');
const processImages = require('../../helpers/imgProcess');

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
      .populate('category', 'name')
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({createdAt:-1})
      .lean();

    const productVariants = products.map(product => {
      const totalStock = product.variants.reduce((acc, v) => acc + (v.stock || 0), 0);
      const basePrice = product.variants.length > 0 ? product.variants[0].basePrice : 0;
      const image=product.images.length > 0 ? product.images[0] : null
      return {
        _id: product._id,
        name: product.name,
        categoryName: product.category ? product.category.name : 'N/A',
        basePrice,
        totalStock,
        addedOn: product.createdAt ? product.createdAt.toLocaleDateString() : 'N/A',
        variantLabel: `${product.variants.length}- volume`,
        isAvailable:product.isAvailable,
        image// first image
      };
    });
    const totalPages = Math.ceil(totalProducts / limit);

    return res.render('adminPages/products', {
      page: 'products',
      products: productVariants,
      currentPage: page,
      totalPages,
      limit,
      search,
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
    const categories=await Category.find({isDeleted:false,isActive:true})//to list existing categories in addProduct.js
    return res.render('adminPages/addProduct',{page:'products',categories});
  } catch (err) {
    res.status(500).send(err.message);
  }
}


const addProduct = async (req, res) => {
  try {
    const { name, description, categoryId, tags, basePrice, discountPrice, stock, volume } = req.body;
    const images=await processImages(req.files)
    const variants = [{
      volume: volume,
      basePrice: Number(basePrice),
      discount: Number(discountPrice || 0),
      stock: Number(stock || 0)
    }];

    const tagsArray = tags ? tags.split(',').map(tag => tag.trim()) : [];

    const product = new Product({
      name,
      description,
      category: categoryId,
      images: images,
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
    const product=await Product.findById(req.params.id).populate('category')
    const categories=await Category.find({isDeleted:false,isActive:true})
    const variant=product.variants[0]
    res.render('adminPages/editProduct',{
      page:'products',
      product,
      categories,
      variant
    })
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
};

const editProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const { name, description, categoryId, tags, basePrice, discountPrice, stock, volume } = req.body;
    const update={}
    const variants={}
    let images=[]
    if (req.files && req.files.length > 0) images = await processImages(req.files)
    if(images && images.length>0) update.images=images
    if(name!='') update.name=name
    if(description!='') update.description=description
    if(categoryId!='') update.categoryId=categoryId
    if(tags!='') update.tags=tags.split(',').map((v)=>v.trim())
    if(basePrice!='') variants.basePrice=Number(basePrice) 
    if(discountPrice!='') variants.discount=Number(discountPrice) 
    if(stock!='') variants.stock=Number(stock) 
    if(volume!='') variants.volume=volume 
    update.variants=[]
    update.variants.push(variants)
    await Product.findByIdAndUpdate(productId, update, { new: true });
    req.flash("success", "Product updated successfully");
    res.redirect("/admin/products");
  } catch (err) {
    console.error("Error in editProduct:", err);
    res.status(500).send(err.message);
  }
};
const removeImage=async(req,res)=>{
  try {  
    console.log('hello image remove')
    const {image,index}=req.body
    const productId=req.params.id
    const product=await Product.findById(productId)
    if(!product){
      req.flash('error','product not found')
      return res.redirect('/admin/products/edit/'+productId)
    }
    product.images.splice(index,1)
    await product.save()
    return res.json({success:true})
  } catch (er) {
    res.status(500).send(er.message)
  }
}

const toggleProductActive=async(req,res)=>{
  try {
    const id=req.params.id
    const product=await Product.findById(id)
    if(!product){
      req.flash('error','product not found')
      return res.redirect('/admin/products')
    }
    product.isAvailable=!product.isAvailable
    await product.save()
    req.flash('success','status updated successfully')
    return res.redirect(`/admin/products`)
  } catch (er) {
    res.status(500).send(er.message)
  }
}
module.exports={
  showProducts,
  deleteProduct,
  showAddProduct,
  addProduct,
  showEditProduct,
  editProduct,
  toggleProductActive,
  removeImage,
}