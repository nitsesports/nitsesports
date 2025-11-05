
import { useCallback, useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { fetchPointsSnapshot, savePointsSnapshot, isSupabaseConfigured } from "@/data/leaderboardPoints";
import BracketView from "@/components/bracket/BracketView";
const CODM_MATCH_KEYS = ["match1", "match2", "match3"]; 
const createEmptyCodmMatch = () => ({ wins: 0, placement: 0, kills: 0, points: 0 }); 
const createEmptyCodmMatches = () => ({ 
  match1: createEmptyCodmMatch(),
  match2: createEmptyCodmMatch(),
  match3: createEmptyCodmMatch(),
});


const LeaderboardCodm = ({ eventId, game, canEdit }) => { // Removed: : LeaderboardCodmProps
  const [codmRows, setCodmRows] = useState(() => // Removed: <CodmRow[]>
    Array.from({ length: 14 }, (_, i) => ({ id: `${i}`, team: `Team ${i + 1}`, matches: createEmptyCodmMatches() }))
  );
  const [codmBracket, setCodmBracket] = useState(null); // Removed: <Bracket | null>

  const [isDirty, setIsDirty] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState(null); // Removed: <string | null>
  const [loadingPoints, setLoadingPoints] = useState(false);
  const [savingPoints, setSavingPoints] = useState(false);

  const updateCodmTeamName = (rowId, name) => { // Removed: : string
    setCodmRows((prev) => prev.map((r) => (r.id === rowId ? { ...r, team: name } : r)));
    setIsDirty(true);
  };

  const updateCodmStat = useCallback(
    (rowId, matchKey, field, value) => { // Removed parameter types
      const n = Number(value);
      const v = Number.isFinite(n) ? n : 0;
      setCodmRows((prev) =>
        prev.map((r) => {
          if (r.id !== rowId) return r;
          const m = r.matches[matchKey];
          const updated = { ...m, [field]: v }; // Removed: as CodmMatchStats
          updated.points = (field === "placement" ? v : m.placement) + (field === "kills" ? v : m.kills);
          return { ...r, matches: { ...r.matches, [matchKey]: updated } };
        })
      );
      setIsDirty(true);
    },
    []
  );

  const codmOverall = useMemo(() => {
    const rows = codmRows
      .map((r) => {
        const totals = CODM_MATCH_KEYS.reduce(
          (acc, mk) => {
            const m = r.matches[mk];
            acc.wins += m.wins || 0;
            acc.placement += m.placement || 0;
            acc.kills += m.kills || 0;
            return acc;
          },
          { wins: 0, placement: 0, kills: 0 }
        );
        const totalPoints = totals.placement + totals.kills;
        return { id: r.id, team: r.team, totalWins: totals.wins, totalPlacement: totals.placement, totalKills: totals.kills, totalPoints };
      })
      .sort((a, b) => b.totalPoints - a.totalPoints);
    return rows.map((r, i) => ({ rank: i + 1, ...r }));
  }, [codmRows]);

  const buildCodmBracketFromOverall = useCallback((teams) => { // Removed: : string[] and : Bracket
    const seeds = teams.slice(0, 8);
    const qf = [
      { teamA: seeds[0] ?? "—", teamB: seeds[7] ?? "—", scoreA: 0, scoreB: 0, status: "upcoming" }, // Removed: as const
      { teamA: seeds[1] ?? "—", teamB: seeds[6] ?? "—", scoreA: 0, scoreB: 0, status: "upcoming" }, // Removed: as const
      { teamA: seeds[2] ?? "—", teamB: seeds[5] ?? "—", scoreA: 0, scoreB: 0, status: "upcoming" }, // Removed: as const
      { teamA: seeds[3] ?? "—", teamB: seeds[4] ?? "—", scoreA: 0, scoreB: 0, status: "upcoming" }, // Removed: as const
    ];
    const sf = [
      { teamA: "Winner M1", teamB: "Winner M4", scoreA: 0, scoreB: 0, status: "upcoming" }, // Removed: as const
      { teamA: "Winner M2", teamB: "Winner M3", scoreA: 0, scoreB: 0, status: "upcoming" }, // Removed: as const
    ];
    const gf = [{ teamA: "Winner SF1", teamB: "Winner SF2", scoreA: 0, scoreB: 0, status: "upcoming" }]; // Removed: as const
    return {
      columns: [
        { title: "Quarterfinals", matches: qf },
        { title: "Semifinals", matches: sf },
        { title: "Grand Final", matches: gf },
      ],
    };
  }, []);

  useEffect(() => {
    if (!codmBracket) {
      setCodmBracket(buildCodmBracketFromOverall(codmOverall.map((r) => r.team)));
    }
  }, [codmBracket, codmOverall, buildCodmBracketFromOverall]);

  const handleCodmScoreChange = (col, mIdx, newA, newB) => { // Removed: : number
    setCodmBracket((prev) => {
      if (!prev) return prev;
      const next = { ...prev, columns: prev.columns.map((c) => ({ ...c, matches: c.matches.map((m) => ({ ...m })) })) }; // Removed: as Bracket
      next.columns[col].matches[mIdx].scoreA = newA;
      next.columns[col].matches[mIdx].scoreB = newB;
      if (newA !== newB) next.columns[col].matches[mIdx].status = "completed";
      const match = next.columns[col].matches[mIdx];
      if (match.scoreA !== match.scoreB) {
        const winner = match.scoreA > match.scoreB ? match.teamA : match.teamB;
        if (col === 0) {
          if (mIdx === 0) (next.columns[1].matches[0]).teamA = winner; // Removed: as any
          if (mIdx === 3) (next.columns[1].matches[0]).teamB = winner; // Removed: as any
          if (mIdx === 1) (next.columns[1].matches[1]).teamA = winner; // Removed: as any
          if (mIdx === 2) (next.columns[1].matches[1]).teamB = winner; // Removed: as any
        }
        if (col === 1) {
          if (mIdx === 0) (next.columns[2].matches[0]).teamA = winner; // Removed: as any
          if (mIdx === 1) (next.columns[2].matches[0]).teamB = winner; // Removed: as any
        }
        if (col === 2) {
          const gfMatch = next.columns[2].matches[0];
          next.winner = gfMatch.scoreA > gfMatch.scoreB ? gfMatch.teamA : gfMatch.teamB; // Removed: (next as any)
        }
      }
      return next;
    });
    setIsDirty(true);
  };
  
  // Data Loading
  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setLastSavedAt(null);
      setIsDirty(false);
      return;
    }
    let cancelled = false;
    const loadCodm = async () => {
      setLoadingPoints(true);
      try {
        const snapshot = await fetchPointsSnapshot(eventId, game.id); // Removed: <string>
        if (cancelled) return;
        const rows = snapshot?.codmRows ?? []; // Removed: : any[] and (snapshot as any)
        if (rows && rows.length > 0) {
          setCodmRows(
            rows.map((r, idx) => ({ // Removed: (r: any, idx: number)
              id: r.id ?? `${idx}`,
              team: r.team ?? `Team ${idx + 1}`,
              matches: {
                match1: {
                  wins: Number(r?.matches?.match1?.wins ?? 0) || 0,
                  placement: Number(r?.matches?.match1?.placement ?? 0) || 0,
                  kills: Number(r?.matches?.match1?.kills ?? 0) || 0,
                  points: Number(r?.matches?.match1?.points ?? 0) || 0,
                },
                match2: {
                  wins: Number(r?.matches?.match2?.wins ?? 0) || 0,
                  placement: Number(r?.matches?.match2?.placement ?? 0) || 0,
                  kills: Number(r?.matches?.match2?.kills ?? 0) || 0,
                  points: Number(r?.matches?.match2?.points ?? 0) || 0,
                },
                match3: {
                  wins: Number(r?.matches?.match3?.wins ?? 0) || 0,
                  placement: Number(r?.matches?.match3?.placement ?? 0) || 0,
                  kills: Number(r?.matches?.match3?.kills ?? 0) || 0,
                  points: Number(r?.matches?.match3?.points ?? 0) || 0,
                },
              },
            }))
          );
        }
        const savedBracket = snapshot?.codmBracket; // Removed: (snapshot as any) and as Bracket | undefined
        if (savedBracket && savedBracket.columns) {
          setCodmBracket(savedBracket);
        } else {
          setCodmBracket(buildCodmBracketFromOverall(codmOverall.map((r) => r.team)));
        }
        setLastSavedAt(snapshot?.updatedAt ?? null);
        setIsDirty(false);
      } catch (e) {
        toast.error("Failed to load CODM leaderboard");
        console.error(e);
      } finally {
        if (!cancelled) setLoadingPoints(false);
      }
    };
    loadCodm();
    return () => { cancelled = true; };
  }, [eventId, game.id, codmOverall, buildCodmBracketFromOverall]);

  // Data Saving
  const saveCodmPoints = async () => {
    try {
      setSavingPoints(true);
      const payload = { codmRows, codmBracket }; // Removed: as any
      await savePointsSnapshot(eventId, game.id, payload);
      const now = new Date().toISOString();
      setLastSavedAt(now);
      setIsDirty(false);
      toast.success("Points saved");
    } catch (e) {
      console.error(e);
      toast.error("Failed to save points");
    } finally {
      setSavingPoints(false);
    }
  };

  return (
    <div>
      <Tabs defaultValue={"knockout"}>
        <div className="overflow-x-auto pb-2">
          <TabsList className="w-full justify-start sm:w-auto">
            <TabsTrigger value="knockout">Knockout Stage</TabsTrigger>
            <TabsTrigger value="pointrush">Playoffs</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="knockout">
          <Card className="glass-card border-primary/20">
            <CardHeader>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle className="font-orbitron text-2xl">COD Mobile — Preliminary Round</CardTitle>
                {canEdit && (
                  <div className="flex items-center gap-3 text-sm">
                    {isSupabaseConfigured() ? (
                      <>
                        <div className="text-muted-foreground">
                          {lastSavedAt ? `Last saved ${formatDistanceToNow(new Date(lastSavedAt))} ago` : "Never saved"}
                          {isDirty && <span className="ml-2 text-yellow-500">(unsaved)</span>}
                        </div>
                        <Button size="sm" disabled={!isDirty || savingPoints} onClick={saveCodmPoints}>{savingPoints ? "Saving..." : "Save"}</Button>
                      </>
                    ) : (
                      <div className="text-red-500">Supabase not configured</div>
                    )}
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Tabs defaultValue="overall">
                  <TabsList className="w-full">
                    <TabsTrigger value="overall">Overall</TabsTrigger>
                    <TabsTrigger value="match1">Match 1</TabsTrigger>
                    <TabsTrigger value="match2">Match 2</TabsTrigger>
                    <TabsTrigger value="match3">Match 3</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overall">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-border/50">
                          <TableHead className="font-orbitron">#</TableHead>
                          <TableHead className="font-orbitron">Team</TableHead>
                          <TableHead className="font-orbitron text-right">Wins</TableHead>
                          <TableHead className="font-orbitron text-right">Placement Point</TableHead>
                          <TableHead className="font-orbitron text-right">Kill Points</TableHead>
                          <TableHead className="font-orbitron text-right">Total Points</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {codmOverall.map((row) => (
                          <TableRow key={`codm-overall-${row.id}`} className="border-border/50">
                            <TableCell className="font-semibold">{row.rank}.</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-semibold">{row.team.split(' ').map(s=>s[0]).slice(0,2).join('')}</div>
                                {canEdit ? (
                                  <Input value={row.team} onChange={(e)=>updateCodmTeamName(row.id, e.target.value)} />
                                ) : (
                                  <div>{row.team}</div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">{row.totalWins}</TableCell>
                            <TableCell className="text-right">{row.totalPlacement}</TableCell>
                            <TableCell className="text-right">{row.totalKills}</TableCell>
                            <TableCell className="text-right font-semibold">{row.totalPoints}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    <div className="text-xs text-muted-foreground mt-2">Top 8 teams advance to the Quarter-Finals based on total points.</div>
                  </TabsContent>

                  {(["match1","match2","match3"]).map((mk) => ( // Removed: as CodmMatchKey[]
                    <TabsContent key={mk} value={mk}>
                      <Table>
                        <TableHeader>
                          <TableRow className="border-border/50">
                            <TableHead className="font-orbitron">#</TableHead>
                            <TableHead className="font-orbitron">Team</TableHead>
                            <TableHead className="font-orbitron text-right">Wins</TableHead>
                            <TableHead className="font-orbitron text-right">Placement</TableHead>
                            <TableHead className="font-orbitron text-right">Kill Points</TableHead>
                            <TableHead className="font-orbitron text-right">Points</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {codmRows.map((r, i) => {
                            const m = r.matches[mk];
                            return (
                              <TableRow key={`codm-${mk}-${r.id}`} className="border-border/5Example">
                                <TableCell className="font-semibold">{i + 1}.</TableCell>
                                <TableCell>{r.team}</TableCell>
                                <TableCell className="text-right">{canEdit ? (<Input className="text-right" type="number" value={m.wins} onChange={(e)=>updateCodmStat(r.id, mk, 'wins', e.target.value)} />) : m.wins}</TableCell>
                                <TableCell className="text-right">{canEdit ? (<Input className="text-right" type="number" value={m.placement} onChange={(e)=>updateCodmStat(r.id, mk, 'placement', e.target.value)} />) : m.placement}</TableCell>
                                <TableCell className="text-right">{canEdit ? (<Input className="text-right" type="number" value={m.kills} onChange={(e)=>updateCodmStat(r.id, mk, 'kills', e.target.value)} />) : m.kills}</TableCell>
                                <TableCell className="text-right">{(m.placement||0)+(m.kills||0)}</TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </TabsContent>
                  ))}
                </Tabs>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="pointrush">
          <div className="space-y-6">
            <h3 className="font-orbitron text-2xl tracking-tight">Playoffs — Top 8</h3>
            {canEdit && (
              <div className="flex items-center gap-3 text-sm mt-2">
                {isSupabaseConfigured() ? (
                  <>
                    <div className="text-muted-foreground">
                      {lastSavedAt ? `Last saved ${formatDistanceToNow(new Date(lastSavedAt))} ago` : "Never saved"}
                      {isDirty && <span className="ml-2 text-yellow-500">(unsaved)</span>}
                    </div>
                    <Button size="sm" variant="outline" onClick={() => { setCodmBracket(buildCodmBracketFromOverall(codmOverall.map(r => r.team))); setIsDirty(true); toast.success('Bracket reseeded from leaderboard'); }}>Reseed from Leaderboard</Button>
                    <Button size="sm" disabled={!isDirty || savingPoints} onClick={saveCodmPoints}>{savingPoints ? "Saving..." : "Save"}</Button>
                  </>
                ) : (
                  <div className="text-red-500">Supabase not configured</div>
                )}
              </div>
            )}
            <div className="rounded-lg border border-border/40 bg-gradient-to-b from-background/60 to-background/30 p-4">
              <BracketView bracket={(codmBracket ?? buildCodmBracketFromOverall(codmOverall.map((r) => r.team)))} onScoreChange={canEdit ? handleCodmScoreChange : undefined} />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LeaderboardCodm;