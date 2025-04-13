from flask import Flask, render_template, request, jsonify
import os
import random

app = Flask(__name__)
app.config['SECRET_KEY'] = os.urandom(24)

# Default currency and VAT settings
DEFAULT_CURRENCY = '₪'
VAT_RATE = 0.18

# Sample user data - using the actual PNG files from static/images
USERS = [
    {"id": "1", "name": "דניאל", "avatar": "דניאל.png"},
    {"id": "2", "name": "אלעד", "avatar": "אלעד.png"},
    {"id": "3", "name": "אהוד", "avatar": "אהוד.png"},
    {"id": "5", "name": "שוצי", "avatar": "שוצי.png"},
    {"id": "6", "name": "כפיר", "avatar": "כפיר.png"},
    {"id": "7", "name": "טראו", "avatar": "טראו.png"}
]

# Read Simon lines from file
def get_simon_lines():
    simon_lines = []
    try:
        with open('static/SimonLines.txt', 'r') as file:
            simon_lines = [line.strip() for line in file.readlines() if line.strip()]
    except Exception as e:
        print(f"Error reading Simon lines: {e}")
        simon_lines = ["Why are you gay?", "You are gay."]
    return simon_lines

@app.route('/')
def index():
    simon_lines = get_simon_lines()
    return render_template('index.html', users=USERS, currency=DEFAULT_CURRENCY, vat_rate=VAT_RATE, simon_lines=simon_lines)

@app.route('/calculate', methods=['POST'])
def calculate():
    data = request.get_json()
    items = data.get('items', [])
    
    # Calculate total per person
    person_totals = {}
    for item in items:
        price = float(item['price'])
        selected_users = item['selected_users']
        split_amount = price / len(selected_users)
        
        for user_id in selected_users:
            if user_id not in person_totals:
                person_totals[user_id] = 0
            person_totals[user_id] += split_amount
    
    return jsonify(person_totals)

@app.route('/get_random_simon_line')
def get_random_simon_line():
    simon_lines = get_simon_lines()
    random_line = random.choice(simon_lines) if simon_lines else "Why are you gay?"
    return jsonify({"line": random_line})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True) 