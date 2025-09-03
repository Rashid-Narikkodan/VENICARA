const Address = require("../../models/Address");

const showAddress = async (req, res) => {
  try {
    let addresses = await Address.find({ userId: req.session.user.id });
    res.render("userPages/address", { addresses });
  } catch (er) {
    console.log(er.message);
    res.status(500).send("showAddress :- " + er.message);
  }
};
const showNewAddress = (req, res) => {
  try {
    res.render("userPages/newAddress");
  } catch (er) {
    console.log(er.message);
    res.status(500).send("showNewAddress :- " + er.message);
  }
};
const handleNewAddress = async (req, res) => {
  try {
    const {
      fullName,
      mobile, // from form -> user mobile number
      pin,
      street,
      address,
      city,
      state,
      landmark,
      alternateMobile,
      type,
    } = req.body;

    const newAddress = new Address({
      userId: req.session.user.id, // assuming logged-in user is available
      fullName,
      mobile,
      pin,
      street,
      address,
      city,
      state,
      landmark,
      alternateMobile,
      type,
    });

    await newAddress.save();

    req.flash("success", "New address added");
    res.redirect("/address");
  } catch (er) {
    console.log(er.message);
    res.status(500).send("handleNewAddress :- " + er.message);
  }
};

const showEditAddress=async(req,res)=>{
    try {
        const address=await Address.findById(req.params.id)
    res.render("userPages/editAddress",{address});
  } catch (er) {
    console.log(er.message);
    res.status(500).send("showEditAddess :- " + er.message);
  }
}

const handleEditAddress = async (req, res) => {
  try {
    const {
      fullName,
      mobile,
      pin,
      street,
      address,
      city,
      state,
      landmark,
      alternateMobile,
      type,
    } = req.body;

    const addressById = await Address.findById(req.params.id);
    if (!addressById) {
      req.flash("error", "Address not found");
      return res.redirect("/address");
    }

    const update = {
      fullName: fullName ? fullName : addressById.fullName,
      mobile: mobile ? mobile : addressById.mobile,
      pin: pin ? pin : addressById.pin,
      street: street ? street : addressById.street,
      address: address ? address : addressById.address,
      city: city ? city : addressById.city,
      state: state ? state : addressById.state,
      landmark: landmark ? landmark : addressById.landmark,
      alternateMobile: alternateMobile
        ? alternateMobile
        : addressById.alternateMobile,
      type: type ? type : addressById.type,
    };

    await Address.findByIdAndUpdate(req.params.id, update, { new: true });

    req.flash("success", "Address updated successfully");
    res.redirect("/address");
  } catch (err) {
    console.error("handleEditAddress Error:", err.message);
    res.status(500).send("handleEditAddress :- " + err.message);
  }
};
const deleteAddress=async(req,res)=>{
    try{
        await Address.findByIdAndDelete(req.params.id)
        req.flash('success','One address removed')
        res.redirect('/address')
    }catch(er){
        console.log(er.message)
        res.status(500).send('deleteAddress :- '+er.message)
    }
}
const setDefaultAddress=async(req,res)=>{
    try{
        const addressId=req.params.id
           await Address.updateMany(
      { userId: req.session.user.id }, 
      { $set: { isDefault: false } }
    );
    await Address.findByIdAndUpdate(addressId, { isDefault: true });
    return res.redirect('/address')
    }catch(er){
        console.log(er.message)
        res.status(500).send('setDefaultAddress :- '+er.message)
    }
}
module.exports = {
  showAddress,
  showNewAddress,
  handleNewAddress,
  showEditAddress,
  handleEditAddress,
  deleteAddress,
  setDefaultAddress,
};
