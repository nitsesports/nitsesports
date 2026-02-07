import { useCallback, useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { fetchPointsSnapshot, savePointsSnapshot, isSupabaseConfigured } from "@/data/leaderboardPoints";

const GROUP_LETTERS = ["A", "B"];

const createEmptyFreeFireMatch = () => ({ gamesPlayed: 0, booyah: 0, placement: 0, kills: 0, points: 0 });
const createEmptyFreeFireMatches = () => ({
  match1: createEmptyFreeFireMatch(),
  match2: createEmptyFreeFireMatch(),
  match3: createEmptyFreeFireMatch(),
  match4: createEmptyFreeFireMatch(),
});
const createFreeFireGroupRows = ({ count, startRank, startTeamNumber }) =>
  Array.from({ length: count }, (_, index) => ({
    rank: startRank + index,
    team: `Team ${startTeamNumber + index}`,
    gamesPlayed: 0,
    booyah: 0,
    placement: 0,
    kills: 0,
    points: 0,
    matches: createEmptyFreeFireMatches(),
    originalIndex: index,
  }));

const GROUP_A_DATA = [
  { team: "NxR", m1: { RP: 7, KP: 23 }, m2: { RP: 1, KP: 3 }, m3: { RP: 12, KP: 32 }, m4: { RP: 0, KP: 0 } },
  { team: "Dark Bullets", m1: { RP: 9, KP: 7 }, m2: { RP: 2, KP: 0 }, m3: { RP: 7, KP: 1 }, m4: { RP: 1, KP: 1 } },
  { team: "TEAM BABA", m1: { RP: 12, KP: 23 }, m2: { RP: 12, KP: 31 }, m3: { RP: 5, KP: 5 }, m4: { RP: 2, KP: 9 } },
  { team: "TEAM SOUL", m1: { RP: 3, KP: 0 }, m2: { RP: 7, KP: 0 }, m3: { RP: 0, KP: 6 }, m4: { RP: 4, KP: 4 } },
  { team: "TEAM X-TREME", m1: { RP: 4, KP: 0 }, m2: { RP: 8, KP: 11 }, m3: { RP: 4, KP: 12 }, m4: { RP: 8, KP: 14 } },
  { team: "APEX PREDATORS", m1: { RP: 2, KP: 1 }, m2: { RP: 0, KP: 0 }, m3: { RP: 9, KP: 3 }, m4: { RP: 7, KP: 4 } },
  { team: "Eucalyptus Esports", m1: { RP: 5, KP: 5 }, m2: { RP: 6, KP: 6 }, m3: { RP: 6, KP: 9 }, m4: { RP: 9, KP: 6 } },
  { team: "PUNJU SQUAD", m1: { RP: 6, KP: 3 }, m2: { RP: 5, KP: 17 }, m3: { RP: 8, KP: 2 }, m4: { RP: 6, KP: 5 } },
  { team: "Eternals", m1: { RP: 1, KP: 3 }, m2: { RP: 4, KP: 1 }, m3: { RP: 0, KP: 0 }, m4: { RP: 3, KP: 2 } },
  { team: "TEAM NOOB", m1: { RP: 0, KP: 0 }, m2: { RP: 3, KP: 5 }, m3: { RP: 2, KP: 5 }, m4: { RP: 0, KP: 0 } },
  { team: "Brahmos", m1: { RP: 0, KP: 0 }, m2: { RP: 0, KP: 1 }, m3: { RP: 0, KP: 1 }, m4: { RP: 5, KP: 1 } },
  { team: "Bluechip", m1: { RP: 8, KP: 8 }, m2: { RP: 9, KP: 8 }, m3: { RP: 3, KP: 7 }, m4: { RP: 12, KP: 26 } },
];

const GROUP_B_DATA = [
  { team: "Kiwi", m1: { RP: 0, KP: 3 }, m2: { RP: 12, KP: 6 }, m3: { RP: 1, KP: 3 }, m4: { RP: 5, KP: 2 } },
  { team: "FALCON", m1: { RP: 9, KP: 10 }, m2: { RP: 7, KP: 4 }, m3: { RP: 7, KP: 16 }, m4: { RP: 7, KP: 14 } },
  { team: "TEAM-EAGLE", m1: { RP: 8, KP: 19 }, m2: { RP: 8, KP: 22 }, m3: { RP: 8, KP: 11 }, m4: { RP: 0, KP: 1 } },
  { team: "ASSAM TRACTOR", m1: { RP: 1, KP: 2 }, m2: { RP: 2, KP: 1 }, m3: { RP: 5, KP: 5 }, m4: { RP: 0, KP: 1 } },
  { team: "Team insane", m1: { RP: 2, KP: 1 }, m2: { RP: 0, KP: 0 }, m3: { RP: 0, KP: 0 }, m4: { RP: 0, KP: 0 } },
  { team: "Z HUNTERS", m1: { RP: 5, KP: 6 }, m2: { RP: 0, KP: 1 }, m3: { RP: 2, KP: 3 }, m4: { RP: 0, KP: 0 } },
  { team: "VELUMUDHRA", m1: { RP: 7, KP: 5 }, m2: { RP: 6, KP: 12 }, m3: { RP: 0, KP: 0 }, m4: { RP: 8, KP: 15 } },
  { team: "T._.AUS", m1: { RP: 12, KP: 20 }, m2: { RP: 9, KP: 12 }, m3: { RP: 12, KP: 8 }, m4: { RP: 3, KP: 4 } },
  { team: "khiladi", m1: { RP: 6, KP: 3 }, m2: { RP: 3, KP: 2 }, m3: { RP: 4, KP: 7 }, m4: { RP: 1, KP: 7 } },
  { team: "PSYKIC ESPORTS", m1: { RP: 3, KP: 4 }, m2: { RP: 5, KP: 9 }, m3: { RP: 6, KP: 12 }, m4: { RP: 9, KP: 17 } },
  { team: "Rush in my blood", m1: { RP: 0, KP: 0 }, m2: { RP: 0, KP: 1 }, m3: { RP: 0, KP: 0 }, m4: { RP: 0, KP: 0 } },
];

const createGroupData = (data) => {
  return data.map((d, index) => {
    const matches = createEmptyFreeFireMatches();
    ['m1', 'm2', 'm3', 'm4'].forEach((mk, i) => {
      const source = d[mk];
      const matchKey = `match${i + 1}`;
      matches[matchKey] = {
        placement: source.RP,
        kills: source.KP,
        booyah: source.RP === 12 ? 1 : 0,
        points: source.RP + source.KP
      };
    });
    return {
      rank: index + 1,
      team: d.team,
      gamesPlayed: 4,
      booyah: 0,
      placement: 0,
      kills: 0,
      points: 0,
      matches: matches,
      originalIndex: index
    };
  });
};

const LeaderboardFreeFire = ({ eventId, game, canEdit }) => {
  const [freefireGroups, setFreefireGroups] = useState(() => ({
    A: createFreeFireGroupRows({ count: 12, startRank: 1, startTeamNumber: 1 }),
    B: createFreeFireGroupRows({ count: 12, startRank: 13, startTeamNumber: 13 }),
  }));
  const [freefireFinalsRows, setFreefireFinalsRows] = useState([]);

  const [loadingPoints, setLoadingPoints] = useState(false);
  const [savingPoints, setSavingPoints] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState(null);

  const getSortedGroupRows = (letter, groups) => {
    const rows = (groups?.[letter] ?? []);
    const withTotals = rows.map((row) => {
      const m1 = row.matches?.match1 ?? { placement: 0, kills: 0, booyah: 0 };
      const m2 = row.matches?.match2 ?? { placement: 0, kills: 0, booyah: 0 };
      const m3 = row.matches?.match3 ?? { placement: 0, kills: 0, booyah: 0 };
      const m4 = row.matches?.match4 ?? { placement: 0, kills: 0, booyah: 0 };
      const totalBooyah = (m1.booyah || 0) + (m2.booyah || 0) + (m3.booyah || 0) + (m4.booyah || 0);
      const totalPlacement = (m1.placement || 0) + (m2.placement || 0) + (m3.placement || 0) + (m4.placement || 0);
      const totalKills = (m1.kills || 0) + (m2.kills || 0) + (m3.kills || 0) + (m4.kills || 0);
      const computedPoints = totalPlacement + totalKills;
      const storedPoints = (typeof row.points === 'number' ? row.points : Number(row.points)) || (row.totalPoints ?? 0);
      const totalPoints = computedPoints || storedPoints || 0;
      return { ...row, totalBooyah, totalPlacement, totalKills, totalPoints };
    });
    return withTotals.sort((a, b) => b.totalPoints - a.totalPoints);
  };

  useEffect(() => {
    const topA = getSortedGroupRows("A", freefireGroups).slice(0, 6);
    const topB = getSortedGroupRows("B", freefireGroups).slice(0, 6);
    const finalsTeams = [...topA, ...topB];

    if (finalsTeams.length > 0) {
      setFreefireFinalsRows((prevRows) => {
        const newRows = finalsTeams.map((row) => ({
          id: row.id ?? `finals-${row.team}`,
          team: row.team,
          group: "A",
          booyah: 0,
          placement: 0,
          kills: 0,
          total: 0,
        }));

        // Correct group assignment for display
        newRows.forEach(nr => {
          if (topB.some(b => b.team === nr.team)) nr.group = "B";
          else nr.group = "A";
        });

        if (prevRows.length > 0) {
          return newRows.map((newRow) => {
            const prevRow = prevRows.find((p) => p.team === newRow.team);
            if (prevRow) {
              return { ...newRow, booyah: prevRow.booyah, placement: prevRow.placement, kills: prevRow.kills, total: prevRow.total };
            }
            return newRow;
          });
        }
        return newRows;
      });
    }
  }, [freefireGroups]);

  const updateFreefireMatchStat = useCallback(
    (group, originalIndex, matchKey, field, rawValue) => {
      const parsed = Number(rawValue);
      const numericValue = Number.isFinite(parsed) ? parsed : 0;
      setFreefireGroups((prev) => {
        const groupRows = (prev[group] ?? []).map((row, index) => {
          if (index !== originalIndex) return row;
          const existingMatches = row.matches ?? createEmptyFreeFireMatches();
          const existingMatch = existingMatches[matchKey] ?? createEmptyFreeFireMatch();
          const updatedMatch = { ...existingMatch, [field]: numericValue };
          const placementValue = field === "placement" ? numericValue : existingMatch.placement ?? 0;
          const killsValue = field === "kills" ? numericValue : existingMatch.kills ?? 0;
          return {
            ...row,
            matches: {
              ...existingMatches,
              [matchKey]: { ...updatedMatch, points: placementValue + killsValue },
            },
          };
        });
        return { ...prev, [group]: groupRows };
      });
      setIsDirty(true);
    }, []
  );

  const renderFreefireStatCell = (group, originalIndex, matchKey, field, value) => {
    const safeValue = Number.isFinite(value) ? value : 0;
    if (!canEdit) return safeValue;
    return <Input type="number" className="text-right" value={safeValue} onChange={(e) => updateFreefireMatchStat(group, originalIndex, matchKey, field, e.target.value)} />;
  };

  const updateFreeFireFinalsCell = (teamId, key, value) => {
    const numericValue = Number(value) || 0;
    setFreefireFinalsRows((prev) =>
      prev.map((row) => {
        if (row.id !== teamId) return row;
        const updated = { ...row, [key]: numericValue };
        updated.total = (updated.placement || 0) + (updated.kills || 0);
        return updated;
      })
    );
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
    const loadFreefire = async () => {
      setLoadingPoints(true);
      try {
        const snapshot = await fetchPointsSnapshot(eventId, game.id);
        if (cancelled) return;
        if (snapshot?.groups) {
          const g = snapshot.groups;
          const mapped = {};
          (GROUP_LETTERS).forEach((letter) => {
            const arr = g[letter] ?? [];
            mapped[letter] = arr.map((r, idx) => ({
              rank: r.rank ?? idx + 1,
              team: r.team ?? `Team ${idx + 1}`,
              gamesPlayed: typeof r.gamesPlayed === 'number' ? r.gamesPlayed : Number(r.gamesPlayed) || 0,
              booyah: typeof r.booyah === 'number' ? r.booyah : Number(r.booyah) || 0,
              placement: typeof r.placement === 'number' ? r.placement : Number(r.placement) || 0,
              kills: typeof r.kills === 'number' ? r.kills : Number(r.kills) || 0,
              points: typeof r.points === 'number' ? r.points : Number(r.points) || 0,
              matches: r.matches ?? createEmptyFreeFireMatches(),
              originalIndex: r.originalIndex ?? idx,
            }));
          });
          setFreefireGroups((prev) => ({ ...prev, ...mapped }));
        } else {
          // If no data on Supabase, seed with hardcoded data
          setFreefireGroups({
            A: createGroupData(GROUP_A_DATA),
            B: createGroupData(GROUP_B_DATA),
          });
          setIsDirty(true); // Enable save button so user can push to Supabase
          if (canEdit) toast.info("Loaded seed data. Click Save to push to Supabase.");
        }

        const savedFinals = snapshot?.finals;
        if (savedFinals && Array.isArray(savedFinals) && savedFinals.length > 0) {
          setFreefireFinalsRows(
            savedFinals.map((r) => {
              const placement = Number(r.placement ?? 0);
              const kills = Number(r.kills ?? 0);
              return {
                id: r.id ?? `team-${Math.random()}`,
                team: r.team ?? 'Unknown',
                group: r.group ?? 'A',
                booyah: Number(r.booyah ?? 0),
                placement,
                kills,
                total: Number(r.total ?? placement + kills),
              };
            })
          );
        }
        setLastSavedAt(snapshot?.updatedAt ?? null);
      } catch (e) {
        toast.error('Failed to load saved Free Fire points');
        console.error(e);
      } finally {
        if (!cancelled) setLoadingPoints(false);
      }
    };
    loadFreefire();
    return () => { cancelled = true; };
  }, [eventId, game.id]);

  // Data Saving
  const saveFreeFirePoints = async () => {
    try {
      setSavingPoints(true);
      const payload = { groups: freefireGroups, finals: freefireFinalsRows };
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
            <TabsTrigger value="groupstage">Finals</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="knockout">
          <div>
            <Tabs defaultValue="group-a">
              <div className="overflow-x-auto pb-2">
                <TabsList className="w-full justify-start sm:w-auto">
                  <TabsTrigger value="group-a">Group A</TabsTrigger>
                  <TabsTrigger value="group-b">Group B</TabsTrigger>
                </TabsList>
              </div>

              {(GROUP_LETTERS).map((letter) => (
                <TabsContent key={`group-tab-${letter}`} value={`group-${letter.toLowerCase()}`}>
                  <Card className="glass-card border-primary/20">
                    <CardHeader>
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <CardTitle className="font-orbitron text-2xl">{game.name} — Group {letter}</CardTitle>
                        {canEdit && (
                          <div className="flex items-center gap-3 text-sm">
                            {isSupabaseConfigured() ? (
                              <>
                                <div className="text-muted-foreground">
                                  {lastSavedAt ? `Last saved ${formatDistanceToNow(new Date(lastSavedAt))} ago` : "Never saved"}
                                  {isDirty && <span className="ml-2 text-yellow-500">(unsaved)</span>}
                                </div>
                                <Button size="sm" disabled={!isDirty || savingPoints} onClick={saveFreeFirePoints}>{savingPoints ? "Saving..." : "Save"}</Button>
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
                          <TabsList className="w-full flex-wrap h-auto">
                            <TabsTrigger value="overall">Overall</TabsTrigger>
                            <TabsTrigger value="match1">Match 1</TabsTrigger>
                            <TabsTrigger value="match2">Match 2</TabsTrigger>
                            <TabsTrigger value="match3">Match 3</TabsTrigger>
                            <TabsTrigger value="match4">Match 4</TabsTrigger>
                          </TabsList>
                          <TabsContent value="overall">
                            <Table>
                              <TableHeader>
                                <TableRow className="border-border/50">
                                  <TableHead className="font-orbitron">#</TableHead>
                                  <TableHead className="font-orbitron">Team</TableHead>
                                  <TableHead className="font-orbitron text-right">Booyah</TableHead>
                                  <TableHead className="font-orbitron text-right">Placement</TableHead>
                                  <TableHead className="font-orbitron text-right">Kills</TableHead>
                                  <TableHead className="font-orbitron text-right">Total</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {getSortedGroupRows(letter, freefireGroups).map((row, idx) => {
                                  const origIdx = row.originalIndex ?? row.rank - 1;
                                  return (
                                    <TableRow key={`freefire-${letter}-${origIdx}`} className="border-border/50">
                                      <TableCell className="font-semibold">{idx + 1}.</TableCell>
                                      <TableCell>
                                        <div className="flex items-center gap-3">
                                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-semibold">{letter}</div>
                                          {canEdit ? (
                                            <Input value={row.team} onChange={(e) => { const v = e.target.value; setFreefireGroups(prev => ({ ...prev, [letter]: prev[letter].map((r, i) => i === origIdx ? { ...r, team: v } : r) })); setIsDirty(true); }} />
                                          ) : (<div>{row.team}</div>)}
                                        </div>
                                      </TableCell>
                                      <TableCell className="text-right">{row.totalBooyah}</TableCell>
                                      <TableCell className="text-right">{row.totalPlacement}</TableCell>
                                      <TableCell className="text-right">{row.totalKills}</TableCell>
                                      <TableCell className="text-right font-semibold">{row.totalPoints}</TableCell>
                                    </TableRow>
                                  );
                                })}
                              </TableBody>
                            </Table>
                          </TabsContent>
                          {['match1', 'match2', 'match3', 'match4'].map((matchKey, mIdx) => (
                            <TabsContent key={matchKey} value={matchKey}>
                              <Table>
                                <TableHeader>
                                  <TableRow className="border-border/50">
                                    <TableHead className="font-orbitron">#</TableHead>
                                    <TableHead className="font-orbitron">Team</TableHead>
                                    <TableHead className="font-orbitron text-right">Booyah</TableHead>
                                    <TableHead className="font-orbitron text-right">Placement</TableHead>
                                    <TableHead className="font-orbitron text-right">Kills</TableHead>
                                    <TableHead className="font-orbitron text-right">Total</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {freefireGroups[letter].map((row) => {
                                    const origIdx = row.originalIndex ?? row.rank - 1;
                                    const m = row.matches?.[matchKey] ?? createEmptyFreeFireMatch();
                                    return (
                                      <TableRow key={`freefire-${letter}-${matchKey}-${row.rank}`} className="border-border/50">
                                        <TableCell className="font-semibold">{row.rank}.</TableCell>
                                        <TableCell><div>{row.team}</div></TableCell>
                                        <TableCell className="text-right">{renderFreefireStatCell(letter, origIdx, matchKey, 'booyah', m.booyah ?? 0)}</TableCell>
                                        <TableCell className="text-right">{renderFreefireStatCell(letter, origIdx, matchKey, 'placement', m.placement ?? 0)}</TableCell>
                                        <TableCell className="text-right">{renderFreefireStatCell(letter, origIdx, matchKey, 'kills', m.kills ?? 0)}</TableCell>
                                        <TableCell className="text-right">{(m.placement || 0) + (m.kills || 0)}</TableCell>
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
              ))}
            </Tabs>
          </div>
        </TabsContent>

        <TabsContent value="groupstage">
          <div>
            <Card className="glass-card border-primary/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="font-orbitron text-2xl">Finals</CardTitle>
                  {canEdit && <Button onClick={saveFreeFirePoints} disabled={!isDirty || savingPoints}>{savingPoints ? 'Saving...' : 'Save Points'}</Button>}
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  {freefireFinalsRows.length === 0 ? (
                    <div className="p-6 text-center text-muted-foreground">
                      Finalists will be announced once group stage results are in.
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow className="border-border/50">
                          <TableHead className="font-orbitron">#</TableHead>
                          <TableHead className="font-orbitron">Team</TableHead>
                          <TableHead className="font-orbitron text-right">Booyah</TableHead>
                          <TableHead className="font-orbitron text-right">Placement</TableHead>
                          <TableHead className="font-orbitron text-right">Kills</TableHead>
                          <TableHead className="font-orbitron text-right">Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {[...freefireFinalsRows].sort((a, b) => b.total - a.total).map((row, idx) => (
                          <TableRow key={`freefire-finals-${row.id}`} className={`border-border/50 ${idx === 0 ? 'bg-yellow-500/10 border-yellow-500/30' : ''}`}>
                            <TableCell className="font-semibold">{idx === 0 ? '🏆' : idx + 1}.</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-semibold">{row.group}</div>
                                <div>{idx === 0 ? <span className="font-bold text-yellow-400">{row.team}</span> : row.team}</div>
                              </div>
                            </TableCell>
                            <TableCell className="text-right w-24">
                              {canEdit ? (<Input className="text-right" type="number" value={row.booyah} onChange={(e) => updateFreeFireFinalsCell(row.id, "booyah", e.target.value)} />) : row.booyah}
                            </TableCell>
                            <TableCell className="text-right w-36">
                              {canEdit ? (<Input className="text-right" type="number" value={row.placement} onChange={(e) => updateFreeFireFinalsCell(row.id, "placement", e.target.value)} />) : row.placement}
                            </TableCell>
                            <TableCell className="text-right w-32">
                              {canEdit ? (<Input className="text-right" type="number" value={row.kills} onChange={(e) => updateFreeFireFinalsCell(row.id, "kills", e.target.value)} />) : row.kills}
                            </TableCell>
                            <TableCell className="text-right font-semibold">{row.total}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LeaderboardFreeFire;
