import type { WeightConfigItem } from "@/types/analyze";
import { Building2, Grid3X3, Mountain, Sun, Zap } from "lucide-vue-next";

export const ANALYSIS_WEIGHTS_CONFIG: WeightConfigItem[] = [
  { id: 'solar', label: 'Solar Irradiance', icon: Sun, width: 'half' },
  { id: 'area', label: 'Available Area', icon: Grid3X3, width: 'half' },
  { id: 'grid', label: 'Grid Distance', icon: Zap, width: 'half' },
  { id: 'slope', label: 'Terrain Slope', icon: Mountain, width: 'half' },
  { id: 'infra', label: 'Infrastructure', icon: Building2, width: 'full' },
]