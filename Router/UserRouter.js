const express = require("express");
const Router = express.Router();
const upload = require('../config/uploadFile')

const authUserMiddleware = require("../middleware/checkAuthUserMiddleware")
const userController = require("../controllers/userController");


Router.get("/api/position", userController.getAllPosition);
Router.get("/api/department", userController.getAllDepartment);
Router.get("/api/jobtype", userController.getAllJobtype);
Router.post("/api/register", userController.postNewUser);
Router.post("/api/login", userController.getToken);

Router.get("/api/users",authUserMiddleware, userController.getAllUsers)
Router.get("/api/users/:id", authUserMiddleware, userController.getUserByID);
Router.put("/api/users/:id",authUserMiddleware, upload.single("photo"), userController.updateUserByID);
Router.delete("/api/users/:id",authUserMiddleware, userController.deleteUserById)

module.exports = Router;
