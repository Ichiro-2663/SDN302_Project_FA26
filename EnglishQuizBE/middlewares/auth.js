const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ 
      success: false, 
      message: "Access denied. Token is missing or malformed." 
    });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "default_jwt_secret_sdn302_fa26");
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ 
      success: false, 
      message: "Invalid or expired token." 
    });
  }
};

const requireRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.map(r => r.toUpperCase()).includes((req.user.role || "").toUpperCase())) {
      return res.status(403).json({ 
        success: false, 
        message: "Forbidden: You do not have permission to access this resource." 
      });
    }
    next();
  };
};

module.exports = { verifyToken, requireRoles };
