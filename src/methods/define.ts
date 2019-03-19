import { Options, SubNodesDefinition } from '../index.d'
import { defaultOptions, newNormStruct } from '../constants/defaults'
import Node from '../Node';

// returns {subNode: Node} for each subnode defined

export default function define(
  namedSubNodes: SubNodesDefinition = {},
  options: Options = defaultOptions,
): object {
if (
    namedSubNodes &&
    (typeof namedSubNodes !== 'object' || Array.isArray(namedSubNodes))
  ) {
    throw new Error(
      'SubNodes must be an object in the form {[subNodeName]: idToNormalizeBy}',
    )
  }

  let subNodeNodes = {}, subNodes = {...namedSubNodes}
  // check subNodes for duplicates
  Object.entries(subNodes).forEach(([subNodeName, subNodeId]) => {
    const newNode = new Node(subNodeName, this.norm)
    this.norm.nodes.set(newNode.sym, newNode.toObject())
    subNodes[newNode.sym] = subNodeId
    delete(subNodes[subNodeName])
    subNodeNodes[subNodeName] = newNode
  })
  
  // add node to our map
  this.norm.nodes.set(this.sym, {
    ...this.norm.nodes.get(this.sym),
    subNodes,
    ...options
  })

  return subNodeNodes
}
