const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  // Get token from header, body, or query
  let token = null;

  if (req.headers["authorization"]) {
    token = req.headers["authorization"];
  } else if (req.body.token) {
    token = req.body.token;
  } else if (req.query.token) {
    token = req.query.token;
  }

  if (!token) {
    return res.status(403).json({
      success: false,
      msg: "A token is required for authentication"
    });
  }

  try {
    // If token is from header, it's probably "Bearer <token>"
    if (token.startsWith("Bearer ")) {
      const parts = token.split(" ");
      if (parts.length !== 2) {
        return res.status(401).json({
          success: false,
          msg: "Invalid token format"
        });
      }
      token = parts[1];
    }

    const decodedData = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = decodedData.user;
    return next();
  } catch (error) {
    console.error("Token verification error:", error);
    return res.status(401).json({
      success: false,
      msg: "Invalid or expired token"
    });
  }
};

module.exports = verifyToken;
