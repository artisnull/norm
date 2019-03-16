const Norm = require('./dist').default

const DATA = {
    branch1: [
        {id: 'b11'},
        {id: 'b12'},
    ],
    nestedBranch: {
        nest: [
            {
                name: 'n1',
                branch1: [
                    {id: 'b21'},
                    {id: 'b22'},
                ]
            },
            {name: 'n2'},
        ]
    }
}

const norm = new Norm({silent: false});

norm.addNode('root', { branch1: 'id', nest: 'name', orange: 'id'}, {
    resolve: {
        nest: data => data.nestedBranch.nest
    },
    omit: true,
    root: true,
})
norm.addNode('branch1', false, {parent: 'root'})
norm.addNode('nest', {branch1: 'id'})
norm.addNode('branch1',false, {parent: 'nest', rename: 'branch2', transform: data => {
    data.id = `TRANSFORMED-${data.id}`
}})

const result = norm.normalize(DATA);
console.log(result)

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