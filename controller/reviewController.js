import mongoose from "mongoose";
import { review } from "../model/reviewModel.js"
import { ErrorHandler } from "../utils/Errorhandler.js"

export const createReview = async (req, res, next) => {
    try {
        const { productId, rating, comment } = req.body

        const userId = req.user._id
        if (!productId || !rating || !comment) {
            return next(new ErrorHandler("Product, rating and comment required", 400));
        }


        const productreview = await review.findOne({ productId: productId })

        if (productreview) {
            const userHasReviewed = productreview.review.some((r) => r.byUser.toString() === userId.toString())

            if (userHasReviewed) {
                return next(new ErrorHandler("you have already reviewed this product ! ", 400))
            }

            productreview.review.push({
                rating,
                byUser: userId,
                comment
            })


            const myreview = await productreview.save()

            res.status(200).json({
                success: true,
                message: "review added successfully!",
                data: myreview
            })
        }
        else {
            const productreview = await review.create({
                productId,
                review: {
                    comment,
                    rating,
                    byUser: userId
                }
            })

            await productreview.save()

            res.status(200).json({
                success: true,
                message: "review sucessfully !",
                data: productreview
            })
        }



    } catch (err) {
        return next(new ErrorHandler(err.message, 500))
    }
}




export const getReview = async (req, res, next) => {
    try {
        const productId = req.params.id;

        const data = await review.findOne({ productId });

        if (!data) {
            return next(new ErrorHandler("No reviews found for this product", 404));
        }

        res.status(200).json({
            success: true,
            results: data.review.length,
            data: data.review
        });

    } catch (err) {
        return next(new ErrorHandler(err.message, 500));
    }
};



export const getAllReviews = async (req, res, next) => {
    try {


        let data = await review.find()
        res.status(200).json({
            success: true,
            data
        })


    } catch (err) {
        return next(new ErrorHandler(err.message, 500))
    }
}


export const updateReview = async (req, res, next) => {
    try {
        const { comment, rating } = req.body;
        const productId = req.params.id;
        const userId = req.user._id;

        if (!comment && !rating) {
            return next(new ErrorHandler("Fill at least one field!", 400));
        }

        const data = await review.findOne({ productId });

        if (!data) {
            return next(new ErrorHandler("No review document found for this product", 404));
        }

        const reviewToUpdate = data.review.find(
            (r) => r.byUser.toString() === userId.toString()
        );

        if (!reviewToUpdate) {
            return next(new ErrorHandler("No review found for this user on this product", 404));
        }

        if (comment) reviewToUpdate.comment = comment;
        if (rating) reviewToUpdate.rating = rating;

        await data.save();

        res.status(200).json({
            success: true,
            message: "Review updated successfully!",
            data
        });

    } catch (err) {
        return next(new ErrorHandler(err.message, 500));
    }
};




export const deleteReviews = async (req, res, next) => {
    try {
        const { userId } = req.body;
        const productId = req.params.id;

        if (!userId) {
            return next(new ErrorHandler("UserId is required", 400));
        }

        const userObjectId = new mongoose.Types.ObjectId(userId);

        let data = await review.findOne({ productId });

        if (!data) {
            return next(new ErrorHandler("No review document found for this product", 404));
        }

        const exists = data.review.some(
            r => r.byUser.toString() === userObjectId.toString()
        );

        if (!exists) {
            return next(new ErrorHandler("Review not found for this user", 404));
        }

        await review.updateOne(
            { productId },
            { $pull: { review: { byUser: userObjectId } } }
        );

        res.status(200).json({
            success: true,
            message: "Review deleted successfully!"
        });

    } catch (err) {
        return next(new ErrorHandler(err.message, 500));
    }
};






