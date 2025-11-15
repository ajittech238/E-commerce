import { Router } from "express";
import { createReward, deleteReward, editReward, getRewardList, randomreward } from "../controller/rewardController.js";
import { isAuthenticated } from "../middleware/authMiddleware.js";
import { checkPermission } from "../middleware/permissionMiddleware.js";
import { handleValidationErrors, checkEmptyBody } from "../middleware/validationMiddleware.js";

const router = Router()

router.get("/", (req, res, next)=>{
    res.send("working !")
})
router.get("/random", randomreward)
router.get("/rewardlist", isAuthenticated, checkPermission('rewards', 'list'), getRewardList)
router.post("/create", isAuthenticated, checkPermission('rewards', 'create'), checkEmptyBody, handleValidationErrors, createReward)
router.patch("/edit/:id", isAuthenticated, checkPermission('rewards', 'update'), checkEmptyBody, handleValidationErrors, editReward)
router.delete("/delete/:id", isAuthenticated, checkPermission('rewards', 'delete'), deleteReward)

export {router as rewardRouter}