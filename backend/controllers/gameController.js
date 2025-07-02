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

/**
 * Function to increment the click count for the authenticated user.
 * @param {Object} req - The request object containing user information.
 * @param {Object} res - The response object to send the updated click count.
 * @returns {Object} - Returns the updated click count for the authenticated user.
 */
export async function incrementClickCount(req, res) {
  const userId = req.user.id;
  const { clickLevel } = req.body;

  const [error, { rows }] = await catchError(
    query(
      `
      INSERT INTO click_stats (user_id, clicks, click_level, last_click_at) VALUES ($1, 1, $2, NOW())
      ON CONFLICT (user_id) 
      DO UPDATE SET clicks = click_stats.clicks + 1, click_level = $2, last_click_at = EXCLUDED.last_click_at RETURNING *
      `,
      [userId, clickLevel]
    )
  );
  if (error) return res.status(500).json({ message: "Database query failed" });

  return res.status(200).json(rows[0]);
}
