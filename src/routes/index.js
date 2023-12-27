import express from 'express'
import userRoute from "./user.js"
import adminRoute from "./admin.js"
import engineerRoute from "./engineer.js"

const router = express.Router()

router.use('/user',userRoute)
router.use('/engineer',engineerRoute)
router.use('/admin',adminRoute)

export default router
