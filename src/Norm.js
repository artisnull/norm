/**
 * Author: Zachariah Lambert
 * ----
 * Takes an array of objects with possible nested arrays of data, and returns a normalized and flattened 
 * representation based on the nodes defined.
 * Data is normalized by the id you provide,
 * resulting in the structure
 * {
 *      [name]: {
 *          byId: {
 *              [id]: node
 *          },
 *          allIds: [id]
 *      }
 * }
 *
 * DEF
 * ----------
 ** Node: {
 *  id: (string || number) defines what key should be used to normalize the dataset
 *  fields: (string[]) defines fields on this node that should also be normalized
 *  root: (boolean) defines node to start normalization on,
 * }
 *
 ** Options: {
 *  rename: (string) allows mapping a field to a different name
 *  - ex: addNode('name', ..., {rename: 'renamed'}) => renamed: {byId, allIds}
 *  additionalIds: (string[]) additional keys to add into each allIds item
 *      - ex: id: 'id', additionalIds: ['name'] => allIds[{id, name}]
 *  transform: (item) => transformedItem | transform the data prior to saving it,
 *  filter: (item) => (true|false): filter out an item from being saved
 *  parent: (string) name of parent key, specify this when to resolve naming conflicts
 *  resolve: (data) => slice : tell the schema where to find your field
 * }
 * 
 * API
 * ------------
 ** addNode(name, Node, Options) => null
 *  - adds a node to define how to normalize data
 *  - name must match the key of the field to be normalized
 *      - if desired to have the normalized key name different from the original, use options.rename
 * 
 ** normalize(data) => normalizedData
 *  - execute normalization on data, based on the defined nodes
 * 
 * EXAMPLE
 * ------------

 // assume data we are going to format looks like:
        data = [{
            root: {
                id: 'rootId',
                nest: [
                    {
                        name: 'nestName'
                    },
                    {
                        name: 'nest2Name'
                    }
                ]
            }
        }]
    const schema = new Schema()
    schema.addNode('root', {id: 'id', root: true, fields: ['nest']})
    schema.addNode('nest', {id: 'name'})
    schema.normalize(data)
 */

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
     * @param {Object} options
     */
    addNode(name, { id, fields, root = false }, options = {}) {
      this._checkDefined([{ label: 'name', val: name }, { label: 'id', val: id }]);
  
      let fieldsArr = fields;
      if (!Array.isArray(fieldsArr)) {
        fieldsArr = fields ? [fields] : [];
      }
  
      let currData = {};
      if (this.nodes.has(name) && !options.parent) {
        console.warn('Duplicate node, but no parent specified. Use the parent option to avoid name conflicts');
      } else if (this.nodes.has(name)) {
        currData = this.nodes.get(name);
      }
  
      let nodeData = {
        name,
        id,
        fields: fieldsArr,
        root,
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
  
      this.nodes.set(name, nodeData);
      if (root === true) {
        this.root = name;
      }
      const nodeName = options.rename || name;
      this.normData[nodeName] = Schema.newNormStruct();
    }
  
    _checkDefined(values) {
      values.forEach(({ val, label }) => {
        if (val == null) {
          throw new Error(`${label} is not defined`);
        }
      });
      return true;
    }
  
    /**
     *
     * @param {array} data
     */
    normalize(data) {
      this._checkDefined([{ val: this.root, label: 'root node' }]);
  
      let node = this.nodes.get(this.root);
      this._normalizeNode(data, node);
      return this.normData;
    }
  
    _normalizeNode(data, { name, id, fields, options }) {
      if (!data) {
        return { allIds: [] };
      }
  
      /*
      Normalize fields
      ----------------------
      */
  
      let dupData = data.map(d => {
        const item = { ...d };
        // more to normalize
        fields.forEach(field => {
          let node = this.nodes.get(field);
  
          // select the key associated with parent = this node
          if (node._dupNode) {
            node = node[options.rename] || node[name];
          }
  
          let slice = item[field];
          if (options.resolve && typeof options.resolve[field] === 'function') {
            slice = options.resolve[field](item);
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
          }
        });
  
        return item;
      });
  
      /*
      Normalize this node
      ----------------------
      */
  
      const nodeName = options.rename || name;
      const { allIds, byId } = this._normalizeArr({
        data: dupData,
        id,
        nodeName,
        ...options
      });
      this._addNormData({ allIds, byId, nodeName });
      return { allIds };
    }
  
    _normalizeArr({ data, id, additionalIds = [], transform = x => x, filter = () => true, nodeName }) {
      let byId = {},
        allIds = [];
      data.forEach(item => {
        // don't duplicate
        if (!this.normData[nodeName].byId[item[id]] && filter(item)) {
          byId[item[id]] = {
            ...transform(item),
            id: item[id]
          };
  
          // if no additional ids, don't make an object
          if (additionalIds.length < 1) {
            allIds.push(item[id]);
          } else {
            let idObj = { id: item[id] };
            additionalIds.forEach(key => {
              idObj[key] = item[key];
            });
            allIds.push(idObj);
          }
        } else if (process.env.NODE_ENV === 'development' || (process.env.NODE_ENV === 'dev' && !filter(item))) {
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