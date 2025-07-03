import { Card, CardContent } from "@/components/ui/card";
import { Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import axios from "axios";

const API_URL = "http://localhost:3000/api/game";

function GamePage() {
  const [level, setLevel] = useState(1);
  const [clicks, setClicks] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGameData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${API_URL}/me`, {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.data.gameData) {
          const { clicks, click_level } = response.data.gameData;
          setClicks(clicks);
          setLevel(click_level);
        }
      } catch (error) {
        console.error("Error fetching game data:", error);
        setClicks(0);
        setLevel(1);
      } finally {
        setLoading(false);
      }
    };
    fetchGameData();
  }, []);

  return (
    <div className="min-h-screen bg-background flex justify-center items-center p-4">
      <div className="w-full max-w-md">
        <Card className="bg-white shadow-lg">
          <CardContent className="text-center p-6">
            <div className="mb-6">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Trophy className="w-5 h-5 text-primary" />
                <span className="text-foreground font-bold">
                  {loading ? "..." : `Level ${level}`}
                </span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div
                  className={`h-2 rounded-full bg-gradient-to-r transition-all duration-500`}
                />
              </div>
            </div>

            <div className="mb-8">
              <div
                className={`text-6xl font-bold text-foreground mb-2 transition-all duration-300`}
              >
                {loading ? "..." : clicks}
              </div>
            </div>

            <Button
              size="lg"
              className={`w-full h-12 text-md font-semibold bg-primary`}
            >
              CLICK ME!
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default GamePage;
