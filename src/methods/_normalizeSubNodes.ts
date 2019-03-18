import { Node } from '../index.d'

export default function _normalizeSubNodes(dataSlice: object, node: Node) : void {
  const {
    name: parentName,
    subNodes = {},
    resolve
  } = node

  // iterate through subNodes and normalize each
  Object.getOwnPropertySymbols(subNodes).forEach(subNodeSym => {
    const subNodeId = subNodes[subNodeSym]
    const subNode: Node = this.nodes.get(subNodeSym)
    const {
      name,
      additionalIds,
      transform,
      filter,
      omit
    } = subNode

    let subSlice = dataSlice[name]

    // handle options.resolve
    if (resolve) {
      if (typeof resolve !== 'object') {
        throw new Error(
          'resolve must be an object, where the subNodes to resolve are the keys, and the resolve functions are the respective values.',
        )
      } else if (resolve[name] && typeof resolve[name] === 'function') {
        subSlice = resolve[name](dataSlice)
      } else if (resolve[name] && typeof resolve[name] !== 'function'){
        throw new Error(
          'resolve must be an object, where the subNodes to resolve are the keys, and the resolve functions are the respective values.',
        )
      }
    }

    if (subSlice) {
      // if we have data, format it
      const isObj = !Array.isArray(subSlice)

      const formattedData = this._formatArr({
        data: isObj ? [subSlice] : subSlice,
        id: subNodeId,
        additionalIds,
        transform,
        filter,
      })

      // Replace the reference in the parent of the normalized values
      const replacement = isObj ? [subSlice[subNodeId]] : formattedData.allIds

      dataSlice[name] = replacement

      !omit &&
        this._addNormData({
          ...formattedData,
          nodeName: name,
        })

      // normalize the subNode
      this._normalizeNode(subSlice, subNode)
    } else {
      !this.silent &&
        console.warn(
          `Couldn't locate ${name} in ${parentName}. Ensure nodes and subNodes match.`,
        )
    }
  })
}
