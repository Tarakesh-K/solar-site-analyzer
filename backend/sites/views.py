import io
from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from sites.serializers import CalculatedAnalysisSerializer, SiteDetailSerializer, SiteListSerializer, SiteSerializer, NewWeightSerializer, SiteWithScoreSerializer
from sites.models import AnalysisResults, Sites, SitesWithScores
from .utils import build_score_filters, export_to_csv_response, extract_values_from_csv, filter_by_land_type, filter_by_region, filter_by_site_name, get_filtered_site_data, limit_and_offset_queries, normalize_area, normalize_infra, offset_and_limit_query_params, split_values_for_query_params, normalize_solar, normalize_slope, normalize_grid
from django.db import transaction
from django.db.models import F, Q, Avg, Sum


class SiteUploadView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        try:
            uploaded_file = request.FILES.get("site_file")
            if not uploaded_file:
                return Response({"error": "No file uploaded"}, status=400)

            file_data = uploaded_file.read().decode("utf-8")
            io_string = io.StringIO(file_data)
            values = extract_values_from_csv(io_string)

            site_serializer = SiteSerializer(data=values, many=True)
            if not site_serializer.is_valid():
                return Response({"error": "CSV data invalid", "details": site_serializer.errors}, status=400)

            # --- ATOMIC TRANSACTION START ---
            with transaction.atomic():
                upserted_sites = []
                for item in site_serializer.validated_data:
                    site_instance, created = Sites.objects.update_or_create(
                        site_id=item.get('site_id'),
                        defaults=item
                    )
                    upserted_sites.append(site_instance)

                # Prepare input for 2nd serializer (Just passing the PK)
                analysis_input = [
                    {
                        "site_id": site.pk,
                        "site_name": site.site_name,
                        "latitude": site.latitude,
                        "longitude": site.longitude,
                        "area_sqm": site.area_sqm,
                        "solar_irradiance_kwh": site.solar_irradiance_kwh,
                        "grid_distance_km": site.grid_distance_km,
                        "slope_degrees": site.slope_degrees,
                        "road_distance_km": site.road_distance_km,
                        "elevation_m": site.elevation_m,
                        "land_type": site.land_type,
                        "region": site.region,
                    }
                    for site in upserted_sites
                ]
                
                analysis_serializer = CalculatedAnalysisSerializer(data=analysis_input, many=True)
                if analysis_serializer.is_valid():
                    analysis_serializer.save()
                else:
                    # This will trigger a rollback of Sites.objects.update_or_create
                    return Response({"error": "Calculation failed", "details": analysis_serializer.errors}, status=400)
            # --- ATOMIC TRANSACTION END ---

            return Response({
                "message": f"Successfully processed {len(upserted_sites)} sites.",
                "filename": uploaded_file.name
            }, status=201)

        except Exception as e:
            return Response({"error": f"Import failed: {str(e)}"}, status=400)
        
    def get(self, request):
        try:
            # We call the common logic and pass the specific Model and Serializer
            # This replaces steps 1 through 5 in your original code
            data = get_filtered_site_data(
                request=request, 
                model=SitesWithScores, 
                serializer_class=SiteWithScoreSerializer
            )
            
            return Response(data, status=status.HTTP_200_OK)

        except Exception as e:
            # Keep the error handling here to catch database or logic issues
            return Response(
                {"error": f"Failed to retrieve sites: {str(e)}"}, 
                status=status.HTTP_400_BAD_REQUEST
            )

