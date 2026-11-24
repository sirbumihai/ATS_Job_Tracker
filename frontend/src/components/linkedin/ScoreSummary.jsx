import React from 'react';
import { AlertTriangle } from 'lucide-react';
import Card from '../ui/Card';
import ScoreRing from '../ui/ScoreRing';
import ScoreBar from '../ui/ScoreBar';

// Fiecare categorie din scoreBreakdown are maximum 20 de puncte.
const CATEGORY_MAX = 20;

/** Coloana de scor: inel /100, bare pe categorii (eticheta + punctaj) si lipsurile critice. */
export default function ScoreSummary({ result }) {
  const breakdown = result?.scoreBreakdown ? Object.entries(result.scoreBreakdown) : [];
  const gaps = result?.criticalGaps || [];

  return (
    <Card className="space-y-5">
      <div className="flex items-center gap-4">
        <ScoreRing value={result?.overallScore || 85} label="Scor profil" size={96} data-testid="score-ring" />
        <div className="min-w-0">
          <h2 className="font-serif text-lg font-medium text-neutral-950 leading-tight">Scor profil</h2>
          {result?.scoreGrade && <p className="text-sm text-neutral-500 mt-0.5">{result.scoreGrade}</p>}
        </div>
      </div>

      {breakdown.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-neutral-100">
          {breakdown.map(([label, value]) => (
            <ScoreBar key={label} label={label} value={value} max={CATEGORY_MAX} />
          ))}
        </div>
      )}

      {gaps.length > 0 && (
        <div className="pt-4 border-t border-neutral-100">
          <h3 className="flex items-center gap-1.5 text-sm font-medium text-neutral-900">
            <AlertTriangle className="w-4 h-4 text-neutral-500" />
            Lipsuri critice ({gaps.length})
          </h3>
          <ul className="mt-2 space-y-1.5">
            {gaps.map((gap, i) => (
              <li key={i} className="text-sm text-neutral-600 flex items-start gap-2">
                <span className="w-1 h-1 rounded-full bg-neutral-400 shrink-0 mt-2" />
                <span>{gap}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}
