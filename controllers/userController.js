const bcrypt = require("bcrypt");
const { executeQuery } = require("../utils/executeQuery");
const checkPassword = require("../utils/checkPassword");
const generateToken = require("../utils/generateToken");
const path = require('path');
const saltRounds = 10;



// Get all positions
exports.getAllPosition = async (req, res) => {
  try {
    const query = "SELECT * FROM position";
    const results = await executeQuery(query);

    if (results.length === 0) {
      return res.status(404).json({ message: "No positions found" });
    }

    res.status(200).json(results);
  } catch (err) {
    console.error("Error retrieving positions:", err);
    res.status(500).json({ message: "Error retrieving positions" });
  }
};

// Get all departments
exports.getAllDepartment = async (req, res) => {
  try {
    const query = "SELECT * FROM department";
    const results = await executeQuery(query);

    if (results.length === 0) {
      return res.status(404).json({ message: "No departments found" });
    }

    res.status(200).json(results);
  } catch (err) {
    console.error("Error retrieving departments:", err);
    res.status(500).json({ message: "Error retrieving departments" });
  }
};

// Get all job types
exports.getAllJobtype = async (req, res) => {
  try {
    const query = "SELECT * FROM jobtype";
    const results = await executeQuery(query);

    if (results.length === 0) {
      return res.status(404).json({ message: "No job types found" });
    }

    res.status(200).json(results);
  } catch (err) {
    console.error("Error retrieving job types:", err);
    res.status(500).json({ message: "Error retrieving job types" });
  }
};

