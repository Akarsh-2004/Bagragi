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
import re
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
PORT = int(os.getenv("PORT", 8000))  # Changed to 8000 to match frontend

# Create FastAPI app
app = FastAPI(title="Hotel API with ML Predictions", version="1.0.0")

# Enable CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Connect to MongoDB
hotel_collection = None
mongodb_connected = False
try:
    client = MongoClient(MONGO_URI)
    db = client["Bagragi"]
    hotel_collection = db["hotels"]
    # Test the connection
    client.admin.command('ping')
    mongodb_connected = True
    logger.info("✅ MongoDB connected successfully")
except Exception as e:
    logger.error(f"❌ MongoDB connection failed: {e}")
    hotel_collection = None
    mongodb_connected = False

# Load ML model
model = None
model_features = []
try:
    model = joblib.load("ML/modelforHotels/hotel_price_model.pkl")
    logger.info("✅ ML model loaded successfully")
    
    # Try to get model feature names if available
    if hasattr(model, 'feature_names_in_'):
        model_features = model.feature_names_in_.tolist()
        logger.info(f"Model features: {model_features}")
    else:
        # Default feature names based on your current implementation
        model_features = ['stars', 'distance']
        logger.info("Using default features: stars, distance")
        
except Exception as e:
    logger.error(f"❌ Failed to load model: {e}")
    model = None

# Load backup CSV dataset
sample_data = pd.DataFrame()
try:
    sample_data = pd.read_csv("data/enhanced_hotels_dataset.csv")
    logger.info(f"✅ Sample CSV data loaded: {len(sample_data)} hotels")
    logger.info(f"CSV columns: {sample_data.columns.tolist()}")
except Exception as e:
    logger.error(f"❌ Failed to load sample CSV: {e}")

# --------- UTILITY FUNCTIONS ---------
def sanitize_for_json(data):
    """Convert numpy types and handle NaN values for JSON serialization"""
    if isinstance(data, dict):
        return {k: sanitize_for_json(v) for k, v in data.items()}
    elif isinstance(data, list):
        return [sanitize_for_json(item) for item in data]
    elif isinstance(data, float):
        if math.isnan(data) or math.isinf(data):
            return None
        return round(data, 2)
    elif pd.isna(data):
        return None
    else:
        return data

def parse_distance(distance_str):
    """Parse distance string to float"""
    if pd.isna(distance_str) or distance_str == "":
        return 2.5  # default
    
    try:
        # Handle different formats: "2.5 km", "2.5", "2.5 km from downtown"
        distance_str = str(distance_str).lower()
        
        # Extract number using regex
        match = re.search(r'(\d+\.?\d*)', distance_str)
        if match:
            return float(match.group(1))
        else:
            return 2.5
    except:
        return 2.5

def predict_hotel_price(stars, distance, additional_features=None):
    """Predict hotel price using ML model"""
    if not model:
        return None
    
    try:
        # Ensure we have valid numeric values
        stars = float(stars) if stars and not pd.isna(stars) else 3.0
        distance = float(distance) if distance and not pd.isna(distance) else 2.5
        
        # Prepare features based on model requirements
        if len(model_features) == 2:
            # Simple model with stars and distance
            features = [[stars, distance]]
        else:
            # More complex model - would need additional feature engineering
            features = [[stars, distance]]
            logger.warning("Model expects more features than provided, using basic features")
        
        prediction = model.predict(features)[0]
        
        # Validate prediction
        if math.isfinite(prediction) and prediction > 0:
            return round(prediction, 2)
        else:
            return None
            
    except Exception as e:
        logger.error(f"Prediction error: {e}")
        return None

def process_csv_hotels(filtered_csv):
    """Process CSV hotels and add ML predictions"""
    results = []
    
    for _, row in filtered_csv.iterrows():
        try:
            # Extract and clean data
            stars = row.get("Stars", 3)
            distance_raw = row.get("Distance from Center", "2.5 km")
            distance = parse_distance(distance_raw)
            
            # Get ML prediction
            predicted_price = predict_hotel_price(stars, distance)
            
            # Create hotel record
            hotel_record = {
                "Country": sanitize_for_json(row.get("Country", "")),
                "City/Place": sanitize_for_json(row.get("City/Place", "")),
                "Hotel Name": sanitize_for_json(row.get("Hotel Name", "")),
                "Stars": sanitize_for_json(stars),
                "Rating": sanitize_for_json(row.get("Rating", "N/A")),
                "Number of Reviews": sanitize_for_json(row.get("Number of Reviews", 0)),
                "Property Type": sanitize_for_json(row.get("Property Type", 0)),
                "Location": sanitize_for_json(row.get("Location", "")),
                "Distance from Center": sanitize_for_json(distance_raw),
                "Avg Price per Night (USD)": sanitize_for_json(row.get("Avg Price per Night (USD)", 0)),
                "Currency": sanitize_for_json(row.get("Currency", "USD")),
                "Amenities": sanitize_for_json(row.get("Amenities", [])),
                "Scraped Date": sanitize_for_json(row.get("Scraped Date", "")),
                "Predicted Price": predicted_price,
                "Host Hotel": False,
                "Name": sanitize_for_json(row.get("Hotel Name", "") or row.get("Name", ""))
            }
            
            results.append(hotel_record)
            
        except Exception as e:
            logger.error(f"Error processing CSV hotel: {e}")
            continue
    
    return results

