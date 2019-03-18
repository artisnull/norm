import { Options, SubNodesDefinition } from '../index.d'
import { defaultOptions } from '../constants/defaults'
import Node from '../Node';

// returns {subNode: Node} for each subnode defined

export default function addRoot(
  name: string,
  subNodes: SubNodesDefinition = {},
  options: Options = defaultOptions,
): object {
  if (this.root) {
    throw new Error(`Root has already been defined, ${name} is attempting to redefine`)
  } else if (!name) {
    throw new Error('Nodes must be named. First argument must be a string')
  } else if (
    subNodes &&
    (typeof subNodes !== 'object' || Array.isArray(subNodes))
  ) {
    throw new Error(
      'SubNodes must be an object in the form {[subNodeName]: idToNormalizeBy}',
    )
  }
  const rootNode = new Node('root', this)
  this.root = rootNode.sym
  this.nodes.set(this.root, rootNode.toObject())
  const {[name]: firstNode} = rootNode.define({[name]: 'id'}, {omit: true})
  this.firstNode = firstNode.sym
  return firstNode.define(subNodes, options)
}
