import mongoose from "mongoose"
import { qna } from "../model/qnaModel.js"
import { ErrorHandler } from "../utils/Errorhandler.js"

export const createQNA = async (req, res, next) => {
    try {
        const { question, answer } = req.body

        if (!question || !answer) {
            return next(new ErrorHandler("Question and Answer are required!", 400));
        }

        const data = await qna.create({
            question,
            answer
        })

        await data.save()

        res.status(200).json({
            success: true,
            message: "qna created !",
            data
        })
    } catch (err) {
        return next(new ErrorHandler(err.message, 500))
    }
}

export const getQNA = async (req, res, next) => {
    try {
        const data = await qna.find()
        res.status(200).json({
            success: true,
            data
        })
    } catch (err) {
        return next(new ErrorHandler(err.message, 500))
    }
}


export const getOneQNA = async (req, res, next) => {
    try {

        const qnaId = req.params.id
        if (!mongoose.Types.ObjectId.isValid(qnaId)) {
            return next(new ErrorHandler("Invalid QNA ID!", 400));
        }
        const data = await qna.findOne({ _id: qnaId })

        if (!data) {
            return next(new ErrorHandler("QNA not found!", 404));
        }
        res.status(200).json({
            success: true,
            data
        })
    } catch (err) {
        return next(new ErrorHandler(err.message, 500))
    }
}


export const updateQNA = async (req, res, next) => {
    try {

        const qnaId = req.params.id
        const { question, answer } = req.body
        if (!mongoose.Types.ObjectId.isValid(qnaId)) {
            return next(new ErrorHandler("Invalid QNA ID!", 400));
        }
        if (!question && !answer) {
            return next(new ErrorHandler("At least one field is required!", 400));
        }
        const data = await qna.findOne({ _id: qnaId })

        if (!data) {
            return next(new ErrorHandler("QNA not found!", 404));
        }
        if (question) data.question = question
        if (answer) data.answer = answer

        await data.save()

        res.status(200).json({
            success: true,
            data
        })
    } catch (err) {
        return next(new ErrorHandler(err.message, 500))
    }
}



export const deleteQNA = async (req, res, next) => {
    try {


        const qnaId = req.params.id

        if (!mongoose.Types.ObjectId.isValid(qnaId)) {
            return next(new ErrorHandler("Invalid QNA ID!", 400));
        }
        const data = await qna.findOne({ _id: qnaId })

        if (!data) {
            return next(new ErrorHandler("QNA already deleted or not found!", 404));
        }
        await data.deleteOne()
        res.status(200).json({
            success: true,
            message: "qna deleted succesfully !"
        })
    } catch (err) {
        return next(new ErrorHandler(err.message, 500))
    }
}





