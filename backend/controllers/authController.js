import { catchError } from "../utils/errorHandler.js";
import { query } from "../db/connection.js";
import bcrypt from "bcrypt";
import {
  generateVerificationToken,
  generateJWTToken,
  generateJWTRefreshToken,
} from "../utils/generateToken.js";
import {
  sendPasswordResetEmail,
  sendVerificationEmail,
  sendWelcomeEmail,
} from "../services/email.js";
import crypto from "crypto";
import { config } from "dotenv";

config();

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

  // Generate a JWT token (This is wrong, it should be done in the login function)
  const user = result.rows[0];
  // const jwtToken = generateJWTToken(user, process.env.SECRET_KEY, "7d");

  // res.cookie("token", jwtToken, {
  //   httpOnly: true,
  //   maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  // });

  // Send a verification email
  await sendVerificationEmail(user.email, verificationToken);

  res.status(201).json({
    message: "User created successfully",
    user: { ...user, pw: undefined },
  });
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
 * Login controller function
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @returns {Promise<void>}
 */
export async function login(req, res) {
  // NOTE: Only login a person if the field is_verified is true
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: "All fields are required" });

  // Verify if user exists
  const [errorEmail, result] = await catchError(
    query("SELECT * FROM users WHERE email = $1", [email])
  );
  if (errorEmail) {
    console.error("Error checking for existing user:", errorEmail);
    return res.status(500).json({ message: "Database error" });
  }
  if (result.rows.length === 0)
    return res.status(400).json({ message: "User does not exist" });

  const user = result.rows[0];

  // Check the password
  const [errorPassword, isMatch] = await catchError(
    bcrypt.compare(password, user.pw)
  );
  if (errorPassword) {
    console.error("Error comparing passwords:", errorPassword);
    return res.status(500).json({ message: "Internal server error" });
  }
  if (!isMatch)
    return res.status(400).json({ message: "Invalid email or password" });

  // Check if the user is verified
  if (!user.is_verified)
    return res
      .status(403)
      .json({ message: "Email not verified! Please check your inbox" });

  // Generate a JWT access token
  const jwtToken = generateJWTToken(user, process.env.SECRET_KEY, "7d");

  // Generate a JWT refresh token
  const refreshToken = generateJWTRefreshToken(
    user,
    process.env.SECRET_REFRESH_KEY,
    "30d"
  );
  const expiresAt = new Date(
    Date.now() + 30 * 24 * 60 * 60 * 1000
  ).toISOString();

  // Store the refresh token in the database
  const [errorRefresh, resultRefresh] = await catchError(
    query(
      "INSERT INTO refresh_tokens (refresh_token, user_id, expires_at) VALUES ($1, $2, $3)",
      [refreshToken, user.id, expiresAt]
    )
  );
  if (errorRefresh) {
    console.error(`Error storing refresh token: ${errorRefresh.message}`);
    return res.status(500).json({ message: "Database error" });
  }

  res.cookie("token", jwtToken, {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  res.status(200).json({ message: "Login successful" });
}

/**
 * Signout controller function
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @returns {Promise<void>}
 */
export async function logout(req, res) {
  const refreshToken = req.cookies.refreshToken;

  if (refreshToken) {
    // Delete the refresh token from the database
    const [errorDelete, _] = await catchError(
      query("DELETE FROM refresh_tokens WHERE refresh_token = $1", [
        refreshToken,
      ])
    );
    if (errorDelete) {
      console.error("Error deleting refresh token:", errorDelete);
      return res
        .status(500)
        .json({ message: `Database error ${errorDelete.message}` });
    }
  }

  res.clearCookie("token");
  res.clearCookie("refreshToken");
  res.status(200).json({ message: "Logout successful" });
}

/**
 * Forgot password controller function
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @returns {Promise<void>}
 */
export async function forgotPassword(req, res) {
  const { email } = req.body;

  if (!email) return res.status(400).json({ message: "Email is required" });

  // Verify if user exists
  const [errorEmail, result] = await catchError(
    query("SELECT * FROM users WHERE email = $1", [email])
  );
  if (errorEmail) {
    console.error("Error checking for existing user:", errorEmail);
    return res.status(500).json({ message: "Database error" });
  }
  if (result.rows.length === 0)
    return res.status(400).json({ message: "User not found" });

  const user = result.rows[0];

  // Generate a reset password token
  const resetPasswordToken = crypto.randomBytes(32).toString("hex");
  const resetPasswordTokenExpiresAt = new Date(
    Date.now() + 1 * 60 * 60 * 1000 // 1 hour from now
  ).toISOString();

  // update the user with the reset password token
  const [errorUpdate, resultUpdate] = await catchError(
    query(
      "UPDATE users SET reset_pw_token = $1, reset_pw_expires_at = $2 WHERE id = $3 RETURNING *",
      [resetPasswordToken, resetPasswordTokenExpiresAt, user.id]
    )
  );
  if (errorUpdate) {
    console.error("Error updating user with reset token:", errorUpdate);
    return res.status(500).json({ message: "Database error" });
  }

  // Send a password reset email
  const resetPasswordURL = `${process.env.FRONTEND_URL}/reset-password?token=${resetPasswordToken}`;
  await sendPasswordResetEmail(user.email, resetPasswordURL, user.name);

  res.status(200).json({ message: "Password reset email sent successfully" });
}

/**
 * Reset password controller function
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @returns {Promise<void>}
 */
export async function resetPassword(req, res) {
  //const { token } = req.query;
  const { token, password } = req.body;

  if (!token) return res.status(400).json({ message: "Token is required" });
  if (!password)
    return res.status(400).json({ message: "New password is required" });

  // Verify if the token is valid in the database
  const [errorToken, result] = await catchError(
    query("SELECT * FROM users WHERE reset_pw_token = $1", [token])
  );
  if (errorToken) {
    console.error("Error checking reset password token:", errorToken);
    return res.status(500).json({ message: "Database error" });
  }
  if (
    result.rows.length === 0 ||
    new Date(result.rows[0].reset_pw_expires_at) < new Date()
  )
    return res.status(400).json({ message: "Invalid or expired token" });

  const user = result.rows[0];

  // Validate the new password
  if (password.length < 6)
    return res
      .status(400)
      .json({ message: "New password must be at least 6 characters long" });

  // Hash the new password
  const [errorHash, hashedPassword] = await catchError(
    bcrypt.hash(password, 10)
  );
  if (errorHash) {
    console.error("Error hashing new password:", errorHash);
    return res.status(500).json({ message: "Internal server error" });
  }

  // Update the user's password in the database
  const [errorUpdate, resultUpdate] = await catchError(
    query(
      "UPDATE users SET pw = $1, reset_pw_token = NULL, reset_pw_expires_at = NULL WHERE id = $2 RETURNING *",
      [hashedPassword, user.id]
    )
  );
  if (errorUpdate) {
    console.error("Error updating user password:", errorUpdate);
    return res.status(500).json({ message: "Database error" });
  }

  res.status(200).json({ message: "Password reset successful" });
}

/**
 * Check authentication status
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @returns {Promise<void>}
 */
export async function checkAuth(req, res) {
  const user = req.user;
  if (!user) return res.status(401).json({ message: "Unauthorized" });

  // If the user is authenticated, we could search all the information in the database
  const [error, result] = await catchError(
    query("SELECT id, email, name, is_verified FROM users WHERE id = $1", [
      user.id,
    ])
  );
  if (error) {
    console.error("Error fetching user data:", error);
    return res.status(500).json({ message: "Database error" });
  }
  const fetchedUser = result.rows[0];

  return res.status(200).json({
    success: true,
    message: "Authenticated",
    user: {
      name: fetchedUser.name,
      email: fetchedUser.email,
      is_verified: fetchedUser.is_verified,
    },
  });
}

/**
 * OAuth controller callback function
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @returns {Promise<void>}
 */
export async function oauthCallback(req, res) {
  const { token, refreshToken } = req.user || {};
  if (!token) {
    console.error("No JWT token found");
    return res.redirect(`${process.env.FRONTEND_URL}/`);
  }
  res.cookie("token", token, {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
  res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
}

/**
 * Function to refresh the JWT token
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @returns {Promise<void>}
 */
export async function refreshToken(req, res) {
  const { refreshToken: oldToken } = req.cookies;

  if (!oldToken) return res.status(401).json({ message: "Unauthorized" });

  // Verify the refresh token in the database
  const [errorLookup, resultLookup] = await catchError(
    query("SELECT * FROM refresh_tokens WHERE refresh_token = $1", [oldToken])
  );
  if (errorLookup) {
    console.error("Error looking up refresh token:", errorLookup);
    return res
      .status(500)
      .json({ message: `Database error ${errorLookup.message}` });
  }
  if (resultLookup.rows.length === 0)
    return res.status(403).json({ message: "Forbidden" });

  // Verify if the refresh token is still valid
  const refreshTokenData = resultLookup.rows[0];

  if (new Date(refreshTokenData.expires_at) < new Date()) {
    const [errorDelete, resultDelete] = await catchError(
      query("DELETE FROM refresh_tokens WHERE refresh_token = $1", [
        refreshTokenData.refresh_token,
      ])
    );
    if (errorDelete) {
      console.error("Error deleting expired refresh token:", errorDelete);
      return res
        .status(500)
        .json({ message: `Database error ${errorDelete.message}` });
    }
    return res.status(403).json({ message: "Refresh token expired" });
  }

  // Successfully found the refresh token

  // Verify the user associated with the refresh token
  const [errorUser, resultUser] = await catchError(
    query("SELECT * FROM users WHERE id = $1", [refreshTokenData.user_id])
  );
  if (errorUser) {
    console.error("Error fetching user data:", errorUser);
    return res
      .status(500)
      .json({ message: `Database error ${errorUser.message}` });
  }

  const user = resultUser.rows[0];

  // Generate a new JWT access and refresh token
  const accessToken = generateJWTToken(user, process.env.SECRET_KEY, "7d");
  const refreshToken = generateJWTRefreshToken(
    user,
    process.env.SECRET_REFRESH_KEY,
    "30d"
  );
  const expiresAt = new Date(
    Date.now() + 30 * 24 * 60 * 60 * 1000
  ).toISOString();

  // Delete the old refresh token
  const [errorDeleteOld, resultDeleteOld] = await catchError(
    query("DELETE FROM refresh_tokens WHERE refresh_token = $1", [oldToken])
  );
  if (errorDeleteOld) {
    console.error("Error deleting old refresh token:", errorDeleteOld);
    return res
      .status(500)
      .json({ message: `Database error ${errorDeleteOld.message}` });
  }

  // Store the new refresh token in the database
  const [errorInsert, resultInsert] = await catchError(
    query(
      "INSERT INTO refresh_tokens (refresh_token, user_id, expires_at) VALUES ($1, $2, $3)",
      [refreshToken, user.id, expiresAt]
    )
  );
  if (errorInsert) {
    console.error("Error storing new refresh token:", errorInsert);
    return res
      .status(500)
      .json({ message: `Database error ${errorInsert.message}` });
  }

  // Set the new tokens in cookies
  res.cookie("token", accessToken, {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  res.status(200).json({ message: "Tokens refreshed successfully" });
}
