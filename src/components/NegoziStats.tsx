import React from 'react';
import { NEGOZI } from '@site/src/data/negozi';

/**
 * Editorial meta-strip with shop totals (Negozi / Regioni / Città).
 * Counts are derived from the live NEGOZI dataset.
 */
const NegoziStats: React.FC = () => {
  const total = NEGOZI.length;
  const regions = new Set(NEGOZI.map((s) => s.region)).size;
  const cities = new Set(NEGOZI.map((s) => s.city)).size;

  return (
    <div className="pg-meta-strip">
      <div>
        <div className="l">Negozi</div>
        <div className="v">{total}</div>
      </div>
      <div>
        <div className="l">Regioni</div>
        <div className="v">{regions}</div>
      </div>
      <div>
        <div className="l">Città</div>
        <div className="v">{cities}</div>
      </div>
    </div>
  );
};

export default NegoziStats;
