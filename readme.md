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
_Notice how the nested references are replaced with the id(s) of the data that used to be there_

---

# API

#### `Norm({silent: true}) : norm`

Constructor, configure silent mode on or off.

`silent: true` Displays warnings that are sometimes helpful for debugging

---
<a name="addRoot"></a>
#### `norm.addRoot(name: string, subnodes: object, options: [Options](#options)) : {[subNodeName]: subNode, ...subNodes}`
Defines the root node of your data, allowing you describe the associated subnodes, and customize how you want the normalization process to take place.

Returns subNodes corresponding to the subNodes you passed in.
You call [`subNode.define`](#define) on those subNodes to further configure the process if necessary

---
<a name="define"></a>
#### `subNode.define(subnodes: object, options: [Options](#options)) : {[subNodeName]: node, ...subNodes}`
Defines this node of your data, allowing you describe the associated subnodes, and customize how you want the normalization process to take place 

Returns subNodes corresponding to the subNodes you passed in.
You call [`subNode.define`](#define) on those subNodes to further configure the process if necessary

---
<a name="normalize"></a>
#### `norm.normalize(data: (object | Array<object>)) : object`
Normalizes your array or object based on the nodes you've defined using [`norm.addRoot`](#addRoot) and [`subNode.define`](#define)

---
<a name="options"></a>
#### `Options : object`

