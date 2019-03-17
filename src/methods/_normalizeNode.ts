import { Node } from '../index.d'
/**
 * Recursively normalizes a node based on the subNodes it identifies
 */
export default function _normalizeNode(data: (object | Array<object>), node: Node) : void {
  if (!data) {
    return
  }

  // If data is an array, iterate through each item and normalize the subNodes
  if (Array.isArray(data)) {
    data.forEach(dataSlice => {
      this._normalizeSubNodes(dataSlice, node)
    })
  } else {
    // data is an object, normalize the subNodes
    this._normalizeSubNodes(data, node)
  }
}
