import { useState, useEffect } from "react";
import BracketView from "./BracketView.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.jsx";
import { Badge } from "@/components/ui/badge.jsx";
import { Button } from "@/components/ui/button.jsx";
import { Input } from "@/components/ui/input.jsx";
import { Trash2, Plus, Edit2, Check, X, ChevronDown, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast.js";
import { saveBracketData, fetchBracketData } from "@/data/bracketService.js";
import { useParams } from "react-router-dom";

const defaultTeams = [
  "One man army", "Mani", "Kanya rasi 007", "Backtracker",
"Knight", "Cricket-Paglu", "Stump smashers", "Virat Coolie",
"Hobart Hurricanes", "Team Sindoor", "Kolkata Blasters", "TEAM-EAGLE",
"Dominators", "RCB1", "WarriorsX", "Sher-e-saltanat",
"Prashun_27", "Tigers", "Kakashi", "STRIKERS",
"Nakul", "Shadow Scorchers", "Team CSK", "RCB",
"Brutal 11", "What about me", "Destroyers", "Smashers",
"CSK1", "The Green Flags", "Subhasish Saikia", "CricFire"
];

const RCBracket = ({ canEdit = false }) => {
  const params = useParams();
  const { toast } = useToast();
  const eventId = params.eventId;
  const gameId = params.gameId;

  const [expandedColumn, setExpandedColumn] = useState(null);
  const [teams, setTeams] = useState(defaultTeams);
  const [newTeamName, setNewTeamName] = useState("");
  const [editingTeamIndex, setEditingTeamIndex] = useState(null);
  const [editingTeamValue, setEditingTeamValue] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const [bracket, setBracket] = useState(() => {
    const rounds = generateInitialBracket(defaultTeams);
    return rounds;
  });

  const [finalStage, setFinalStage] = useState({
    semifinals: [
      { id: "sf1", teamA: "TBD", teamB: "TBD", scoreA: 0, scoreB: 0, status: "upcoming", time: null },
      { id: "sf2", teamA: "TBD", teamB: "TBD", scoreA: 0, scoreB: 0, status: "upcoming", time: null },
    ],
    finals: { id: "final", teamA: "TBD", teamB: "TBD", scoreA: 0, scoreB: 0, status: "upcoming", time: null },
    placementMatches: {
      thirdPlace: { id: "3rd", teamA: "TBD", teamB: "TBD", scoreA: 0, scoreB: 0, status: "upcoming", time: null },
      fifthSixthBracket: [
        { id: "5-6-match1", teamA: "TBD", teamB: "TBD", scoreA: 0, scoreB: 0, status: "upcoming", time: null },
        { id: "5-6-match2", teamA: "TBD", teamB: "TBD", scoreA: 0, scoreB: 0, status: "upcoming", time: null },
        { id: "5-6-final", teamA: "TBD", teamB: "TBD", scoreA: 0, scoreB: 0, status: "upcoming", time: null }
      ]
    }
  });

  // Load saved bracket data on mount
  useEffect(() => {
    const loadBracketData = async () => {
      if (!eventId || !gameId) {
        setIsLoading(false);
        return;
      }

      try {
        const savedData = await fetchBracketData(eventId, gameId);
        if (savedData) {
          setTeams(savedData.teams || defaultTeams);
          if (savedData.bracket) setBracket(savedData.bracket);
          if (savedData.finalStage) setFinalStage(savedData.finalStage);
        }
      } catch (err) {
        console.error("Error loading bracket data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadBracketData();
  }, [eventId, gameId]);

  // Save bracket data to Supabase
  const handleSaveData = async () => {
    if (!eventId || !gameId) {
      toast({
        title: "Error",
        description: "Event ID or Game ID is missing",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      await saveBracketData(eventId, gameId, {
        teams,
        bracket,
        finalStage,
      });
      toast({
        title: "Success",
        description: "Bracket data saved to Supabase",
      });
    } catch (err) {
      console.error("Error saving bracket data:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to save bracket data",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  function generateInitialBracket(teamList) {
    const cols = [
      {
        title: "Round 1 (32 Teams)",
        matches: Array(16).fill(null).map((_, i) => ({
          teamA: teamList[i * 2] || "TBD",
          teamB: teamList[i * 2 + 1] || "TBD",
          scoreA: 0,
          scoreB: 0,
          status: "upcoming",
          time: null
        }))
      },
      {
        title: "Round 2 (16 Teams)",
        matches: Array(8).fill(null).map(() => ({
          teamA: "TBD",
          teamB: "TBD",
          scoreA: 0,
          scoreB: 0,
          status: "upcoming",
          time: null
        }))
      },
      {
        title: "Quarterfinals (8 Teams)",
        matches: Array(4).fill(null).map(() => ({
          teamA: "TBD",
          teamB: "TBD",
          scoreA: 0,
          scoreB: 0,
          status: "upcoming",
          time: null
        }))
      }
    ];
    return { columns: cols };
  }

  const handleAddTeam = () => {
    if (newTeamName.trim()) {
      const updatedTeams = [...teams, newTeamName.trim()];
      setTeams(updatedTeams);
      setNewTeamName("");
      setBracket(generateInitialBracket(updatedTeams));
    }
  };

  const handleEditTeam = (index) => {
    setEditingTeamIndex(index);
    setEditingTeamValue(teams[index]);
  };

  const handleSaveTeam = (index) => {
    if (editingTeamValue.trim()) {
      const updatedTeams = [...teams];
      updatedTeams[index] = editingTeamValue.trim();
      setTeams(updatedTeams);
      setBracket(generateInitialBracket(updatedTeams));
      setEditingTeamIndex(null);
      setEditingTeamValue("");
    }
  };

  const handleDeleteTeam = (index) => {
    const updatedTeams = teams.filter((_, i) => i !== index);
    setTeams(updatedTeams);
    setBracket(generateInitialBracket(updatedTeams));
  };

  const getWinner = (match) => {
    if (match.scoreA === match.scoreB) return null;
    return match.scoreA > match.scoreB ? match.teamA : match.teamB;
  };

  const propagateWinnersToNextRound = (updatedBracket, columnIndex, finalStage) => {
    // For each match in current column, get winner and place in next round
    const currentMatches = updatedBracket.columns[columnIndex].matches;

    if (columnIndex < updatedBracket.columns.length - 1) {
      // Not the last column, propagate to next column in bracket
      const nextColumn = updatedBracket.columns[columnIndex + 1];

      currentMatches.forEach((match, matchIndex) => {
        const winner = getWinner(match);
        const nextMatchIndex = Math.floor(matchIndex / 2);
        const isTeamA = matchIndex % 2 === 0;

        if (nextColumn.matches[nextMatchIndex]) {
          if (winner) {
            if (isTeamA) {
              nextColumn.matches[nextMatchIndex].teamA = winner;
            } else {
              nextColumn.matches[nextMatchIndex].teamB = winner;
            }
          } else {
            if (isTeamA) {
              nextColumn.matches[nextMatchIndex].teamA = "TBD";
            } else {
              nextColumn.matches[nextMatchIndex].teamB = "TBD";
            }
          }
        }
      });

      // Recursively propagate to next rounds
      if (columnIndex + 1 < updatedBracket.columns.length - 1) {
        return propagateWinnersToNextRound(updatedBracket, columnIndex + 1, finalStage);
      }
    } else if (columnIndex === updatedBracket.columns.length - 1) {
      // Last column (Quarterfinals) - propagate to finals and placement matches
      const winners = currentMatches.map(match => getWinner(match) || "TBD");
      const losers = currentMatches.map(match => {
        const winner = getWinner(match);
        if (winner === match.teamA) return match.teamB;
        if (winner === match.teamB) return match.teamA;
        return "TBD";
      });

      if (finalStage) {
        // Update semifinals with quarterfinal winners
        finalStage.semifinals[0].teamA = winners[0] || "TBD";
        finalStage.semifinals[0].teamB = winners[1] || "TBD";
        finalStage.semifinals[1].teamA = winners[2] || "TBD";
        finalStage.semifinals[1].teamB = winners[3] || "TBD";

        // Update 5th/6th place bracket with quarterfinal losers
        finalStage.placementMatches.fifthSixthBracket[0].teamA = losers[0] || "TBD";
        finalStage.placementMatches.fifthSixthBracket[0].teamB = losers[1] || "TBD";
        finalStage.placementMatches.fifthSixthBracket[1].teamA = losers[2] || "TBD";
        finalStage.placementMatches.fifthSixthBracket[1].teamB = losers[3] || "TBD";
      }
    }

    return updatedBracket;
  };

  const handleScoreChange = (colIndex, matchIndex, scoreA, scoreB) => {
    if (!canEdit) return;

    const newBracket = { ...bracket };
    // Update the current match score
    newBracket.columns[colIndex].matches[matchIndex] = {
      ...newBracket.columns[colIndex].matches[matchIndex],
      scoreA,
      scoreB
    };

    // Create a temp finalStage for propagation
    const tempFinalStage = { ...finalStage };

    // Propagate winners to next rounds
    const updatedBracket = propagateWinnersToNextRound(newBracket, colIndex, tempFinalStage);

    // Update both bracket and finals
    setBracket(updatedBracket);

    // If quarterfinals were updated, update finals state
    if (colIndex === newBracket.columns.length - 1) {
      setFinalStage(tempFinalStage);
    }
  };

  const handleFinalScoreChange = (stage, matchId, scoreA, scoreB) => {
    if (!canEdit) return;

    setFinalStage(prev => {
      if (stage === "semifinals") {
        const updatedSemifinals = prev.semifinals.map(match =>
          match.id === matchId ? { ...match, scoreA, scoreB } : match
        );

        // Get winners and losers from semifinals
        const winner1 = getWinner(updatedSemifinals[0]);
        const loser1 = updatedSemifinals[0].scoreA === updatedSemifinals[0].scoreB
          ? "TBD"
          : updatedSemifinals[0].scoreA > updatedSemifinals[0].scoreB
            ? updatedSemifinals[0].teamB
            : updatedSemifinals[0].teamA;

        const winner2 = getWinner(updatedSemifinals[1]);
        const loser2 = updatedSemifinals[1].scoreA === updatedSemifinals[1].scoreB
          ? "TBD"
          : updatedSemifinals[1].scoreA > updatedSemifinals[1].scoreB
            ? updatedSemifinals[1].teamB
            : updatedSemifinals[1].teamA;

        // Update 3rd place match with semifinal losers
        const updatedPlacementMatches = { ...prev.placementMatches };
        updatedPlacementMatches.thirdPlace = {
          ...updatedPlacementMatches.thirdPlace,
          teamA: loser1 || "TBD",
          teamB: loser2 || "TBD"
        };

        return {
          ...prev,
          semifinals: updatedSemifinals,
          finals: {
            ...prev.finals,
            teamA: winner1 || "TBD",
            teamB: winner2 || "TBD"
          },
          placementMatches: updatedPlacementMatches
        };
      } else if (stage === "finals") {
        return {
          ...prev,
          finals: { ...prev.finals, scoreA, scoreB }
        };
      } else if (stage === "thirdPlace") {
        return {
          ...prev,
          placementMatches: {
            ...prev.placementMatches,
            thirdPlace: { ...prev.placementMatches.thirdPlace, scoreA, scoreB }
          }
        };
      } else if (stage === "fifthSixthBracket") {
        const updatedFifthSixth = prev.placementMatches.fifthSixthBracket.map(match =>
          match.id === matchId ? { ...match, scoreA, scoreB } : match
        );

        // Get winners from first two matches
        const winner1 = getWinner(updatedFifthSixth[0]);
        const winner2 = getWinner(updatedFifthSixth[1]);

        // Update final 5-6 match with winners
        updatedFifthSixth[2] = {
          ...updatedFifthSixth[2],
          teamA: winner1 || "TBD",
          teamB: winner2 || "TBD"
        };

        return {
          ...prev,
          placementMatches: {
            ...prev.placementMatches,
            fifthSixthBracket: updatedFifthSixth
          }
        };
      }
      return prev;
    });
  };

  const columns = [
    {
      id: "teams",
      label: "Teams",
      count: teams.length,
      icon: "👥"
    },
    {
      id: "elimination",
      label: "Elimination",
      count: 28,
      icon: "🏆"
    },
    {
      id: "finals",
      label: "Finals",
      count: 3,
      icon: "⭐"
    }
  ];

  if (isLoading) {
    return (
      <Card className="glass-card border-border/30 bg-black/50">
        <CardHeader>
          <CardTitle className="font-orbitron">Loading bracket data...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Admin Controls */}
      {canEdit && (
        <div className="bg-gradient-to-r from-yellow-600/20 to-yellow-600/5 border border-yellow-500/30 rounded-lg p-4 flex items-center justify-between">
          <p className="text-sm text-yellow-400 font-semibold">✓ Admin Mode: You can edit and save bracket data</p>
          <Button
            onClick={handleSaveData}
            disabled={isSaving}
            className="bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? "Saving..." : "Save Data"}
          </Button>
        </div>
      )}

      {/* Column Headers - Top Tab Navigation */}
      <div className="grid grid-cols-3 gap-3">
        {columns.map((col) => (
          <button
            key={col.id}
            onClick={() => setExpandedColumn(expandedColumn === col.id ? null : col.id)}
            className={`transition-all duration-300 rounded-lg border-2 p-4 text-center font-orbitron cursor-pointer ${
              expandedColumn === col.id
                ? "bg-gradient-to-r from-yellow-600/30 to-yellow-600/10 border-yellow-500 shadow-lg shadow-yellow-500/20"
                : "bg-black/50 border-border/40 hover:border-yellow-400/50"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <span className="text-2xl">{col.icon}</span>
              <div className="text-left">
                <p className="text-sm text-muted-foreground">{col.label}</p>
                <p className="text-lg font-bold text-yellow-400">{col.count}</p>
              </div>
            </div>
            <ChevronDown
              className={`w-4 h-4 mx-auto mt-2 transition-transform ${
                expandedColumn === col.id ? "rotate-180" : ""
              }`}
            />
          </button>
        ))}
      </div>

      {/* Teams Column Content */}
      {expandedColumn === "teams" && (
        <Card className="glass-card border-border/30 bg-black/50 border-yellow-500/50 shadow-lg shadow-yellow-500/10">
          <CardHeader>
            <CardTitle className="font-orbitron text-2xl">Teams ({teams.length})</CardTitle>
            <p className="text-sm text-muted-foreground mt-2">All participating teams</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {canEdit && (
              <div className="flex gap-2">
                <Input
                  placeholder="Add new team..."
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleAddTeam()}
                  className="flex-1"
                />
                <Button onClick={handleAddTeam} className="bg-yellow-600 hover:bg-yellow-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add
                </Button>
              </div>
            )}
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {teams.map((team, index) => (
                <div key={index} className="relative">
                  {editingTeamIndex === index ? (
                    <div className="flex gap-2">
                      <Input
                        value={editingTeamValue}
                        onChange={(e) => setEditingTeamValue(e.target.value)}
                        className="flex-1"
                        autoFocus
                      />
                      <button
                        onClick={() => handleSaveTeam(index)}
                        className="p-2 text-green-400 hover:bg-green-400/20 rounded"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setEditingTeamIndex(null)}
                        className="p-2 text-red-400 hover:bg-red-400/20 rounded"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-border/40 rounded-lg p-3 flex items-center justify-between group hover:border-yellow-400/50 transition">
                      <span className="truncate font-medium">{team}</span>
                      {canEdit && (
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                          <button
                            onClick={() => handleEditTeam(index)}
                            className="p-1.5 text-blue-400 hover:bg-blue-400/20 rounded"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteTeam(index)}
                            className="p-1.5 text-red-400 hover:bg-red-400/20 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Elimination Column Content */}
      {expandedColumn === "elimination" && (
        <Card className="glass-card border-border/30 bg-black/50 border-yellow-500/50 shadow-lg shadow-yellow-500/10">
          <CardHeader>
            <CardTitle className="font-orbitron text-2xl">Single Elimination Bracket</CardTitle>
            <p className="text-sm text-muted-foreground mt-2">32 teams compete to reach final 4</p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Bracket Columns */}
            <div className="bg-black/30 border border-border/20 rounded-lg p-6 overflow-x-auto">
              <BracketView 
                bracket={bracket} 
                onScoreChange={canEdit ? handleScoreChange : null}
              />
            </div>

            {/* Subcolumns Info */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-blue-950/30 border border-blue-400/30 rounded-lg p-4">
                <h4 className="font-orbitron text-blue-300 font-semibold mb-2">Round 1</h4>
                <p className="text-xs text-muted-foreground">16 matches</p>
                <p className="text-xs text-muted-foreground">32 → 16 teams</p>
              </div>
              <div className="bg-purple-950/30 border border-purple-400/30 rounded-lg p-4">
                <h4 className="font-orbitron text-purple-300 font-semibold mb-2">Round 2</h4>
                <p className="text-xs text-muted-foreground">8 matches</p>
                <p className="text-xs text-muted-foreground">16 → 8 teams</p>
              </div>
              <div className="bg-pink-950/30 border border-pink-400/30 rounded-lg p-4">
                <h4 className="font-orbitron text-pink-300 font-semibold mb-2">Quarterfinals</h4>
                <p className="text-xs text-muted-foreground">4 matches</p>
                <p className="text-xs text-muted-foreground">8 → 4 teams</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Finals Column Content */}
      {expandedColumn === "finals" && (
        <Card className="glass-card border-border/30 bg-black/50 border-yellow-500/50 shadow-lg shadow-yellow-500/10">
          <CardHeader>
            <CardTitle className="font-orbitron text-2xl">Final Stage (Top 6)</CardTitle>
            <p className="text-sm text-muted-foreground mt-2">Semifinals, Championship, and Placement Matches</p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Semifinals */}
            <div className="space-y-4">
              <h4 className="font-orbitron text-lg text-cyan-400">Semifinals (4 Teams → 2 Teams)</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {finalStage.semifinals.map((match, idx) => (
                  <div key={match.id} className="rounded-md border border-border/40 bg-black/80 p-4">
                    <p className="text-sm text-muted-foreground mb-3 font-semibold">Semifinal {idx + 1}</p>

                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{match.teamA}</span>
                      {canEdit ? (
                        <Input
                          type="number"
                          className="w-12 h-8 text-right bg-orange-500 text-black border-none rounded font-bold"
                          value={match.scoreA}
                          onChange={(e) => handleFinalScoreChange("semifinals", match.id, Number(e.target.value) || 0, match.scoreB)}
                        />
                      ) : (
                        <span className="rounded bg-orange-500 px-2 py-1 font-orbitron text-black">{match.scoreA}</span>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="font-medium">{match.teamB}</span>
                      {canEdit ? (
                        <Input
                          type="number"
                          className="w-12 h-8 text-right bg-orange-500 text-black border-none rounded font-bold"
                          value={match.scoreB}
                          onChange={(e) => handleFinalScoreChange("semifinals", match.id, match.scoreA, Number(e.target.value) || 0)}
                        />
                      ) : (
                        <span className="rounded bg-orange-500 px-2 py-1 font-orbitron text-black">{match.scoreB}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Finals */}
            <div className="space-y-4">
              <h4 className="font-orbitron text-lg text-yellow-400">Championship Finals (2 Teams → 1st Place)</h4>
              <div className="rounded-md border-2 border-yellow-600/50 bg-gradient-to-br from-yellow-600/20 to-yellow-600/5 p-6">
                <p className="text-yellow-400 font-semibold mb-4">Grand Finals</p>

                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold text-lg">{finalStage.finals.teamA}</span>
                  {canEdit ? (
                    <Input
                      type="number"
                      className="w-14 h-10 text-right bg-yellow-500 text-black border-none rounded font-bold text-lg"
                      value={finalStage.finals.scoreA}
                      onChange={(e) => handleFinalScoreChange("finals", "final", Number(e.target.value) || 0, finalStage.finals.scoreB)}
                    />
                  ) : (
                    <span className="rounded bg-yellow-500 px-3 py-2 font-orbitron text-black font-bold text-lg">{finalStage.finals.scoreA}</span>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-bold text-lg">{finalStage.finals.teamB}</span>
                  {canEdit ? (
                    <Input
                      type="number"
                      className="w-14 h-10 text-right bg-yellow-500 text-black border-none rounded font-bold text-lg"
                      value={finalStage.finals.scoreB}
                      onChange={(e) => handleFinalScoreChange("finals", "final", finalStage.finals.scoreA, Number(e.target.value) || 0)}
                    />
                  ) : (
                    <span className="rounded bg-yellow-500 px-3 py-2 font-orbitron text-black font-bold text-lg">{finalStage.finals.scoreB}</span>
                  )}
                </div>
              </div>
            </div>

            {/* 3rd Place Match */}
            <div className="space-y-4">
              <h4 className="font-orbitron text-lg text-amber-500">3rd Place Match (Bronze Medal)</h4>
              <div className="rounded-md border border-amber-600/50 bg-gradient-to-br from-amber-600/20 to-amber-600/5 p-4">
                <p className="text-amber-400 font-semibold mb-3">3rd vs 4th Place</p>

                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{finalStage.placementMatches.thirdPlace.teamA}</span>
                  {canEdit ? (
                    <Input
                      type="number"
                      className="w-12 h-8 text-right bg-amber-500 text-black border-none rounded font-bold"
                      value={finalStage.placementMatches.thirdPlace.scoreA}
                      onChange={(e) => handleFinalScoreChange("thirdPlace", "3rd", Number(e.target.value) || 0, finalStage.placementMatches.thirdPlace.scoreB)}
                    />
                  ) : (
                    <span className="rounded bg-amber-500 px-2 py-1 font-orbitron text-black text-sm font-bold">{finalStage.placementMatches.thirdPlace.scoreA}</span>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-medium">{finalStage.placementMatches.thirdPlace.teamB}</span>
                  {canEdit ? (
                    <Input
                      type="number"
                      className="w-12 h-8 text-right bg-amber-500 text-black border-none rounded font-bold"
                      value={finalStage.placementMatches.thirdPlace.scoreB}
                      onChange={(e) => handleFinalScoreChange("thirdPlace", "3rd", finalStage.placementMatches.thirdPlace.scoreA, Number(e.target.value) || 0)}
                    />
                  ) : (
                    <span className="rounded bg-amber-500 px-2 py-1 font-orbitron text-black text-sm font-bold">{finalStage.placementMatches.thirdPlace.scoreB}</span>
                  )}
                </div>
              </div>
            </div>

            {/* 5th/6th Place Bracket */}
            <div className="space-y-4">
              <h4 className="font-orbitron text-lg text-blue-400">5th/6th Place Bracket</h4>
              <div className="space-y-3">
                {/* First two matches */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {finalStage.placementMatches.fifthSixthBracket.slice(0, 2).map((match, idx) => (
                    <div key={match.id} className="rounded-md border border-blue-400/30 bg-blue-950/30 p-4">
                      <p className="text-sm text-blue-300 mb-3 font-semibold">Quarterfinal Losers Match {idx + 1}</p>

                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">{match.teamA}</span>
                        {canEdit ? (
                          <Input
                            type="number"
                            className="w-12 h-8 text-right bg-blue-500 text-black border-none rounded font-bold"
                            value={match.scoreA}
                            onChange={(e) => handleFinalScoreChange("fifthSixthBracket", match.id, Number(e.target.value) || 0, match.scoreB)}
                          />
                        ) : (
                          <span className="rounded bg-blue-500 px-2 py-1 font-orbitron text-black text-sm">{match.scoreA}</span>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">{match.teamB}</span>
                        {canEdit ? (
                          <Input
                            type="number"
                            className="w-12 h-8 text-right bg-blue-500 text-black border-none rounded font-bold"
                            value={match.scoreB}
                            onChange={(e) => handleFinalScoreChange("fifthSixthBracket", match.id, match.scoreA, Number(e.target.value) || 0)}
                          />
                        ) : (
                          <span className="rounded bg-blue-500 px-2 py-1 font-orbitron text-black text-sm">{match.scoreB}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Final 5-6 match */}
                <div className="rounded-md border border-blue-600/50 bg-gradient-to-br from-blue-600/20 to-blue-600/5 p-4">
                  <p className="text-blue-400 font-semibold mb-3">5th vs 6th Place Final</p>

                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{finalStage.placementMatches.fifthSixthBracket[2].teamA}</span>
                    {canEdit ? (
                      <Input
                        type="number"
                        className="w-12 h-8 text-right bg-blue-500 text-black border-none rounded font-bold"
                        value={finalStage.placementMatches.fifthSixthBracket[2].scoreA}
                        onChange={(e) => handleFinalScoreChange("fifthSixthBracket", finalStage.placementMatches.fifthSixthBracket[2].id, Number(e.target.value) || 0, finalStage.placementMatches.fifthSixthBracket[2].scoreB)}
                      />
                    ) : (
                      <span className="rounded bg-blue-500 px-2 py-1 font-orbitron text-black font-bold">{finalStage.placementMatches.fifthSixthBracket[2].scoreA}</span>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="font-medium">{finalStage.placementMatches.fifthSixthBracket[2].teamB}</span>
                    {canEdit ? (
                      <Input
                        type="number"
                        className="w-12 h-8 text-right bg-blue-500 text-black border-none rounded font-bold"
                        value={finalStage.placementMatches.fifthSixthBracket[2].scoreB}
                        onChange={(e) => handleFinalScoreChange("fifthSixthBracket", finalStage.placementMatches.fifthSixthBracket[2].id, finalStage.placementMatches.fifthSixthBracket[2].scoreA, Number(e.target.value) || 0)}
                      />
                    ) : (
                      <span className="rounded bg-blue-500 px-2 py-1 font-orbitron text-black font-bold">{finalStage.placementMatches.fifthSixthBracket[2].scoreB}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tournament Summary */}
      {!expandedColumn && (
        <Card className="glass-card border-border/30 bg-gradient-to-r from-purple-900/20 to-pink-900/20">
          <CardHeader>
            <CardTitle className="font-orbitron text-lg">Tournament Overview</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-yellow-400">{teams.length}</p>
              <p className="text-xs text-muted-foreground">Total Teams</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-cyan-400">28</p>
              <p className="text-xs text-muted-foreground">Total Matches</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-400">4</p>
              <p className="text-xs text-muted-foreground">Final Teams</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-pink-400">1</p>
              <p className="text-xs text-muted-foreground">Champion</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RCBracket;
