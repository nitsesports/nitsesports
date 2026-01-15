import { useCallback, useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import {
  fetchPointsSnapshot,
  savePointsSnapshot,
  isSupabaseConfigured,
} from "@/data/leaderboardPoints";

/** -------------------------------
 * CONFIG
 * ------------------------------*/
const ROUND1_MATCH_KEYS = ["r1match1", "r1match2", "r1match3"];
const KNOCKOUT_MATCH_KEYS = ["match1", "match2", "match3", "match4", "match5", "match6"];


/**
 * Vanguard Arena Round 1 => 72 teams => 4 groups of 18
 */
const ROUND1_GROUPS_72 = {
  A: [0, 17],
  B: [18, 35],
  C: [36, 53],
  D: [54, 71],
};

/**
 * Vanguard Arena Knockout => 32 teams => 4 groups of 8
 */
const KNOCKOUT_GROUPS_32 = {
  A: [0, 7],
  B: [8, 15],
  C: [16, 23],
  D: [24, 31],
};

/**
 * Lock & Load old knockout format => 36 teams => 4 groups of 9
 */
const KNOCKOUT_GROUPS_36 = {
  A: [0, 8],
  B: [9, 17],
  C: [18, 26],
  D: [27, 35],
};

const LOCKLOAD_KNOCKOUT_TEAMS_COUNT = 36;

const LeaderboardBgmi = ({ eventId, game, canEdit }) => {
  /** -------------------------------
   * EVENT FLAGS
   * ------------------------------*/
  const hasRound1 = eventId === "vanguardarena";

  /** -------------------------------
   * GLOBAL STATE
   * ------------------------------*/
  const [isDirty, setIsDirty] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const [loadingPoints, setLoadingPoints] = useState(false);
  const [savingPoints, setSavingPoints] = useState(false);

  /** -------------------------------
   * ROUND 1 (Vanguard Arena only)
   * ✅ FIXED: team names stored separately to prevent flicker
   * ------------------------------*/
  const [round1TeamNamesState, setRound1TeamNamesState] = useState(() =>
    hasRound1 ? Array.from({ length: 72 }, (_, i) => `Team ${i + 1}`) : []
  );

  useEffect(() => {
    if (!hasRound1) return;
    // reset list if event switches
    setRound1TeamNamesState(Array.from({ length: 72 }, (_, i) => `Team ${i + 1}`));
  }, [hasRound1, eventId]);

  const round1InitialRows = useMemo(() => {
    if (!hasRound1) return [];
    return round1TeamNamesState.map((t) => ({
      team: t,
      wwcd: 0,
      placement: 0,
      kills: 0,
      total: 0,
    }));
  }, [hasRound1, round1TeamNamesState]);

  const createRound1Template = useCallback(() => {
    if (!hasRound1) return {};
    return ROUND1_MATCH_KEYS.reduce((acc, key) => {
      acc[key] = round1InitialRows.map((row) => ({ ...row }));
      return acc;
    }, {});
  }, [hasRound1, round1InitialRows]);

  const [round1Data, setRound1Data] = useState(() => (hasRound1 ? createRound1Template() : {}));

  const round1GroupLetterForIndex = (idx) => {
    if (idx >= ROUND1_GROUPS_72.A[0] && idx <= ROUND1_GROUPS_72.A[1]) return "A";
    if (idx >= ROUND1_GROUPS_72.B[0] && idx <= ROUND1_GROUPS_72.B[1]) return "B";
    if (idx >= ROUND1_GROUPS_72.C[0] && idx <= ROUND1_GROUPS_72.C[1]) return "C";
    if (idx >= ROUND1_GROUPS_72.D[0] && idx <= ROUND1_GROUPS_72.D[1]) return "D";
    return "?";
  };

  const indicesForRound1Group = (letter) => {
    const [s, e] = ROUND1_GROUPS_72[letter];
    return Array.from({ length: e - s + 1 }, (_, i) => s + i);
  };

  const getRound1TeamName = useCallback(
    (origIdx) => round1TeamNamesState?.[origIdx] ?? `Team ${origIdx + 1}`,
    [round1TeamNamesState]
  );

  const updateRound1TeamName = (origIdx, name) => {
    if (!hasRound1) return;

    // ✅ stable state update (no flicker)
    setRound1TeamNamesState((prev) => {
      const next = [...prev];
      next[origIdx] = name;
      return next;
    });

    // ✅ sync into all Round1 matches (so points tables use same name)
    setRound1Data((prev) => {
      const next = { ...prev };

      for (const key of ROUND1_MATCH_KEYS) {
        const rows = next[key].slice();
        rows[origIdx] = { ...rows[origIdx], team: name };
        next[key] = rows;
      }

      return next;
    });

    setIsDirty(true);
  };

  const updateRound1Cell = (mk, idx, key, value) => {
    if (!hasRound1) return;

    setRound1Data((prev) => {
      const next = { ...prev };
      const rows = [...next[mk]];
      const row = { ...rows[idx] };

      if (key === "wwcd" || key === "placement" || key === "kills") {
        row[key] = Number(value) || 0;
        row.total = (row.placement || 0) + (row.kills || 0);
      }

      rows[idx] = row;
      next[mk] = rows;
      return next;
    });

    setIsDirty(true);
  };

  const round1OverallRowsForGroup = useCallback(
    (letter) => {
      if (!hasRound1) return [];

      const [s, e] = ROUND1_GROUPS_72[letter];

      const groupRows = Array.from({ length: e - s + 1 }, (_, k) => {
        const idx = s + k;
        let wwcd = 0;
        let placement = 0;
        let kills = 0;
        let total = 0;

        for (const mk of ROUND1_MATCH_KEYS) {
          const r = round1Data?.[mk]?.[idx];
          if (!r) continue;

          wwcd += Number(r.wwcd || 0);
          placement += Number(r.placement || 0);
          kills += Number(r.kills || 0);
          total += Number(r.placement || 0) + Number(r.kills || 0);
        }

        return {
          origIdx: idx,
          team: getRound1TeamName(idx),
          wwcd,
          placement,
          kills,
          total,
        };
      });

      groupRows.sort((a, b) => b.total - a.total);
      return groupRows.map((row, i) => ({ rank: i + 1, ...row }));
    },
    [hasRound1, round1Data, getRound1TeamName]
  );

  /** ✅ Qualified = Top 8 from each group */
  const qualifiedTeams = useMemo(() => {
    if (!hasRound1) return [];

    const result = [];

    for (const letter of ["A", "B", "C", "D"]) {
      const top8 = round1OverallRowsForGroup(letter).slice(0, 8);
      result.push(
        ...top8.map((r) => ({
          team: r.team,
          fromGroup: letter,
        }))
      );
    }

    return result;
  }, [hasRound1, round1OverallRowsForGroup]);

  /** -------------------------------
   * KNOCKOUT TEAMS
   * ------------------------------*/
  const knockoutTeamNames = useMemo(() => {
    // ✅ Vanguard: Knockout teams = Qualified teams
    if (hasRound1) {
      if (!qualifiedTeams || qualifiedTeams.length === 0) {
        return Array.from({ length: 32 }, (_, i) => `Qualified Team ${i + 1}`);
      }
      return qualifiedTeams.map((t) => t.team);
    }

    // ✅ Lock&Load: old 36 teams
    return Array.from({ length: LOCKLOAD_KNOCKOUT_TEAMS_COUNT }, (_, i) => `Team ${i + 1}`);
  }, [hasRound1, qualifiedTeams]);

  const ACTIVE_KNOCKOUT_GROUPS = hasRound1 ? KNOCKOUT_GROUPS_32 : KNOCKOUT_GROUPS_36;

  const knockoutInitialRows = useMemo(
    () =>
      knockoutTeamNames.map((t) => ({
        team: t,
        wwcd: 0,
        placement: 0,
        kills: 0,
        total: 0,
      })),
    [knockoutTeamNames]
  );

  const createKnockoutTemplate = useCallback(() => {
    return KNOCKOUT_MATCH_KEYS.reduce((acc, key) => {
      acc[key] = knockoutInitialRows.map((row) => ({ ...row }));
      return acc;
    }, {});
  }, [knockoutInitialRows]);

  const [matchData, setMatchData] = useState(() => createKnockoutTemplate());
  const [finalsRows, setFinalsRows] = useState([]);

  /** ✅ Sync knockout team names (from Round1) without resetting points */
  useEffect(() => {
    if (!hasRound1) return;

    setMatchData((prev) => {
      const next = { ...prev };

      for (const mk of KNOCKOUT_MATCH_KEYS) {
        const oldRows = next[mk] ?? [];

        next[mk] = knockoutTeamNames.map((teamName, idx) => {
          const old = oldRows[idx] || {};
          const placement = Number(old.placement ?? 0);
          const kills = Number(old.kills ?? 0);

          return {
            team: teamName,
            wwcd: Number(old.wwcd ?? 0),
            placement,
            kills,
            total: placement + kills,
          };
        });
      }

      return next;
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasRound1, knockoutTeamNames.join("|")]);

  const getKnockoutTeamName = useCallback(
    (origIdx) => {
      const firstMatch = matchData[KNOCKOUT_MATCH_KEYS[0]];
      return firstMatch && firstMatch[origIdx]
        ? firstMatch[origIdx].team
        : `Team ${origIdx + 1}`;
    },
    [matchData]
  );

  const updateKnockoutCell = (m, i, key, value) => {
    setMatchData((prev) => {
      const next = { ...prev };
      const rows = [...next[m]];
      const row = { ...rows[i] };

      if (key === "wwcd" || key === "placement" || key === "kills") {
        row[key] = Number(value) || 0;
        row.total = (row.placement || 0) + (row.kills || 0);
      }

      rows[i] = row;
      next[m] = rows;
      return next;
    });

    setIsDirty(true);
  };

  const knockoutGroupLetterForIndex = (idx) => {
    if (idx >= ACTIVE_KNOCKOUT_GROUPS.A[0] && idx <= ACTIVE_KNOCKOUT_GROUPS.A[1]) return "A";
    if (idx >= ACTIVE_KNOCKOUT_GROUPS.B[0] && idx <= ACTIVE_KNOCKOUT_GROUPS.B[1]) return "B";
    if (idx >= ACTIVE_KNOCKOUT_GROUPS.C[0] && idx <= ACTIVE_KNOCKOUT_GROUPS.C[1]) return "C";
    if (idx >= ACTIVE_KNOCKOUT_GROUPS.D[0] && idx <= ACTIVE_KNOCKOUT_GROUPS.D[1]) return "D";
    return "?";
  };

  const indicesForKnockoutGroup = (letter) => {
    const [s, e] = ACTIVE_KNOCKOUT_GROUPS[letter];
    return Array.from({ length: e - s + 1 }, (_, i) => s + i);
  };

  const indicesForGroups = (...groups) =>
    groups.flatMap((g) => {
      const [s, e] = ACTIVE_KNOCKOUT_GROUPS[g];
      return Array.from({ length: e - s + 1 }, (_, i) => s + i);
    });

  const indicesForKnockoutMatch = (mk) => {
    switch (mk) {
      case "match1":
        return indicesForGroups("A", "B");
      case "match2":
        return indicesForGroups("C", "D");
      case "match3":
        return indicesForGroups("A", "C");
      case "match4":
        return indicesForGroups("B", "D");
      case "match5":
        return indicesForGroups("A", "D");
      case "match6":
        return indicesForGroups("B", "C");
      default:
        return knockoutTeamNames.map((_, i) => i);
    }
  };

  const overallRowsKnockout = useMemo(() => {
    if (!matchData || !knockoutTeamNames || knockoutTeamNames.length === 0) return [];

    const aggregated = knockoutTeamNames.map((_, idx) => {
      const team = getKnockoutTeamName(idx);

      let wwcd = 0;
      let placement = 0;
      let kills = 0;
      let total = 0;

      for (const mk of KNOCKOUT_MATCH_KEYS) {
        const r = matchData?.[mk]?.[idx];
        if (!r) continue;

        wwcd += Number(r.wwcd || 0);
        placement += Number(r.placement || 0);
        kills += Number(r.kills || 0);
        total += Number(r.placement || 0) + Number(r.kills || 0);
      }

      return { team, wwcd, placement, kills, total, origIdx: idx };
    });

    aggregated.sort((a, b) => b.total - a.total);
    return aggregated.map((row, i) => ({ rank: i + 1, ...row }));
  }, [matchData, knockoutTeamNames, getKnockoutTeamName]);

  const overallTotalsByIndexKnockout = useMemo(() => {
    const map = new Map();
    for (const row of overallRowsKnockout) map.set(row.origIdx, row.total);
    return map;
  }, [overallRowsKnockout]);

  /** Finals rows auto from top 16 of knockout */
  useEffect(() => {
    setFinalsRows((prev) => {
      const topTeams = overallRowsKnockout.slice(0, 16);

      return topTeams.map((row) => {
        const existing = prev.find((p) => p.origIdx === row.origIdx);
        if (existing) return { ...existing, team: row.team };

        return {
          origIdx: row.origIdx,
          team: row.team,
          wwcd: 0,
          placement: 0,
          kills: 0,
          total: 0,
        };
      });
    });
  }, [overallRowsKnockout]);



  const finalsDisplayRows = useMemo(() => {
    return [...finalsRows]
      .sort((a, b) => b.total - a.total)
      .map((row, index) => ({ rank: index + 1, ...row }));
  }, [finalsRows]);

  const updateFinalsCell = (origIdx, key, value) => {
    const numericValue = Number(value) || 0;

    setFinalsRows((prev) =>
      prev.map((row) => {
        if (row.origIdx !== origIdx) return row;
        const updated = { ...row, [key]: numericValue };
        updated.total = (updated.placement || 0) + (updated.kills || 0);
        return updated;
      })
    );

    setIsDirty(true);
  };

  /** -------------------------------
   * LOAD DATA (Supabase)
   * ------------------------------*/
  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setLastSavedAt(null);
      return;
    }

    let cancelled = false;

    const load = async () => {
      setLoadingPoints(true);

      try {
        const snapshot = await fetchPointsSnapshot(eventId, game.id);
        if (cancelled) return;

        if (!snapshot) {
          if (hasRound1) setRound1Data(createRound1Template());
          setMatchData(createKnockoutTemplate());
          setFinalsRows([]);
          setLastSavedAt(null);
          setIsDirty(false);
          return;
        }

        // ✅ Round1 load only for Vanguard Arena
        if (hasRound1 && snapshot.round1Data) {
          const next = createRound1Template();

          for (const key of ROUND1_MATCH_KEYS) {
            const savedRows = snapshot.round1Data?.[key] ?? [];

            next[key] = round1InitialRows.map((row, index) => {
              const saved = savedRows[index];
              const placement = Number(saved?.placement ?? 0);
              const kills = Number(saved?.kills ?? 0);

              return {
                team: saved?.team ?? row.team,
                wwcd: Number(saved?.wwcd ?? 0),
                placement,
                kills,
                total: placement + kills,
              };
            });
          }

          setRound1Data(next);

          // ✅ important: load stable names state from match1 so input doesn't flicker
          const namesFromSaved =
            snapshot.round1Data?.r1match1?.map((r, i) => r?.team ?? `Team ${i + 1}`) ??
            Array.from({ length: 72 }, (_, i) => `Team ${i + 1}`);

          setRound1TeamNamesState(namesFromSaved);
        } else if (hasRound1) {
          setRound1Data(createRound1Template());
          setRound1TeamNamesState(Array.from({ length: 72 }, (_, i) => `Team ${i + 1}`));
        }

        // ✅ Knockout load
        if (snapshot.matchData) {
          const next = createKnockoutTemplate();

          for (const key of KNOCKOUT_MATCH_KEYS) {
            const savedRows = snapshot.matchData?.[key] ?? [];

            next[key] = knockoutInitialRows.map((row, index) => {
              const saved = savedRows[index];
              const placement = Number(saved?.placement ?? 0);
              const kills = Number(saved?.kills ?? 0);

              return {
                team: saved?.team ?? row.team,
                wwcd: Number(saved?.wwcd ?? 0),
                placement,
                kills,
                total: placement + kills,
              };
            });
          }

          setMatchData(next);
        } else {
          setMatchData(createKnockoutTemplate());
        }

        // ✅ Finals load
        if (snapshot.finals && snapshot.finals.length > 0) {
          setFinalsRows(
            snapshot.finals
              .filter((r) => r.origIdx !== -1)
              .slice(0, 16)
              .map((row) => {
                const placement = Number(row.placement ?? 0);
                const kills = Number(row.kills ?? 0);

                return {
                  origIdx: row.origIdx,
                  team: row.team ?? `Team ${row.origIdx + 1}`,
                  wwcd: Number(row.wwcd ?? 0),
                  placement,
                  kills,
                  total: Number(row.total ?? placement + kills),
                };
              })
          );
        } else {
          setFinalsRows([]);
        }

        setLastSavedAt(snapshot.updatedAt ?? null);
        setIsDirty(false);
      } catch (error) {
        if (!cancelled) {
          toast.error("Failed to load saved leaderboard");
          console.error(error);
        }
      } finally {
        if (!cancelled) setLoadingPoints(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [
    eventId,
    game.id,
    
  ]);

  /** -------------------------------
   * SAVE DATA (Supabase)
   * ------------------------------*/
  const saveBgmiPoints = async () => {
    try {
      setSavingPoints(true);

      const payload = {
        ...(hasRound1 ? { round1Data } : {}),
        matchData,
        finals: finalsRows.map((r) => ({
          origIdx: r.origIdx,
          team: r.team,
          wwcd: r.wwcd,
          placement: r.placement,
          kills: r.kills,
          total: r.total,
        })),
      };

      await savePointsSnapshot(eventId, game.id, payload);

      setLastSavedAt(new Date().toISOString());
      setIsDirty(false);
      toast.success("Points saved");
    } catch (e) {
      console.error(e);
      toast.error("Failed to save points");
    } finally {
      setSavingPoints(false);
    }
  };

  /** -------------------------------
   * UI HELPERS
   * ------------------------------*/
  const SaveBar = () => {
    if (!canEdit) return null;

    return (
      <div className="flex items-center gap-3 text-sm">
        {isSupabaseConfigured() ? (
          <>
            <div className="text-muted-foreground">
              {lastSavedAt
                ? `Last saved ${formatDistanceToNow(new Date(lastSavedAt))} ago`
                : "Never saved"}
              {isDirty && <span className="ml-2 text-yellow-500">(unsaved)</span>}
            </div>

            <Button size="sm" disabled={!isDirty || savingPoints} onClick={saveBgmiPoints}>
              {savingPoints ? "Saving..." : "Save"}
            </Button>
          </>
        ) : (
          <div className="text-red-500">Supabase not configured</div>
        )}
      </div>
    );
  };

  /** -------------------------------
   * ROUND 1 GROUP MATCH TABLE
   * ------------------------------*/
  const Round1MatchTable = ({ groupLetter, matchKey }) => {
    return (
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-border/50">
              <TableHead className="font-orbitron">#</TableHead>
              <TableHead className="font-orbitron">Team</TableHead>
              <TableHead className="font-orbitron text-right">WWCD!</TableHead>
              <TableHead className="font-orbitron text-right">Placement</TableHead>
              <TableHead className="font-orbitron text-right">Kills</TableHead>
              <TableHead className="font-orbitron text-right">Total</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {indicesForRound1Group(groupLetter).map((origIdx, i) => {
              const row = round1Data?.[matchKey]?.[origIdx];

              return (
                <TableRow key={`${groupLetter}-${matchKey}-${origIdx}`} className="border-border/50">
                  <TableCell className="font-semibold">{i + 1}.</TableCell>

                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-semibold">
                        {groupLetter}
                      </div>

                      {canEdit ? (
                        <Input
                          value={round1TeamNamesState[origIdx] ?? ""}
                          onChange={(e) => updateRound1TeamName(origIdx, e.target.value)}
                        />
                      ) : (
                        <div>{getRound1TeamName(origIdx)}</div>
                      )}
                    </div>
                  </TableCell>

                  <TableCell className="text-right w-24">
                    {canEdit ? (
                      <Input
                        className="text-right"
                        type="number"
                        value={row?.wwcd ?? 0}
                        onChange={(e) => updateRound1Cell(matchKey, origIdx, "wwcd", e.target.value)}
                      />
                    ) : (
                      row?.wwcd ?? 0
                    )}
                  </TableCell>

                  <TableCell className="text-right w-28">
                    {canEdit ? (
                      <Input
                        className="text-right"
                        type="number"
                        value={row?.placement ?? 0}
                        onChange={(e) =>
                          updateRound1Cell(matchKey, origIdx, "placement", e.target.value)
                        }
                      />
                    ) : (
                      row?.placement ?? 0
                    )}
                  </TableCell>

                  <TableCell className="text-right w-24">
                    {canEdit ? (
                      <Input
                        className="text-right"
                        type="number"
                        value={row?.kills ?? 0}
                        onChange={(e) => updateRound1Cell(matchKey, origIdx, "kills", e.target.value)}
                      />
                    ) : (
                      row?.kills ?? 0
                    )}
                  </TableCell>

                  <TableCell className="text-right font-semibold">
                    {(row?.placement || 0) + (row?.kills || 0)}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    );
  };

  /** -------------------------------
   * ROUND 1 GROUP OVERALL TABLE
   * ------------------------------*/
  const Round1OverallTable = ({ groupLetter }) => {
    const rows = round1OverallRowsForGroup(groupLetter);
    const top8OrigIdx = rows.slice(0, 8).map((r) => r.origIdx);
    const top8Set = new Set(top8OrigIdx);

    return (
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-border/50">
              <TableHead className="font-orbitron">#</TableHead>
              <TableHead className="font-orbitron">Team</TableHead>
              <TableHead className="font-orbitron text-right">Total</TableHead>
              <TableHead className="font-orbitron text-right">Status</TableHead>
            </TableRow>
          </TableHeader>

        <TableBody>
            {rows.map((row) => (
              <TableRow key={`r1-overall-${groupLetter}-${row.origIdx}`} className="border-border/50">
                <TableCell className="font-semibold">{row.rank}.</TableCell>
                <TableCell>{row.team}</TableCell>
                <TableCell className="text-right font-semibold">{row.total}</TableCell>
                <TableCell className="text-right font-semibold">
                  {top8Set.has(row.origIdx) ? "✅ Qualified" : "-"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  };

  /** -------------------------------
   * RENDER
   * ------------------------------*/
  return (
    <div>
      <Tabs defaultValue={hasRound1 ? "round1" : "knockout"}>
        <div className="overflow-x-auto pb-2">
          <TabsList className="w-full justify-start sm:w-auto">
            {hasRound1 && <TabsTrigger value="round1">Round 1</TabsTrigger>}
            <TabsTrigger value="knockout">Knockout Stage</TabsTrigger>
            <TabsTrigger value="finals">Finals</TabsTrigger>
          </TabsList>
        </div>

        {/* ================= ROUND 1 ================= */}
        {hasRound1 && (
          <TabsContent value="round1">
            <Tabs defaultValue="group-a">
              <div className="overflow-x-auto pb-2">
                <TabsList className="w-full justify-start sm:w-auto">
                  <TabsTrigger value="group-a">Group A</TabsTrigger>
                  <TabsTrigger value="group-b">Group B</TabsTrigger>
                  <TabsTrigger value="group-c">Group C</TabsTrigger>
                  <TabsTrigger value="group-d">Group D</TabsTrigger>
                  <TabsTrigger value="qualified">Qualified</TabsTrigger>
                </TabsList>
              </div>

              {["A", "B", "C", "D"].map((letter) => (
                <TabsContent key={`r1-group-${letter}`} value={`group-${letter.toLowerCase()}`}>
                  <Card className="glass-card border-primary/20">
                    <CardHeader>
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <CardTitle className="font-orbitron text-2xl">
                          {game.name} — Round 1 Group {letter}
                        </CardTitle>
                        <SaveBar />
                      </div>
                    </CardHeader>

                    <CardContent>
                      <Tabs defaultValue="match1">
                        <div className="overflow-x-auto pb-2">
                          <TabsList className="w-full justify-start sm:w-auto">
                            <TabsTrigger value="match1">Match 1</TabsTrigger>
                            <TabsTrigger value="match2">Match 2</TabsTrigger>
                            <TabsTrigger value="match3">Match 3</TabsTrigger>
                            <TabsTrigger value="overall">Overall</TabsTrigger>
                          </TabsList>
                        </div>

                        <TabsContent value="match1">
                          <Round1MatchTable groupLetter={letter} matchKey="r1match1" />
                        </TabsContent>

                        <TabsContent value="match2">
                          <Round1MatchTable groupLetter={letter} matchKey="r1match2" />
                        </TabsContent>

                        <TabsContent value="match3">
                          <Round1MatchTable groupLetter={letter} matchKey="r1match3" />
                        </TabsContent>

                        <TabsContent value="overall">
                          <div className="mb-3 text-sm text-muted-foreground">
                            ✅ Top <b>8 teams</b> qualify from Group <b>{letter}</b>
                          </div>
                          <Round1OverallTable groupLetter={letter} />
                        </TabsContent>
                      </Tabs>
                    </CardContent>
                  </Card>
                </TabsContent>
              ))}

              <TabsContent value="qualified">
                <Card className="glass-card border-primary/20">
                  <CardHeader>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <CardTitle className="font-orbitron text-2xl">
                        Qualified Teams (Top 8 per group)
                      </CardTitle>
                      <SaveBar />
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="mb-3 text-sm text-muted-foreground">
                      Total Qualified: <b>{qualifiedTeams.length}</b> / 32
                    </div>

                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-border/50">
                            <TableHead className="font-orbitron">#</TableHead>
                            <TableHead className="font-orbitron">Team</TableHead>
                            <TableHead className="font-orbitron text-right">Group</TableHead>
                          </TableRow>
                        </TableHeader>

                        <TableBody>
                          {qualifiedTeams.map((t, i) => (
                            <TableRow key={`qualified-${i}`} className="border-border/50">
                              <TableCell className="font-semibold">{i + 1}.</TableCell>
                              <TableCell>{t.team}</TableCell>
                              <TableCell className="text-right font-semibold">{t.fromGroup}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </TabsContent>
        )}

        {/* ================= KNOCKOUT ================= */}
        <TabsContent value="knockout">
          <Tabs defaultValue="group-a">
            <div className="overflow-x-auto pb-2">
              <TabsList className="w-full justify-start sm:w-auto">
                <TabsTrigger value="group-a">Group A</TabsTrigger>
                <TabsTrigger value="group-b">Group B</TabsTrigger>
                <TabsTrigger value="group-c">Group C</TabsTrigger>
                <TabsTrigger value="group-d">Group D</TabsTrigger>
                <TabsTrigger value="points-table">Points Table</TabsTrigger>
              </TabsList>
            </div>

            {["A", "B", "C", "D"].map((letter) => (
              <TabsContent key={`knockout-group-${letter}`} value={`group-${letter.toLowerCase()}`}>
                <Card className="glass-card border-primary/20">
                  <CardHeader>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <CardTitle className="font-orbitron text-2xl">
                        {game.name} — Knockout Group {letter}
                      </CardTitle>
                      <SaveBar />
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-border/50">
                            <TableHead className="font-orbitron">#</TableHead>
                            <TableHead className="font-orbitron">Team</TableHead>
                            <TableHead className="font-orbitron text-right">Total Points</TableHead>
                          </TableRow>
                        </TableHeader>

                        <TableBody>
                          {indicesForKnockoutGroup(letter).map((origIdx, i) => (
                            <TableRow key={`ko-${letter}-${origIdx}`} className="border-border/50">
                              <TableCell className="font-semibold">{i + 1}.</TableCell>

                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-semibold">
                                    {letter}
                                  </div>
                                  <div>{getKnockoutTeamName(origIdx)}</div>
                                </div>
                              </TableCell>

                              <TableCell className="text-right font-semibold">
                                {overallTotalsByIndexKnockout.get(origIdx) ?? 0}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}

            <TabsContent value="points-table">
              <Card className="glass-card border-primary/20">
                <CardHeader>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <CardTitle className="font-orbitron text-2xl">Knockout Points Table</CardTitle>
                    <SaveBar />
                  </div>
                </CardHeader>

                <CardContent>
                  <Tabs defaultValue="overall">
                    <div className="overflow-x-auto pb-2">
                      <TabsList className="w-full justify-start sm:w-auto">
                        <TabsTrigger value="overall">Overall</TabsTrigger>
                        {KNOCKOUT_MATCH_KEYS.map((k, i) => (
                          <TabsTrigger key={k} value={k}>
                            {`Match ${i + 1}`}
                          </TabsTrigger>
                        ))}
                      </TabsList>
                    </div>

                    <TabsContent value="overall">
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow className="border-border/50">
                              <TableHead className="font-orbitron">#</TableHead>
                              <TableHead className="font-orbitron">Team</TableHead>
                              <TableHead className="font-orbitron text-right">WWCD!</TableHead>
                              <TableHead className="font-orbitron text-right">Placement Point</TableHead>
                              <TableHead className="font-orbitron text-right">Kill Points</TableHead>
                              <TableHead className="font-orbitron text-right">Total Points</TableHead>
                            </TableRow>
                          </TableHeader>

                          <TableBody>
                            {overallRowsKnockout.map((row) => (
                              <TableRow key={`ko-overall-${row.rank}`} className="border-border/50">
                                <TableCell className="font-semibold">{row.rank}.</TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-semibold">
                                      {knockoutGroupLetterForIndex(row.origIdx)}
                                    </div>
                                    <div>{row.team}</div>
                                  </div>
                                </TableCell>
                                <TableCell className="text-right">{row.wwcd}</TableCell>
                                <TableCell className="text-right">{row.placement}</TableCell>
                                <TableCell className="text-right">{row.kills}</TableCell>
                                <TableCell className="text-right font-semibold">{row.total}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </TabsContent>

                    {KNOCKOUT_MATCH_KEYS.map((mk) => (
                      <TabsContent key={mk} value={mk}>
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow className="border-border/50">
                                <TableHead className="font-orbitron">#</TableHead>
                                <TableHead className="font-orbitron">Team</TableHead>
                                <TableHead className="font-orbitron text-right">WWCD!</TableHead>
                                <TableHead className="font-orbitron text-right">Placement Point</TableHead>
                                <TableHead className="font-orbitron text-right">Kill Points</TableHead>
                                <TableHead className="font-orbitron text-right">Total Points</TableHead>
                              </TableRow>
                            </TableHeader>

                            <TableBody>
                              {indicesForKnockoutMatch(mk).map((origIdx, i) => {
                                const row = matchData[mk][origIdx];

                                return (
                                  <TableRow key={`${mk}-${origIdx}`} className="border-border/50">
                                    <TableCell className="font-semibold">{i + 1}.</TableCell>

                                    <TableCell>
                                      <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-semibold">
                                          {knockoutGroupLetterForIndex(origIdx)}
                                        </div>
                                        <div>{row.team}</div>
                                      </div>
                                    </TableCell>

                                    <TableCell className="text-right w-28">
                                      {canEdit ? (
                                        <Input
                                          className="text-right"
                                          type="number"
                                          value={row.wwcd}
                                          onChange={(e) =>
                                            updateKnockoutCell(mk, origIdx, "wwcd", e.target.value)
                                          }
                                        />
                                      ) : (
                                        row.wwcd
                                      )}
                                    </TableCell>

                                    <TableCell className="text-right w-36">
                                      {canEdit ? (
                                        <Input
                                          className="text-right"
                                          type="number"
                                          value={row.placement}
                                          onChange={(e) =>
                                            updateKnockoutCell(mk, origIdx, "placement", e.target.value)
                                          }
                                        />
                                      ) : (
                                        row.placement
                                      )}
                                    </TableCell>

                                    <TableCell className="text-right w-32">
                                      {canEdit ? (
                                        <Input
                                          className="text-right"
                                          type="number"
                                          value={row.kills}
                                          onChange={(e) =>
                                            updateKnockoutCell(mk, origIdx, "kills", e.target.value)
                                          }
                                        />
                                      ) : (
                                        row.kills
                                      )}
                                    </TableCell>

                                    <TableCell className="text-right w-32">
                                      {(row.placement || 0) + (row.kills || 0)}
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                            </TableBody>
                          </Table>
                        </div>
                      </TabsContent>
                    ))}
                  </Tabs>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* ================= FINALS ================= */}
        <TabsContent value="finals">
          <Card className="glass-card border-primary/20">
            <CardHeader>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle className="font-orbitron text-2xl">{game.name} — Finals</CardTitle>
                <SaveBar />
              </div>
            </CardHeader>

            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border/50">
                      <TableHead className="font-orbitron">#</TableHead>
                      <TableHead className="font-orbitron">Team</TableHead>
                      <TableHead className="font-orbitron text-right">WWCD!</TableHead>
                      <TableHead className="font-orbitron text-right">Placement Point</TableHead>
                      <TableHead className="font-orbitron text-right">Kill Points</TableHead>
                      <TableHead className="font-orbitron text-right">Total Points</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {finalsDisplayRows.map((row) => (
                      <TableRow key={`finals-${row.origIdx}`} className="border-border/50">
                        <TableCell className="font-semibold">{row.rank}.</TableCell>

                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-semibold">
                              {knockoutGroupLetterForIndex(row.origIdx)}
                            </div>
                            <div>{row.team}</div>
                          </div>
                        </TableCell>

                        <TableCell className="text-right w-28">
                          {canEdit ? (
                            <Input
                              className="text-right"
                              type="number"
                              value={row.wwcd}
                              onChange={(e) => updateFinalsCell(row.origIdx, "wwcd", e.target.value)}
                            />
                          ) : (
                            row.wwcd
                          )}
                        </TableCell>

                        <TableCell className="text-right w-36">
                          {canEdit ? (
                            <Input
                              className="text-right"
                              type="number"
                              value={row.placement}
                              onChange={(e) =>
                                updateFinalsCell(row.origIdx, "placement", e.target.value)
                              }
                            />
                          ) : (
                            row.placement
                          )}
                        </TableCell>

                        <TableCell className="text-right w-32">
                          {canEdit ? (
                            <Input
                              className="text-right"
                              type="number"
                              value={row.kills}
                              onChange={(e) => updateFinalsCell(row.origIdx, "kills", e.target.value)}
                            />
                          ) : (
                            row.kills
                          )}
                        </TableCell>

                        <TableCell className="text-right font-semibold">{row.total}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {loadingPoints && (
        <div className="mt-3 text-sm text-muted-foreground">
          Loading saved points...
        </div>
      )}
    </div>
  );
};

export default LeaderboardBgmi;