// Add new user
exports.postNewUser = async (req, res) => {
  try {
    const {
      UserName,
      FName,
      LName,
      Email,
      Password,
      position,
      department,
      DateOfBirth,
      Gender,
      Country,
      JobType,
    } = req.body;

    // Verify required fields
    if (
      !UserName ||
      !FName ||
      !LName ||
      !Email ||
      !Password ||
      !position ||
      !department ||
      !DateOfBirth ||
      !Gender ||
      !Country ||
      !JobType
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const hashedPassword = await bcrypt.hash(Password, saltRounds);

    const query = `
        INSERT INTO users (
          UserName, FName, LName, Email, Password, position_id, department_id, Date, Gender, Country, JobType_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

    await executeQuery(query, [
      UserName,
      FName,
      LName,
      Email,
      hashedPassword,
      position,
      department,
      DateOfBirth,
      Gender,
      Country,
      JobType,
    ]);

    res.status(201).json({ message: "User added successfully" });
  } catch (err) {
    console.error("Error adding user:", err);
    res.status(500).json({ message: "Unexpected error occurred" });
  }
};

// Get New Token
exports.getToken = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email or password is missing" });
    }

    const query = "SELECT id, password ,Role FROM users WHERE email = ?";
    const results = await executeQuery(query, [email]);
    console.log(results)

    if (results.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await checkPassword(password, results[0].password);

    if (isMatch) {
      const userId = results[0].id;
      const token = await generateToken({ id: userId, email: email });

      // حذف التوكن القديم
      const deleteOldTokenQuery = "DELETE FROM tokens WHERE user_id = ?";
      await executeQuery(deleteOldTokenQuery, [userId]);

      // إدراج التوكن الجديد
      const insertTokenQuery = `
          INSERT INTO tokens (token, user_id, expires_at)
          VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 1 HOUR));
        `;
      await executeQuery(insertTokenQuery, [token, userId]);

      return res.status(200).json({ token: token , id:results[0].id , Role:results[0].Role });
    } else {
      return res.status(401).json({ message: "Invalid password" });
    }
  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Get user by ID
exports.getUserByID = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const query = `
      SELECT 
        users.id, 
        users.FName, 
        users.LName, 
        users.Email, 
        users.Gender, 
        users.photo, 
        position.position_name, 
        department.department_name, 
        jobtype.JobType_name,
        users.CreatedAt, 
        users.Role,
        users.Date,
        users.Country
      FROM users
      INNER JOIN position ON users.position_id = position.id
      INNER JOIN department ON users.department_id = department.id
      INNER JOIN jobtype ON users.jobtype_id = jobtype.id
      WHERE users.id = ?;
    `;

    const results = await executeQuery(query, [id]);

    if (results.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = results[0];
    // If photo path is relative, convert it to a full URL
    user.photo = user.photo ? `${req.protocol}://${req.get('host')}/uploads/${path.basename(user.photo)}` : null;

    res.status(200).json(user); // Return user data including the full URL to the photo
  } catch (err) {
    console.error("Error retrieving user by ID:", err);
    res.status(500).json({ message: "Error retrieving user by ID" });
  }
};
// Get user by ID
exports.getAllUsers = async (req, res) => {
  try {
    const userRole = req.userRole;

    if (userRole !== "admin") {
      return res.status(403).json({ message: "Unauthorized user" });
    }

    const query = `
      SELECT 
        users.id, 
        users.FName, 
        users.LName, 
        users.Email, 
        users.Gender, 
        users.photo, 
        position.position_name, 
        department.department_name, 
        jobtype.JobType_name,
        users.CreatedAt, 
        users.Role
      FROM users
      INNER JOIN position ON users.position_id = position.id
      INNER JOIN department ON users.department_id = department.id
      INNER JOIN jobtype ON users.jobtype_id = jobtype.id;
    `;

    const results = await executeQuery(query);

    if (results.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    // Convert each user's photo path to a full URL if it's available
    const users = results.map(user => ({
      ...user,
      photo: user.photo ? `${req.protocol}://${req.get('host')}/uploads/${path.basename(user.photo)}` : null
    }));

    res.status(200).json(users);
  } catch (err) {
    console.error("Error retrieving all users:", err);
    res.status(500).json({ message: "Error retrieving all users" });
  }
};


// Update user by ID
exports.updateUserByID = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      UserName,
      FName,
      LName,
      Email,
      position,
      department,
      Country,
      JobType
    } = req.body;

    // Verify if at least one field is provided
    if (
      !UserName &&
      !FName &&
      !LName &&
      !Email &&
      !position &&
      !department &&
      !Country &&
      !JobType &&
      !req.file
    ) {
      return res.status(400).json({ message: "No fields to update" });
    }

    const setClause = [];
    const params = [];

    if (UserName) {
      setClause.push("UserName = ?");
      params.push(UserName);
    }
    if (FName) {
      setClause.push("FName = ?");
      params.push(FName);
    }
    if (LName) {
      setClause.push("LName = ?");
      params.push(LName);
    }
    if (position) {
      setClause.push("position_id = ?");
      params.push(position);
    }
    if (department) {
      setClause.push("department_id = ?");
      params.push(department);
    }
    if (Country) {
      setClause.push("Country = ?");
      params.push(Country);
    }
    if (JobType) {
      setClause.push("JobType_id = ?");
      params.push(JobType);
    }
    if (req.file) {
      const photoPath = req.file.path; // الحصول على مسار الصورة
      setClause.push("photo = ?"); // إضافة تحديث المسار إلى الاستعلام
      params.push(photoPath); // إضافة المسار إلى قائمة المعلمات
    }

    // Check if there are fields to update
    if (setClause.length === 0) {
      return res.status(400).json({ message: "No fields to update" });
    }

    const query = `
      UPDATE users
      SET ${setClause.join(", ")}
      WHERE id = ?
    `;

    params.push(id); // Add user ID to the parameters
    await executeQuery(query, params);

    res.status(200).json({ message: "User updated successfully" });
  } catch (err) {
    console.error("Error updating user:", err);
    res.status(500).json({ message: "Unexpected error occurred" });
  }
};



// Delete user by ID
exports.deleteUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const queries = [
      { query: "DELETE FROM tasks WHERE userId = ?;", params: [id] },
      { query: "DELETE FROM tokens WHERE user_id = ?;", params: [id] },
      { query: "DELETE FROM users WHERE id = ?;", params: [id] }
    ];

    await Promise.all(queries.map(({ query, params }) => executeQuery(query, params)));

    return res.status(200).json({ message: "User and associated data deleted successfully." });

  } catch (error) {

    console.error("Error in deleteUserById:", error);
    return res.status(500).json({ message: "An internal server error occurred. Please try again later." });
  }
};

