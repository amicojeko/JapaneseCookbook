export interface ColorPalette {
  primary: string;
  dark: string;
  light: string;
  label: string;
}

export interface GraphNode {
  id: string;
  label: string;
  label_jp: string;
  subtitle?: string;
  type: 'hub' | 'primary' | 'child' | 'leaf';
  color: string;
  level: number;
  has_drilldown: boolean;
  drilldown_tab?: string;
  is_hybrid?: boolean;
  hybrid_roots?: string[];
  hybrid_descriptions?: Record<string, string>;
  description: string;
  examples: string[];
  notes?: string;
}

export interface GraphEdge {
  source: string;
  target: string;
  type: 'primary' | 'hybrid' | 'affinity';
  dashed?: boolean;
  label?: string;
  color_hint?: string;
}

export interface DrilldownNode {
  id: string;
  label: string;
  label_jp?: string;
  color?: string;
  border?: string;
  description: string;
  examples?: string[];
  notes?: string;
  period?: string;
  [key: string]: unknown;
}

export interface DrilldownData {
  title: string;
  description: string;
  nodes?: DrilldownNode[];
  timeline?: DrilldownNode[];
  special?: DrilldownNode[];
  children?: Record<string, Array<{ id: string; label: string; description: string }>>;
}

export interface GraphData {
  meta: {
    title: string;
    version: string;
    description: string;
    node_count: number;
    total_nodes_including_children: number;
  };
  color_palette: Record<string, ColorPalette>;
  nodes: GraphNode[];
  edges: GraphEdge[];
  drilldowns: Record<string, DrilldownData>;
}
