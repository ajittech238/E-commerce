import mongoose from "mongoose"
import { wishlist } from "../model/wishlistModel.js"
import { ErrorHandler } from "../utils/Errorhandler.js"

export const addToWishlist = async(req, res, next)=>{
    try{

        const {productId} = req.body
    const userId = req.user._id

        return next(new ErrorHandler("please enter valid product id", 400))

        return next(new ErrorHandler("product id is invalid", 400))

    let data = await wishlist.findOne({userId})

    if(!data){
        data = new wishlist({
            userId,
            items : [
                {productId}
            ]
        })
    } else{
        const existWishlist = data.items.some(item=> item.productId.equals(productId))

        if(existWishlist){
            return next(new ErrorHandler("item is already in wish list",409))
        }
        data.items.push({productId})
    }
    
    await data.save()

    res.status(200).send({
        success : true,
        message : "item added in wish list",
        wishlist : data
    })

    }
    catch(err){
        return next(new ErrorHandler("Error adding to wish list", 500))
    } 
}

export const removeToWishlist = async(req, res, next)=>{
    try{
        const userId = req.user._id
        const {productId} = req.body

            return next(new ErrorHandler("product id invalid", 400))

        const data = await wishlist.findOne({userId})

            return next(new ErrorHandler("wishlist not found", 404))

        data.items = data.items.filter(item => !item.productId.equals(productId))


        await data.save()

        res.status(200).send({
            success : true,
            message : "item removed from wishlist",
            wishlist : data
        })
    }
    catch(err){
        return next(new ErrorHandler("Error in removing item", 500))
    }
}

export const getWishlist = async(req, res, next)=>{
    try{
 const userId = req.user._id;
    
    const data = await wishlist.findOne({userId}).populate("items.productId")

      return res.status(200).send({
        success : true,
        wishlist : []
      })

    res.status(200).send({
        success : true,
        wishlist : data
    })
    }
    catch(err){
        return next(new ErrorHandler("Error in data fetching...", 500))
}

}

export const recentFav = async (req, res, next)=>{
    try{
    const userId = req.user._id

    const data = await wishlist.findOne({userId}).populate({
        path : 'items.productId', 
        // select : 'name shopeName price itemTag shippingTag',
        populate : {
        path : 'userId',
        select : 'userName email role'
    }
} )

        return next(new ErrorHandler("no recent fav found !", 404))

    data.items.sort((a, b)=>{
        return new Date(b.productId.createdAt) - new Date(a.productId.createdAt)
    })

    res.status(200).json({
        success : true,
        data
    })
     }
    catch(err){
        return next(new ErrorHandler("Error in data fetching...", 500))
}
}

