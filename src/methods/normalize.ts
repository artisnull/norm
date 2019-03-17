/**
 * Public method to begin normalization of data
 * @param {} data
 */
export default function normalize(data: (object | Array<object>)): object {
  if (!this.root) {
    throw new Error('No root is defined.')
  }

  // Start at root node
  let node = this.nodes.get(this.root)
  this._normalizeNode(data, node) // recursively normalize
  return this.normData // return normalized data
}
