const Norm = require('./dist').default

const DATA = [{
    id: 'root',
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
]

const norm = new Norm();
norm.addNode('root', {id: 'id', root: true, fields: ['branch1', 'nest']}, {resolve: {
    nest: data => data.nestedBranch.nest
}})
norm.addNode('branch1', {id: 'id'}, {parent: 'root'})
norm.addNode('nest', {id: 'name', fields: ['branch1']})
norm.addNode('branch1', {id: 'id'}, {parent: 'nest', rename: 'branch2', transform: data => {
    data.id = `TRANSFORMED-${data.id}`
}})

const result = norm.normalize(DATA);
console.log(result);