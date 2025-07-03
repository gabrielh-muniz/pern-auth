import { config } from "dotenv";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { query } from "../db/connection.js";
import { catchError } from "../utils/errorHandler.js";
import { generateJWTToken } from "../utils/generateToken.js";

config();

// Create a helper function to find or create a user
async function findOrCreateUser(name, email, provider, providerId) {
  try {
    // Check if the user already exists
    const [errorUser, existingUser] = await catchError(
      query("SELECT * FROM users WHERE provider = $1 AND provider_id = $2", [
        provider,
        providerId,
      ])
    );
    if (errorUser)
      throw new Error(`Database query failed ${errorUser.message}`);

    if (existingUser.rows.length > 0) return existingUser.rows[0];

    // Check if the user exists with the same email
    const [errorEmail, existingUserByEmail] = await catchError(
      query("SELECT * FROM users WHERE email = $1", [email])
    );
    if (errorEmail)
      throw new Error(`Database query failed ${errorEmail.message}`);

    // If the user exists, but not with the current provider, update the user
    if (existingUserByEmail.rows.length > 0) {
      const user = existingUserByEmail.rows[0];
      const [errorUpdate, updatedUser] = await catchError(
        query(
          "UPDATE users SET provider = $1, provider_id = $2, is_verified = TRUE WHERE id = $3 RETURNING *",
          [provider, providerId, user.id]
        )
      );
      if (errorUpdate) throw new Error("Database update failed");

      return updatedUser.rows[0];
    }

    // If the user does not exist, create a new user
    const [errorInsert, newUser] = await catchError(
      query(
        "INSERT INTO users (name, email, provider, provider_id, is_verified) VALUES ($1, $2, $3, $4, TRUE) RETURNING *",
        [name, email, provider, providerId]
      )
    );
    if (errorInsert)
      throw new Error(
        `Database insert failed: ${errorInsert.message || errorInsert}`
      );

    return newUser.rows[0];
  } catch (error) {
    throw new Error(`Error in findOrCreateUser: ${error.message}`);
  }
}

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails && profile.emails?.[0]?.value;
        const name = profile.displayName || profile.name?.givenName;

        if (!email || !name)
          return done(new Error("Missing email or name in profile"), null);

        const user = await findOrCreateUser(name, email, "google", profile.id);

        // Generate a JWT token for the user
        const token = generateJWTToken(
          { id: user.id, email: user.email, name: user.name },
          process.env.SECRET_KEY,
          "7d"
        );

        done(null, { token });
      } catch (error) {
        return done(
          new Error(`Error processing Google profile: ${error.message}`)
        );
      }
    }
  )
);

export default passport;
