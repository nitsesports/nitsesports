
export type GroupLetter = "A" | "B" | "C" | "D";

export type SimpleGroupRow = {
  rank: number;
  team: string;
  points: number;
  gamesPlayed?: number;
  gamesWon?: number;
  originalIndex?: number;
};

export type BracketMatch = {
  teamA: string;
  teamB: string;
  scoreA: number;
  scoreB: number;
  status: "upcoming" | "live" | "completed";
};

export type BracketColumn = {
  title: string;
  matches: BracketMatch[];
};

export type Bracket = {
  columns: BracketColumn[];
  winner?: string;
};

export type Game = {
  id: string;
  name: string;
  image: string;
  participants: string;
  gameHead: { name: string; phone: string };
  format: string;
  rankings: Array<{
    rank: number;
    team: string;
    points: number;
    prize: string;
  }>;
};