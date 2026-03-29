import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';
import type { GraphData, GraphNode, ColorPalette } from './types';
import styles from './CucinaGiapponese.module.css';

const SVG_W = 1000;
const SVG_H = 700;
const CX = 500;
const CY = 350;

// Pill dimensions
const PILL_W = 116;
const PILL_H = 38;
const PILL_RX = 19;
const HUB_W = 136;
const HUB_H = 58;
const HUB_RX = 14;

interface SimNode extends d3.SimulationNodeDatum {
  id: string;
  label: string;
  label_jp: string;
  subtitle?: string;
  type: string;
  color: string;
  has_drilldown: boolean;
  is_hybrid?: boolean;
}

interface SimLink extends d3.SimulationLinkDatum<SimNode> {
  edgeType: 'primary' | 'hybrid' | 'affinity';
  label?: string;
  color_hint?: string;
}

interface Props {
  data: GraphData;
  selectedId: string | null;
  onNodeClick: (node: GraphNode) => void;
}

function getPalette(colorKey: string, palette: Record<string, ColorPalette>): ColorPalette {
  return palette[colorKey] ?? palette['bevande'];
}

export default function GraphView({ data, selectedId, onNodeClick }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const gRef = useRef<SVGGElement>(null);
  const simRef = useRef<d3.Simulation<SimNode, SimLink> | null>(null);
  const simNodesRef = useRef<SimNode[]>([]);
  const draggingRef = useRef<{ id: string; moved: boolean } | null>(null);

  const [positions, setPositions] = useState<Map<string, { x: number; y: number }>>(new Map());
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // ── Simulation ───────────────────────────────────────────────────────────────
  useEffect(() => {
    const simNodes: SimNode[] = data.nodes.map(n => ({
      id: n.id,
      label: n.label,
      label_jp: n.label_jp,
      subtitle: n.subtitle,
      type: n.type,
      color: n.color,
      has_drilldown: n.has_drilldown,
      is_hybrid: n.is_hybrid,
      x: n.type === 'hub' ? CX : CX + (Math.random() - 0.5) * 400,
      y: n.type === 'hub' ? CY : CY + (Math.random() - 0.5) * 400,
      fx: n.type === 'hub' ? CX : undefined,
      fy: n.type === 'hub' ? CY : undefined,
    }));
    simNodesRef.current = simNodes;

    const simLinks: SimLink[] = data.edges.map(e => ({
      source: e.source,
      target: e.target,
      edgeType: e.type,
      label: e.label,
      color_hint: e.color_hint,
    }));

    const sim = d3
      .forceSimulation<SimNode, SimLink>(simNodes)
      .force(
        'link',
        d3.forceLink<SimNode, SimLink>(simLinks)
          .id(d => d.id)
          .distance(l => l.edgeType === 'primary' ? 250 : l.edgeType === 'hybrid' ? 340 : 280)
          .strength(l => l.edgeType === 'primary' ? 0.85 : l.edgeType === 'hybrid' ? 0.15 : 0.05),
      )
      .force('charge', d3.forceManyBody().strength(-800))
      .force('collide', d3.forceCollide<SimNode>(68).strength(0.9))
      .force('center', d3.forceCenter(CX, CY).strength(0.04));

    sim.on('tick', () => {
      setPositions(new Map(simNodes.map(n => [n.id, { x: n.x ?? CX, y: n.y ?? CY }])));
    });

    simRef.current = sim;
    return () => { sim.stop(); };
  }, [data]);

  // ── D3 Zoom ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!svgRef.current || !gRef.current) return;

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.25, 3])
      .filter(event => {
        if (event.type === 'wheel') return true;
        return !(event.target as Element).closest('[data-draggable]');
      })
      .on('zoom', event => {
        d3.select(gRef.current!).attr('transform', event.transform.toString());
      });

    d3.select(svgRef.current).call(zoom);
    return () => { d3.select(svgRef.current!).on('.zoom', null); };
  }, []);

  // ── Node drag ────────────────────────────────────────────────────────────────
  const handleNodePointerDown = useCallback((e: React.PointerEvent, nodeId: string) => {
    if (nodeId === 'root') return;
    e.stopPropagation();
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
    draggingRef.current = { id: nodeId, moved: false };
    const node = simNodesRef.current.find(n => n.id === nodeId);
    if (node) {
      node.fx = node.x;
      node.fy = node.y;
      simRef.current?.alphaTarget(0.3).restart();
    }
  }, []);

  const handleSvgPointerMove = useCallback((e: React.PointerEvent) => {
    if (!draggingRef.current || !svgRef.current) return;
    draggingRef.current.moved = true;
    const tr = d3.zoomTransform(svgRef.current);
    const rect = svgRef.current.getBoundingClientRect();
    const svgX = (e.clientX - rect.left) * (SVG_W / rect.width);
    const svgY = (e.clientY - rect.top) * (SVG_H / rect.height);
    const simX = (svgX - tr.x) / tr.k;
    const simY = (svgY - tr.y) / tr.k;
    const node = simNodesRef.current.find(n => n.id === draggingRef.current!.id);
    if (node) { node.fx = simX; node.fy = simY; }
  }, []);

  const handleSvgPointerUp = useCallback((e: React.PointerEvent) => {
    if (!draggingRef.current) return;
    const { id, moved } = draggingRef.current;
    const node = simNodesRef.current.find(n => n.id === id);
    if (node) {
      node.fx = null;
      node.fy = null;
      simRef.current?.alphaTarget(0);
    }
    if (!moved) {
      const graphNode = data.nodes.find(n => n.id === id);
      if (graphNode) onNodeClick(graphNode as GraphNode);
    }
    draggingRef.current = null;
  }, [data, onNodeClick]);

  // ── Render edges ─────────────────────────────────────────────────────────────
  const edges = data.edges.map(edge => {
    const from = positions.get(edge.source);
    const to = positions.get(edge.target);
    if (!from || !to) return null;

    if (edge.type === 'primary') {
      const pal = getPalette(edge.color_hint ?? 'bevande', data.color_palette);
      return (
        <line key={`${edge.source}-${edge.target}`}
          x1={from.x} y1={from.y} x2={to.x} y2={to.y}
          stroke={pal.primary} strokeWidth={1.8} opacity={0.35}
        />
      );
    }
    if (edge.type === 'hybrid') {
      const mx = (from.x + to.x) / 2;
      const my = (from.y + to.y) / 2;
      return (
        <g key={`hybrid-${edge.source}-${edge.target}`}>
          <line x1={from.x} y1={from.y} x2={to.x} y2={to.y}
            stroke="#1D9E75" strokeWidth={1.6} strokeDasharray="7,4" opacity={0.6}
          />
          {edge.label && (
            <>
              <rect x={mx - 55} y={my - 10} width={110} height={19} rx={5}
                style={{ fill: 'var(--ifm-background-color)' }} opacity={0.92}
                stroke="#1D9E75" strokeWidth={0.5} strokeOpacity={0.3}
              />
              <text x={mx} y={my + 4} textAnchor="middle"
                fill="#1D9E75" fontSize={8.5} fontStyle="italic" style={{ pointerEvents: 'none' }}>
                {edge.label}
              </text>
            </>
          )}
        </g>
      );
    }
    return (
      <line key={`affinity-${edge.source}-${edge.target}`}
        x1={from.x} y1={from.y} x2={to.x} y2={to.y}
        stroke="#888" strokeWidth={1} strokeDasharray="4,4" opacity={0.25}
      />
    );
  });

  // ── Render nodes ─────────────────────────────────────────────────────────────
  const nodes = data.nodes.map(node => {
    const pos = positions.get(node.id);
    if (!pos) return null;
    const isHub = node.type === 'hub';
    const pal = getPalette(node.color, data.color_palette);
    const isSelected = selectedId === node.id;
    const isHovered = hoveredId === node.id;

    const w = isHub ? HUB_W : PILL_W;
    const h = isHub ? HUB_H : PILL_H;
    const rx = isHub ? HUB_RX : PILL_RX;

    const tooltipX = pos.x > SVG_W * 0.55 ? pos.x - w / 2 - 175 : pos.x + w / 2 + 8;
    const tooltipY = Math.max(8, Math.min(pos.y - 32, SVG_H - 74));

    return (
      <g
        key={node.id}
        data-draggable={isHub ? undefined : 'true'}
        style={{ cursor: isHub ? 'default' : 'grab' }}
        onPointerDown={e => handleNodePointerDown(e, node.id)}
        onMouseEnter={() => !draggingRef.current && setHoveredId(node.id)}
        onMouseLeave={() => setHoveredId(null)}
      >
        {/* Glow on hover/select */}
        {(isHovered || isSelected) && !isHub && (
          <rect x={pos.x - w / 2 - 8} y={pos.y - h / 2 - 8} width={w + 16} height={h + 16}
            rx={rx + 4} fill={pal.primary} opacity={0.12}
          />
        )}
        {/* Hybrid dashed border */}
        {node.is_hybrid && (
          <rect x={pos.x - w / 2 - 5} y={pos.y - h / 2 - 5} width={w + 10} height={h + 10}
            rx={rx + 3} fill="none" stroke="#1D9E75" strokeWidth={1.5} strokeDasharray="5,3" opacity={0.55}
          />
        )}
        {/* Main pill */}
        <rect
          x={pos.x - w / 2} y={pos.y - h / 2} width={w} height={h} rx={rx}
          fill={isHub ? '#111' : pal.dark}
          stroke={isSelected ? '#ffdc06' : (isHub ? '#444' : pal.primary)}
          strokeWidth={isSelected ? 3 : 1.5}
          style={{
            transition: 'stroke 0.2s, stroke-width 0.2s',
            filter: isSelected ? `drop-shadow(0 0 10px ${pal.primary}99)` : 'none',
          }}
        />
        {/* Drilldown indicator */}
        {node.has_drilldown && (
          <circle cx={pos.x + w / 2 - 6} cy={pos.y - h / 2 + 6} r={5} fill="#ffdc06" opacity={0.9} />
        )}
        {/* Label */}
        {isHub ? (
          <>
            <text x={pos.x} y={pos.y - 8} textAnchor="middle" fill="#fff" fontSize={12} fontWeight="800" style={{ pointerEvents: 'none' }}>Cucina</text>
            <text x={pos.x} y={pos.y + 8} textAnchor="middle" fill="#fff" fontSize={12} fontWeight="800" style={{ pointerEvents: 'none' }}>Giapponese</text>
            <text x={pos.x} y={pos.y + 22} textAnchor="middle" fill="#555" fontSize={9} style={{ pointerEvents: 'none' }}>{node.label_jp}</text>
          </>
        ) : (
          <>
            <text x={pos.x} y={pos.y + 1} textAnchor="middle" dominantBaseline="middle"
              fill={pal.light} fontSize={11} fontWeight="bold" style={{ pointerEvents: 'none' }}>
              {node.label}
            </text>
            <text x={pos.x} y={pos.y + h / 2 + 14} textAnchor="middle"
              fill="#777" fontSize={9} style={{ pointerEvents: 'none' }}>
              {node.label_jp}
            </text>
          </>
        )}
        {/* Tooltip */}
        {isHovered && !isHub && !draggingRef.current && (
          <foreignObject x={tooltipX} y={tooltipY} width={168} height={74}
            style={{ pointerEvents: 'none', overflow: 'visible' }}>
            <div className={styles.tooltip} style={{ borderColor: pal.primary }}>
              <span className={styles.tooltipLabel}>{node.label}</span>
              <span className={styles.tooltipJp}>{node.label_jp}</span>
              {node.subtitle && <span className={styles.tooltipSub}>{node.subtitle}</span>}
              {node.has_drilldown && <span className={styles.tooltipHint}>clicca per esplorare →</span>}
            </div>
          </foreignObject>
        )}
      </g>
    );
  });

  return (
    <div className={styles.graphWrapper}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        className={styles.graphSvg}
        style={{ cursor: 'grab' }}
        onPointerMove={handleSvgPointerMove}
        onPointerUp={handleSvgPointerUp}
        onPointerLeave={handleSvgPointerUp}
      >
        <g ref={gRef}>
          <g style={{ pointerEvents: 'none' }}>{edges}</g>
          <g>{nodes}</g>
        </g>
      </svg>

      <div className={styles.graphControls}>
        Scorri per zoom · trascina i nodi · clicca per i dettagli
      </div>

      <div className={styles.legend}>
        <span className={styles.legendItem}>
          <span className={styles.legendDot} style={{ background: '#ffdc06' }} />
          ha drilldown
        </span>
        <span className={styles.legendItem}>
          <svg width={28} height={10}>
            <line x1={0} y1={5} x2={28} y2={5} stroke="#1D9E75" strokeWidth={1.5} strokeDasharray="6,3" />
          </svg>
          radici ibride
        </span>
        <span className={styles.legendItem}>
          <svg width={28} height={10}>
            <line x1={0} y1={5} x2={28} y2={5} stroke="#888" strokeWidth={1} strokeDasharray="4,3" />
          </svg>
          affinità
        </span>
      </div>
    </div>
  );
}
