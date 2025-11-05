// src/components/leaderboards/LeaderboardSimple.jsx

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// Removed: type { Game } import

// Removed: LeaderboardSimpleProps type definition

const LeaderboardSimple = ({ game }) => { // Removed: type annotation
  const rankings = game.rankings ?? [];

  return (
    <div>
      <Card className="glass-card border-primary/20">
        <CardHeader>
          <CardTitle className="font-orbitron text-2xl">{game.name} — Final Rankings</CardTitle>
        </CardHeader>
        <CardContent>
          {rankings.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/50">
                    <TableHead className="font-orbitron">#</TableHead>
                    <TableHead className="font-orbitron">Team</TableHead>
                    <TableHead className="font-orbitron text-right">Points</TableHead>
                    <TableHead className="font-orbitron text-right">Prize</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rankings.map((row) => (
                    <TableRow key={row.rank} className="border-border/50">
                      <TableCell className="font-semibold">{row.rank}.</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-semibold">{row.team.split(' ').map(s=>s[0]).slice(0,2).join('')}</div>
                          <div>{row.team}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-semibold">{row.points}</TableCell>
                      <TableCell className="text-right">{row.prize}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-muted-foreground">Rankings are not yet available for this game.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LeaderboardSimple;