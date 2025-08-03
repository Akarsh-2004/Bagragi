from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import pandas as pd
import joblib
import uvicorn
import traceback
from pymongo import MongoClient
from dotenv import load_dotenv
import os
import math

# Load environment variables
load_dotenv()
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
PORT = int(os.getenv("PORT", 5000))

# Create FastAPI app
app = FastAPI()

# Enable CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Connect to MongoDB
client = MongoClient(MONGO_URI)
db = client["Bagragi"]
hotel_collection = db["hotels"]

# Load ML model
try:
    model = joblib.load("ML/modelforHotels/hotel_price_model.pkl")
    print("✅ ML model loaded successfully.")
except Exception as e:
    print("❌ Failed to load model:", e)
    model = None

# Load backup CSV dataset
try:
    sample_data = pd.read_csv("data/enhanced_hotels_dataset.csv")
    print("✅ Sample CSV data loaded.")
except Exception as e:
    print("❌ Failed to load sample CSV:", e)
    sample_data = pd.DataFrame()

# --------- UTILITY: Sanitize floats and NaNs for JSON ---------
def sanitize_for_json(data):
    if isinstance(data, dict):
        return {k: sanitize_for_json(v) for k, v in data.items()}
    elif isinstance(data, list):
        return [sanitize_for_json(item) for item in data]
    elif isinstance(data, float):
        if math.isnan(data) or math.isinf(data):
            return 0.0
        return round(data, 2)
    else:
        return data

# --------- MAIN API ROUTE ---------
@app.post("/api/hotel_info")
async def hotel_info(request: Request):
    try:
        data = await request.json()
        country = data.get("country", "").strip()
        city = data.get("city", "").strip()
        star_filter = data.get("stars")

        if not country and not city:
            return JSONResponse(content={"error": "Missing 'country' or 'city' parameter"}, status_code=400)

        # --- FILTER CSV DATA ---
        filtered_csv = sample_data.copy()
        if country:
            filtered_csv = filtered_csv[filtered_csv["Country"].str.lower() == country.lower()]
        if city:
            filtered_csv = filtered_csv[filtered_csv["City/Place"].str.lower() == city.lower()]
        if star_filter:
            try:
                stars = [float(s) for s in (star_filter if isinstance(star_filter, list) else [star_filter])]
                filtered_csv = filtered_csv[filtered_csv["Stars"].isin(stars)]
            except ValueError:
                return JSONResponse(content={"error": "Invalid 'stars' value"}, status_code=400)

        # --- ML PREDICTION ON CSV ---
        predicted_prices_csv = []
        for _, row in filtered_csv.iterrows():
            try:
                stars = float(row.get("Stars", 3))
                dist_str = str(row.get("Distance from Center", "2.5"))
                dist = float(dist_str.split()[0]) if "km" in dist_str else float(dist_str)
                pred = model.predict([[stars, dist]])[0] if model else None
                if pred is not None and math.isfinite(pred):
                    predicted_prices_csv.append(pred)
                else:
                    predicted_prices_csv.append(None)
            except:
                predicted_prices_csv.append(None)

        filtered_csv = filtered_csv.copy()
        filtered_csv["Predicted Price"] = predicted_prices_csv
        csv_result = filtered_csv.to_dict(orient="records")
        for hotel in csv_result:
            hotel["Host Hotel"] = False
            hotel["Name"] = hotel.get("Hotel Name", "") or hotel.get("Name", "")

        # --- QUERY MONGO ---
        mongo_query = {}
        if country:
            mongo_query["location.country"] = {"$regex": f"^{country}$", "$options": "i"}
        if city:
            mongo_query["location.city"] = {"$regex": f"^{city}$", "$options": "i"}
        if star_filter:
            try:
                stars = [float(s) for s in (star_filter if isinstance(star_filter, list) else [star_filter])]
                mongo_query["stars"] = {"$in": stars}
            except:
                pass

        mongo_hotels = list(hotel_collection.find(mongo_query))
        mongo_result = []
        for h in mongo_hotels:
            try:
                stars = float(h.get("stars", 3))
            except:
                stars = 3.0
            dist = 2.5  # default

            try:
                pred = model.predict([[stars, dist]])[0] if model else None
                if pred is not None and not math.isfinite(pred):
                    pred = None
            except:
                pred = None

            mongo_result.append({
                "Country": h.get("location", {}).get("country", ""),
                "City/Place": h.get("location", {}).get("city", ""),
                "Location": h.get("location", {}).get("address", ""),
                "Stars": stars,
                "Distance from Center": dist,
                "Predicted Price": pred,
                "Host Hotel": True,
                "Name": h.get("name", ""),
                "Description": h.get("description", ""),
                "Price Per Night": h.get("pricePerNight", ""),
                "Amenities": h.get("amenities", []),
                "Rating": h.get("averageRating", 0),
                "Images": h.get("images", [])
            })

        # --- FINAL RESPONSE ---
        all_hotels = csv_result + mongo_result
        valid_prices = [h["Predicted Price"] for h in all_hotels if isinstance(h.get("Predicted Price"), (int, float)) and math.isfinite(h["Predicted Price"])]
        avg_price = round(sum(valid_prices) / len(valid_prices), 2) if valid_prices else None

        response = {
            "hotels": all_hotels,
            "average_price": avg_price,
            "count": len(all_hotels)
        }

        return JSONResponse(content=sanitize_for_json(response))

    except Exception as e:
        traceback.print_exc()
        return JSONResponse(content={"error": f"Internal server error: {str(e)}"}, status_code=500)

# --------- MAIN ENTRY POINT ---------
if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=PORT, reload=True)
