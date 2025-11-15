import { GoogleGenerativeAI } from '@google/generative-ai';
import { ErrorHandler } from '../utils/Errorhandler.js';
import { chatAI } from '../model/chatbotModel.js';




const getAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

export const askGemini = async (req, res, next) => {
    try {
        const { question } = req.body

        const userId = req.user._id;

        return next(new ErrorHandler("please provide a question", 400))

        const model = getAI.getGenerativeModel({ model: "gemini-1.5-flash" })

        let convertsation = await chatAI.findOne({ userId: userId, status: "active" })

        const title = question.substring(0, 30)
        convertsation = new chatAI({
            userId: userId,
            history: [],
            title: title
        })

        const history = convertsation.history.map(item => ({
            role: item.role,
            parts: Array.isArray(item.parts) ? item.parts
                .filter(part => typeof part.text === 'string')
                .map(part => ({ text: part.text })) :
                []
        }))

        const chat = model.startChat({
            history,
        })
        // const result = await chat.sendMessage(question)
        const result = await chat.sendMessageStream(question)

        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        let fullresponse = '';
        for await (const chunks of result.stream) {
            const chunkText = chunks.text()
            fullresponse += chunkText
            res.write(`data:${JSON.stringify({ text: chunkText })}

`)
        }

        convertsation.history.push({
            role: 'user',
            parts: [{ text: question }]
        })

        convertsation.history.push({
            role: 'model',
            parts: [{ text: fullresponse }]
        })

        await convertsation.save()
        res.end();


    } catch (err) {
        console.error(err)
        return next(new ErrorHandler(err.message, 500))
    }
}


export const closechat = async (req, res, next) => {
    try {

        const userId = req.user._id
        let convertsation = await chatAI.findOne({ userId: userId, status: 'active' })
        return next(new ErrorHandler("no active conversation found", 404))

        convertsation.status = "closed"

        await convertsation.save()

        res.status(200).json({
            success: true,
            message: "chat is closed !"
        })

    } catch (err) {
        console.error(err)
        return next(new ErrorHandler(err.message, 500))
    }
}



export const gethistory = async (req, res, next) => {
    try {

        const userId = req.user._id

        let convertsation = await chatAI.find({ userId: userId })
        res.status(200).json({
            success: true,
            total_conversation: convertsation.length,
            convertsation
        })

    } catch (err) {
        console.error(err)
        return next(new ErrorHandler(err.message, 500))
    }
}



export const gethistorybyId = async (req, res, next) => {
    try {

        const userId = req.params.id

        let convertsation = await chatAI.find({ userId: userId })

        res.status(200).json({
            success: true,
            total_conversation: convertsation.length,
            convertsation
        })

    } catch (err) {
        console.error(err)
        return next(new ErrorHandler(err.message, 500))
    }
}


export const ask2Gemini = async (req, res, next) => {
    try {
        const { question } = req.body

        const userId = req.user._id;

        if (!question) return next(new ErrorHandler("please provide a question", 400))

        const model = getAI.getGenerativeModel({ model: "gemini-1.5-flash" })

        let convertsation = await chatAI.findOne({ userId: userId, status: "active" })

        const title = question.substring(0, 30)
        convertsation = new chatAI({
            userId: userId,
            history: [],
            title: title
        })

        const history = convertsation.history.map(item => ({
            role: item.role,
            parts: Array.isArray(item.parts) ? item.parts
                .filter(part => typeof part.text === 'string')
                .map(part => ({ text: part.text })) :
                []
        }))

        const chat = model.startChat({
            history,
        })

        const result = await chat.sendMessage(question)
        const fullresponse = result.response.text();

        convertsation.history.push({
            role: 'user',
            parts: [{ text: question }]
        })

        convertsation.history.push({
            role: 'model',
            parts: [{ text: fullresponse }]
        })

        await convertsation.save()

        res.status(200).json({
            success: true,
            response: fullresponse
        });


    } catch (err) {
        console.error(err)
        return next(new ErrorHandler(err.message, 500))
    }
}
