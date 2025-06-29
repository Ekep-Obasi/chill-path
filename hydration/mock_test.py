#FOR TESTING PURPOSES ONLY
#DELETE THIS FILE AFTER TESTING
from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/distance_only', methods=['POST'])
def mock_distance_only():
    data = request.get_json()
    print("Received:", data)

    return jsonify({
        "distance": 1800.0,   # meters
        "duration": 1200.0    # seconds
    })

if __name__ == '__main__':
    app.run(debug=True, port=3000)