def process_mongo_hotels(mongo_hotels):
    """Process MongoDB hotels and add ML predictions"""
    results = []
    
    for h in mongo_hotels:
        try:
            stars = float(h.get("stars", 3))
            distance = 2.5  # default for mongo hotels
            
            # Get ML prediction
            predicted_price = predict_hotel_price(stars, distance)
            
            hotel_record = {
                "Country": h.get("location", {}).get("country", ""),
                "City/Place": h.get("location", {}).get("city", ""),
                "Location": h.get("location", {}).get("address", ""),
                "Stars": stars,
                "Distance from Center": f"{distance} km",
                "Predicted Price": predicted_price,
                "Host Hotel": True,
                "Name": h.get("name", ""),
                "Hotel Name": h.get("name", ""),
                "Description": h.get("description", ""),
                "Price Per Night": h.get("pricePerNight", ""),
                "Amenities": h.get("amenities", []),
                "Rating": h.get("averageRating", 0),
                "Images": h.get("images", []),
                "Currency": "INR"
            }
            
            results.append(sanitize_for_json(hotel_record))
            
        except Exception as e:
            logger.error(f"Error processing MongoDB hotel: {e}")
            continue
    
    return results

# --------- MAIN API ROUTE ---------
@app.post("/api/hotel_info")
async def hotel_info(request: Request):
    try:
        data = await request.json()
        country = data.get("country", "").strip()
        city = data.get("city", "").strip()
        star_filter = data.get("stars")
        
        logger.info(f"Request: country={country}, city={city}, stars={star_filter}")

        if not country and not city:
            return JSONResponse(
                content={"error": "Please provide either 'country' or 'city' parameter"}, 
                status_code=400
            )

        # --- FILTER CSV DATA ---
        csv_results = []
        if not sample_data.empty:
            filtered_csv = sample_data.copy()
            
            if country:
                filtered_csv = filtered_csv[
                    filtered_csv["Country"].str.lower() == country.lower()
                ]
            
            if city:
                filtered_csv = filtered_csv[
                    filtered_csv["City/Place"].str.lower() == city.lower()
                ]
                
            if star_filter:
                try:
                    stars = [float(s) for s in (star_filter if isinstance(star_filter, list) else [star_filter])]
                    filtered_csv = filtered_csv[filtered_csv["Stars"].isin(stars)]
                except ValueError:
                    return JSONResponse(
                        content={"error": "Invalid 'stars' value. Must be a number between 1-5"}, 
                        status_code=400
                    )
            
            csv_results = process_csv_hotels(filtered_csv)
            logger.info(f"Found {len(csv_results)} CSV hotels")

        # --- QUERY MONGO ---
        mongo_results = []
        if mongodb_connected and hotel_collection is not None:
            try:
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
                mongo_results = process_mongo_hotels(mongo_hotels)
                logger.info(f"Found {len(mongo_results)} MongoDB hotels")
            except Exception as e:
                logger.error(f"MongoDB query error: {e}")
                mongo_results = []

        # --- COMBINE AND CALCULATE STATS ---
        all_hotels = csv_results + mongo_results
        
        # Calculate average price from ML predictions
        predicted_prices = [
            h["Predicted Price"] for h in all_hotels 
            if h.get("Predicted Price") is not None and isinstance(h["Predicted Price"], (int, float))
        ]
        
        avg_price = round(sum(predicted_prices) / len(predicted_prices), 2) if predicted_prices else None
        
        # Add USD prices as backup average if no ML predictions
        if avg_price is None:
            usd_prices = [
                h.get("Avg Price per Night (USD)", 0) * 83 for h in all_hotels 
                if h.get("Avg Price per Night (USD)") and h.get("Avg Price per Night (USD)") > 0
            ]
            avg_price = round(sum(usd_prices) / len(usd_prices), 2) if usd_prices else None

        response = {
            "hotels": all_hotels,
            "average_price": avg_price,
            "count": len(all_hotels),
            "ml_predictions": len(predicted_prices),
            "model_status": "active" if model else "unavailable"
        }

        logger.info(f"Returning {len(all_hotels)} hotels, avg_price={avg_price}")
        return JSONResponse(content=response)

    except Exception as e:
        logger.error(f"API Error: {str(e)}")
        traceback.print_exc()
        return JSONResponse(
            content={"error": f"Internal server error: {str(e)}"}, 
            status_code=500
        )

# --------- HEALTH CHECK ENDPOINT ---------
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "model_loaded": model is not None,
        "csv_data_loaded": not sample_data.empty,
        "mongodb_connected": mongodb_connected,
        "model_features": model_features
    }

# --------- MAIN ENTRY POINT ---------
if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=PORT, reload=True)