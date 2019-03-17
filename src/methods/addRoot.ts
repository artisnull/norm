import { Options, SubNodesDefinition } from '../index.d'
import { defaultOptions } from '../constants/defaults'
import Node from '../Node';

// returns {subNode: Node} for each subnode defined

export default function addNode(
  name: string,
  subNodes: SubNodesDefinition = {},
  options: Options = defaultOptions,
): object {
  if (!name) {
    throw new Error('Nodes must be named. First argument must be a string')
  } else if (
    subNodes &&
    (typeof subNodes !== 'object' || Array.isArray(subNodes))
  ) {
    throw new Error(
      'SubNodes must be an object in the form {[subNodeName]: idToNormalizeBy}',
    )
  }
  const rootNode = new Node(name, this)
  this.root = rootNode.sym
  return rootNode.define(subNodes, options)
}
