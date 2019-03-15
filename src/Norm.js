// Author Zachariah Lambert

export const defaultNode = { id: 'id', subNodes: [], root: false, omit: false }
export const defaultConfig = { silent: true, allowDuplicates: false }
class Norm {
  constructor({ silent = true, allowDuplicates = false } = defaultConfig) {
    this.nodes = new Map()
    this.root = null
    this.normData = {}
    this.silent = silent
    this.allowDuplicates = allowDuplicates
  }

  static newNormStruct() {
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
    { id = 'id', subNodes = [], root = false, omit = false } = defaultNode,
    options = {},
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

    let nodeData = {
      name,
      id,
      subNodes: subNodesArr,
      root,
      omit,
      options,
    }

    // name conflicts are avoided by specifying the parent
    if (options.parent) {
      nodeData = {
        [options.parent]: nodeData,
        ...currData,
        _dupNode: true,
      }
    }
    // add node to our map
    this.nodes.set(name, nodeData)

    // handle setting root
    if (root === true && this.root) {
      throw new Error(
        `Only one root allowed and root has already been defined as ${
          this.root
        }, but ${name} is also set as root`,
      )
    } else if (root === true) {
      this.root = name
    }

    // Don't add omitted node structure
    if (!omit) {
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
    const {subNodes, options, name } = node
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
          subNode = subNode[options.rename] || subNode[name]
        }

        let subSlice = dataSlice[subNodeName]

        // handle options.resolve
        if (options.resolve) {
          if (typeof options.resolve !== 'object') {
            throw new Error(
              'resolve must be an object, where the subNodes to resolve are the keys, and the resolve functions are the respective values.',
            )
          } else if (typeof options.resolve[subNodeName] === 'function') {
            subSlice = options.resolve[subNodeName](dataSlice)
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

          if (subNode.options.rename) {
            delete dataSlice[subNodeName]
            dataSlice[subNode.options.rename] = replacement
          } else {
            dataSlice[subNodeName] = replacement
          }
        } else {
          !this.silent &&
            console.warn(
              `Couldn't locate ${subNodeName} in ${options.rename ||
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
    const  { name, id, options, omit } = node
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

    const nodeName = options.rename || name
    const { allIds, byId } = this._formatArr({
      data: formattedData,
      id,
      nodeName,
      ...options,
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
