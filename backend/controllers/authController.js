import { catchError } from "../utils/errorHandler.js";
import { query } from "../db/connection.js";
import bcrypt from "bcrypt";
import { generateVerificationToken } from "../utils/generateToken.js";
import { generateJWTToken } from "../utils/generateToken.js";

/**
 * Signup controller function
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @returns {Promise<void>}
 */
export async function signup(req, res) {
  const { name, email, password } = req.body;

  // Validate input
  if (!name || !email || !password)
    return res.status(400).json({ message: "All fields are required" });

  if (password.length < 6)
    return res
      .status(400)
      .json({ message: "Password must be at least 6 characters long" });

  // Verify if user already exists
  const [errorEmail, resultEmail] = await catchError(
    query("SELECT * FROM users WHERE email = $1", [email])
  );
  if (errorEmail) {
    console.error("Error checking for existing user:", errorEmail);
    return res.status(500).json({ message: "Database error" });
  }
  if (resultEmail.rows.length > 0)
    return res.status(400).json({ message: "User already exists" });

  // If nothing went wrong, insert the new user
  // Hash the password
  const [errorHash, hashedPassword] = await catchError(
    bcrypt.hash(password, 10)
  );
  if (errorHash || !hashedPassword) {
    console.error("Error hashing password:", errorHash);
    return res.status(500).json({ message: "Error hashing password" });
  }

  // Create a verification token
  const verificationToken = generateVerificationToken();

  // Create an expiration date for the verification token (24 hours from now)
  const verificationTokenExpiresAt = new Date(
    Date.now() + 24 * 60 * 60 * 1000
  ).toISOString();

  // Insert the new user into the database
  const [errorInsert, result] = await catchError(
    query(
      "INSERT INTO users (name, email, pw, verification_token, verification_token_expires_at) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [
        name,
        email,
        hashedPassword,
        verificationToken,
        verificationTokenExpiresAt,
      ]
    )
  );
  if (errorInsert) {
    console.error("Errror inserting user:", errorInsert);
    return res.status(500).json({ message: "Database error" });
  }

  // Generate a JWT token
  const user = result.rows[0];
  const jwtToken = generateJWTToken(user, process.env.SECRET_KEY, "7d");

  res.cookie("token", jwtToken, {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  res.status(201).json({ message: "User created successfully" });
}

/**
 * Signup controller function
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @returns {Promise<void>}
 */
export async function login(req, res) {
  res.send("Hello from the login route");
}

/**
 * Signup controller function
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @returns {Promise<void>}
 */
export async function logout(req, res) {
  res.send("Hello from the logout route");
}
