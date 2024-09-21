const { executeQuery } = require("../utils/executeQuery");

//Add New Task
exports.postNewTask = async (req, res) => {
  try {
    const { title, description, deadline, userId } = req.body;

    if (!title || !description || !deadline || !userId) {
      return res
        .status(401)
        .json({ error: "Some required fields are missing" });
    }

    const query =
      "INSERT INTO tasks (title, description, deadline, userId) VALUES (?, ?, ?, ?)";
    await executeQuery(query, [title, description, deadline, userId]);

    return res.status(201).json({ message: "Task added successfully" });
  } catch (err) {
    console.error("Error adding task:", err);
    return res.status(500).json({ message: "Unexpected error occurred" });
  }
};

//Put Task 
exports.updateTaskByID = async (req, res) => {
  try {
    const id = req.params.id;
    const { Id, title, description, completed, workTime, status, start, end, deadline } = req.body;
    
    if (isNaN(Id) || isNaN(id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    if (!id || !Id) {
      return res.status(400).json({ message: "No input to update" });
    }

    const setClause = [];
    const params = [];

    const userRole = req.userRole;

    if (userRole === "admin") {
      if (typeof title === 'string' && title.trim() !== '') {
        setClause.push("title = ?");
        params.push(title);
      }
      if (typeof description === 'string' && description.trim() !== '') {
        setClause.push("description = ?");
        params.push(description);
      }
      if (deadline) {
        setClause.push("deadline = ?");
        params.push(deadline);
      }
    }

    // Fields that any user can update
    if (completed === 0 || 1) {
      setClause.push("completed = ?");
      params.push(completed);
    }
    if ( status === 1 || 0) {
      setClause.push("status = ?");
      params.push(status);
    }
    if (workTime) {
      setClause.push("workTime = ?");
      params.push(workTime);
    }
    if (start) {
      setClause.push("start = ?");
      params.push(start);
    }
    if (end) {
      setClause.push("end = ?");
      params.push(end);
    }

    if (setClause.length === 0) {
      return res.status(400).json({ message: "No valid fields to update" });
    }

    let query = "";

    if (userRole === "admin") {
      params.push(id)
      query = `UPDATE tasks SET ${setClause.join(", ")} WHERE id = ?`;
    } else {
      params.push(id, Id)
      query = `UPDATE tasks SET ${setClause.join(", ")} WHERE id = ? AND userId = ?`;
    }
    
    console.log(params)


    const results = await executeQuery(query, params);
    if (!results.affectedRows) {
      return res.status(400).json({ message: "Not Found the Task" });
    }
    if (!results.changedRows) {
      return res.status(400).json({ message: "No valid fields to update" });
    }

    res.status(200).json({ message: "Task updated successfully" });

  } catch (error) {
    console.error("Error in updateTaskByID:", error);
    return res.status(500).json({ message: "An internal server error occurred. Please try again later." });
  }
};

// Delete Task By ID 
exports.deleteTaskByID = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.query;

    if (!id || !userId) {
      return res.status(400).json({ message: "Task ID is required" });
    }

    const userRole = req.userRole; // Get userRole from request object
    let query = "";
    const params = [id];

    if (userRole === "admin") {
      query = "DELETE FROM tasks WHERE id = ?";
    } else {
      query = "DELETE FROM tasks WHERE id = ? AND userId = ?";
      params.push(userId);
    }

    const result = await executeQuery(query, params);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Error in deleteTaskByID:", error);
    return res.status(500).json({ message: "An internal server error occurred. Please try again later." });
  }
};

// Get Task By Id
exports.getTaskByID = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.query;

    if (!id || !userId) {
      return res.status(400).json({ message: "Task ID and User ID are required" });
    }

    const userRole = req.userRole; // Get userRole from request object

    let query = "";
    const params = [id];

    if (userRole === "admin") {
      query = "SELECT * FROM tasks WHERE id = ?";
    } else {
      query = "SELECT * FROM tasks WHERE id = ? AND userId = ?";
      params.push(userId);
    }

    const task = await executeQuery(query, params);

    if (task.length === 0) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.status(200).json({ task: task[0] });
  } catch (error) {
    console.error("Error in getTaskByID:", error);
    return res.status(500).json({ message: "An internal server error occurred. Please try again later." });
  }
};

//Get All Tasks
exports.getAllTasks = async (req, res) => {
  try {
    const userId = req.body?.userId || req.query?.userId;


    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const userRole = req.userRole; // Get userRole from request object

    let query = "";
    const params = [];

    if (userRole === "admin") {
      query = "SELECT * FROM tasks";
    } else {
      query = "SELECT * FROM tasks WHERE userId = ?";
      params.push(userId);
    }

    const tasks = await executeQuery(query, params);

    res.status(200).json({ tasks });
  } catch (error) {
    console.error("Error in getAllTasks:", error);
    return res.status(500).json({ message: "An internal server error occurred. Please try again later." });
  }
};
