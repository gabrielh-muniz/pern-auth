import jwt from "jsonwebtoken";

export function verifyToken(req, res, next) {
  const token = req.cookies.token;

  if (!token) return res.status(401).json({ message: "Token is required" });

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    if (!decoded) return res.status(401).json({ message: "Unauthorized" });

    // Attach the decoded user (id and email) to the request object
    req.user = decoded;

    next();
  } catch (error) {
    console.error("Token verification error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
