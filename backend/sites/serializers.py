from decimal import Decimal
from rest_framework import serializers
from .models import Sites, AnalysisResults, AnalysisParameters, SitesWithScores


class SiteSerializer(serializers.ModelSerializer):
    site_id = serializers.IntegerField()

    class Meta:
        model = Sites
        fields = "__all__"

    # --- TEXT & CATEGORICAL VALIDATION ---

    def validate_site_name(self, value):
        if not value:
            raise serializers.ValidationError("Site should not be missing.")
        return value.strip()

    def validate_land_type(self, value):
        valid_types = [
            "Agricultural",
            "Industrial",
            "Wasteland",
            "Hilly",
            "Open Land",
            "Mixed Use",
            "Forest Adjacent",
            "Near Water Body",
            "Peri-Urban",
        ]
        if value not in valid_types:
            # We allow it, but normalize it; or you can raise an error
            pass
        return value

    # --- GEOGRAPHIC VALIDATION ---

    def validate_latitude(self, value):
        if not (-90 <= value <= 90):
            raise serializers.ValidationError("Latitude must be between -90 and 90.")
        return value

    def validate_longitude(self, value):
        if not (-180 <= value <= 180):
            raise serializers.ValidationError("Longitude must be between -180 and 180.")
        return value

    def validate_region(self, value):
        if not value:
            raise serializers.ValidationError("Region is a required field.")
        return value

    # --- PHYSICAL & NUMERIC VALIDATION ---

    def validate_area_sqm(self, value):
        if value < 500:  # Minimum logic: anything smaller isn't a "site"
            raise serializers.ValidationError(
                "Area is too small for solar development (min 500 sqm)."
            )
        return value

    def validate_solar_irradiance_kwh(self, value):
        if not (0 <= value <= 10):  # Physical limit: even the Sahara doesn't exceed 8-9
            raise serializers.ValidationError(
                "Solar irradiance must be between 0 and 10 kWh/m²/day."
            )
        return value

    def validate_grid_distance_km(self, value):
        if value < 0:
            raise serializers.ValidationError("Grid distance cannot be negative.")
        if value > 500:
            raise serializers.ValidationError(
                "Distance exceeds 500km; site is likely too remote."
            )
        return value

    def validate_slope_degrees(self, value):
        if not (0 <= value <= 90):
            raise serializers.ValidationError(
                "Slope degrees must be between 0 (flat) and 90 (vertical)."
            )
        return value

    def validate_road_distance_km(self, value):
        if value < 0:
            raise serializers.ValidationError("Road distance cannot be negative.")
        return value

    def validate_elevation_m(self, value):
        # Validation for altitude (Earth's surface range)
        if not (-413 <= value <= 8848):
            raise serializers.ValidationError(
                "Elevation must be between -413m (Dead Sea) and 8848m (Everest)."
            )
        return value


