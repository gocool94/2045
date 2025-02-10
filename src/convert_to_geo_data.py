import pandas as pd
import geopandas as gpd
from shapely import wkt

# 📂 Load CSV File (Update path as needed)
csv_file_path = f"C:\\Users\\gocoo\\Downloads\\Electoral_Districts___Provincial__2020___Districts__lectoraux___Provincial__2020.csv"  # Change this to your actual file
output_geojson_path = "electoral_districts.geojson"

# 📌 Read CSV
df = pd.read_csv(csv_file_path)

# 📌 Convert WKT (Well-Known Text) to Geometry
df["geometry"] = df["the_geom"].apply(wkt.loads)

# 📌 Convert to GeoDataFrame
gdf = gpd.GeoDataFrame(df, geometry="geometry", crs="EPSG:4326")  # Ensure WGS84 projection

# 📌 Save as GeoJSON
gdf.to_file(output_geojson_path, driver="GeoJSON")

print(f"✅ GeoJSON file saved as: {output_geojson_path}")
