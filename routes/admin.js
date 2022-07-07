var express = require('express');
const { response } = require('../app');
var router = express.Router();
var constants = require('../config/constants')
var adminHelper = require('../helpers/admin-helper')

router.get('/', (req, res) => {
    if(req.session.adminLoggedIn) {
        res.render('admin/index', {admin : true, base_url : constants.BASE_URL});    
    } else {
        res.render('admin/login', { "loginErr": req.session.loginErr });
        delete req.session.loginErr
    }
    
})


router.post('/admin-login', (req, res) => {
    adminHelper.adminLogin(req.body).then((response) => {
        if(response.status) {
            req.session.adminLoggedIn = true
            req.session.adminUserData = response.admin
            res.redirect('/admin')
        } else {
            req.session.loginErr = true;
            res.redirect('/admin')
        }
    })
})

router.get('/logout', (req, res) => {
    req.session.destroy()
    res.redirect('/admin')
})



/**category starts here */

router.get('/add-category', (req, res) => {
    res.render('admin/add-category', {admin : true})
})

router.get('/view-category', async(req, res) => {
    let categoryList = await adminHelper.getCategory()
    res.render('admin/view-category', {admin : true, category : categoryList})
})

router.post('/add-category', (req, res) => {
    adminHelper.addCategory(req.body).then((response) => {
        if(response) {
            res.redirect('/admin/view-category')
        } else {
            res.redirect('/add-category')
        }
    })
})


router.get('/edit-category/:id', async(req, res) => {
    let getCategoryById = await adminHelper.getCategoryById(req.params.id)
    if(getCategoryById) {
        res.render('admin/edit-category', {admin : true, category : getCategoryById})
    }
})

router.post('/update-category/:id', (req, res) => {
    adminHelper.updateCategory(req.params.id, req.body).then((data) => {
        if(data) {
            res.redirect('/admin/view-category')
        }
        
    })
})


router.get('/delete-category/:id', (req, res) => {
    adminHelper.deleteCategory(req.params.id).then(() => {
        res.redirect('/admin/view-category')
    })
})

/**category ends here */



/**sub category starts here */

router.get('/add-sub-category', async(req, res) => {
    let categoryList = await adminHelper.getCategory()
    res.render('admin/add-sub-category', {admin : true, category : categoryList})
})

router.get('/view-sub-category', async(req, res) => {
    let subCategoryList = await adminHelper.getSubCategory()    
    res.render('admin/view-sub-category', {admin : true, subcategory : subCategoryList})
})

router.post('/add-sub-category', (req, res) => {
    adminHelper.addSubCategory(req.body).then((response) => {
        if(response) {
            res.redirect('/admin/view-sub-category')
        } else {
            res.redirect('/add-sub-category')
        }
    })
})


router.get('/edit-sub-category/:id', async(req, res) => {
    let categoryList = await adminHelper.getCategory()
    let subCategoryById = await adminHelper.getSubCategoryById(req.params.id).then((response) => {
        if (response) {
            res.render('admin/edit-sub-category', { admin : true, subcategory : response, category : categoryList })
        }
    })
})

router.post('/update-sub-category/:id', (req, res) => {
    adminHelper.updateSubCategory(req.params.id, req.body).then((data) => {
        if(data) {
            res.redirect('/admin/view-sub-category')
        }
        
    })
})


router.get('/delete-sub-category/:id', (req, res) => {
    adminHelper.deleteSubCategory(req.params.id).then((response) => {
        if (response) {
            res.redirect('/admin/view-sub-category')
        }
    })
})

/**sub category ends here */

/**products starts here */
router.get('/add-product', async(req, res) => {
    let categoryList = await adminHelper.getCategory()
    res.render('admin/add-product', {admin : true, category : categoryList})
})

router.get('/view-product', async(req, res) => {
    let productList = await adminHelper.getproducts()
    res.render('admin/view-product', {admin : true, products : productList})
})

router.post('/sub-category-details', (req, res) => {
    adminHelper.getSubCategoryBycategoryId(req.body.categoryId).then((data) => {
        res.json({
            error : false,
            dataList : data
        })
    })
})

router.post('/add-product', (req, res) => {
    adminHelper.addProduct(req.body).then((response) => {
        if (response) {
            res.redirect('/admin/view-product')
        }
    })
})


router.get('/edit-product/:id', async(req, res) => {
    let categoryList = await adminHelper.getCategory()
    let subCategoryList = await adminHelper.getSubCategoryDetails()

    let getProductById = await adminHelper.getProductById(req.params.id).then((response) => {
        if (response) {
            res.render('admin/edit-product', {productDetails : response, category : categoryList, subCategory : subCategoryList})
        }
    })
})

router.post('/update-product/:id', (req, res) => {
    console.log(req.params.id);
    adminHelper.updateProduct(req.params.id, req.body).then((data) => {
        if(data) {
            res.redirect('/admin/view-product')
        }
        
    })
})


router.get('/delete-product/:id', (req, res) => {
    adminHelper.deleteProduct(req.params.id).then((response) => {
        if (response) {
            res.redirect('/admin/view-product')
        }
    })
})


/**products ends here */



module.exports = router

