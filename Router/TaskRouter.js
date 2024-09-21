const express = require('express');
const Router = express.Router();
const authUserMiddleware = require("../middleware/checkAuthTasksMiddleware")
const taskController = require('../controllers/taskController');

Router.use(authUserMiddleware)
Router.post("/api/tasks",authUserMiddleware,taskController.postNewTask);
Router.put("/api/tasks/:id",authUserMiddleware,taskController.updateTaskByID);
Router.delete("/api/tasks/:id",authUserMiddleware,taskController.deleteTaskByID);
Router.get("/api/tasks/:id",authUserMiddleware,taskController.getTaskByID);
Router.get("/api/tasks",authUserMiddleware,taskController.getAllTasks);




module.exports = Router