class SiteView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, **kwargs):
        try:
            site_id = kwargs.get("site_id")  # fetch from URL
            site = get_object_or_404(Sites, site_id=site_id)
            serializer = SiteDetailSerializer(site)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class SiteAnalysisView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        try:
            weight_data = request.data.get("weights")
            serializer = NewWeightSerializer(data=weight_data)
            
            if serializer.is_valid():
                # 1. Update the weights in AnalysisParameters
                serializer.save_weights()
                
                # 2. TRIGGER RECALCULATION (The next step)
                # You would call your calculation logic here for all sites
                self.recalculate_all_sites(serializer.validated_data)
                
                return Response({"message": "Weights updated and scores recalculated"}, status=200)
            
            return Response(serializer.errors, status=400)

        except Exception as e:
            return Response({"error": str(e)}, status=400)
        
    def recalculate_all_sites(self, weights):
        """
        Recalculates scores for every site and updates AnalysisResults.
        """
        sites = Sites.objects.all()

        for site in sites:
            # 1. Normalize Raw Values to 0-100 scores 
            # (This turns '15 degrees' or '5km' into a score out of 100)
            s_score = normalize_solar(site.solar_irradiance_kwh)
            a_score = normalize_area(site.area_sqm)
            g_score = normalize_grid(site.grid_distance_km)
            sl_score = normalize_slope(site.slope_degrees)
            i_score = normalize_infra(site.road_distance_km)

            # 2. Apply the weights to get weighted components
            w_solar = s_score * float(weights['solar'])
            w_area  = a_score * float(weights['area'])
            w_grid  = g_score * float(weights['grid'])
            w_slope = sl_score * float(weights['slope'])
            w_infra = i_score * float(weights['infra'])

            # 3. Sum for the Final Score
            total_suitability = w_solar + w_area + w_grid + w_slope + w_infra

            # 4. Upsert (Update or Create) the Result record
            AnalysisResults.objects.update_or_create(
                site=site,
                defaults={
                    'solar_score': round(w_solar, 2),
                    'area_score': round(w_area, 2),
                    'grid_score': round(w_grid, 2),
                    'slope_score': round(w_slope, 2),
                    'infra_score': round(w_infra, 2),
                    'total_score': round(total_suitability, 2)
                }
            )

class SiteStatiscsSummary(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        try:
            site_name = request.query_params.get('site_name')
            land_type = request.query_params.get('land_type')
            region = request.query_params.get('region')

            queryset = SitesWithScores.objects.all().order_by('-total_suitability_score')
            queryset = filter_by_site_name(queryset, site_name)
            queryset = filter_by_land_type(queryset, land_type)
            queryset = filter_by_region(queryset, region)

            queries = request.query_params.getlist("q")
            filters = split_values_for_query_params(queries, SitesWithScores)

            offset, limit = offset_and_limit_query_params(request)
            
            combined_q = Q()
            combined_q = build_score_filters(filters, combined_q)


            # 1. Start with the queryset
            sites = limit_and_offset_queries(queryset, limit, offset)
            
            # 2. Global Aggregates (Rounded to 2 decimals)
            # Doing this first keeps the JSON clean
            stats_raw = sites.aggregate(
                total_land_area=Sum("area_sqm"),
                avg_suitability=Avg('total_suitability_score'),
                avg_solar=Avg('solar_irradiance_score'),
                avg_area=Avg('area_score'),
                avg_grid=Avg('grid_distance_score'),
                avg_slope=Avg('slope_score'),
                avg_infra=Avg('infrastructure_score')
            )
            
            stats = {
                "avg_suitability_score": round(stats_raw['avg_suitability'] or 0, 2),
                "total_land_area": round(stats_raw["total_land_area"] or 0, 2),
                "factor_averages": {
                    "solar_irradiance": round(stats_raw['avg_solar'] or 0, 2),
                    "land_area": round(stats_raw['avg_area'] or 0, 2),
                    "grid_proximity": round(stats_raw['avg_grid'] or 0, 2),
                    "terrain_slope": round(stats_raw['avg_slope'] or 0, 2),
                    "infrastructure": round(stats_raw['avg_infra'] or 0, 2),
                }
            }

            # 3. Individual Site Data (Renamed and Sorted by score)
            site_scoring_system = list(sites.annotate(
                available_land_area=F('area_sqm'),
                solar_irradiance=F('solar_irradiance_kwh'),
                distance_from_grid=F('grid_distance_km'),
                terrain_elevation=F("elevation_m"),
                proximity_to_infra=F("road_distance_km")
            ).values(
                'site_id', 
                'site_name',
                'latitude',
                'longitude',
                'solar_irradiance',
                'available_land_area', 
                'distance_from_grid',
                'slope_degrees',
                'terrain_elevation',
                'land_type',
                'region',
                'proximity_to_infra',
                'total_suitability_score'
            ))

            return Response({
                "kpi": {
                    "total_sites": sites.count(),
                },
                "stats": stats,
                "site_data": {
                    "site_scoring_system": site_scoring_system,
                },
            }, status=200)
        
        except Exception as e:
            return Response({"error": f"Stats error: {str(e)}"}, status=400)
        
class SiteExportSummary(APIView):
    permission_classes = [permissions.AllowAny]
    
    def get(self, request):
        try:
            # Get your data using your common function
            data = get_filtered_site_data(request, SitesWithScores, SiteWithScoreSerializer)

            return export_to_csv_response(data, filename="solar_sites_summary.csv")

        except Exception as e:
            return Response({"error": str(e)}, status=400)