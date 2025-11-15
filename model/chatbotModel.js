import mongoose from "mongoose";

const chatbot_AI_Schema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
    },
    history: [
        {
            role: {
                type: String,
                enum: ["user", "model"],
                required: true
            },
            parts: [
                {
                    text: {
                        type: String,
                        required: true
                    },
                },
            ],

        },
    ],

    status: {
        type: String,
        enum: ["active", "closed"],
        default: "active"
    },
    title: {
        type: String,
    }
}, { timestamps: true })


export const chatAI = mongoose.model("chatwithAI", chatbot_AI_Schema)