import React from 'react';
import type { GraphNode, DrilldownNode, GraphData } from './types';
import styles from './CucinaGiapponese.module.css';

type AnyNode = GraphNode | DrilldownNode;

interface Props {
  node: AnyNode;
  data: GraphData;
}

function isGraphNode(n: AnyNode): n is GraphNode {
  return 'type' in n && 'level' in n;
}

export default function NodeDetail({ node, data }: Props) {
  const examples: string[] = node.examples ?? [];
  const notes: string = (node.notes as string) ?? '';
  const description: string = node.description ?? '';
  const labelJp: string = (node.label_jp as string) ?? '';

  let accentColor = '#1D9E75';
  let subtitleText = '';

  if (isGraphNode(node)) {
    const pal = data.color_palette[node.color];
    if (pal) accentColor = pal.primary;
    if (node.subtitle) subtitleText = node.subtitle;
    if (node.is_hybrid) subtitleText = 'categoria ibrida';
  } else {
    accentColor = (node.border as string | undefined) ?? '#1D9E75';
    const period = node.period;
    if (period) subtitleText = period;
  }

  return (
    <div className={styles.detailPanel} style={{ '--accent': accentColor } as React.CSSProperties}>
      <div className={styles.detailHeader}>
        <div className={styles.detailTitleRow}>
          <span className={styles.detailAccentBar} style={{ background: accentColor }} />
          <div>
            <h2 className={styles.detailTitle}>{node.label}</h2>
            {labelJp && <span className={styles.detailJp}>{labelJp}</span>}
          </div>
        </div>
        {subtitleText && (
          <span className={styles.detailSubtitle}>{subtitleText}</span>
        )}
      </div>

      {description && (
        <p className={styles.detailDescription}>{description}</p>
      )}

      {examples.length > 0 && (
        <div className={styles.detailExamples}>
          {examples.map((ex, i) => (
            <span key={i} className={styles.examplePill} style={{ borderColor: accentColor }}>
              {ex}
            </span>
          ))}
        </div>
      )}

      {notes && (
        <p className={styles.detailNotes}>
          <svg className={styles.notesIcon} width={14} height={14} viewBox="0 0 14 14" fill="none">
            <circle cx={7} cy={7} r={6} stroke="currentColor" strokeWidth={1.2} />
            <path d="M7 5v4M7 3.5v.5" stroke="currentColor" strokeWidth={1.2} strokeLinecap="round" />
          </svg>
          {notes}
        </p>
      )}

      {isGraphNode(node) && node.is_hybrid && node.hybrid_descriptions && (
        <div className={styles.hybridRoots}>
          <span className={styles.hybridLabel}>Radici ibride:</span>
          {Object.entries(node.hybrid_descriptions).map(([rootId, desc]) => (
            <div key={rootId} className={styles.hybridRow}>
              <span className={styles.hybridRootId}>{rootId}</span>
              <span className={styles.hybridDesc}>{desc}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
