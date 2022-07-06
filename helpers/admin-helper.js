var db = require('../config/connection')
var collection = require('../config/collection')
var bcrypt = require('bcrypt')
const { response } = require('../app')
var objectId = require('mongodb').ObjectId


module.exports = {
    adminLogin:(adminData) => {
        return new Promise(async(resolve, reject) => {
            let loginStatus = false
            let response = {}
            let adminExist = await db.get().collection(collection.ADMIN_COLLECTION).findOne({email: adminData.email})
            if (adminExist) {
                bcrypt.compare(adminData.password, adminExist.password).then((status) => {
                    if(status) {
                        response.admin = adminExist
                        response.status = true
                        resolve(response)
                    } else {
                        resolve({status : false})        
                    }
                })
            } else {
                resolve({status : false})
            }
        })
    },

    /**category starts */

    addCategory:(category) => { 
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CATEGORY_COLLECTION).insertOne({category_name : category.category}).then((data) => {
                let id = data.insertedId.toString()
                resolve(id)
            })
        })
    },

    getCategory:() => {
        return new Promise(async(resolve, reject) => {
            let category = await db.get().collection(collection.CATEGORY_COLLECTION).find().toArray()
            resolve(category)
        })
    },

    getCategoryById:(categoryId) => {
        return new Promise(async(resolve, reject) => {
            let category = await db.get().collection(collection.CATEGORY_COLLECTION).findOne({_id:objectId(categoryId)})
            resolve(category)
        })
    },

    updateCategory:(categoryid, data) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CATEGORY_COLLECTION).updateOne({_id : objectId(categoryid)}, {
                $set : {
                    category_name : data.category
                }
            }).then((response) => {
                resolve(response)
            })
        })
    },

    deleteCategory:(categoryId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CATEGORY_COLLECTION).deleteOne({_id:objectId(categoryId)}).then((response) => {
                resolve(response)
            })
        })
    },

    /**category ends */

    /**sub category starts */
    getSubCategory:() => {
        return new Promise(async(resolve, reject) => {
            let subCategory = await db.get().collection(collection.CATEGORY_COLLECTION).aggregate([
                {
                    $lookup : {
                        from : collection.SUBCATEGORY_COLLECTION,
                        localField : '_id',
                        foreignField : 'category_id',
                        as : 'subCategoryDetails'
                    }
                },
                {
                    $unwind : '$subCategoryDetails'
                },
                {
                    $project : {
                        category_id : '$_id',
                        category_name : '$category_name',
                        sub_category_id : '$subCategoryDetails._id',
                        sub_category_name : '$subCategoryDetails.sub_category',
                    }
                }
            ]).toArray()
            resolve(subCategory)
        })
    },
    
    addSubCategory:(subCategoryData) => {
        let subCatObj = {
            category_id : objectId(subCategoryData.category_id),
            sub_category : subCategoryData.sub_category
        }

        return new Promise((resolve, reject) => {
            db.get().collection(collection.SUBCATEGORY_COLLECTION).insertOne(subCatObj).then((data) => {
                let id = data.insertedId.toString()
                resolve(id)  
            })
        })
    },

    getSubCategoryById:(subCategoryId) => {
        return new Promise(async(resolve, reject) => {
            let subCategory = await db.get().collection(collection.SUBCATEGORY_COLLECTION).aggregate([
                {
                    $match : {
                        _id : objectId(subCategoryId)
                    }
                },
                {
                    $lookup : {
                        from : collection.CATEGORY_COLLECTION,
                        localField : 'category_id',
                        foreignField : '_id',
                        as : 'categoryDetails'
                    }
                },
                {
                    $unwind : '$categoryDetails'
                },
                {   
                    $project : {
                        category_id : '$categoryDetails._id',
                        category_name : '$categoryDetails.category_name',
                        sub_category_name : '$sub_category',
                    }
                }
            ]).toArray()
            resolve(subCategory[0])
        })
    },



    updateSubCategory:(subcategoryid, data) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.SUBCATEGORY_COLLECTION).updateOne({_id : objectId(subcategoryid)}, {
                $set : {
                    category_id : objectId(data.category_id),
                    sub_category : data.sub_category
                }
            }).then((response) => {
                resolve(response)
            })
        })
    },


    deleteSubCategory:(subCategoryId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.SUBCATEGORY_COLLECTION).deleteOne({_id : objectId(subCategoryId)}).then((response) => {
                resolve(response)
            })
        })
    },

    /**sub category ends */


    /**products starts here */
    getSubCategoryBycategoryId:(categoryId) => {
        return new Promise(async(resolve, reject) => {
            let subCategories = await db.get().collection(collection.SUBCATEGORY_COLLECTION)
            .find({category_id : objectId(categoryId)}).toArray()
            resolve(subCategories)
        })
    },

    addProduct:(productData) => {
        let proObj = {
            category_id : objectId(productData.category_id),
            sub_category_id : objectId(productData.sub_category_id),
            product_name : productData.product_name,
            price : productData.price
        }

        console.log(proObj);

        return new Promise((resolve, reject) => {
            db.get().collection(collection.PRODUCT_COLLECTION).insertOne(proObj).then((data) => {
                let id = data.insertedId.toString()
                resolve(id)  
            })
        })
    },

    getproducts:() => {
        return new Promise(async(resolve, reject) => {
            let productDetails = await db.get().collection(collection.PRODUCT_COLLECTION).aggregate([
                {
                    $lookup : {
                        from : collection.SUBCATEGORY_COLLECTION,
                        localField : 'sub_category_id',
                        foreignField : '_id',
                        as : 'subCategoryDetails'
                    }
                },
                {
                    $unwind : '$subCategoryDetails'
                },
                {
                    $lookup : {
                        from : collection.CATEGORY_COLLECTION,
                        localField : 'category_id',
                        foreignField : '_id',
                        as : 'categoryDetails'
                    }
                },
                {
                    $unwind : '$categoryDetails'
                },
                {
                    $project : {
                        product_name : '$product_name',
                        price : '$price',
                        category : '$categoryDetails.category_name',
                        sub_category : '$subCategoryDetails.sub_category'
                    }
                }

                
            ]).toArray()
            resolve(productDetails)
        })
    }

    /**products ends here */
}
