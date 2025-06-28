# app.py

# To run this code you need to install the following dependencies:
# pip install google-genai python-dotenv Flask Flask-Cors

import os
from flask import Flask, request, jsonify
from flask_cors import CORS # Import CORS to handle cross-origin requests
from google import genai
from google.genai import types

from dotenv import load_dotenv
load_dotenv() # Load environment variables from .env file

# 1. Initialize Flask Application
app = Flask(__name__)
# Enable CORS for all origins. This is necessary during development
# so your frontend (e.g., HTML file loaded directly in browser, or different local port)
# can communicate with this backend.
# IMPORTANT: In a production environment, you should restrict this to your specific frontend URL(s).
CORS(app)

# 2. Initialize Gemini Client (done once when the app starts)
client = genai.Client(
    api_key=os.environ.get("GEMINI_API_KEY"),
)

model = "gemini-2.5-pro"

# 3. Define the System Instructions (these remain constant for your bot's personality)
system_instructions = [
    types.Part.from_text(text="""You are a friendly and knowledgeable assistant specializing in heat-related health and safety.

Your job is to help people stay safe and comfortable during hot weather.

Provide advice about preventing heatstroke, recognizing symptoms of heat exhaustion, and what to do in case of heat emergencies.
Suggest appropriate clothing to wear in hot conditions.
Advise on hydration: how much water to drink, signs of dehydration, and tips for staying cool.
Offer general guidance for families, outdoor workers, athletes, the elderly, and children.
Be supportive, clear, and practical. If someone describes symptoms of severe heat illness, encourage them to seek professional medical help immediately.
Only answer questions related to heat, hot weather, sun safety, and hydration.

"""),
]

# 4. Define the Generative Model Configuration
generate_content_config = types.GenerateContentConfig(
    temperature=0.4,
    max_output_tokens=6000,
    thinking_config = types.ThinkingConfig(
        thinking_budget=-1,
    ),
    response_mime_type="text/plain",
    system_instruction=system_instructions,
)

# 5. Create the API Endpoint for Chatting
# This is the "doorway" for your frontend to send messages to your backend.
@app.route('/chat', methods=['POST'])
def chat():
    # Get the JSON data sent from the frontend
    # The frontend will send the 'history' (list of past messages)
    # and the 'message' (the current user's input)
    data = request.json
    conversation_history_raw = data.get('history', [])
    current_user_message = data.get('message', '')

    # Convert the raw history from the frontend's JSON format
    # into the Gemini API's `types.Content` objects.
    conversation_history_for_gemini = []
    for entry in conversation_history_raw:
        if 'role' in entry and 'parts' in entry and isinstance(entry['parts'], list):
            parts_list = []
            for part in entry['parts']:
                if 'text' in part and isinstance(part['text'], str):
                    parts_list.append(types.Part.from_text(text=part['text']))
            if parts_list:
                conversation_history_for_gemini.append(types.Content(role=entry['role'], parts=parts_list))

    # Add the current user message to the history for this specific API call
    if current_user_message:
        conversation_history_for_gemini.append(
            types.Content(role="user", parts=[types.Part.from_text(text=current_user_message)])
        )

    full_response = ""
    try:
        # Call the Gemini API with the full conversation history
        # The model uses this history to understand the context of the current message.
        for chunk in client.models.generate_content_stream(
            model=model,
            contents=conversation_history_for_gemini,
            config=generate_content_config,
        ):
            full_response += chunk.text
        
        # Return the Gemini's response as a JSON object
        return jsonify({'response': full_response})

    except Exception as e:
        # Handle errors gracefully
        print(f"Error calling Gemini API: {e}")
        return jsonify({'error': 'An internal server error occurred. Please check logs.'}), 500

# 6. Run the Flask Server
if __name__ == '__main__':
    # Ensure the API key is loaded before starting the server
    if not os.environ.get("GEMINI_API_KEY"):
        print("Error: GEMINI_API_KEY environment variable not set.")
        print("Please ensure your .env file is in the same directory as app.py and contains GEMINI_API_KEY='YOUR_API_KEY'.")
    else:
        # This starts the Flask development server.
        # It will listen for incoming requests (e.g., from your future frontend)
        # on http://127.0.0.1:5000 (localhost on port 5000).
        print("Flask backend is starting...")
        print("Listening for requests on http://127.0.0.1:5000/chat")
        app.run(debug=True, port=5000)