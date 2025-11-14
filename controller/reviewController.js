import { review } from "../model/reviewModel.js"
import { ErrorHandler } from "../utils/Errorhandler.js"

export const createReview = async(req, res, next)=>{
    try {
        const {productId, rating, comment} = req.body

        const userId = req.user._id


        const productreview = await review.findOne({productId : productId })

        if(productreview){
            const userHasReviewed = productreview.review.some((r)=> r.byUser.toString() === userId.toString())

            if(userHasReviewed){
                return next(new ErrorHandler("you have already reviewed this product ! ", 400))
            }

            productreview.review.push({
                rating,
                byUser : userId,
                comment
            })


            const myreview = await productreview.save()

            res.status(200).json({
                success : true,
                message : "review added successfully!",
                data : myreview
            })
        }
        else{
            const productreview = await review.create({
                productId,
                review : {
                    comment,
                    rating,
                    byUser : userId
                }
            })

            await productreview.save()

            res.status(200).json({
                success : true,
                message : "review sucessfully !",
                data : productreview
            })
        }

       
       
    } catch (err) {
        return next(new ErrorHandler(err.message, 500))
    }
}




export const getReview = async(req, res, next)=>{
    try {
        const productId = req.params.id

        let data = await review.findOne({productId})

            data = []
       
            res.status(200).json({
                success : true,
                results : data.review.length,
                data
            })
    
       
    } catch (err) {
        return next(new ErrorHandler(err.message, 500))
    }
}




export const getAllReviews = async(req, res, next)=>{
    try {
     

        let data = await review.find()
            res.status(200).json({
                success : true,
                data
            })
    
       
    } catch (err) {
        return next(new ErrorHandler(err.message, 500))
    }
}


export const updateReview = async(req, res, next)=>{
    try {
        const {comment, rating} = req.body
        const productId = req.params.id
       const userId = req.user._id

        return next(new ErrorHandler("fill atleast one field !", 400))

       const data = await review.findOne({productId : productId, "review.byUser" : userId})

        return next(new ErrorHandler("product review not found for this user", 404))

       const reviewtoUpdate = data.review.find((r)=> r.byUser.toString() == userId.toString())

        return next(new ErrorHandler("couldn't find the specific review for user !", 404))

       if(comment) reviewtoUpdate.comment = comment

       if(rating) reviewtoUpdate.rating = rating


       await data.save()

       res.status(200).json({
        success : true,
        message : "review updated !",
        data
       })
    
       
    } catch (err) {
        return next(new ErrorHandler(err.message, 500))
    }
}



export const deleteReviews = async(req, res, next)=>{
    try {
     
        const {userId} = req.body
        const productId = req.params.id


        let data = await review.updateOne({productId}, {
            $pull : {
                review : { byUser : userId}
            }
        })

                return next(new ErrorHandler("review already deleted !", 200))

    
            res.status(200).json({
                success : true,
                message : "review deleted !"
            })
    
       
    } catch (err) {
        return next(new ErrorHandler(err.message, 500))
    }
}








