const Address = require("../../models/Address");

// Reusable error handler
const handleError = require('../../helpers/handleError')

const showAddress = async (req, res) => {
  try {
    let addresses = await Address.find({
      userId: req.session.user.id,
      isDeleted: false,
    });
    res.render("userPages/address", { addresses });
  } catch (error) {
    handleError(res, "showAddress", error);
  }
};

const showNewAddress = (req, res) => {
  try {
    res.render("userPages/newAddress");
  } catch (error) {
    handleError(res, "showNewAddress", error);
  }
};

const handleNewAddress = async (req, res) => {
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

    const newAddress = new Address({
      userId: req.session.user.id,
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
  } catch (error) {
    handleError(res, "handleNewAddress", error);
  }
};

const showEditAddress = async (req, res) => {
  try {
    const address = await Address.findById(req.params.id);
    res.render("userPages/editAddress", { address });
  } catch (error) {
    handleError(res, "showEditAddress", error);
  }
};

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
      fullName: fullName || addressById.fullName,
      mobile: mobile || addressById.mobile,
      pin: pin || addressById.pin,
      street: street || addressById.street,
      address: address || addressById.address,
      city: city || addressById.city,
      state: state || addressById.state,
      landmark: landmark || addressById.landmark,
      alternateMobile: alternateMobile || addressById.alternateMobile,
      type: type || addressById.type,
    };

    await Address.findByIdAndUpdate(req.params.id, update, { new: true });

    req.flash("success", "Address updated successfully");
    res.redirect("/address");
  } catch (error) {
    handleError(res, "handleEditAddress", error);
  }
};

const deleteAddress = async (req, res) => {
  try {
    await Address.findByIdAndUpdate(req.params.id, { isDeleted: true });
    req.flash("success", "One address removed");
    res.redirect("/address");
  } catch (error) {
    handleError(res, "deleteAddress", error);
  }
};

const setDefaultAddress = async (req, res) => {
  try {
    const addressId = req.params.id;

    // First remove default from all
    await Address.updateMany(
      { userId: req.session.user.id },
      { $set: { isDefault: false } }
    );

    // Then set the chosen one
    await Address.findByIdAndUpdate(addressId, { isDefault: true });

    return res.redirect("/address");
  } catch (error) {
    handleError(res, "setDefaultAddress", error);
  }
};

module.exports = {
  showAddress,
  showNewAddress,
  handleNewAddress,
  showEditAddress,
  handleEditAddress,
  deleteAddress,
  setDefaultAddress,
};
