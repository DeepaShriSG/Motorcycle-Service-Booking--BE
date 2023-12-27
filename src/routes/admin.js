import express from "express";
import AdminController from "../controller/admin.js";
import Auth from "../common/auth.js";

const router = express.Router();

router.get("/getuser/:id", Auth.validate,AdminController.getuser);
router.get("/getservice/:id",Auth.validate,AdminController.service)
router.get("/activeengineers",Auth.validate,AdminController.ActiveEngineers)
router.post("/assign/:id",Auth.validate,AdminController.assignEngineer)
router.post("/update/:id",Auth.validate,AdminController.updateAction)
router.get("/completedusers",Auth.validate,AdminController.completedUsers)
router.get("/reports",AdminController.getReports)
router.get("/servicereports",AdminController.serviceReports)

router.post("/create", AdminController.createAdmin);
router.get("/verify",Auth.validate,AdminController.verifyAdmin)
router.get("/getadmin/:id",AdminController.getadmin)
router.put("/editadmin/:id",AdminController.EditAdmin)
router.post("/login", AdminController.login);

router.post('/forget-password',AdminController.forgotPassword)
router.post('/reset-password',Auth.validate,AdminController.resetPassword)

export default router;




