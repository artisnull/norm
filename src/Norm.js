// Author Zachariah Lambert
class Schema {
    constructor(config = { silent: true }) {
      this.nodes = new Map();
      this.root = null;
      this.normData = {};
      this.silent = config.silent;
    }
  
    static newNormStruct() {
      return {
        byId: {},
        allIds: []
      };
    }
    /**
     *
     * @param {string} name
     * @param {Object} node
     * @param {string} node.id
     * @param {string[]} node.fields
     * @param {boolean} node.root
     * @param {boolean} node.omit
     * @param {Object} options
     */
    addNode(name, { id = 'id', fields, root = false, omit = false }, options = {}) {
      if (!name) {
        throw new Error('Nodes must be named. First argument must be a string')
      }
  
      // fields should be an array
      let fieldsArr = fields;
      if (!Array.isArray(fieldsArr)) {
        fieldsArr = fields ? [fields] : [];
      }
  
      let currData = {};

      // check if the node name has been defined already, and if it has, if the parent option is defined
      if (this.nodes.has(name) && !options.parent) {
        !this.silent && console.warn('Duplicate node, but no parent specified. Use options.parent to resolve name conflicts');
      } else if (this.nodes.has(name)) {
        currData = this.nodes.get(name);
      }
  
      let nodeData = {
        name,
        id,
        fields: fieldsArr,
        root,
        omit,
        options
      };
  
      // name conflicts are avoided by specifying the parent
      if (options.parent) {
        nodeData = {
          [options.parent]: nodeData,
          ...currData,
          _dupNode: true
        };
      }
      // add node to our map
      this.nodes.set(name, nodeData);

      // handle setting root
      if (root === true && this.root) {
        throw new Error(`Only one root allowed and root has already been defined as ${this.root}, but ${name} is also set as root`)
      } else if (root === true) {
        this.root = name;
      }

      // Don't add omitted node structure
      if (!omit) {
        // handle renaming node
        const nodeName = options.rename || name;
        // layout node scaffold for new node
        this.normData[nodeName] = Schema.newNormStruct();
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
      let node = this.nodes.get(this.root);
      this._normalizeNode(data, node); // recursively normalize
      return this.normData; // return normalized data
    }

    _normalizeFields({item, fields, options, name}) {
      // iterate through fields and normalize each
      fields.forEach(field => {
        let node = this.nodes.get(field);
        
        // if node exists
        if (!node) {
          !this.silent && console.warn(`Couldn't locate ${field} in ${options.rename || name}. Ensure nodes and fields match.`)
        } else {
          
          // find this node
          if (node._dupNode) {
            node = node[options.rename] || node[name];
          }
  
          let slice = item[field];
  
          // handle options.resolve
          if (options.resolve) {
            if (typeof options.resolve !== 'object') {
              throw new Error('resolve must be an object, where the fields to resolve are the keys, and the resolve functions are the respective values.')
            } else if (typeof options.resolve[field] === 'function') {
              slice = options.resolve[field](item);
            }
          }
          
  
          if (slice) {
            const isObj = !Array.isArray(slice);
            const { allIds: normalizedIds } = this._normalizeNode(isObj ? [slice] : slice, node);
  
            // Replace the reference in the parent of the normalized values
            const replacement = isObj ? [slice[node.id]] : normalizedIds;
  
            if (node.options.rename) {
              delete item[field];
              item[node.options.rename] = replacement;
            } else {
              item[field] = replacement;
            }
          } else {
            !this.silent && console.warn(`Couldn't locate ${field} in ${options.rename || name}. Ensure nodes and fields match.`)
          }
        }

      });
    }
  
    /**
     * Recursively normalizes a node based on the fields it identifies
     * @param {*} data 
     * @param {*} param1 
     */
    _normalizeNode(data, { name, id, fields, options, omit}) {
      if (!data) {
        return { allIds: [] };
      }
  
      /*
      Normalize fields of node before node itself
      ----------------------
      */
     // If data is an array, iterate through each item and normalize the fields
     let formattedData = []
     if (Array.isArray(data)) {
      formattedData = data.map(d => {
         const item = { ...d };
         this._normalizeFields({item, fields, options, name})
         return item;
       });
     } else {
       // data is an object, normalize the fields and convert to an array for the next step
       this._normalizeFields({item: data, fields, options, name})
       formattedData = [data]
     }
  
  
      /*
      Normalize this node
      ----------------------
      */
  
      const nodeName = options.rename || name;
      const { allIds, byId } = this._formatArr({
        data: formattedData,
        id,
        nodeName,
        ...options
      });

      // add normalized data to the final object
      !omit && this._addNormData({ allIds, byId, nodeName });
      return { allIds };
    }
  
    // turn [data] into {byId, allIds}
    _formatArr({ data, id, additionalIds = [], transform = x => x, filter = () => true, nodeName }) {
      let byId = {},
        allIds = [];

      // iterate through each item and structure into byId,allIds format
      data.forEach(item => {
        // filter item from being included
        if (filter(item)) {
          // make byId
          byId[item[id]] = {
            ...transform(item), // transform the object data if desired
            id: item[id] // always include id
          };
  
          // make allIds
          // if no additional ids, don't make an object, just push the id
          if (additionalIds.length < 1) {
            allIds.push(item[id]);
          } else {
            // additionalIds are present
            let idObj = { id: item[id] };
            additionalIds.forEach(key => {
              idObj[key] = item[key];
            });
            allIds.push(idObj);
          }
        } else if (process.env.NODE_ENV === 'development' || (process.env.NODE_ENV === 'dev' && !filter(item))) {
          // Item has been filtered
          !this.silent &&
            console.warn({ message: 'Data element has been filtered', element: item, fn: filter.toString() });
        }
      });
      return { byId, allIds };
    }
  
    _addNormData({ byId, allIds, nodeName }) {
      this.normData = {
        ...this.normData,
        [nodeName]: {
          byId: {
            ...this.normData[nodeName].byId,
            ...byId
          },
          allIds: [...this.normData[nodeName].allIds, ...allIds]
        }
      };
    }
  }
  
  export default Schema;