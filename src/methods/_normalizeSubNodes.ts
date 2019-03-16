import { Node } from '../index.d'
import { defaultNode, defaultOptions } from '../constants/defaults'

export default function _normalizeSubNodes(dataSlice: object, node: Node) : void {
  const {
    subNodes,
    name,
    resolve,
    rename,
    additionalIds,
    transform,
    filter,
  } = node
  // iterate through subNodes and normalize each
  Object.entries(subNodes).forEach(([subNodeName, subNodeId]) => {
    let subNode: Node
    if (!this.nodes.has(subNodeName)) {
      this.addNode(subNodeName, defaultNode, defaultOptions)
    }
    subNode = this.nodes.get(subNodeName)

    // find this subNode
    if (subNode._dupNode) {
      subNode = subNode[subNode._rename[name]]
    }

    let subSlice = dataSlice[subNodeName]

    // handle options.resolve
    if (resolve) {
      if (typeof resolve !== 'object') {
        throw new Error(
          'resolve must be an object, where the subNodes to resolve are the keys, and the resolve functions are the respective values.',
        )
      } else if (typeof resolve[subNodeName] === 'function') {
        subSlice = resolve[subNodeName](dataSlice)
      } else {
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

      if (subNode.rename) {
        delete dataSlice[subNodeName]
        dataSlice[subNode.rename] = replacement
      } else {
        dataSlice[subNodeName] = replacement
      }

      !subNode.omit &&
        this._addNormData({
          ...formattedData,
          nodeName: subNode.rename || subNode.name,
        })

      // normalize the subNode
      this._normalizeNode(subSlice, subNode)
    } else {
      !this.silent &&
        console.warn(
          `Couldn't locate ${subNodeName} in ${rename ||
            name}. Ensure nodes and subNodes match.`,
        )
    }
  })
}
