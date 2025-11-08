import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.jsx";
import { AdvanceCard, MatchCard } from "./MatchCard.jsx";

const CodBracket = ({ bracket }) => {
  if (!bracket) return null;
  return (
    <div>
      <h3 className="font-orbitron text-xl mb-4">COD Bracket</h3>
      <div className="grid gap-4">
        {bracket.columns.map((col, i) => (
          <div key={i}>
            <h4 className="font-semibold mb-2">{col.title}</h4>
            <div className="grid gap-3">
              {col.matches.map((m, idx) => (
                <MatchCard key={idx} match={m} colIndex={i} matchIndex={idx} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CodBracket;
