/**
 * Public method to begin normalization of data
 * @param {} data
 */
export default function normalize(data: (object | Array<object>)): object {
  if (!this.root) {
    throw new Error('No root is defined.')
  }

  let originalSlice = data
  // Start at root node
  let node = this.nodes.get(this.root)
  if (!Array.isArray(data) && typeof data === 'object')  {
    originalSlice = {[node.name]: data}
  } else if (Array.isArray(data)){
    let firstNodeName = this.nodes.get(this.firstNode).name
    originalSlice = {[firstNodeName]: data}
  } else {
    throw new Error(`Data must be an array or object. Recieved ${typeof data}`)
  }
  this._normalizeNode(originalSlice, node) // recursively normalize
  return this.normData // return normalized data
}
