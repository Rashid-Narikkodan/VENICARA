
```
VENICARA
├─ app.js
├─ config
│  ├─ cloudinary.js
│  ├─ db.js
│  ├─ mailer.js
│  ├─ passport.js
│  └─ payment.js
├─ controllers
│  ├─ admin
│  │  ├─ authController.js
│  │  ├─ categoriesController.js
│  │  ├─ couponsController.js
│  │  ├─ customersController.js
│  │  ├─ dashboardController.js
│  │  ├─ index.js
│  │  ├─ ordersController.js
│  │  ├─ productsController.js
│  │  ├─ referralsController.js
│  │  └─ salesReportController.js
│  └─ user
│     ├─ addressController.js
│     ├─ authController.js
│     ├─ cartController.js
│     ├─ checkoutController.js
│     ├─ deleteController.js
│     ├─ homecontrollers.js
│     ├─ index.js
│     ├─ orderController.js
│     ├─ productControllers.js
│     ├─ referController.js
│     ├─ userControllers.js
│     ├─ walletController.js
│     └─ wishlistController.js
├─ helpers
│  ├─ discPercent.js
│  ├─ finalPercentage.js
│  ├─ finalPrice.js
│  ├─ generateInvoice.js
│  ├─ generateOTP.js
│  ├─ getChartData.js
│  ├─ getDashboardData.js
│  ├─ handleError.js
│  ├─ imgProcess.js
│  ├─ orderID.js
│  ├─ referralCode.js
│  ├─ salesExcel.js
│  ├─ salesPDF.js
│  ├─ sendMail.js
│  └─ uploadToCloudinary.js
├─ middlewares
│  ├─ authAdmin.js
│  ├─ authUser.js
│  ├─ flash.js
│  ├─ multer.js
│  └─ session.js
├─ models
│  ├─ Address.js
│  ├─ Admin.js
│  ├─ Cart.js
│  ├─ Category.js
│  ├─ Coupon.js
│  ├─ Order.js
│  ├─ PaymentMethod.js
│  ├─ Product.js
│  ├─ Referrals.js
│  ├─ Review.js
│  ├─ User.js
│  ├─ Wallet.js
│  ├─ WalletTransaction.js
│  └─ Wishlist.js
├─ package-lock.json
├─ package.json
├─ public
│  ├─ css
│  │  ├─ adminDashboard.css
│  │  ├─ adminLogin.css
│  │  ├─ userAuth.css
│  │  └─ userHeader.css
│  ├─ images
│  │  ├─ apple-touch-icon.png
│  │  ├─ b&w.avif
│  │  ├─ blackshirtwtchperfume.avif
│  │  ├─ category-MEN.avif
│  │  ├─ category-unisex.avif
│  │  ├─ category-women.avif
│  │  ├─ Dolce & Gabbana (1).avif
│  │  ├─ f76be7b5-3b78-43fb-a0a6-b0543c1f2b5a.png
│  │  ├─ favicon-16x16.png
│  │  ├─ favicon-32x32.png
│  │  ├─ favicon-96x96.png
│  │  ├─ featuredProduct.avif
│  │  ├─ fevicon.png
│  │  ├─ Gentleman Givenchy (1).avif
│  │  ├─ hero-1.avif
│  │  ├─ hero-2.avif
│  │  ├─ login.avif
│  │  ├─ logo.avif
│  │  ├─ manwithperfume.avif
│  │  ├─ Screenshot 2025-09-11 153150.png
│  │  ├─ sitwithperfume.avif
│  │  └─ womenwithperfume.avif
│  └─ js
│     ├─ adminHeader.js
│     ├─ adminLogin.js
│     ├─ forgotOTP.js
│     ├─ forgotPass.js
│     ├─ forgotPassChange.js
│     ├─ product.js
│     ├─ signupOTP.js
│     ├─ toggleStatus.js
│     ├─ userHeader.js
│     ├─ userLogin.js
│     └─ userSignUp.js
├─ routes
│  ├─ admin
│  │  ├─ authRoutes.js
│  │  ├─ categroiesRoutes.js
│  │  ├─ couponRoutes.js
│  │  ├─ customersRoutes.js
│  │  ├─ dashboardRoutes.js
│  │  ├─ index.js
│  │  ├─ orderRoutes.js
│  │  ├─ productsRoutes.js
│  │  ├─ referralsRoutes.js
│  │  └─ salesReportRoutes.js
│  ├─ adminRoutes.js
│  └─ user
│     ├─ addressRoutes.js
│     ├─ authRoutes.js
│     ├─ cartRoutes.js
│     ├─ checkoutRoutes.js
│     ├─ deleteRoutes.js
│     ├─ homeRoutes.js
│     ├─ index.js
│     ├─ orderRoutes.js
│     ├─ profileRoutes.js
│     ├─ referRoutes.js
│     ├─ walletRoutes.js
│     └─ wishlistRoutes.js
└─ views
   ├─ adminPages
   │  ├─ addCategory.ejs
   │  ├─ addProduct.ejs
   │  ├─ categories.ejs
   │  ├─ coupons.ejs
   │  ├─ customers.ejs
   │  ├─ dashboard.ejs
   │  ├─ editCategory.ejs
   │  ├─ editProduct.ejs
   │  ├─ login.ejs
   │  ├─ orderDetails.ejs
   │  ├─ orders.ejs
   │  ├─ products.ejs
   │  ├─ profle.ejs
   │  ├─ referrals.ejs
   │  └─ salesReport.ejs
   ├─ partials
   │  ├─ admin
   │  │  ├─ footer.ejs
   │  │  └─ header.ejs
   │  └─ user
   │     ├─ footer.ejs
   │     ├─ header-landing.ejs
   │     ├─ header.ejs
   │     └─ sidebarProfile.ejs
   └─ userPages
      ├─ 404.ejs
      ├─ 500.ejs
      ├─ address.ejs
      ├─ cart.ejs
      ├─ changePass.ejs
      ├─ checkoutAddress.ejs
      ├─ checkoutAddressAdd.ejs
      ├─ checkoutAddressEdit.ejs
      ├─ checkoutPayment.ejs
      ├─ deleteAc.ejs
      ├─ editAddress.ejs
      ├─ forgot.ejs
      ├─ forgotOTP.ejs
      ├─ home.ejs
      ├─ landing.ejs
      ├─ login.ejs
      ├─ newAddress.ejs
      ├─ newEmailOTP.ejs
      ├─ orderDetails.ejs
      ├─ orders.ejs
      ├─ placeOrder.ejs
      ├─ privacyPolicy.ejs
      ├─ productDetails.ejs
      ├─ profile.ejs
      ├─ profileChangePass.ejs
      ├─ profileEdit.ejs
      ├─ refer.ejs
      ├─ shop.ejs
      ├─ signup.ejs
      ├─ terms&conditions.ejs
      ├─ verify-otp.ejs
      ├─ wallet.ejs
      ├─ walletTransaction.ejs
      └─ wishlist.ejs

```