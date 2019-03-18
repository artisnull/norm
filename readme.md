[![Coverage Status](https://coveralls.io/repos/github/artisnull/norm/badge.svg)](https://coveralls.io/github/artisnull/norm)
# ReadMe is WIP
Takes an array of objects with possible nested arrays of data, and returns a normalized and flattened
representation based on the nodes defined.
Data is normalized by the id you provide,
resulting in the structure
```
{
    [name]: {
        byId: {
            [id1]: node1,
            [id2]: node2,
        },
        allIds: [id1, id2]
    }
}
```
DEF

---

Node
-
* id: (string || number) defines what key should be used to normalize the dataset
* fields: (string[]) defines fields on this node that should also be normalized
* root: (boolean) defines node to start normalization on,
* omit: (boolean) Whether to include this node in the final data (doesn't affect its fields)
}

Options
-
rename: (string) allows mapping a field to a different name
ex: addNode('name', ..., {rename: 'renamed'})

additionalIds: (string[]) additional keys to add into each allIds item - ex: id: 'id', additionalIds: ['name'] => allIds[{id, name}]

transform: (item) => transformedItem | transform the data prior to saving it,

filter: (item) => (true|false): filter out an item from being saved

parent: (string) name of parent key, specify this when to resolve naming conflicts

---

resolve: Tell the schema where to find your field

```javascript
resolve: {
    [fieldNameToResolve]: thisNode => thisNode.whereToFindField
}
```
Example:
```
const source = {
    a: {
        b: {
            c: [{id: 1}, {id: 2}]
        }
    }
}

norm.addNode('resolver', {omit: true, root: true, fields: 'c'}, {
    resolve: {
        c: slice => slice.a.b.c
    }
})

```


API

---

addNode(name, Node, Options) => null

- adds a node to define how to normalize data
- name must match the key of the field to be normalized
  - if desired to have the normalized key name different from the original, use options.rename

normalize(data) => normalizedData

- execute normalization on data, based on the defined nodes
