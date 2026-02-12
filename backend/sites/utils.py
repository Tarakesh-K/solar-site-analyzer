import csv
from django.http import HttpResponse
from django.forms import ValidationError
from django.db import models
from django.db.models import Q
from sites.constants import ALLOWED_QUERY_PARAMS_FOR_SITE

def get_allowed_columns(model):
    """
    Returns a set of field names that are allowed for filtering 
    based on the specific model's schema.
    """
    return {
        field.name
        for field in model._meta.fields
        if isinstance(field, (models.IntegerField, models.FloatField, models.DecimalField, models.DateTimeField))
    }

def extract_values_from_csv(io_string):
    # DictReader uses the first line as keys automatically
    dict_reader = csv.DictReader(io_string)
    
    # Convert the reader object into a list of dictionaries
    # Each dictionary is { "header_name": "value" }
    return [row for row in dict_reader]

def split_values_for_query_params(queries, model):
    result = []

    for q in queries:
        # Create dict from "key:value,key:value" string
        data = {}
        for part in q.split(","):
            if ":" in part:
                key, value = part.split(":", 1)
                # 🔹 Auto-convert ALL values to numeric if possible
                data[key.strip()] = try_numeric_conversion(value.strip())

        # 🔹 Validation logic (Allowed Keys)
        invalid_keys = set(data.keys()) - ALLOWED_QUERY_PARAMS_FOR_SITE
        if invalid_keys:
            raise ValidationError(
                f"Invalid query keys: {sorted(invalid_keys)}. "
                f"Allowed keys: {sorted(ALLOWED_QUERY_PARAMS_FOR_SITE)}"
            )

        # 🔹 Validation logic (Allowed Columns)
        col = data.get("col")
        if not col:
            raise ValidationError("Missing `col` in filter")

        # 🔹 Call the function with the model passed into split_values_for_query_params
        allowed_cols = get_allowed_columns(model)

        if col not in allowed_cols:
            raise ValidationError(
                f"Invalid filter column: '{col}' for model '{model.__name__}'. "
                f"Allowed columns: {sorted(allowed_cols)}"
            )

        result.append(data)

    return result
    
def filter_by_site_name(queryset, site_name_prefix):
    """
    Case-insensitive 'Starts With' match for site_name.
    e.g., 'j' matches 'Jaipur', 'Jaisalmer'.
    """
    if site_name_prefix:
        # __istartswith handles case-insensitivity (J vs j)
        return queryset.filter(site_name__istartswith=site_name_prefix)
    return queryset

def filter_by_land_type(queryset, land_type):
    """
    Exact match for land_type (e.g., 'Barren', 'Scrub').
    """
    if land_type:
        return queryset.filter(land_type__exact=land_type)
    return queryset

def filter_by_region(queryset, region):
    """
    Exact match for region/state.
    """
    if region:
        return queryset.filter(region__iexact=region)
    return queryset

def build_score_filters(filters, combined_q=None):
    if combined_q is None:
        combined_q = Q()
    
    for f in filters:
        col = f.get('col')
        if not col:
            continue
            
        try:
            if 'score' in f and ('min_score' in f or 'max_score' in f):
                raise ValidationError({
                    "filter_error": f"Column '{col}' cannot have 'score' combined with 'min_score' or 'max_score'."
                })
            if 'score' in f:
                combined_q &= Q(**{f"{col}": f['score']})
            # We apply the filters to the Q object
            if 'min_score' in f:
                combined_q &= Q(**{f"{col}__gte": f['min_score']})
            if 'max_score' in f:
                combined_q &= Q(**{f"{col}__lte": f['max_score']}) 
        except Exception as e:
            # 🔹 Throwing ValidationError ensures the API user knows what went wrong
            raise ValidationError({
                "filter_error": f"Field '{col}' does not exist or has invalid data.",
                "details": str(e)
            })
            
    return combined_q

