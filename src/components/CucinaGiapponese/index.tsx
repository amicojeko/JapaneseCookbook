import React, { useState } from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import type { GraphNode, DrilldownNode, GraphData } from './types';
import GraphView from './GraphView';
import DrilldownView from './DrilldownView';
import NodeDetail from './NodeDetail';
import styles from './CucinaGiapponese.module.css';
import rawData from '@site/src/data/cucina-giapponese-graph.json';

const data = rawData as unknown as GraphData;

type AnyNode = GraphNode | DrilldownNode;
type View = 'graph' | 'drilldown';

function MobileAccordion() {
  const [openId, setOpenId] = useState<string | null>(null);
  const primaryNodes = data.nodes.filter(n => n.type === 'primary');

  return (
    <div className={styles.accordion}>
      <p className={styles.accordionHint}>Tocca una categoria per espandere i dettagli</p>
      {primaryNodes.map(node => {
        const pal = data.color_palette[node.color];
        const isOpen = openId === node.id;
        const dd = node.drilldown_tab ? data.drilldowns[node.drilldown_tab] : null;
        return (
          <div key={node.id} className={`${styles.accordionItem} ${isOpen ? styles.accordionOpen : ''}`}>
            <button
              className={styles.accordionToggle}
              style={{ borderLeftColor: pal?.primary ?? '#555' }}
              onClick={() => setOpenId(isOpen ? null : node.id)}
              aria-expanded={isOpen}
            >
              <span className={styles.accordionLabel}>
                <span style={{ color: pal?.primary }}>{node.label}</span>
                <span className={styles.accordionJp}>{node.label_jp}</span>
              </span>
              <span className={styles.accordionSubtitle}>{node.subtitle}</span>
              <span className={`${styles.accordionChevron} ${isOpen ? styles.chevronOpen : ''}`}>▾</span>
            </button>
            {isOpen && (
              <div className={styles.accordionBody}>
                <p className={styles.accordionDesc}>{node.description}</p>
                {node.examples && node.examples.length > 0 && (
                  <div className={styles.accordionExamples}>
                    {node.examples.map((ex, i) => (
                      <span key={i} className={styles.examplePill} style={{ borderColor: pal?.primary }}>
                        {ex}
                      </span>
                    ))}
                  </div>
                )}
                {node.notes && <p className={styles.detailNotes}>{node.notes}</p>}
                {dd && (
                  <div className={styles.accordionChildren}>
                    {(dd.nodes ?? dd.timeline ?? []).map(child => (
                      <div key={child.id} className={styles.accordionChild}>
                        <strong style={{ color: child.border }}>{child.label}</strong>
                        {child.label_jp && <span className={styles.accordionJp}>{child.label_jp}</span>}
                        <p>{child.description}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function CucinaGiapponeseInner() {
  const [view, setView] = useState<View>('graph');
  const [selectedPrimary, setSelectedPrimary] = useState<GraphNode | null>(null);
  const [selectedDetail, setSelectedDetail] = useState<AnyNode | null>(null);

  const handleGraphNodeClick = (node: GraphNode) => {
    if (node.type === 'hub') {
      setSelectedPrimary(null);
      setSelectedDetail(node);
      return;
    }
    setSelectedPrimary(node);
    setSelectedDetail(node);
    if (node.has_drilldown && node.drilldown_tab) {
      setView('drilldown');
    }
  };

  const handleDrilldownNodeClick = (node: DrilldownNode) => {
    setSelectedDetail(node);
  };

  const handleBack = () => {
    setView('graph');
    setSelectedDetail(selectedPrimary);
  };

  return (
    <div className={styles.container}>
      {/* Desktop: two-column layout */}
      <div className={styles.desktopOnly}>
        <div className={styles.desktopLayout}>
          {/* Left: graph or drilldown */}
          <div className={styles.graphColumn}>
            {view === 'graph' && (
              <GraphView
                data={data}
                selectedId={selectedPrimary?.id ?? null}
                onNodeClick={handleGraphNodeClick}
              />
            )}
            {view === 'drilldown' && selectedPrimary?.drilldown_tab && (
              <DrilldownView
                drilldownKey={selectedPrimary.drilldown_tab}
                data={data}
                categoryColor={selectedPrimary.color}
                onBack={handleBack}
                onNodeClick={handleDrilldownNodeClick}
                selectedId={
                  selectedDetail && 'border' in selectedDetail ? selectedDetail.id : null
                }
              />
            )}
          </div>
          {/* Right: detail panel */}
          <div className={styles.detailColumn}>
            {selectedDetail
              ? <NodeDetail node={selectedDetail} data={data} />
              : <div className={styles.placeholder}>
                  <div className={styles.placeholderIcon}>🗺️</div>
                  <strong>Esplora la cucina giapponese</strong>
                  <p>Clicca un nodo del grafo per scoprire descrizione, esempi e relazioni di ogni categoria.</p>
                  <p className={styles.placeholderHint}>I nodi con <span className={styles.placeholderDot} /> hanno un drilldown dettagliato.</p>
                </div>
            }
          </div>
        </div>
      </div>

      {/* Mobile: accordion */}
      <div className={styles.mobileOnly}>
        <MobileAccordion />
      </div>
    </div>
  );
}

export default function CucinaGiapponese() {
  return (
    <BrowserOnly fallback={<div className="loading">Caricamento grafo...</div>}>
      {() => <CucinaGiapponeseInner />}
    </BrowserOnly>
  );
}
