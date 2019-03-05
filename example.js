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
norm.addNode('root', {omit: true, root: true, fields: ['branch1', 'nest', 'orange']}, {resolve: {
    nest: data => data.nestedBranch.nest
}})
norm.addNode('branch1', {id: 'id'}, {parent: 'root'})
norm.addNode('nest', {id: 'name', fields: ['branch1']})
norm.addNode('branch1', {id: 'id'}, {parent: 'nest', rename: 'branch2', transform: data => {
    data.id = `TRANSFORMED-${data.id}`
}})

const result = norm.normalize(DATA);

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