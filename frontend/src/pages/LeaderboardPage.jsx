import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trophy, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import axios from "axios";

function LeaderboardPage() {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  async function fetchLeaderboardData() {
    setIsLoading(true);
    try {
      const response = await axios.get(
        "http://localhost:3000/api/game/leaderboard",
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      setLeaderboardData(response.data.leaderboard || []);
    } catch (error) {
      console.error("Error fetching leaderboard data:", error);
      setLeaderboardData([]);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchLeaderboardData();

    const interval = setInterval(
      () => {
        fetchLeaderboardData();
      },
      30 * 60 * 1000
    );

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = async () => {
    await fetchLeaderboardData();
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight">Leaderboard</h1>
        <p className="text-muted-foreground mt-2">
          Top <span className="font-semibold">10</span> performers ranked by
          total clicks
        </p>
      </div>

      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-6 w-6 text-yellow-500" />
              Top Players
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Rank</TableHead>
                <TableHead>Player</TableHead>
                <TableHead className="text-right">Clicks</TableHead>
                <TableHead className="text-center">Level</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaderboardData.map((player, index) => {
                const rank = index + 1;
                return (
                  <TableRow
                    key={player.id}
                    className={rank <= 3 ? "bg-muted/50" : ""}
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center justify-center">#1</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={player.avatar || "/placeholder.svg"}
                            alt={player.username}
                          />
                          <AvatarFallback className="rounded-lg">
                            CN
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{player.username}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono font-semibold">
                      {player.clicks.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-center">
                      Level {Math.floor(player.clicks / 10) + 1}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

export default LeaderboardPage;
