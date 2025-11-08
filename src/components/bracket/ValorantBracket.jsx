import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.jsx";
import MatchCard from "./MatchCard.jsx";

const ValorantBracket = ({ bracket }) => {
  if (!bracket) return null;
  return (
    <div>
      <h3 className="font-orbitron text-xl mb-4">Valorant Bracket</h3>
      {bracket.columns.map((col, i) => (
        <div key={i} className="mb-4">
          <h4 className="font-semibold mb-2">{col.title}</h4>
          <div className="grid gap-3">
            {col.matches.map((m, idx) => (
              <MatchCard key={idx} match={m} colIndex={i} matchIndex={idx} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ValorantBracket;
