[![Coverage Status](https://coveralls.io/repos/github/artisnull/norm/badge.svg?branch=1.2_ts)](https://coveralls.io/github/artisnull/norm?branch=1.2_ts)

# NORM

Turn your messy data into organized bliss, with lots of customization

Turns this

```javascript
const data = {
  "posts": [
    {
      "id": "0000",
      "description": "A post about nothing"
    },
    {
      "id": "0001",
      "description": "A post about something"
    },
    {
      "id": "0002",
      "description": "A post about life"
    }
  ]
}
```
into
```javascript
const result = {
  "posts": {
    "byId": {
      "000": {
        "id": "0000",
        "description": "A post about nothing"
      },
      "0001": {
        "id": "0001",
        "description": "A post about something"
      },
      "0002": {
        "id": "0002",
        "description": "A post about life"
      }
    },
    "allIds": ["0000", "0001", "0002"] 
  }
}
```
:tada: :tada: :tada:

---

# Usage

### Basic Single Node
Using the example above, all you need to get started is:
```javascript
import Norm from '@artisnull/norm'

const norm = new Norm()
norm.addRoot('posts')

const result = norm.normalize(data.posts)
```

### Basic Multi Node
What if our example had __nested data__ that we also wanted to normalize?

Let's take this data:

```javascript
const data = {
  posts: [
    {
      id: '0000',
      description: 'A post about nothing',
      thumbnail: {
        url: 'pathToImage',
        id: '0003',
      }
    },
    {
      id: '0001',
      description: 'A post about something',
      thumbnail: {
        url: 'pathToImage',
        id: '0004',
      }
    },
    {
      id: '0002',
      description: 'A post about life',
      thumbnail: {
        url: 'pathToImage',
        id: '0005',
      }
    },
  ]
}
```
And modify our single node example slightly, adding `{thumbnail: 'id'}` as the second argument: 
```javascript
const norm = new Norm()
norm.addRoot('posts', {thumbnail: 'id'})

const result = norm.normalize(data.posts)
```
Which results in:
```javascript
result = {
  posts: {
    byId: {
      '0000': {
        id: '0000',
        description: 'A post about nothing',
        thumbnail: ['0003'],
      },
      '0001': {
        id: '0001',
        description: 'A post about something',
        thumbnail: ['0004'],
      },
      '0002': {
        id: '0002',
        description: 'A post about life',
        thumbnail: ['0005'],
      },
    },
    allIds: ['0000', '0001', '0002'],
  },
  thumbnail: {
    byId: {
      '0003': { url: 'pathToImage', id: '0003' },
      '0004': { url: 'pathToImage', id: '0004' },
      '0005': { url: 'pathToImage', id: '0005' },
    },
    allIds: ['0003', '0004', '0005'],
  },
}

```
>_Notice how the nested references are replaced with the id(s) of the data that used to be there_

---

# API

#### `Norm({silent: boolean}) : norm`
`default silent = true`

Constructor, configure silent mode on or off.

`silent: false` Displays warnings that are sometimes helpful for debugging

```javascript
import Norm from '@artisnull/norm'
const norm = new Norm()
```

---
<a name="addRoot"></a>
#### `norm.addRoot(name: string, subNodes: object, options: [Options](#options)) : {[subNodeName]: subNode, ...subNodes}`
Defines the root node of your data, allowing you describe the associated subnodes, and customize how you want the normalization process to take place.

Returns subNodes corresponding to the subNodes you passed in.

You call [`subNode.define`](#define) on those subNodes to further configure the process if necessary

> `subNodes` should be in the form `{[subNodeName]: 'keyToNormalizeBy'}`, or either {} or undefined if there are no subnodes  
> For example `{thumbnail: 'id'}`, thumbnail is the subNode name and it will be normalized by the values in `thumbnail.id`

Usage:
```javascript
const {thumbnail} = norm.addRoot('posts', {thumbnail: 'id'}})
```
---
<a name="define"></a>
#### `subNode.define(subNodes: object, options: [Options](#options)) : {[subNodeName]: node, ...subNodes}`
Defines this node of your data, allowing you describe the associated subnodes, and customize how you want the normalization process to take place 

Returns subNodes corresponding to the subNodes you passed in.

You call [`subNode.define`](#define) on those subNodes to further configure the process if necessary
> `subNodes` should be in the form `{[subNodeName]: 'keyToNormalizeBy'}`, or either {} or undefined if there are no subnodes  
> For example `{thumbnail: 'id'}`, thumbnail is the subNode name and it will be normalized by the values in `thumbnail.id`

Usage:
```javascript
const {thumbnail, users} = norm.addRoot('posts', {thumbnail: 'id', users: 'name'})
const {sources} = thumbnail.define({sources: 'resolution'}, {additionalIds: ['url']})
```
---
<a name="normalize"></a>
#### `norm.normalize(data: (object | Array<object>)) : object`
Normalizes your array or object based on the nodes you've defined using [`norm.addRoot`](#addRoot) and [`subNode.define`](#define)

Usage:
```javascript
const result = norm.normalize(data)
```
---
<a name="options"></a>
#### `Options : object`
Modify and customize how you want your data to normalize
```javascript
const options = {
    additionalIds: ['name'],
    filter: slice => slice.isGood,
    omit: true,
    resolve: {
        subNode1: slice => 'slice.subNode2'
    },
    transform: slice => {
        slice.tranformed = true
        return slice
    }
}
```
---
#### `options.additionalIds : Array<string>`
Define additional ids to be included in allIds.

Useful for when data can't be identified by id alone

Usage:
```javascript
// Given this data
const data = {
    node: [
        {
            id: 'id',
            type: 'node'
        }
    ]
}
// Given this node
node.define(undefined, {
    // Should be in the form
    additionalIds: ['type']
})
```
After normalizing:
```javascript
result.node = {
    byId:{...},
    allIds: [{'id': 'id', type: 'node'}]
}
```
---
#### `options.filter() : boolean`
Filter data from being saved into the normalized data structure.

Useful for keeping data out of the result.

`options.filter() => true` saves data

`options.filter() => false` does not save data

Note: _Called __before__ `options.transform()`_


Usage:
```javascript
// Given this data
const data = {
    node: [
        {
            id: 'id',
            type: null
        },
        {
            id: 'id2',
            type: 'node'
        },
    ]
}
// Given this node
node.define(undefined, {
    // Should be in the form
    filter: slice => {
        // slice = corresponding {id, type} object
        return !!slice.type // true to save, false to skip
    }
})
```
After normalizing:
```javascript
result.node = {
    byId:{
        id2: {...}
    },
    allIds: ['id2']
}
```
---
#### `options.omit : boolean`
`default: false`

Toggle saving __this node__ into the normalized structure

Useful for keeping data out of the result, __has no effect on subNodes__

`options.omit = true` does not save data

`options.omit = false` saves data

Usage:
```javascript
// Given this data
const data = {
    root: {
        node: [...]
    }
}
// Given this node
root.define({node: 'id'}, {
    // Should be in the form
    omit: true
})
```
After normalizing:
```javascript
result = {
    node: {
        byId:{...},
        allIds: [...]
    }
}
```
> Notice there is no `root` key in the result
---

#### `options.resolve : object`
Describe how to find a subnode using `"object.dot"` notation.

Useful for renaming a node, dynamically selecting a node, or cherry-picking a nested node

Usage:
```javascript
// Given this data
const data = {
    node: [
        {
            id: 'id',
            bar: {
                id: 'bar-id'
            }
        }
    ]
}
// Given this node
node.define({foo: 'id'}, {
    // Should be in the form
    resolve: {
        foo: slice => {
            // slice = {id: 'id', bar: {id: 'bar-id'}}
            return 'slice.bar'
        }
    }
})
```
After normalizing:
```javascript
result = {
    node: {
        byId:{
            id: {id: 'id', foo: ['bar-id']}
        },
        allIds: ['id']
    },
    foo: {
        byId:{
            id: {id: 'bar-id'}
        },
        allIds: ['bar-id']
    }
}
```
> Notice that `node.bar` has been replaced with `node.foo`

The above is an example of using `options.resolve` to rename a node

---

#### `options.transform() : object`
Transform a node being saved into the normalized structure.

Note: _Called __after__ `options.filter()`_

Useful for cleaning up or adding to a node

Usage:
```javascript
// Given this data
const data = {
    node: [
        {
            id: 'id',
        }
    ]
}
// Given this node
node.define(undefined, {
    // Should be in the form
    transform: slice => {
        // slice = {id: 'id'}
        return {...slice, transformed: true}
    }
})
```
After normalizing:
```javascript
result = {
    node: {
        byId:{
            id: {id: 'id', transformed: true}
        },
        allIds: ['id']
    }
}
```
> Note: the `id` key cannot be modified in the `options.transform()` function
---

