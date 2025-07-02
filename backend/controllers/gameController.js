import { catchError } from "../utils/errorHandler.js";
import { query } from "../db/connection.js";

/**
 * Function to fetch game data for the authenticated user.
 * @param {Object} req - The request object containing user information.
 * @param {Object} res - The response object to send the game data.
 * @returns {Object} - Returns the game data for the authenticated user.
 */
export async function fetchGameData(req, res) {
  const userId = req.user.id;

  const [error, gameData] = await catchError(
    query("SELECT * FROM click_stats WHERE user_id = $1", [userId])
  );
  if (error) return res.status(500).json({ message: "Database query failed" });

  return res.status(200).json({ gameData });
}
