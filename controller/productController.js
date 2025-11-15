import mongoose from "mongoose";
import { Category } from "../model/categories.js";
import { productDetails } from "../model/productModel.js";
import { shop } from "../model/shopModel.js";
import { ErrorHandler } from "../utils/Errorhandler.js";

const fileupload = (imgs, res) => {
  if (!imgs || imgs.length === 0) {
    throw new ErrorHandler("No files selected!", 400);
  }

  const successfullyUploads = imgs.map(file => ({
    filename: file.filename,
    path: file.path,
    mimetype: file.mimetype,
    size: file.size,
    fileurl: file.path
  }));
  return successfullyUploads

}

export const uploadtogoogledrive = async (req, res, next) => {
  try {

    const data = fileupload(req.files)
    const img = []
    data.map(d => img.push(d.fileurl))

    res.status(200).json({
      message: `${data.length} image uploaded successfully !`,
      images: img
    })



  } catch (err) {
    console.error(err)
    res.status(500).json({
      success: false,
      message: "failed to upload"
    })
  }
}

export const addProduct = async (req, res, next) => {

  const userId = req.user._id
  const { name, price, category, itemTag, shippingTag, discount, quantity } = req.body || {};

  try {

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No image files provided."
      });
    }

    const shopdata = await shop.findOne({ owner: userId })
    if (!shopdata) {
      return next(new ErrorHandler("Create shop to upload product!", 400));
    }


    // categoryId li hai Category Model se

    let categoryId = category;

    if (typeof category === "string" && mongoose.Types.ObjectId.isValid(category)) {
      categoryId = category;
    }
    else if (typeof category === "string") {
      const findCategory = await Category.findOne({ name: category.trim() });
      if (!findCategory) {
        return next(new ErrorHandler("Invalid category name!", 400));
      }
      categoryId = findCategory._id;
    }
    const data = await productDetails.create({
      name,
      shopName: shopdata.shopName,
      shopId: shopdata._id,
      price,
      category: categoryId,  // category ko category Id change kiya hai
      quantity,
      itemTag,
      discount,
      shippingTag,
      userId
    });

    const imgdata = fileupload(req.files)
    const img = []
    imgdata.map(d => img.push(d.fileurl))

    data.images = img

    await data.save()


    res.status(201).send({
      success: true,
      message: "product added successfully ! ",
      data: data,
    });
  } catch (err) {
    console.error(err)
    return next(new ErrorHandler("internal server error !", 500));
  }
};

export const getProduct = async (req, res, next) => {
  try {
    const data = await productDetails.find();
    if (!data || data.length === 0) {
      return next(new ErrorHandler("No products found!", 404));
    }
    res.status(200).send({
      success: true,
      results: data.length,
      data: data,
    });
  } catch (err) {
    return next(new ErrorHandler("internal server error !", 500));
  }
};


export const getProductByCategory = async (req, res, next) => {
  try {
    const { categoryId } = req.params;
    const data = await productDetails.find({ category: categoryId }).populate("category")
    if (data.length === 0) {
      return next(new ErrorHandler("no product available", 404))
    }
    res.status(200).send({
      success: true,
      data: data
    });
  } catch (err) {
    return next(new ErrorHandler("internal server error !", 500));
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const newdata = req.body
    const data = await productDetails.findByIdAndUpdate(id, newdata, {
      new: true
    })

    if (!data) {
      return next(new ErrorHandler("Product not found!", 404));
    }
    res.status(200).send({
      success: true,
      message: "product updated successfully !",
      data
    })

  }
  catch (err) {
    return next(new ErrorHandler(`${err._message}`, 500))

  }
}

export const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    const data = await productDetails.findByIdAndDelete(id)

    if (!data) {
      return next(new ErrorHandler("Product not found!", 404));
    }

    res.status(200).send({
      success: true,
      message: "product deleted successfully !",

    })

  }
  catch (err) {
    return next(new ErrorHandler(`${err._message}`, 500))

  }
}

export const filterProduct = async (req, res, next) => {
  try {

    const { name, shopName, category, price, min, max, itemTag, shippingTag, sort } = req.query;

    if (!name && !shopName && !category && !price && !min && !max && !itemTag && !shippingTag && !sort) {
      return next(new ErrorHandler("user query to get data !", 400))
    }

    let filter = {}



    if (name?.trim()) filter.name = { $regex: name, $options: "i" }
    if (shopName?.trim()) filter.shopName = { $regex: shopName, $options: "i" }
    if (min?.trim() && max?.trim()) filter.price = { $gte: min, $lte: max }
    if (category?.trim()) {
      let catDoc = await Category.findOne({
        $or: [{ type: category }, { name: category }]
      })

      if (catDoc) {
        filter.category = catDoc._id
      }
    }

    let query = productDetails.find(filter).populate("category")

    if (sort?.trim() === "latest") {
      query = query.sort({ createdAt: -1 })
    }
    else if (sort?.trim() === "priceLowToHigh") {
      query = query.sort({ price: 1 })
    }
    else if (sort?.trim() === "priceHighToLow") {
      query = query.sort({ price: -1 })
    }

    const products = await query

    res.send({
      success: true,
      results: products.length,
      products
    })
  }
  catch (err) {
    return next(new ErrorHandler(`${err._message}`, 500))

  }

}