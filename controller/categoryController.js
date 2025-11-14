import { Category } from "../model/categories.js"
import { ErrorHandler } from "../utils/Errorhandler.js"

export const addCategory = async (req, res, next) => {
    try {
        const { name, type } = req.body || {}

        if (!name || !type) {
            return next(new ErrorHandler("Name and type are required!", 400));
        }
        const category = new Category({ name, type })


        await category.save()
        res.status(201).send({
            success: true,
            message: "category added successfully !",
            category
        })
    }
    catch (err) {

        return next(new ErrorHandler(`${err._message}`, 500))
    }
}


export const getAllCategory = async (req, res, next) => {
    try {
        const main = await Category.find({ type: "main" })
        const gift = await Category.find({ type: "gift" })
        const home = await Category.find({ type: "home" })
        const fashion = await Category.find({ type: "fashion" })

        res.status(200).send({
            success: true,
            mainCategory: main,
            giftCategory: gift,
            homeCategory: home,
            fashionCategory: fashion,

        })
    }
    catch (err) {
        return next(new ErrorHandler(`${err._message}`, 500))

    }
}

export const removeCategory = async (req, res, next) => {
    try {
        const { id } = req.params

        const data = await Category.findByIdAndDelete(id)

        if (!data) {
            return next(new ErrorHandler("Category not found", 404))
        }
        res.status(200).json({
            success: true,
            message: "category deleted successfully!"
        })
    }
    catch (err) {
        return next(new ErrorHandler("Error in removing category", 500))
    }
}

export const updateCategory = async (req, res, next) => {
    try {
        const { id } = req.params
        const { name, type } = req.body

        const category = await Category.findByIdAndUpdate(id, { name, type }, { new: true })

        if(!category) {
            return next(new ErrorHandler("Category not found", 404))
        }
        res.status(200).json({
            success: true,
            message: "Category updated successfully!",
            category
        })
    }
    catch (err) {
        return next(new ErrorHandler("Error in updating category", 500))
    }
}

export const getOneCategory = async (req, res, next) => {
    try {
        const { id } = req.params

        const category = await Category.findById(id)

        if (!category) {
            return next(new ErrorHandler("Category not found!", 404));
        }

        res.status(200).json({
            success: true,
            category
        })
    }
    catch (err) {
        return next(new ErrorHandler("Error in getting category", 500))
    }
}