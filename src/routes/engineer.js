import express from "express";
import EngineerController from "../controller/engineer.js";
import Auth from "../common/auth.js";

const router = express.Router();

router.get("/assignedusers", Auth.validate, EngineerController.AssignedUsers);
router.post("/updatestatus/:id", Auth.validate, EngineerController.updateStatus);
router.get("/reports",Auth.validate,EngineerController.getReports)
router.get("/servicereports",Auth.validate,EngineerController.serviceReports)
router.get("/userslist", Auth.validate, EngineerController.userslist);
router.get("/verify", Auth.validate, EngineerController.verifyEngineer);

router.put("/editengineer/:id", EngineerController.EditEngineer);
router.get("/getuser/:id", EngineerController.getuser);
router.get("/getservice/:id", EngineerController.servicedetails);
router.put("/editService/:id", EngineerController.EditService);

router.get( "/getengineers", Auth.validate, Auth.adminGuard, EngineerController.getEngineers);
router.get("/getengineer/:id", EngineerController.getengineer);
router.post("/create", EngineerController.createEngineer);
router.post("/login", EngineerController.login);
router.post("/forget-password", EngineerController.forgotPassword);
router.post("/resetpassword", Auth.validate, EngineerController.resetPassword);

export default router;
