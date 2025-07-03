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

  const data = gameData.rows[0];

  return res.status(200).json({ gameData: data });
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

  const [error, gameData] = await catchError(
    query(
      `
      INSERT INTO click_stats (user_id, clicks, last_click_at) VALUES ($1, 1, NOW())
      ON CONFLICT (user_id) 
      DO UPDATE SET clicks = click_stats.clicks + 1, last_click_at = EXCLUDED.last_click_at RETURNING clicks;
      `,
      [userId]
    )
  );

  if (error) return res.status(500).json({ message: "Database query failed" });

  if (gameData.rows.length === 0) console.log("Now rows");

  return res.status(200).json(gameData.rows[0]);
}
