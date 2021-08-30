from __future__ import division
from __future__ import print_function
import requests
import json
import urllib

def create_matrix(data):
  positions = data["positions"]
  API_key = data["API_key"]
  # Distance Matrix API only accepts 100 elements per request, so get rows in multiple requests.
  max_elements = 100
  num_positions = len(positions) 
  # Maximum number of rows that can be computed per request 
  max_rows = max_elements // num_positions
  q, r = divmod(num_positions, max_rows)
  dest_positions = positions
  distance_matrix = []
  # Send q requests, returning max_rows rows per request.
  for i in range(q):
    origin_positions = positions[i * max_rows: (i + 1) * max_rows]
    response = send_request(origin_positions, dest_positions, API_key)
    distance_matrix += build_distance_matrix(response)

  # Get the remaining r rows, if necessary.
  if r > 0:
    origin_positions = positions[q * max_rows: q * max_rows + r]
    response = send_request(origin_positions, dest_positions, API_key)
    distance_matrix += build_distance_matrix(response)
  return distance_matrix

def send_request(origin_positions, dest_positions, API_key):
  """ Build and send request for the given origin and destination positions."""
  def build_address_str(positions):
    # Build a pipe-separated string of positions
    address_str = ''
    for i in range(len(positions) - 1):
      address_str += positions[i] + '|' 
    address_str += positions[-1]
    return address_str

  request = 'https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial'
  origin_address_str = build_address_str(origin_positions)
  dest_address_str = build_address_str(dest_positions)
  request = request + '&origins=' + origin_address_str + '&destinations=' + \
                       dest_address_str + '&key=' + API_key
  with urllib.request.urlopen(request) as response:
    jsonResult = response.read()
  response = json.loads(jsonResult)
  return response

def build_distance_matrix(response):
  distance_matrix = []
  for row in response['rows']:
    row_list = [row['elements'][j]['distance']['value'] for j in range(len(row['elements']))]
    distance_matrix.append(row_list)
  return distance_matrix