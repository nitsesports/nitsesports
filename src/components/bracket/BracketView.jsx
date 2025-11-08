import MatchCard from "./MatchCard.jsx";

const BracketView = ({ bracket, onScoreChange, colOffset = 0 }) => {
  if (!bracket || !Array.isArray(bracket.columns)) return null;

  return (
    <div className="overflow-x-auto">
      <div className="grid grid-flow-col auto-cols-max gap-6 min-w-full">
        {bracket.columns.map((col, i) => (
          <div key={i} className="min-w-[240px]">
            <h4 className="font-semibold mb-2 text-sm text-muted-foreground">{col.title}</h4>
            <div className="grid gap-3">
              {col.matches.map((m, idx) => (
                <MatchCard
                  key={idx}
                  match={m}
                  colIndex={i + colOffset}
                  matchIndex={idx}
                  onScoreChange={onScoreChange}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BracketView;
