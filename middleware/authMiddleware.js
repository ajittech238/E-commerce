import jwt from 'jsonwebtoken'
import { user } from '../model/userModel.js';
import { shop } from '../model/shopModel.js';
import { ErrorHandler } from '../utils/Errorhandler.js';
import { config } from 'dotenv';
config()


export const  isAuthenticated = async(req, res, next)=>{
    try{
        let token;
    if(req.cookies && req.cookies.token){
        token = req.cookies.token
    }
    else if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        token = req.headers.authorization.split(' ')[1];
    }
    
    if(!token){
        return next(new Error("user is not authenticated."))
    }

    if (!process.env.JWT_SECRET) {
        return next(new Error("JWT_SECRET is not defined in the environment variables."));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const data = await user.findById(decoded.id)
    if(!data){
        return next(new Error("user not found !"))
    }

    req.user = data;
    next()

    }
    catch(err){
        console.error(err)
        return next(new Error("internal server error"))
    }
   
}

export const  isAuthorized = (...role)=>{
    return(req, res , next)=>{
        if(!role.includes(req.user.role)){
            return next(new Error(`user with this role ${req.user.role} not allowed to access this resource `))
        }
        next()
    }
}

export const isShopVerified = async(req, res, next)=>{
    try {
        const userId = req.user._id

        const data = await shop.findOne({owner : userId})

        if(!data){
            return next(new ErrorHandler("shop is not registed !", 400))
        }

        if(!data.isShopVerified){
            return next(new ErrorHandler("verify the shop", 200))
        }

        next()

    } catch (err) {
        return next(new ErrorHandler(err.message, 500))
    }
}