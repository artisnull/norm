// Author Zachariah Lambert

export const defaultNode = { id: 'id', subNodes: [],  }
export const defaultOptions : Options = {
  root: null,
  omit: false,
  resolve: undefined,
  parent: undefined,
  rename: undefined
}
export const defaultConfig = { silent: true, allowDuplicates: false }

interface Node extends Options {
  name: String
  id: String
  subNodes: Array<Object>
  _dupNode?: Boolean
}
interface Options {
  resolve: Function
  parent: String
  rename: String
  omit: Boolean
  root: Boolean
}

class Norm {
  nodes: Map<String, Node>
  root: String
  normData: Object
  silent: Boolean
  allowDuplicates: Boolean
  
  constructor({ silent = true, allowDuplicates = false } = defaultConfig) {
    this.nodes = new Map()
    this.root = null
    this.normData = {}
    this.silent = silent
    this.allowDuplicates = allowDuplicates
  }

  static newNormStruct() : Object {
    return {
      byId: {},
      allIds: [],
    }
  }
  /**
   *
   * @param {string} name
   * @param {Object} node
   * @param {string} node.id
   * @param {string[]} node.subNodes
   * @param {boolean} node.root
   * @param {boolean} node.omit
   * @param {Object} options
   */
  addNode(
    name,
    { id = 'id', subNodes = []} = defaultNode,
    options : Options = defaultOptions,
  ) {
    if (!name) {
      throw new Error('Nodes must be named. First argument must be a string')
    }

    // subNodes should be an array
    let subNodesArr = subNodes
    if (!Array.isArray(subNodesArr)) {
      subNodesArr = subNodes ? [subNodes] : []
    }

    let currData = {}

    // check if the node name has been defined already, and if it has, if the parent option is defined
    if (this.nodes.has(name) && !options.parent && !this.allowDuplicates) {
      throw new Error(
        'Duplicate node, but no parent specified. Use options.parent to resolve name conflicts',
      )
    } else if (this.nodes.has(name)) {
      currData = this.nodes.get(name)
    }

    let nodeData: Node = {
      name,
      id,
      subNodes: subNodesArr,
      ...options,
    }

    // name conflicts are avoided by specifying the parent
    if (options.parent) {
      nodeData = {
        [options.parent as string]: nodeData,
        ...currData as Node,
        _dupNode: true,
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
      this.normData[nodeName] = Norm.newNormStruct()
    }
  }

  /**
   * Public method to begin normalization of data
   * @param {} data
   */
  normalize(data) {
    if (!this.root) {
      throw new Error('No root is defined.')
    }

    // Start at root node
    let node = this.nodes.get(this.root)
    this._normalizeNode(data, node) // recursively normalize
    return this.normData // return normalized data
  }

  _normalizeSubNodes(dataSlice, node) {
    const {subNodes, options, name, resolve, rename } = node
    // iterate through subNodes and normalize each
    subNodes.forEach(subNodeName => {
      let subNode = this.nodes.get(subNodeName)

      // if subNode exists
      if (!subNode) {
        !this.silent &&
          console.warn(
            `Couldn't locate ${subNodeName} in ${options.rename ||
              name}. Ensure nodes and subNodes match.`,
          )
      } else {
        // find this subNode
        if (subNode._dupNode) {
          subNode = subNode[rename] || subNode[name]
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
          }
        }

        if (subSlice) {
          const isObj = !Array.isArray(subSlice)
          const { allIds: normalizedIds } = this._normalizeNode(
            isObj ? [subSlice] : subSlice,
            subNode,
          )

          // Replace the reference in the parent of the normalized values
          const replacement = isObj ? [subSlice[subNode.id]] : normalizedIds

          if (subNode.rename) {
            delete dataSlice[subNodeName]
            dataSlice[subNode.rename] = replacement
          } else {
            dataSlice[subNodeName] = replacement
          }
        } else {
          !this.silent &&
            console.warn(
              `Couldn't locate ${subNodeName} in ${rename ||
                name}. Ensure nodes and subNodes match.`,
            )
        }
      }
    })
  }

  /**
   * Recursively normalizes a node based on the subNodes it identifies
   * @param {*} data
   * @param {*} node
   */
  _normalizeNode(data, node) {
    const  { name, id, rename, omit, ...rest } = node
    if (!data) {
      return { allIds: [] }
    }

    /*
      Normalize subNodes of node before node itself
      ----------------------
      */
    // If data is an array, iterate through each item and normalize the subNodes
    let formattedData = []
    if (Array.isArray(data)) {
      formattedData = data.map(d => {
        const dataSlice = { ...d }
        this._normalizeSubNodes( dataSlice, node)
        return dataSlice
      })
    } else {
      // data is an object, normalize the subNodes and convert to an array for the next step
      this._normalizeSubNodes(data, node)
      formattedData = [data]
    }

    /*
      Normalize this node
      ----------------------
      */

    const nodeName = rename || name
    const { allIds, byId } = this._formatArr({
      data: formattedData,
      id,
      nodeName,
      ...rest,
    })

    // add normalized data to the final object
    !omit && this._addNormData({ allIds, byId, nodeName })
    return { allIds }
  }

  // turn [data] into {byId, allIds}
  _formatArr({
    data,
    id,
    additionalIds = [],
    transform = x => x,
    filter = () => true,
    nodeName,
  }) {
    let byId = {},
      allIds = []

    // iterate through each item and structure into byId,allIds format
    data.forEach(item => {
      // filter item from being included
      if (filter(item)) {
        // make byId
        byId[item[id]] = {
          ...transform(item), // transform the object data if desired
          id: item[id], // always include id
        }

        // make allIds
        // if no additional ids, don't make an object, just push the id
        if (additionalIds.length < 1) {
          allIds.push(item[id])
        } else {
          // additionalIds are present
          let idObj = { id: item[id] }
          additionalIds.forEach(key => {
            idObj[key] = item[key]
          })
          allIds.push(idObj)
        }
      } else if (
        process.env.NODE_ENV === 'development' ||
        (process.env.NODE_ENV === 'dev' && !filter(item))
      ) {
        // Item has been filtered
        !this.silent &&
          console.warn({
            message: 'Data element has been filtered',
            element: item,
            fn: filter.toString(),
          })
      }
    })
    return { byId, allIds }
  }

  _addNormData({ byId, allIds, nodeName }) {
    this.normData = {
      ...this.normData,
      [nodeName]: {
        byId: {
          ...this.normData[nodeName].byId,
          ...byId,
        },
        allIds: [...this.normData[nodeName].allIds, ...allIds],
      },
    }
  }
}

export default Norm
