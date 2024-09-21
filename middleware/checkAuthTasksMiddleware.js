// authMiddleware.js
const checkAuthByToken = require("../utils/CheckAuthByToken");
const checkUserRole = require("../utils/checkUserRole");

const authTaskMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization;
    const userId = req.body?.Id || parseInt(req.query?.userId);
    
    if(isNaN(userId)){
      return res.status(400).json({ message: "Invalid user ID" });
    }
    if (!token) {
      return res.status(401).json({ error: "Token not provided" });
    }

    const isAllowed = await checkAuthByToken(token, userId);
    if (!isAllowed) {
      return res.status(403).json({ message: "Unauthorized user" });
    }

    const userRole = await checkUserRole(userId);
    req.userRole = userRole;
    next();
  } catch (err) {
    console.error("Error in authMiddleware:", err);
    return res.status(500).json({ message: "An internal server error occurred" });
  }
};

module.exports = authTaskMiddleware;
