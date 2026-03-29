import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';
import type { GraphData, DrilldownNode } from './types';
import styles from './CucinaGiapponese.module.css';

const DD_W = 720;
const DD_H = 440;
const CX = 360;
const CY = 210;

// Pill dimensions
const PILL_W = 104;
const PILL_H = 34;
const PILL_RX = 17;

interface SimNode extends d3.SimulationNodeDatum {
  id: string;
  label: string;
  label_jp?: string;
  color?: string;
  border?: string;
  isCenter?: boolean;
}

interface Props {
  drilldownKey: string;
  data: GraphData;
  categoryColor: string;
  onBack: () => void;
  onNodeClick: (node: DrilldownNode) => void;
  selectedId: string | null;
}

// ── Timeline (Sushi) ─────────────────────────────────────────────────────────
function TimelineView({
  nodes, selected, onSelect,
}: { nodes: DrilldownNode[]; selected: string | null; onSelect: (n: DrilldownNode) => void }) {
  const [hovered, setHovered] = useState<string | null>(null);
  const count = nodes.length;
  const spacing = (DD_W - 140) / Math.max(count - 1, 1);
  const Y = DD_H / 2;

  return (
    <svg viewBox={`0 0 ${DD_W} ${DD_H}`} className={styles.graphSvg}>
      <line x1={50} y1={Y} x2={DD_W - 50} y2={Y} stroke="#333" strokeWidth={2} />
      {nodes.map((node, i) => {
        const x = 70 + i * spacing;
        const isSelected = selected === node.id;
        const isHovered = hovered === node.id;
        return (
          <g key={node.id} style={{ cursor: 'pointer' }}
            onClick={() => onSelect(node)}
            onMouseEnter={() => setHovered(node.id)}
            onMouseLeave={() => setHovered(null)}>
            <line x1={x} y1={Y - 14} x2={x} y2={Y + 14} stroke="#444" strokeWidth={1} />
            {(isHovered || isSelected) && (
              <rect x={x - PILL_W / 2 - 6} y={Y - PILL_H / 2 - 6} width={PILL_W + 12} height={PILL_H + 12}
                rx={PILL_RX + 3} fill={node.border ?? '#1D9E75'} opacity={0.13}
              />
            )}
            <rect x={x - PILL_W / 2} y={Y - PILL_H / 2} width={PILL_W} height={PILL_H} rx={PILL_RX}
              fill={node.color ?? '#085041'}
              stroke={isSelected ? '#ffdc06' : (node.border ?? '#1D9E75')}
              strokeWidth={isSelected ? 2.5 : 1.5}
            />
            <text x={x} y={Y + 1} textAnchor="middle" dominantBaseline="middle"
              fill="#fff" fontSize={10} fontWeight="bold" style={{ pointerEvents: 'none' }}>
              {node.label}
            </text>
            {node.period && (
              <text x={x} y={Y - PILL_H / 2 - 10} textAnchor="middle" fill="#777" fontSize={8} style={{ pointerEvents: 'none' }}>
                {node.period}
              </text>
            )}
            {node.label_jp && (
              <text x={x} y={Y + PILL_H / 2 + 14} textAnchor="middle" fill="#666" fontSize={8.5} style={{ pointerEvents: 'none' }}>
                {node.label_jp}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

// Center pill (slightly larger than child pills)
const CENTER_W = 120;
const CENTER_H = 40;
const CENTER_RX = 14;

// ── Force drilldown ──────────────────────────────────────────────────────────
function ForceRadial({
  drilldownKey, nodes, selected, onSelect, centerLabel, centerLabelJp, centerColor, centerPrimary,
}: {
  drilldownKey: string; nodes: DrilldownNode[]; selected: string | null;
  onSelect: (n: DrilldownNode) => void;
  centerLabel: string; centerLabelJp: string; centerColor: string; centerPrimary: string;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const gRef = useRef<SVGGElement>(null);
  const simRef = useRef<d3.Simulation<SimNode, d3.SimulationLinkDatum<SimNode>> | null>(null);
  const simNodesRef = useRef<SimNode[]>([]);
  const draggingRef = useRef<{ id: string; moved: boolean } | null>(null);
  const [positions, setPositions] = useState<Map<string, { x: number; y: number }>>(new Map());
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  useEffect(() => {
    const centerNode: SimNode = { id: '__center__', label: '', isCenter: true, x: CX, y: CY, fx: CX, fy: CY };
    const simNodes: SimNode[] = [
      centerNode,
      ...nodes.map(n => ({
        id: n.id, label: n.label, label_jp: n.label_jp,
        color: n.color, border: n.border,
        x: CX + (Math.random() - 0.5) * 200,
        y: CY + (Math.random() - 0.5) * 200,
      })),
    ];
    simNodesRef.current = simNodes;

    const links = nodes.map(n => ({ source: '__center__', target: n.id }));

    const sim = d3.forceSimulation<SimNode>(simNodes)
      .force('link', d3.forceLink(links).id((d: SimNode) => d.id).distance(180).strength(0.8))
      .force('charge', d3.forceManyBody().strength(-500))
      .force('collide', d3.forceCollide<SimNode>(d => d.isCenter ? 75 : 60).strength(0.9))
      .force('center', d3.forceCenter(CX, CY).strength(0.05));

    sim.on('tick', () => {
      setPositions(new Map(simNodes.map(n => [n.id, { x: n.x ?? CX, y: n.y ?? CY }])));
    });

    simRef.current = sim;
    return () => { sim.stop(); };
  }, [drilldownKey, nodes]);

  useEffect(() => {
    if (!svgRef.current || !gRef.current) return;
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 2.5])
      .filter(e => e.type === 'wheel' || !(e.target as Element).closest('[data-draggable]'))
      .on('zoom', ev => d3.select(gRef.current!).attr('transform', ev.transform.toString()));
    d3.select(svgRef.current).call(zoom);
    return () => { d3.select(svgRef.current!).on('.zoom', null); };
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent, id: string) => {
    e.stopPropagation();
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
    draggingRef.current = { id, moved: false };
    const node = simNodesRef.current.find(n => n.id === id);
    if (node) { node.fx = node.x; node.fy = node.y; }
    simRef.current?.alphaTarget(0.3).restart();
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!draggingRef.current || !svgRef.current) return;
    draggingRef.current.moved = true;
    const tr = d3.zoomTransform(svgRef.current);
    const rect = svgRef.current.getBoundingClientRect();
    const svgX = (e.clientX - rect.left) * (DD_W / rect.width);
    const svgY = (e.clientY - rect.top) * (DD_H / rect.height);
    const node = simNodesRef.current.find(n => n.id === draggingRef.current!.id);
    if (node) { node.fx = (svgX - tr.x) / tr.k; node.fy = (svgY - tr.y) / tr.k; }
  }, []);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (!draggingRef.current) return;
    const { id, moved } = draggingRef.current;
    const node = simNodesRef.current.find(n => n.id === id);
    if (node) { node.fx = null; node.fy = null; }
    simRef.current?.alphaTarget(0);
    if (!moved) {
      const ddNode = nodes.find(n => n.id === id);
      if (ddNode) onSelect(ddNode);
    }
    draggingRef.current = null;
  }, [nodes, onSelect]);

  const centerPos = positions.get('__center__') ?? { x: CX, y: CY };

  return (
    <svg ref={svgRef} viewBox={`0 0 ${DD_W} ${DD_H}`} className={styles.graphSvg}
      style={{ cursor: 'grab' }}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}>
      <g ref={gRef}>
        {/* Edges */}
        <g style={{ pointerEvents: 'none' }}>
          {nodes.map(node => {
            const pos = positions.get(node.id);
            if (!pos) return null;
            return (
              <line key={`edge-${node.id}`}
                x1={centerPos.x} y1={centerPos.y} x2={pos.x} y2={pos.y}
                stroke={node.border ?? '#555'} strokeWidth={1.2} opacity={0.25}
              />
            );
          })}
        </g>
        {/* Center pill */}
        <g>
          <rect
            x={centerPos.x - CENTER_W / 2} y={centerPos.y - CENTER_H / 2}
            width={CENTER_W} height={CENTER_H} rx={CENTER_RX}
            fill={centerColor} stroke={centerPrimary} strokeWidth={2}
          />
          <text x={centerPos.x} y={centerPos.y - 3} textAnchor="middle" dominantBaseline="middle"
            fill="#fff" fontSize={12} fontWeight="800" style={{ pointerEvents: 'none' }}>
            {centerLabel}
          </text>
          <text x={centerPos.x} y={centerPos.y + 13} textAnchor="middle"
            fill="rgba(255,255,255,0.55)" fontSize={9} style={{ pointerEvents: 'none' }}>
            {centerLabelJp}
          </text>
        </g>
        {/* Nodes */}
        {nodes.map(node => {
          const pos = positions.get(node.id);
          if (!pos) return null;
          const isSelected = selected === node.id;
          const isHovered = hoveredId === node.id;
          return (
            <g key={node.id} data-draggable="true"
              style={{ cursor: 'grab' }}
              onPointerDown={e => handlePointerDown(e, node.id)}
              onMouseEnter={() => !draggingRef.current && setHoveredId(node.id)}
              onMouseLeave={() => setHoveredId(null)}>
              {(isHovered || isSelected) && (
                <rect x={pos.x - PILL_W / 2 - 6} y={pos.y - PILL_H / 2 - 6}
                  width={PILL_W + 12} height={PILL_H + 12} rx={PILL_RX + 3}
                  fill={node.border ?? '#555'} opacity={0.14}
                />
              )}
              <rect x={pos.x - PILL_W / 2} y={pos.y - PILL_H / 2}
                width={PILL_W} height={PILL_H} rx={PILL_RX}
                fill={node.color ?? '#1a1a1a'}
                stroke={isSelected ? '#ffdc06' : (node.border ?? '#555')}
                strokeWidth={isSelected ? 2.5 : 1.5}
                style={{ filter: isSelected ? `drop-shadow(0 0 8px ${node.border ?? '#fff'}88)` : 'none' }}
              />
              <text x={pos.x} y={pos.y + 1} textAnchor="middle" dominantBaseline="middle"
                fill="#fff" fontSize={10} fontWeight="bold" style={{ pointerEvents: 'none' }}>
                {node.label}
              </text>
              {node.label_jp && (
                <text x={pos.x} y={pos.y + PILL_H / 2 + 14} textAnchor="middle"
                  fill="#777" fontSize={8.5} style={{ pointerEvents: 'none' }}>
                  {node.label_jp}
                </text>
              )}
            </g>
          );
        })}
      </g>
    </svg>
  );
}

// ── Main DrilldownView ───────────────────────────────────────────────────────
export default function DrilldownView({
  drilldownKey, data, categoryColor, onBack, onNodeClick, selectedId,
}: Props) {
  const dd = data.drilldowns[drilldownKey];
  if (!dd) return null;

  const isTimeline = drilldownKey === 'sushi';
  const nodes = isTimeline ? (dd.timeline ?? []) : (dd.nodes ?? []);
  const pal = data.color_palette[categoryColor] ?? data.color_palette['bevande'];
  // Find the parent graph node to get its label for the center pill
  const parentNode = data.nodes.find(n => (n as any).drilldown_tab === drilldownKey);

  return (
    <div className={styles.drilldownContainer}>
      <div className={styles.drilldownHeader}>
        <button className={styles.backButton} onClick={onBack}>
          <svg width={16} height={16} viewBox="0 0 16 16" fill="none">
            <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
          </svg>
          Torna al grafo
        </button>
        <div className={styles.drilldownTitle}>
          <span className={styles.drilldownTitleDot} style={{ background: pal?.primary ?? '#1D9E75' }} />
          <span>{dd.title}</span>
        </div>
      </div>

      <p className={styles.drilldownDesc}>{dd.description}</p>

      <div className={styles.graphWrapper} style={{ padding: '12px 12px 4px' }}>
        {isTimeline
          ? <TimelineView nodes={nodes} selected={selectedId} onSelect={onNodeClick} />
          : <ForceRadial drilldownKey={drilldownKey} nodes={nodes} selected={selectedId} onSelect={onNodeClick}
              centerLabel={parentNode?.label ?? dd.title}
              centerLabelJp={parentNode?.label_jp ?? ''}
              centerColor={pal.dark}
              centerPrimary={pal.primary}
            />
        }
      </div>

      {isTimeline && dd.special && dd.special.length > 0 && (
        <div className={styles.specialRow}>
          <span className={styles.specialLabel}>Forma speciale:</span>
          {dd.special.map(s => (
            <button key={s.id}
              className={`${styles.specialChip} ${selectedId === s.id ? styles.specialChipSelected : ''}`}
              onClick={() => onNodeClick(s)}>
              {s.label} <span>{s.label_jp}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
