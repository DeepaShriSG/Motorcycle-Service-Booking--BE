import express from "express";
import UsersController from "../controller/user.js";
import Auth from "../common/auth.js";

const router = express.Router();

router.get("/allusers",Auth.validate,Auth.adminGuard,UsersController.AllUsers)
router.get("/activeusers",Auth.validate,Auth.adminGuard,UsersController.getActiveUsers)
router.post("/verify",Auth.validate,UsersController.verifyUser)

router.get("/getuser", Auth.validate,UsersController.getUserByid);
router.put("/edituser",Auth.validate,UsersController.EditUser)

router.post('/bookservice',Auth.validate,UsersController.BookService)
router.get("/getservice",Auth.validate,UsersController.servicedetails)
router.put("/editservice",UsersController.EditService)

router.post("/create", UsersController.createUsers);
router.post("/login", UsersController.login);
router.post('/forget-password',UsersController.forgotPassword)
router.post('/reset-password',Auth.validate,UsersController.resetPassword)

export default router;
