import type { LucideIcon } from "lucide-vue-next"
import type { InputWidth } from "./filters/inputTypes"

export type Weights = {
  solar: number
  area: number
  grid: number
  slope: number
  infra: number
}

export type WeightRequest = {
  weights: Weights
}

export interface WeightConfigItem {
  id: 'solar' | 'area' | 'grid' | 'slope' | 'infra'
  label: string
  icon: LucideIcon // Lucide icon component type
  width: InputWidth
}