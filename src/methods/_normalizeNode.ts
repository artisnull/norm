import { Node } from '../index.d'
/**
 * Recursively normalizes a node based on the subNodes it identifies
 */
export default function _normalizeNode(data: object, node: Node) {
  const { name, rename, omit, ...rest } = node
  if (!data) {
    return { allIds: [] }
  }

  /*
      Normalize subNodes of node before node itself
      ----------------------
      */
  // If data is an array, iterate through each item and normalize the subNodes
  if (Array.isArray(data)) {
    data.forEach(d => {
      const dataSlice = { ...d }
      this._normalizeSubNodes(dataSlice, node)
    })
  } else {
    // data is an object, normalize the subNodes
    this._normalizeSubNodes(data, node)
  }
}
