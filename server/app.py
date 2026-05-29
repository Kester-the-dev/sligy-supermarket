from flask import Flask, jsonify
from flask_cors import CORS
import json

app = Flask(__name__)
CORS(app)

with open('data/products.json') as f:
    products = json.load(f)

@app.route('/api/products')
def get_products():
    return jsonify(products)

if __name__ == '__main__':
    app.run(port=5000, debug=True)