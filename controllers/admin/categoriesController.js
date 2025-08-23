
const Category=require('../../models/Category');


const showCategory = async (req, res) => {
  try {
        const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;

    const totalCategories = await Category.countDocuments({isDeleted:false});

    const categories = await Category.find({isDeleted:false})
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({createdAt:-1})
      .lean();

    const totalPages = Math.ceil(totalCategories/ limit);

    return res.render('adminPages/categories', {
      page: 'categories',
      categories,
      currentPage: page,
      totalPages,
      limit,
      count: '0'
    });

  } catch (er) {
    res.status(500).send(er.message)
  }
}

const deleteCategory=async(req,res)=>{
  try {
   console.log(req.params.id)
    await Category.findByIdAndUpdate(req.params.id,{isDeleted:true})
    req.flash('success','category deleted successfully')
    return res.redirect('/admin/categories')
  } catch (er) {
    res.status(500).send('show edit category'+er.message)
  }
}

const showAddCategory= async (req,res)=>{
  try{
    res.render('adminPages/addCategory',{page:'categories'})
  }catch(er){
    res.status(500).send('addCategory'+er.message)
  }
}
const addCategory= async (req,res)=>{
  try{
    const {name,description}=req.body
    if(!name||!description){
      req.flash('error','name and description is required')
      return res.redirect('/admin/categories')
    }
    const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const category = await Category.findOne({
      name: { $regex: `^${escapedName}$`, $options: 'i' }
    });
    if(category){
      req.flash('error','This category is already existing')
      return res.redirect('/admin/categories')
    }
    const newCategory=new Category({
      name,
      description
    })
    newCategory.save()
    req.flash('success','new Category created successfully')
    return res.redirect('/admin/categories')
  }catch(er){
    res.status(500).send('addCategory'+er.message)
  }
}
const showEditCategory=async(req,res)=>{
try {
    const category=await Category.findById(req.params.id)
    return res.render('adminPages/editCategory', { page: 'categories',category })
  } catch (er) {
    res.status(500).send('show edit category'+er.message)
  }
}
const editCategory=async(req,res)=>{
  try {
    const update={}
    if(req.body.name!='') update.name=req.body.name
    if(req.body.description!='') update.description=req.body.description
    await Category.findByIdAndUpdate(req.params.id,update)
    req.flash('success','Category updated successfully')
    return res.redirect('/admin/categories')
  } catch (er) {
    res.status(500).send('edit category'+er.message)
  }
}

const activeCategory=async(req,res)=>{
  try {
    const id=req.params.id
    const category=await Category.findById(id)
    if(!category){
      req.flash('error','category not found')
      return res.redirect('/admin/categories')
    }
    category.isActive=!category.isActive
    await category.save()
    req.flash('success','category removed successfully')
    return res.redirect(`/admin/categories/edit/${id}`)
  } catch (er) {
    res.status(500).send(er.message)
  }
}

module.exports={
  showCategory,
  deleteCategory,
  showAddCategory,
  addCategory,
  showEditCategory,
  editCategory,
  activeCategory,
}