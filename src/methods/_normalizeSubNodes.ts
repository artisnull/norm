import { Node } from '../index.d'

export default function _normalizeSubNodes(
  dataSlice: object,
  node: Node,
): void {
  const { name: parentName, subNodes = {}, resolve } = node

  // iterate through subNodes and normalize each
  Object.getOwnPropertySymbols(subNodes).forEach(subNodeSym => {
    const subNodeId = subNodes[subNodeSym]
    const subNode: Node = this.nodes.get(subNodeSym)
    const { name, additionalIds, transform, filter, omit } = subNode

    let subSlice = dataSlice[name]
    let superSlice, lastNode
    // handle options.resolve
    if (resolve) {
      if (typeof resolve !== 'object') {
        throw new Error(
          'resolve must be an object, where the subNodes to resolve are the keys, and the resolve functions are the respective values.',
        )
      } else if (resolve[name] && typeof resolve[name] === 'function' && typeof resolve[name](dataSlice) === 'string') {
        // split up the path and keep track of where we are
        const path = resolve[name](dataSlice).split('.')
        path.shift()
        lastNode = path.pop()
        superSlice = path.reduce((acc : object, curr : string) => acc[curr], dataSlice)
        subSlice = superSlice[lastNode]
      } else if (resolve[name]) {
        throw new Error(
          'resolve must be an object, where the subNodes to resolve are the keys, and the values are functions that return strings describing the path to resolve.',
        )
      }
    }

    if (subSlice) {
      // normalize the subNode
      this._normalizeNode(subSlice, subNode)

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

      if (resolve) {
        delete superSlice[lastNode]
        superSlice[subNode.name] = replacement
      } else {
        dataSlice[subNode.name] = replacement
      }

      !omit &&
        this._addNormData({
          ...formattedData,
          nodeName: name,
        })
    } else {
      !this.silent &&
        console.warn(
          `Couldn't locate ${name} in ${parentName}. Ensure nodes and subNodes match.`,
        )
    }
  })
}
