import Norm, { defaultNode, defaultConfig } from '../../src'

const basicNode = name => ({
  ...defaultNode,
  options: {},
  name,
})
const nestNode = (name, subNode) => ({
  ...defaultNode,
  options: {},
  name,
  subNodes: [subNode],
})
const dupNode = (name, subNode) => ({
  _dupNode: true,
  parent: {
    ...nestNode(name, subNode),
    options: { parent: 'parent' },
  },
  otherData: true
})
const renameNode = (name, subNode) => ({
  _dupNode: true,
  parent: {
    ...basicNode(name),
    options: { parent: 'parent', rename: 'a' },
  },
  renamed: basicNode('renamed'),
  otherData: true
})

const genSampleData = (node) => ({
    obj: {
        [node]: {
            value: 'test',
            id: 'test-id'
        }
    },
    arr: {
        [node]: [
            {value: 'test', id: 'test-id'}
        ]
    }
})

const mockNorm = (function() {
  return () => ({
    ...defaultConfig,
    nodes: {
      has: jest.fn(name => false),
      get: jest.fn(
        name =>
          ({
            test: basicNode('test'),
            emptyNest: nestNode('emptyNest', 'empty'),
            nest: nestNode('nest', 'slice'),
            renamed: renameNode('test'),
            slice: basicNode('slice'),
          }[name]),
      ),
      set: jest.fn(),
    },
    root: null,
    normData: {},
    normalizeSubNodes: new Norm()._normalizeSubNodes,
    _normalizeNode: jest.fn(arg => ({allIds: ['id']}))
  })
})()

describe('norm :: _normalizeSubNodes', () => {
  describe('when subNodes are defined in this.nodes', () => {
    describe('when subNode is a duplicate', () => {
        describe('when subNode is an object', () => {
            it('should replace slice based on rename option', () => {
              const norm = mockNorm()
              const data = genSampleData('test').obj
              norm.normalizeSubNodes({
                dataSlice: data,
                subNodes: ['renamed'],
                options: {rename: 'renamed'},
                name: 'named',
              })
              expect(data).toMatchObject({renamed: ['test-id']})
            })
        });
        describe('when subNode is an array', () => {
            it('should replace slice based on rename option', () => {
              const norm = mockNorm()
              const data = genSampleData('renamed').arr
              norm.normalizeSubNodes({
                dataSlice: data,
                subNodes: ['renamed'],
                options: {rename: 'renamed'},
                name: 'named',
              })
              expect(data).toMatchObject({renamed: ['id']})
            })
        });
    })
    // describe('when resolve option is present', () => {})
    // describe('when a subNode cannot be found in the dataSlice', () => {
    //   it('should warn user when not in silent mode', () => {
    //     global.console.warn = jest.fn()
    //     const norm = mockNorm()
    //     norm.silent = false

    //     norm.normalizeSubNodes({
    //       dataSlice: basicNode('data'),
    //       subNodes: ['nest'],
    //       options: {},
    //       name: 'data',
    //     })
    //     expect(global.console.warn).toBeCalledWith(
    //       `Couldn't locate nest in data. Ensure nodes and subNodes match.`,
    //     )
    //   })
    //   it('should not warn user when in silent mode', () => {
    //     global.console.warn = jest.fn()
    //     const norm = mockNorm()

    //     norm.normalizeSubNodes({
    //       dataSlice: basicNode('data'),
    //       subNodes: ['nest'],
    //       options: {},
    //       name: 'data',
    //     })
    //     expect(global.console.warn).not.toBeCalledWith(
    //       `Couldn't locate nest in data. Ensure nodes and subNodes match.`,
    //     )
    //   })
    // })
  })
//   describe('when a subNode isn\t defined in this.nodes', () => {
//     it('should warn user when not in silent mode', () => {
//       global.console = {
//         warn: jest.fn(),
//       }
//       const norm = mockNorm()
//       norm.silent = false

//       norm.normalizeSubNodes({
//         dataSlice: basicNode,
//         subNodes: ['empty'],
//         options: {},
//         name: 'test',
//       })
//       expect(global.console.warn).toBeCalledWith(
//         `Couldn't locate empty in test. Ensure nodes and subNodes match.`,
//       )
//     })
//     it('should not warn user when in silent mode', () => {
//       global.console = {
//         warn: jest.fn(),
//       }
//       const norm = mockNorm()

//       norm.normalizeSubNodes({
//         dataSlice: basicNode,
//         subNodes: ['empty'],
//         options: {},
//         name: 'test',
//       })
//       expect(global.console.warn).not.toBeCalledWith(
//         `Couldn't locate empty in test. Ensure nodes and subNodes match.`,
//       )
//     })
//   })
})
