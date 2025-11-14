import express from 'express'
import { productRouter } from './routes/productRoute.js'
import { connectDB } from './database/db.js'
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from './swagger-output.json' with { type: "json" };
import cors from 'cors'
import { userRouter } from './routes/userRoute.js';
import cookieParser from 'cookie-parser';
import { cartRouter } from './routes/cartRoute.js';
import { catogoryRouter } from './routes/categoryRoute.js';
import { wishistRouter } from './routes/wishlistRoute.js';
import { orderRouter } from './routes/orderRoute.js';
import ejs from 'ejs'
import { adminRouter } from './routes/adminRoute.js';
import { errorMiddleware } from './middleware/errorMiddleware.js';
import { notificationRouter } from './routes/notificationRoute.js';
import { whatsappRouter } from './routes/whatsappRoute.js';
import { emailRouter } from './routes/emailRoute.js';
import { employeeRouter } from './routes/employeeRoute.js';
import { departmentRouter } from './routes/departmentRoute.js';
import { couponRouter } from './routes/couponRoute.js';
import { invoiceRouter } from './routes/invoiceRoute.js';
// import { datemodify, linkCreate, getreward } from './testing.js';
import { transactionRouter } from './routes/transactionRoute.js';
import { referearnRouter } from './routes/refer&earnRoute.js';
import { eventRouter } from './routes/evnetRoute.js';
import multer from "multer";
import { rewardRouter } from './routes/rewardRoutes.js';
import { scratchRouter } from './routes/scratchRoute.js';
import { shopRouter } from './routes/shopRoute.js';
import { qnaRouter } from './routes/qnaRoute.js';
import { reviewRouter } from './routes/reviewRoute.js';
import { chatbotRouter } from './routes/chatbotRoute.js';
import { razorpayRouter } from './routes/razorpayRoute.js';
import { returnRouter } from './routes/returnRoute.js';
import { warehouseRouter } from './routes/warehouseRoute.js';
import { rackRouter } from './routes/rackRoute.js';
import permissionRouter from './routes/permissionRoute.js';
import { seedPermissions } from './utils/seedPermissions.js';







const app = express()

connectDB()

app.use(express.json())
app.use(express.urlencoded({extended: true}));
app.use(cookieParser())

app.use('/uploads', express.static('uploads'))

app.set('view engine', 'ejs')

app.use(cors({
  origin: [
    'https://testapix.netlify.app',
    "http://localhost:3001",
    "http://localhost:5173",
    "http://localhost:8081",
    "http://localhost:8080",
    process.env.FRONTEND_URL,
    process.env.FRONTEND_URL2,
  ],
  
  credentials : true
}));





app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get("/", (req,res)=>{
    res.render("index")
})

app.use("/api/v1/product", productRouter)
// #swagger.tags = ['Auth']
app.use("/api/v1/auth", userRouter)
app.use("/api/v1/cart", cartRouter)
app.use("/api/v1/category", catogoryRouter)
app.use("/api/v1/wishlist", wishistRouter)
app.use("/api/v1/order", orderRouter)
app.use("/api/v1/admin", adminRouter)
app.use("/api/v1/notification", notificationRouter)
app.use("/api/v1/whatsapp", whatsappRouter)
app.use("/api/v1/email", emailRouter)
app.use("/api/v1/employee", employeeRouter)
app.use("/api/v1/department", departmentRouter)
app.use("/api/v1/coupon", couponRouter)
app.use("/api/v1/invoice", invoiceRouter)
app.use("/api/v1/transaction", transactionRouter)
app.use("/api/v1/referearn", referearnRouter)
app.use("/api/v1/event", eventRouter)
app.use("/api/v1/reward", rewardRouter)
app.use("/api/v1/scratch", scratchRouter)
app.use("/api/v1/shop", shopRouter)
app.use("/api/v1/qna", qnaRouter)
app.use("/api/v1/review", reviewRouter)
app.use("/api/v1/chatbot", chatbotRouter)
app.use("/api/v1/razorpay",razorpayRouter);
app.use("/api/v1/returnRefund",returnRouter);
app.use("/api/v1/warehouse",warehouseRouter);
app.use("/api/v1/rack",rackRouter);
app.use("/api/v1/permissions", permissionRouter);
app.use(errorMiddleware)

// Seed permissions on startup
seedPermissions();


// datemodify()

// linkCreate()

// getreward()  
   
app.listen(process.env.PORT, ()=>{
    console.log(`it's running... on port ${process.env.PORT}`)
})