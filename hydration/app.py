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
    

@app.route('/api/get-chill-path-recommendation', methods=['POST'])
def get_chill_path_recommendation():
    data = request.get_json()

    # Validate incoming JSON
    start = data.get('start')
    end = data.get('end')
    mode = data.get('mode', 'walking')  # default to walking if not given

    if not start or not end:
        return jsonify({"error": "start and end coordinates are required"}), 400

    # Send POST request to Express backend
    express_api_url = "http://127.0.0.1:3000/distance_only"  # Adjust port if needed

    try:
        express_response = requests.post(express_api_url, json={
            "start": start,
            "end": end,
            "mode": mode
        })
        express_response.raise_for_status()
        express_data = express_response.json()

        distance = express_data.get("distance")
        duration = express_data.get("duration")  # in seconds

        if distance is None or duration is None:
            return jsonify({"error": "Invalid response from Express backend"}), 500

        # Calculate recommended water
        recommended_water = calculate_water_recommendation(duration)

        return jsonify({
            "start": start,
            "end": end,
            "distance_meters": distance,
            "time_seconds": duration,
            "recommended_water_liters": recommended_water,
            "message": "Remember to refill at water stops and listen to your body!"
        })

    except requests.exceptions.RequestException as e:
        return jsonify({"error": f"Failed to connect to Express backend: {e}"}), 500
    except Exception as e:
        return jsonify({"error": f"An internal server error occurred: {e}"}), 500


if __name__ == '__main__':
    app.run(debug=True, port=5001) 
