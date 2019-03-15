import Norm from '../src'

const genObj = (count, children) => {
    const res = []
    for (let i = 1; i < count + 1; i++) {
        const item = {
            id: i,
            name: `Item ${i}`,
            ...children
        }
        res.push(item)
    }
    return res
}

const testData = {
    arr1: genObj(2),
    arr2: genObj(2, {
        nest: genObj(2)
    })
}

describe('norm', () => {
    describe('default structure', () => {
        it('should be byId, allIds', () => {
            const struct = Norm.newNormStruct()
            expect(struct).toMatchObject({
                byId: {},
                allIds: []
            })
        });
    });
    it('should normalize data', () => {
        const norm = new Norm()
        norm.addNode('root', {subNodes: 'arr1'}, {root: true, omit: true})
        norm.addNode('arr1')
        const result = norm.normalize(testData)
        expect(result).toMatchObject({
            arr1: {
                byId: {
                    1: {
                        id: 1,
                        name: `Item 1`
                    },
                    2: {
                        id: 2,
                        name: `Item 2`
                    }
                },
                allIds: [1, 2]
            }
        })
    });
});