const checkAuthByToken = require("../utils/CheckAuthByToken");
const checkUserRole = require("../utils/checkUserRole");

const authUserMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization;
    const { id } = req.params; // Extract id from params
    const { userId } = req.query; // Extract userId from body

    const userIdentifier = id ? parseInt(id) : parseInt(userId); // Use either id from params or userId from body

    // Check if a valid user identifier exists
    if (isNaN(userIdentifier)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    // Check if token is provided
    if (!token) {
      return res.status(401).json({ error: "Token not provided" });
    }

    // Verify if the user is allowed by checking the token
    const isAllowed = await checkAuthByToken(token, userIdentifier);
    if (!isAllowed) {
      return res.status(403).json({ message: "Unauthorized user" });
    }

    // Retrieve and assign the user's role
    const userRole = await checkUserRole(userIdentifier);
    req.userRole = userRole; // Attach user role to the request object for further use in other middlewares or controllers

    next(); // Move to the next middleware or route handler
  } catch (err) {
    console.error("Error in authMiddleware:", err);
    return res.status(500).json({ message: "An internal server error occurred" });
  }
};

module.exports = authUserMiddleware;
