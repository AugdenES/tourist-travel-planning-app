import numpy as np

def optimize_personal(distance_matrix):
  row = 0
  visited = [0]
  def min_cost(row, visited):
    if len(visited) == len(distance_matrix[row]):
      return visited
    for column in visited:
      distance_matrix[row][column] = np.nan
    currentRow = distance_matrix[row]
    nextLocation = currentRow.index(np.nanmin(currentRow)) # min(cost for cost in currentRow if cost != 0)
    visited.append(nextLocation)
    return min_cost(nextLocation, visited)

  return min_cost(row, visited)