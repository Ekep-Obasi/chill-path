from flask import Flask, request, jsonify
import requests # To make HTTP requests to your partner's backend
from flask_cors import CORS # Import CORS


app = Flask(__name__)
CORS(app)

def calculate_water_recommendation(time_in_seconds):
    walk_duration_hours = time_in_seconds/3600
    recommended_water_liters = walk_duration_hours*0.875

    if(recommended_water_liters < 0.5):
        return 0.5
    elif recommended_water_liters <= 1.0:
        return 1.0
    elif recommended_water_liters <= 1.5:
        return 1.5
    else:
        return round(recommended_water_liters * 2) / 2 
    

# TEST REMOVE LATER
@app.route('/api/mock-partner-distance-time', methods=['GET'])
def get_mock_distance_time():
    # You can optionally use path_id here if you want to return different data based on it
    # path_id = request.args.get('pathId')

    # Hardcoded values for testing
    hardcoded_distance = 5000  # meters (e.g., 5 km)
    hardcoded_time = 3600      # seconds (e.g., 1 hour)

    return jsonify({
        "distance_meters": hardcoded_distance,
        "time_seconds": hardcoded_time
    }), 200 # Return 200 OK status
#remove later

@app.route('/api/get-chill-path-recommendation', methods=['GET'])
def get_chill_path_recommendation():
    path_id = request.args.get('pathId') # Get path ID from your frontend

    if not path_id:
        return jsonify({"error": "pathId is required"}), 400

    # 1. Call Partner's Backend (NOW CALLING YOUR MOCK BACKEND)
    # Set the URL to your own local mock endpoint
    # Ensure this URL matches where your Flask app is running (default is localhost:5000)
    partner_api_url = f"http://127.0.0.1:5001/api/mock-partner-distance-time?pathId={path_id}" # Using 127.0.0.1 or localhost

    try:
        partner_response = requests.get(partner_api_url)
        partner_response.raise_for_status()
        partner_data = partner_response.json()

        distance_meters = partner_data.get("distance_meters")
        time_seconds = partner_data.get("time_seconds")

        if distance_meters is None or time_seconds is None:
            # This error might now indicate an issue with your mock backend's response format
            return jsonify({"error": "Could not retrieve distance or time from partner (mock) backend"}), 500

        # 2. Apply Hydration Logic
        recommended_water = calculate_water_recommendation(time_seconds)

        # 3. Return to Frontend
        return jsonify({
            "pathId": path_id,
            "distance_meters": distance_meters,
            "time_seconds": time_seconds,
            "recommended_water_liters": recommended_water,
            "message": "Remember to refill at water stops and listen to your body!"
        })

    except requests.exceptions.RequestException as e:
        return jsonify({"error": f"Failed to connect to partner (mock) backend: {e}"}), 500
    except Exception as e:
        return jsonify({"error": f"An internal server error occurred: {e}"}), 500



if __name__ == '__main__':
    app.run(debug=True, port=5001) 
