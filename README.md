
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
│  │  ├─ b&w.avif
│  │  ├─ blackshirtwtchperfume.avif
│  │  ├─ category-MEN.avif
│  │  ├─ category-unisex.avif
│  │  ├─ category-women.avif
│  │  ├─ Dolce & Gabbana (1).avif
│  │  ├─ f76be7b5-3b78-43fb-a0a6-b0543c1f2b5a.png
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
│  ├─ js
│  │  ├─ adminHeader.js
│  │  ├─ adminLogin.js
│  │  ├─ forgotOTP.js
│  │  ├─ forgotPass.js
│  │  ├─ forgotPassChange.js
│  │  ├─ product.js
│  │  ├─ shop.js
│  │  ├─ signupOTP.js
│  │  ├─ toggleStatus.js
│  │  ├─ userHeader.js
│  │  ├─ userLogin.js
│  │  └─ userSignUp.js
│  └─ upload
│     ├─ products
│     │  ├─ product-1755794347643-Acqua di Gio by Giorgio Armani (1).webp
│     │  ├─ product-1755794347748-Acqua di Gio by Giorgio Armani (2).webp
│     │  ├─ product-1755794347824-Acqua di Gio by Giorgio Armani (3).webp
│     │  ├─ product-1755794629396-Acqua di Gio by Giorgio Armani (1).webp
│     │  ├─ product-1755794629510-Acqua di Gio by Giorgio Armani (2).webp
│     │  ├─ product-1755794629600-Acqua di Gio by Giorgio Armani (3).webp
│     │  ├─ product-1755794677821-Acqua di Gio by Giorgio Armani (1).webp
│     │  ├─ product-1755794677917-Acqua di Gio by Giorgio Armani (2).webp
│     │  ├─ product-1755794677986-Acqua di Gio by Giorgio Armani (3).webp
│     │  ├─ product-1755800131304-Ajmal Aristocrat (1).webp
│     │  ├─ product-1755800131453-Ajmal Aristocrat (2).webp
│     │  ├─ product-1755800131511-Ajmal Aristocrat (3).webp
│     │  ├─ product-1755800387102-Al Haramain Amber Oud (2).webp
│     │  ├─ product-1755800387148-Al Haramain Amber Oud (3).webp
│     │  ├─ product-1755800387193-Al Haramain LâAventure (1).jpg
│     │  ├─ product-1755800465960-Al Haramain Amber Oud (2).webp
│     │  ├─ product-1755800466026-Al Haramain Amber Oud (3).webp
│     │  ├─ product-1755800466084-Al Haramain LâAventure (1).jpg
│     │  ├─ product-1755801845868-Ajmal Aristocrat (3).webp
│     │  ├─ product-1755801845925-Al Haramain Amber Oud (1).webp
│     │  ├─ product-1755801845982-Al Haramain Amber Oud (2).webp
│     │  ├─ product-1755842304385-Acqua di Gio by Giorgio Armani (1).webp
│     │  ├─ product-1755842304487-Acqua di Gio by Giorgio Armani (2).webp
│     │  ├─ product-1755842304545-Acqua di Gio by Giorgio Armani (3).webp
│     │  ├─ product-1755842366994-Ajmal Aristocrat (1).webp
│     │  ├─ product-1755842367129-Ajmal Aristocrat (2).webp
│     │  ├─ product-1755842367195-Ajmal Aristocrat (3).webp
│     │  ├─ product-1755842425959-Al Haramain Amber Oud (1).webp
│     │  ├─ product-1755842426028-Al Haramain Amber Oud (2).webp
│     │  ├─ product-1755842426080-Al Haramain Amber Oud (3).webp
│     │  ├─ product-1755842503064-Al Haramain LâAventure (1).jpg
│     │  ├─ product-1755842503120-Al Haramain LâAventure (2).jpg
│     │  ├─ product-1755842503175-Al Haramain LâAventure (3).jpg
│     │  ├─ product-1755845666217-Acqua di Gio by Giorgio Armani (1).webp
│     │  ├─ product-1755845666384-Acqua di Gio by Giorgio Armani (2).webp
│     │  ├─ product-1755845666616-Acqua di Gio by Giorgio Armani (3).webp
│     │  ├─ product-1755845788602-Al Haramain Amber Oud (1).webp
│     │  ├─ product-1755845788699-Al Haramain Amber Oud (2).webp
│     │  ├─ product-1755845788888-Al Haramain Amber Oud (3).webp
│     │  ├─ product-1756012044517-Al Haramain Amber Oud (1).webp
│     │  ├─ product-1756012044638-Al Haramain Amber Oud (2).webp
│     │  ├─ product-1756012044688-Al Haramain Amber Oud (3).webp
│     │  ├─ product-1756012695513-Al Haramain Amber Oud (1).webp
│     │  ├─ product-1756012695587-Al Haramain Amber Oud (2).webp
│     │  ├─ product-1756012695641-Al Haramain Amber Oud (3).webp
│     │  ├─ product-1756012708735-Al Haramain Amber Oud (1).webp
│     │  ├─ product-1756012708793-Al Haramain Amber Oud (2).webp
│     │  ├─ product-1756012708858-Al Haramain Amber Oud (3).webp
│     │  ├─ product-1756012759792-Al Haramain Amber Oud (3).webp
│     │  ├─ product-1756012759852-Al Haramain Amber Oud (1).webp
│     │  ├─ product-1756012759913-Al Haramain Amber Oud (2).webp
│     │  ├─ product-1756012873660-Al Haramain Amber Oud (1).webp
│     │  ├─ product-1756012873722-Al Haramain Amber Oud (2).webp
│     │  ├─ product-1756012873777-Al Haramain Amber Oud (3).webp
│     │  ├─ product-1756012880551-Al Haramain Amber Oud (1).webp
│     │  ├─ product-1756012880622-Al Haramain Amber Oud (2).webp
│     │  ├─ product-1756012880675-Al Haramain Amber Oud (3).webp
│     │  ├─ product-1756012908707-Al Haramain Amber Oud (1).webp
│     │  ├─ product-1756012908775-Al Haramain Amber Oud (2).webp
│     │  ├─ product-1756012908820-Al Haramain Amber Oud (3).webp
│     │  ├─ product-1756012941694-Al Haramain Amber Oud (2).webp
│     │  ├─ product-1756012966219-Al Haramain Amber Oud (1).webp
│     │  ├─ product-1756012966276-Al Haramain Amber Oud (2).webp
│     │  ├─ product-1756012966335-Al Haramain Amber Oud (3).webp
│     │  ├─ product-1756013757806-Al Haramain Amber Oud (1).webp
│     │  ├─ product-1756013757893-Al Haramain Amber Oud (2).webp
│     │  ├─ product-1756013757942-Al Haramain Amber Oud (3).webp
│     │  ├─ product-1756013809477-Al Haramain Amber Oud (1).webp
│     │  ├─ product-1756013809539-Al Haramain Amber Oud (2).webp
│     │  ├─ product-1756013809593-Al Haramain Amber Oud (3).webp
│     │  ├─ product-1756040266163-Al Haramain Amber Oud (1).webp
│     │  ├─ product-1756040266405-Al Haramain Amber Oud (2).webp
│     │  ├─ product-1756040266576-Al Haramain Amber Oud (3).webp
│     │  ├─ product-1756043983337-Al Haramain Amber Oud (1).webp
│     │  ├─ product-1756043983480-Al Haramain Amber Oud (2).webp
│     │  ├─ product-1756044005071-Al Haramain Amber Oud (1).webp
│     │  ├─ product-1756044005135-Al Haramain Amber Oud (3).webp
│     │  ├─ product-1756050040138-Gucci Bloom (1).webp
│     │  ├─ product-1756050040225-Gucci Bloom (2).webp
│     │  ├─ product-1756050040271-Gucci Bloom (3).webp
│     │  ├─ product-1756063833086-Tom Ford Black Orchid (1).webp
│     │  ├─ product-1756063833174-Tom Ford Black Orchid (2).webp
│     │  ├─ product-1756063833229-Tom Ford Black Orchid (3).webp
│     │  ├─ product-1756092911223-Al Haramain Amber Oud (1).webp
│     │  ├─ product-1756092911373-Al Haramain Amber Oud (2).webp
│     │  ├─ product-1756092911490-Al Haramain Amber Oud (3).webp
│     │  ├─ product-1756093252425-Ajmal Aristocrat (3).webp
│     │  ├─ product-1756093252607-Al Haramain Amber Oud (1).webp
│     │  ├─ product-1756093252749-Al Haramain Amber Oud (2).webp
│     │  ├─ product-1756093629080-Ajmal Aristocrat (1).webp
│     │  ├─ product-1756093629389-Ajmal Aristocrat (2).webp
│     │  ├─ product-1756093629548-Ajmal Aristocrat (3).webp
│     │  ├─ product-1756094049976-Yves Saint Laurent Black Opium (1).webp
│     │  ├─ product-1756094050322-Yves Saint Laurent Black Opium (2).webp
│     │  ├─ product-1756094050473-Yves Saint Laurent Black Opium (3).webp
│     │  ├─ product-1756095317361-Arabian Oud Kalemat (1).webp
│     │  ├─ product-1756095317526-Arabian Oud Kalemat (2).webp
│     │  ├─ product-1756095317689-Arabian Oud Kalemat (3).webp
│     │  ├─ product-1756095440908-Acqua di Gio by Giorgio Armani (2).webp
│     │  ├─ product-1756095453399-Al Haramain Amber Oud (1).webp
│     │  ├─ product-1756095453697-Al Haramain Amber Oud (2).webp
│     │  ├─ product-1756095569407-Al Haramain Amber Oud (3).webp
│     │  ├─ product-1756095590490-Acqua di Gio by Giorgio Armani (1).webp
│     │  ├─ product-1756095590743-Acqua di Gio by Giorgio Armani (2).webp
│     │  ├─ product-1756095590932-Acqua di Gio by Giorgio Armani (3).webp
│     │  ├─ product-1756201724386-Acqua di Gio by Giorgio Armani (1).webp
│     │  ├─ product-1756201778194-Acqua di Gio by Giorgio Armani (1).webp
│     │  ├─ product-1756201778268-Acqua di Gio by Giorgio Armani (2).webp
│     │  ├─ product-1756201778324-Acqua di Gio by Giorgio Armani (3).webp
│     │  ├─ product-1756202312769-Gucci Bloom (1).webp
│     │  ├─ product-1756202312829-Gucci Bloom (2).webp
│     │  ├─ product-1756202312880-Gucci Bloom (3).webp
│     │  ├─ product-1756202392185-Gucci Bloom (1).webp
│     │  ├─ product-1756202392262-Gucci Bloom (2).webp
│     │  ├─ product-1756202392323-Gucci Bloom (3).webp
│     │  ├─ product-1756202783429-dior sauvage-1 (1).webp
│     │  ├─ product-1756202783484-dior sauvage-1 (2).webp
│     │  ├─ product-1756202783550-dior sauvage-1 (3).webp
│     │  ├─ product-1756202907765-dior sauvage-1 (2).webp
│     │  ├─ product-1756203163140-Jo Malone Peony & Blush Suede (1).webp
│     │  ├─ product-1756203163217-Jo Malone Peony & Blush Suede (2).webp
│     │  ├─ product-1756203163320-Jo Malone Peony & Blush Suede (3).webp
│     │  ├─ product-1756203707178-Chanel No5 (1).webp
│     │  ├─ product-1756203707247-Chanel No5 (2).webp
│     │  ├─ product-1756203707313-Chanel No5 (3).webp
│     │  ├─ product-1756206408956-Tom Ford Black Orchid (1).webp
│     │  ├─ product-1756206409123-Tom Ford Black Orchid (2).webp
│     │  ├─ product-1756206409225-Tom Ford Black Orchid (3).webp
│     │  ├─ product-1756209441608-Arabian Oud Kalemat (1).webp
│     │  ├─ product-1756209441706-Arabian Oud Kalemat (2).webp
│     │  ├─ product-1756209441765-Arabian Oud Kalemat (3).webp
│     │  ├─ product-1756210004548-Arabian Oud Kalemat (2).webp
│     │  ├─ product-1756211822156-Al Haramain Amber Oud (1).webp
│     │  ├─ product-1756211822272-Al Haramain Amber Oud (2).webp
│     │  ├─ product-1756211822342-Al Haramain Amber Oud (3).webp
│     │  ├─ product-1756212843307-Al Haramain LâAventure (1).jpg
│     │  ├─ product-1756212843375-Al Haramain LâAventure (2).jpg
│     │  ├─ product-1756212843436-Al Haramain LâAventure (3).jpg
│     │  ├─ product-1756212865860-Swiss Arabian Shaghaf Oud (1).webp
│     │  ├─ product-1756212865980-Swiss Arabian Shaghaf Oud (2).webp
│     │  ├─ product-1756212866104-Swiss Arabian Shaghaf Oud (3).webp
│     │  ├─ product-1756215959114-Yves Saint Laurent Black Opium (1).webp
│     │  ├─ product-1756215959302-Yves Saint Laurent Black Opium (2).webp
│     │  ├─ product-1756215959363-Yves Saint Laurent Black Opium (3).webp
│     │  ├─ product-1756215997729-Yves Saint Laurent Black Opium (3).webp
│     │  ├─ product-1756216096303-Burberry Her (1).jpg
│     │  ├─ product-1756216096371-Burberry Her (2).jpg
│     │  ├─ product-1756216096429-Burberry Her (3).jpg
│     │  ├─ product-1756216116301-Rasasi La Yuqawam (1).webp
│     │  ├─ product-1756216116355-Rasasi La Yuqawam (2).webp
│     │  ├─ product-1756216116410-Rasasi La Yuqawam (3).webp
│     │  ├─ product-1756216138009-Ajmal Aristocrat (1).webp
│     │  ├─ product-1756216138120-Ajmal Aristocrat (2).webp
│     │  ├─ product-1756216138180-Ajmal Aristocrat (3).webp
│     │  ├─ product-1756216574780-Acqua di Gio by Giorgio Armani (1).webp
│     │  ├─ product-1756216574933-Acqua di Gio by Giorgio Armani (2).webp
│     │  ├─ product-1756216575077-Acqua di Gio by Giorgio Armani (3).webp
│     │  ├─ product-1756217822037-Tom Ford Black Orchid (3).webp
│     │  ├─ product-1756265805040-featuredProduct.avif
│     │  ├─ product-1756266040068-Gentleman Givenchy (1).avif
│     │  ├─ product-1756266299647-Dolce & Gabbana (1).avif
│     │  ├─ product-1756443088543-Fogg  (1).avif
│     │  ├─ product-1756443088816-Fogg  (2).avif
│     │  ├─ product-1756443089059-Fogg  (3).avif
│     │  ├─ product-1756445841190-Fogg  (1).avif
│     │  ├─ product-1757945407576-Screenshot 2025-09-01 230051.png
│     │  ├─ product-1757950395177-Screenshot 2025-09-02 124403.png
│     │  ├─ product-1758433500233-Fogg  (1).avif
│     │  ├─ product-1758433541518-Fogg  (1).avif
│     │  ├─ product-1758433664866-Fogg  (1).avif
│     │  ├─ product-1758433925660-Fogg  (2).avif
│     │  ├─ product-1758434016838-Fogg  (1).avif
│     │  ├─ product-1758434082169-Fogg  (2).avif
│     │  ├─ product-1759213856046-IMG_20250531_112731.jpg
│     │  ├─ product-1759213856228-IMG_20250531_112910.jpg
│     │  ├─ product-1759219707778-WhatsApp Image 2025-06-14 at 19.46.17_68f48de7.jpg
│     │  ├─ product-1759219736251-WhatsApp Image 2025-06-14 at 19.46.17_68f48de7.jpg
│     │  ├─ product-1759219751735-WhatsApp Image 2025-06-14 at 19.46.17_68f48de7.jpg
│     │  ├─ product-1759219797178-category-MEN.avif
│     │  ├─ product-1759219797334-1754024488724.jpeg
│     │  ├─ product-1759219797405-The-best-4K-Programming-Wallpaper-HD.jpg
│     │  └─ product-1759220192190-Screenshot 2025-06-23 175355.png
│     └─ profiles
│        ├─ User-1757904501329-Screenshot 2025-09-11 153150.png
│        ├─ User-1759213159595-IMG_20250913_115119.jpg
│        ├─ User-1759219632051-WhatsApp Image 2025-06-14 at 19.46.17_68f48de7.jpg
│        └─ User-1759402476947-IMG_20251001_150229.jpg
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
      ├─ profileOTP.ejs
      ├─ profileVerifyOTP.ejs
      ├─ refer.ejs
      ├─ shop.ejs
      ├─ signup.ejs
      ├─ terms&conditions.ejs
      ├─ verify-otp.ejs
      ├─ wallet.ejs
      ├─ walletTransaction.ejs
      └─ wishlist.ejs

```