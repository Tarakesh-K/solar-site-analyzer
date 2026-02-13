import type { FactorAverages } from "@/types/dashboard"
import type { SiteWithScores } from "@/types/sites"

export type Statistics = {
    kpi: KPI
    stats: Stats
    site_data: SiteWithScores[]
}

export type KPI = {
    total_sites: number
}

export type Stats = {
    avg_suitability_score: number
    total_land_area: number
    factor_averages: FactorAverages
}