class CalculatedAnalysisSerializer(serializers.ModelSerializer):
    site_id = serializers.PrimaryKeyRelatedField(
        queryset=Sites.objects.all(), source="site"
    )

    class Meta:
        model = AnalysisResults
        fields = [
            "result_id",
            "site_id",
            "solar_irradiance_score",
            "area_score",
            "grid_distance_score",
            "slope_score",
            "infrastructure_score",
            "total_suitability_score",
            "parameters_snapshot",
        ]
        read_only_fields = [
            "result_id",
            "solar_irradiance_score",
            "area_score",
            "grid_distance_score",
            "slope_score",
            "infrastructure_score",
            "total_suitability_score",
            "parameters_snapshot",
        ]

    def validate(self, attrs):
        """
        'attrs' is a dictionary for a SINGLE item.
        'attrs['site']' is now a full Sites model instance.
        """
        site = attrs.get("site")
        weights_dict = dict(
            AnalysisParameters.objects.values_list("parameter_name", "weight_value")
        )

        # 1. Weights logic (Pull from initial_data which is the raw dict)
        weights = (
            self.initial_data[0].get("parameters_snapshot")
            if isinstance(self.initial_data, list) and self.initial_data
            else None
        ) or {
            # Cast everything to float to match your site data types
            "solar": float(weights_dict.get("solar_irradiance_weight", 0.35)),
            "area": float(weights_dict.get("area_weight", 0.25)),
            "grid": float(weights_dict.get("grid_distance_weight", 0.20)),
            "slope": float(weights_dict.get("slope_weight", 0.15)),
            "infra": float(weights_dict.get("infrastructure_weight", 0.05)),
        }

        # 2. Calculation logic (Using the site object attributes)
        # No more data.get() needed for these!
        irr = float(site.solar_irradiance_kwh)
        area = float(site.area_sqm)
        dist = float(site.grid_distance_km)
        slope = float(site.slope_degrees)
        road = float(site.road_distance_km)

        # Apply Formulas
        s_score = (
            100.0 if irr >= 5.5 else (0.0 if irr < 3.0 else ((irr - 3.0) / 2.5) * 100)
        )
        a_score = (
            100.0
            if area >= 50000
            else (0.0 if area < 5000 else ((area - 5000) / 45000) * 100)
        )
        g_score = (
            100.0
            if dist <= 1
            else (0.0 if dist >= 20 else 100 - ((dist - 1) / 19) * 100)
        )
        i_score = (
            100.0
            if road <= 0.5
            else (0.0 if road >= 5 else 100 - ((road - 0.5) / 4.5) * 100)
        )

        if slope <= 5:
            sl_score = 100.0
        elif slope > 20:
            sl_score = 0.0
        elif slope <= 15:
            sl_score = 100 - ((slope - 5) / 10) * 50
        else:
            sl_score = 50 - ((slope - 15) / 5) * 50

        total = (
            (s_score * weights["solar"])
            + (a_score * weights["area"])
            + (g_score * weights["grid"])
            + (sl_score * weights["slope"])
            + (i_score * weights["infra"])
        )

        # 3. Update attrs with the calculated results
        attrs.update(
            {
                "solar_irradiance_score": round(s_score, 2),
                "area_score": round(a_score, 2),
                "grid_distance_score": round(g_score, 2),
                "slope_score": round(sl_score, 2),
                "infrastructure_score": round(i_score, 2),
                "total_suitability_score": round(total, 2),
                "parameters_snapshot": weights,
            }
        )

        return attrs


class SiteListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sites
        fields = "__all__"


class SiteWithScoreSerializer(serializers.ModelSerializer):
    class Meta:
        model = SitesWithScores
        fields = "__all__"


class AnalysisResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnalysisResults
        fields = [
            "result_id",
            "solar_irradiance_score",
            "area_score",
            "grid_distance_score",
            "slope_score",
            "infrastructure_score",
            "total_suitability_score",
            "analysis_timestamp",
            "parameters_snapshot",
        ]


class SiteDetailSerializer(serializers.ModelSerializer):
    analysis_history = AnalysisResultSerializer(
        many=True, read_only=True, source="analysis_results"
    )

    class Meta:
        model = Sites
        fields = "__all__"


class NewWeightSerializer(serializers.Serializer):
    # Match the JSON keys
    solar = serializers.FloatField()
    area = serializers.FloatField()
    grid = serializers.FloatField()
    slope = serializers.FloatField()
    infra = serializers.FloatField()

    # Translation map: { JSON_KEY: DB_PARAMETER_NAME }
    MAPPING = {
        "solar": "solar_irradiance_weight",
        "area": "area_weight",
        "grid": "grid_distance_weight",
        "slope": "slope_weight",
        "infra": "infrastructure_weight",
    }

    def validate(self, attrs):
        # Validation: Ensure weights are valid percentages

        total = sum(attrs.values())
        if not (total == 1):  # Allowing small float rounding margin
            raise serializers.ValidationError("Weights must sum to approximately 1.0")
        return attrs

    def save_weights(self):
        """
        Corrected: Update the global weight parameters in the 'tall' table.
        """
        results = []
        for json_key, db_name in self.MAPPING.items():
            weight_val = self.validated_data.get(json_key)

            # Use AnalysisParameters (the weights table), not AnalysisResults (the scores table)
            obj, created = AnalysisParameters.objects.update_or_create(
                parameter_name=db_name, defaults={"weight_value": weight_val}
            )
            results.append(obj)
        return results
