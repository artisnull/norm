const Norm = require('./dist').default

const DATA = () => ({
  branch1: [{ id: 'b11' }, { id: 'b12' }],
  nestedBranch: {
    nest: [
      {
        name: 'n1',
        branch1: [{ id: 'b21' }, { id: 'b22' }],
      },
      { name: 'n2' },
    ],
  },
})

const norm = new Norm({ silent: false })

const { nest } = norm.addRoot(
  'root',
  { branch1: 'id', nest: 'name', orange: 'id' },
  {
    resolve: {
      nest: data => data.nestedBranch.nest,
    },
    omit: true,
  },
)
const { branch2 } = nest.define(
  { branch2: 'id' },
  { resolve: { branch2: slice => slice.branch1 } },
)
branch2.define(undefined, {
  transform: data => {
    data.id = `TRANSFORMED-${data.id}`
  },
})

const result = norm.normalize(DATA())
console.log(result)

const norm2 = new Norm()
norm2.addRoot('branch1')
const res2 = norm2.normalize(DATA().branch1)
console.log(res2)

// const genObj = (count, children) => {
//     const res = []
//     for (let i = 1; i < count + 1; i++) {
//         const item = {
//             id: i,
//             name: `Item ${i}`,
//             ...children
//         }
//         res.push(item)
//     }
//     return res
// }

// const testData = {
//     arr1: genObj(2),
//     arr2: genObj(2, {
//         nest: genObj(2)
//     })
// }

// const norm = new Norm()
// norm.addNode('root', {'arr1': 'id'}, {root: true, omit: true})
// norm.addNode('arr1')
// const result = norm.normalize(testData)

/*
{
    "branch1": {
        "byId": {
            "b11": {
                "id": "b11"
            },
            "b12": {
                "id": "b12"
            }
        },
        "allIds": ["b11", "b12"]
    },
    "nest": {
        "byId": {
            "n1": {
                "name": "n1",
                "branch2": [
                    "TRANSFORMED-b21",
                    "TRANSFORMED-b22"
                ],
                "id": "n1"
            },
            "n2": {
                "name": "n2",
                "id": "n2"
            }
        },
        "allIds": ["n1", "n2"]
    },
    "branch2": {
        "byId": {
            "b21": {
                "id": "TRANSFORMED-b21"
            },
            "b22": {
                "id": "TRANSFORMED-b22"
            }
        },
        "allIds": ["TRANSFORMED-b21", "TRANSFORMED-b22"]
    }
}*/
