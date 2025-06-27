import { catchError } from "../utils/errorHandler.js";
import { query } from "../db/connection.js";
import bcrypt from "bcrypt";
import { generateVerificationToken } from "../utils/generateToken.js";
import { generateJWTToken } from "../utils/generateToken.js";
import { sendVerificationEmail, sendWelcomeEmail } from "../services/email.js";

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

  // Send a verification email
  await sendVerificationEmail(user.email, verificationToken);

  res.status(201).json({ message: "User created successfully" });
}

/**
 * Function to verify the user's email
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @return {Promise<void>}
 */
export async function verifyEmail(req, res) {
  const { verificationToken } = req.body;

  if (!verificationToken)
    return res.status(400).json({ message: "Token is required" });

  // Check if the token is valid in database
  const [error, result] = await catchError(
    query("SELECT * FROM users WHERE verification_token = $1", [
      verificationToken,
    ])
  );
  if (error) {
    console.error("Error checking verification token:", error);
    return res.status(500).json({ message: "Database error" });
  }

  const user = result.rows[0];

  if (
    result.rows.length === 0 ||
    new Date(user.verification_token_expires_at) < new Date()
  ) {
    return res.status(400).json({ message: "Invalid or expired token" });
  }

  // Update the user's verification status
  const [errorUpdate, resultUpdate] = await catchError(
    query(
      "UPDATE users SET is_verified = TRUE, verification_token = NULL, verification_token_expires_at = NULL WHERE id = $1",
      [user.id]
    )
  );
  if (errorUpdate) {
    console.error("Error updating user verification status:", errorUpdate);
    return res.status(500).json({ message: "Database error" });
  }

  // Send a welcome email
  await sendWelcomeEmail(user.email, user.name);

  res.status(200).json({ message: "Email verified successfully" });
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
