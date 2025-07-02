const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Check if token is present
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Access denied. No token provided." });
    }

    const token = authHeader.split(" ")[1]; // Get the token after 'Bearer'

    // Verify the token
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        console.error("JWT verification error:", err);
        return res.status(403).json({ message: "Invalid token" });
      }

      req.user = decoded; // decoded contains id, role, etc.
      next();
    });

  } catch (error) {
    console.error("Auth Middleware error:", error);
    res.status(500).json({ message: "Server error in auth middleware" });
  }
};

module.exports = authMiddleware;