def offset_and_limit_query_params(request):
    try:
        # Default offset to 0, limit to None (all)
        offset = int(request.query_params.get("offset", 0))
        limit = request.query_params.get("limit")
        limit = int(limit) if limit is not None else None
    except (ValueError, TypeError):
        # Fallback if someone sends ?limit=abc
        offset = 0
        limit = None
    finally:
        return offset, limit

def limit_and_offset_queries(queryset, limit, offset):
    if limit is not None and offset is not None:
        # SQL: SELECT ... LIMIT {limit} OFFSET {offset}
        sites = queryset[offset : limit + offset]
    elif limit is not None:
        # SQL: SELECT ... LIMIT {limit}
        sites = queryset[:limit]
    else:
        # SQL: SELECT ... (All matching rows, no limit)
        # This fixes your 'sites.objects' typo
        sites = queryset.all()
    return sites

def try_numeric_conversion(value):
    """Attempt to convert string to float or int; return original if not possible."""
    try:
        # Check if it's an integer first (optional, but cleaner for some DBs)
        if "." not in value:
            return int(value)
        return float(value)
    except (ValueError, TypeError):
        return value

def normalize_solar(value):
    # Higher is better. Range: 3.0 (score 0) to 6.0 (score 100)
    val = float(value)
    if val >= 6.0: return 100
    if val <= 3.0: return 0
    return (val - 3.0) / (6.0 - 3.0) * 100

def normalize_slope(value):
    # Lower is better. Range: 0 deg (score 100) to 15 deg (score 0)
    val = float(value)
    if val <= 0: return 100
    if val >= 15: return 0
    return (15 - val) / 15 * 100

def normalize_grid(value):
    # Lower is better. Range: 0km (score 100) to 10km (score 0)
    val = float(value)
    if val <= 0: return 100
    if val >= 10: return 0
    return (10 - val) / 10 * 100

def normalize_area(value):
    """
    Goal: Bigger area = Higher Score.
    Range: 10,000 sqm (Score 0) to 100,000 sqm (Score 100).
    """
    val = float(value)
    min_area = 10000
    max_area = 100000
    
    if val >= max_area:
        return 100
    if val <= min_area:
        return 0
        
    # Linear Interpolation Formula: (Current - Min) / (Max - Min) * 100
    return ((val - min_area) / (max_area - min_area)) * 100

def normalize_infra(value):
    """
    Goal: Shorter distance = Higher Score.
    Range: 0 km (Score 100) to 10 km (Score 0).
    """
    val = float(value)
    max_dist = 10.0 # 10 km threshold
    
    if val <= 0:
        return 100
    if val >= max_dist:
        return 0
        
    # Inverse Linear Interpolation: (Max - Current) / Max * 100
    return ((max_dist - val) / max_dist) * 100

def get_filtered_site_data(request, model, serializer_class):
    """
    Logic-only helper to filter and serialize site data.
    """
    queries = request.query_params.getlist("q")
    site_name = request.query_params.get('site_name')
    land_type = request.query_params.get('land_type')
    region = request.query_params.get('region')

    # Apply your custom filter logic
    filters = split_values_for_query_params(queries, model)
    combined_q = Q()
    combined_q = build_score_filters(filters, combined_q)

    # Database Query
    queryset = model.objects.filter(combined_q)
    queryset = filter_by_site_name(queryset, site_name)
    queryset = filter_by_land_type(queryset, land_type)
    queryset = filter_by_region(queryset, region)

    # Handle Pagination
    offset, limit = offset_and_limit_query_params(request)
    sites = limit_and_offset_queries(queryset, limit, offset)

    # Serialize
    serializer = serializer_class(sites, many=True)
    return serializer.data

def export_to_csv_response(data, filename="solar_sites_summary.csv"):
    # Create the response object
    response = HttpResponse(content_type='text/csv')
    
    # This line is CRITICAL for triggering a download
    response['Content-Disposition'] = f'attachment; filename="{filename}"'

    if not data:
        return response

    # Use DictWriter to handle dictionaries
    headers = data[0].keys()
    writer = csv.DictWriter(response, fieldnames=headers)
    writer.writeheader()
    writer.writerows(data)

    return response