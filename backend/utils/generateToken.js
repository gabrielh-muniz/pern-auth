import jwt from "jsonwebtoken";

/**
 * Generates a random 6-digit verification token
 * @returns {string} A 6-digit verification token
 */
export function generateVerificationToken() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Generates a JWT token for user authentication
 * @param {Object} user - The user object containing user information
 * @param {string} secretKey - The secret key used to sign the JWT
 * @param {number} expiresIn - The expiration time for the token in seconds
 * @returns {string} A JWT token
 */
export function generateJWTToken(user, secretKey, expiresIn) {
  const token = jwt.sign({ id: user.id, email: user.email }, secretKey, {
    expiresIn,
  });
  return token;
}

/**
 * Generates a JWT refresh token for user authentication
 * @param {Object} user - The user object containing user information
 * @param {string} secretKey - The secret key used to sign the JWT
 * @param {number} expiresIn - The expiration time for the token in seconds
 * @returns {string} A JWT refresh token
 */
export function generateJWTRefreshToken(user, secretRefreshKey, expiresIn) {
  const refreshToken = jwt.sign(
    { id: user.id, email: user.email },
    secretRefreshKey,
    { expiresIn }
  );
  return refreshToken;
}
