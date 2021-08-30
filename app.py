from flask import render_template
from flask import request, after_this_request
from flask import json
from flaskapp import create_app
from flaskapp.construct_distance_matrix import create_matrix
from flaskapp.optimize_path_google import optimize_google
from flaskapp.optimize_path_personal import optimize_personal
from dotenv import load_dotenv
import os

load_dotenv()

api_key = os.getenv("GOOGLE_API_KEY")
api_script = "https://maps.googleapis.com/maps/api/js?key="+api_key+"&callback=initMain&libraries=places&v=weekly"

app = create_app()

@app.route('/api', methods = ['POST','GET'])
def api():
    if request.method == 'POST':
        return api_script

@app.route('/', methods = ['POST','GET'])
def index():
    data = {}
    data["API_key"] = api_key
    data["num_vehicles"] = 1
    data["depot"] = 0
    
    if request.method == 'POST':
        # Load and convert JSON string from request event,  
        # and add its values to our dictionary 'data'
        request_data = json.loads(request.data)
        data["positions"] = request_data["path_positions"]

        # Create the distance matrix from our data and add it to the dictionary 'data'
        distance_matrix = create_matrix(data)
        data['distance_matrix'] = distance_matrix # yapf: disable

        # Collect solution of TSP of our data and create dictionary to return
        ## keys = { type: int, name: "Stop Order", description: "order of stops from 0 to (# of markers)"}
        ## values = { type: int, name: "Index Order" description: "index of data["positions"] accessed from 'optimized_path'" }
        #optimized_path = optimize_google(data)
        optimized_path = optimize_personal(distance_matrix)
        optimized_dict = {}
        path_length = len(optimized_path)
        for i in range(path_length):
            optimized_dict[i] = optimized_path[i]
        return optimized_dict

    return render_template("index.html")

if __name__ == "__main__":
    app.run()