import { Options, SubNodesDefinition, Node } from '../index.d'
import { defaultOptions, newNormStruct } from '../constants/defaults'

export default function addNode(
  name: string,
  subNodes: SubNodesDefinition = {},
  options: Options = defaultOptions,
): void {
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

  // check if the node name has been defined already, and if it has, if the parent option is defined
  if (this.nodes.has(name) && !options.rename && !this.allowDuplicates) {
    throw new Error(
      'Duplicate node, but no rename specified. Use options.rename to avoid name conflicts',
    )
  }

  let nodeData: object = {
    name,
    subNodes,
    ...options,
  }

  // name conflicts are avoided by specifying the parent
  if (options.rename) {
    nodeData = {
      [options.rename]: nodeData,
      ...this.nodes.get(name),
      _dupNode: true,
      _rename: {
        [name]: options.rename
      }
    }
  }
  
  // add node to our map
  this.nodes.set(name, nodeData)

  // handle setting root
  if (options.root === true && this.root) {
    throw new Error(
      `Only one root allowed and root has already been defined as ${
        this.root
      }, but ${name} is also set as root`,
    )
  } else if (options.root === true) {
    this.root = name
  }

  // Don't add omitted node structure
  if (!options.omit) {
    // handle renaming node
    const nodeName = options.rename || name
    // layout node scaffold for new node
    this.normData[nodeName] = newNormStruct()
  }
}
