import { _normalizeSubNodes, defaultNode, defaultConfig, defaultOptions } from '../../src'
import sampleData from '../sampleData'

const mockNorm = (function() {
  return () => ({
    ...defaultConfig,
    nodes: {
      has: jest.fn(name => false),
      get: jest.fn(),
      set: jest.fn(),
    },
    root: null,
    normData: {},
    normalizeSubNodes: _normalizeSubNodes,
    addNode: jest.fn(),
    _formatArr: jest.fn(args => ({ byId: {}, allIds: ['allIds'] })),
    _addNormData: jest.fn(),
    _normalizeNode: jest.fn(),
  })
})()

const wrapError = cb => cb

describe('norm :: _normalizeSubNodes', () => {
  describe('when subNodes are defined in this.nodes', () => {
    describe('when subNode is a duplicate', () => {
      describe('when subNode is an object', () => {
        it('should replace slice based on rename option', () => {
          const testData = sampleData().posts[0]
          const targetDataSlice = testData.thumbnail
          const norm = mockNorm()

          const newNode = {
            name: 'thumbnail',
            ...defaultNode,
            ...defaultOptions,
            rename: 'renamed',
          }
          norm.nodes.has = jest.fn(() => true)
          norm.nodes.get = jest.fn(() => ({
            oldData: true,
            renamed: newNode,
            _dupNode: true,
            _rename: {
              parent: 'renamed',
            },
          }))

          norm.normalizeSubNodes(testData, {
            subNodes: { thumbnail: 'id' },
            name: 'parent',
          })

          expect(norm._formatArr).toBeCalledWith({
            data: [targetDataSlice],
            id: 'id',
          })
          expect(norm._addNormData).toBeCalledWith({
            nodeName: 'renamed',
            byId: {},
            allIds: ['allIds'],
          })
          expect(testData.thumbnail).not.toBeDefined()
          expect(testData.renamed).toEqual([targetDataSlice.id])
        })
      })
      describe('when subNode is an array', () => {
        it('should replace slice based on rename option', () => {
          const testData = sampleData()
          const targetDataSlice = testData.posts
          const norm = mockNorm()

          const newNode = {
            name: 'posts',
            ...defaultNode,
            ...defaultOptions,
            rename: 'renamed',
          }
          norm.nodes.has = jest.fn(() => true)
          norm.nodes.get = jest.fn(() => ({
            oldData: true,
            renamed: newNode,
            _dupNode: true,
            _rename: {
              parent: 'renamed',
            },
          }))

          norm.normalizeSubNodes(testData, {
            subNodes: { posts: 'id' },
            name: 'parent',
          })

          expect(norm._formatArr).toBeCalledWith({
            data: targetDataSlice,
            id: 'id',
          })
          expect(norm._addNormData).toBeCalledWith({
            nodeName: 'renamed',
            byId: {},
            allIds: ['allIds'],
          })
          expect(testData.thumbnail).not.toBeDefined()
          expect(testData.renamed).toEqual(['allIds'])
        })
      })
    })
    describe('when resolve option is present', () => {
      it('should resolve the subNode', () => {
        const testData = sampleData().meta
        const targetDataSlice = testData.posts.allUsers
        const norm = mockNorm()

        const parent = {
          name: 'parent',
          subNodes: {user: 'name'},
          resolve: {
            user: slice => slice.posts.allUsers
          }
        }
        const newNode = {
          name: 'user',
          ...defaultNode,
          ...defaultOptions,
        }
        norm.nodes.has = jest.fn(() => true)
        norm.nodes.get = jest.fn(() => newNode)

        norm.normalizeSubNodes(testData, parent)

        expect(norm._formatArr).toBeCalledWith({
          data: targetDataSlice,
          id: 'name',
        })
        expect(norm._addNormData).toBeCalledWith({
          nodeName: 'user',
          byId: {},
          allIds: ['allIds'],
        })
        expect(testData.user).toEqual(['allIds'])
      })
      it('should throw error when resolve[nodeName] is not a function', () => {
        const testData = sampleData().meta
        const targetDataSlice = testData.posts.allUsers
        const norm = mockNorm()

        const parent = {
          name: 'parent',
          subNodes: {user: 'name'},
          resolve: {
            user: 'wrong'
          }
        }
        const newNode = {
          name: 'user',
          ...defaultNode,
          ...defaultOptions,
        }
        norm.nodes.has = jest.fn(() => true)
        norm.nodes.get = jest.fn(() => newNode)

        const res = wrapError(() =>norm.normalizeSubNodes(testData, parent))

        expect(res).toThrowError('resolve must be an object, where the subNodes to resolve are the keys, and the resolve functions are the respective values.')
      });
      it('should throw error when resolve is not an object', () => {
        const testData = sampleData().meta
        const targetDataSlice = testData.posts.allUsers
        const norm = mockNorm()

        const parent = {
          name: 'parent',
          subNodes: {user: 'name'},
          resolve: slice => slice.posts.allUsers
        }
        const newNode = {
          name: 'user',
          ...defaultNode,
          ...defaultOptions,
        }
        norm.nodes.has = jest.fn(() => true)
        norm.nodes.get = jest.fn(() => newNode)

        const res = wrapError(() =>norm.normalizeSubNodes(testData, parent))

        expect(res).toThrowError('resolve must be an object, where the subNodes to resolve are the keys, and the resolve functions are the respective values.')
      });
    })
    describe('when a subNode cannot be found in the dataSlice', () => {
      it('should warn user when not in silent mode', () => {
        global.console.warn = jest.fn()
        const norm = mockNorm()
        norm.silent = false

        const testData = sampleData().meta
        const targetDataSlice = testData.posts.allUsers

        const parent = {
          name: 'parent',
          subNodes: {notPresent: 'name'},
        }
        const newNode = {
          name: 'user',
          ...defaultNode,
          ...defaultOptions,
        }
        norm.nodes.has = jest.fn(() => true)
        norm.nodes.get = jest.fn(() => newNode)

        norm.normalizeSubNodes(testData, parent)

        expect(global.console.warn).toBeCalledWith(
          `Couldn't locate notPresent in parent. Ensure nodes and subNodes match.`,
        )
      })
      it('should not warn user when in silent mode', () => {
        global.console.warn = jest.fn()
        const norm = mockNorm()

        const testData = sampleData().meta
        const targetDataSlice = testData.posts.allUsers

        const parent = {
          name: 'parent',
          subNodes: {notPresent: 'name'},
        }
        const newNode = {
          name: 'user',
          ...defaultNode,
          ...defaultOptions,
        }
        norm.nodes.has = jest.fn(() => true)
        norm.nodes.get = jest.fn(() => newNode)

        norm.normalizeSubNodes(testData, parent)

        expect(global.console.warn).not.toBeCalledWith(
          `Couldn't locate notPresent in parent. Ensure nodes and subNodes match.`,
        )
      })
    })
  })
    describe('when a subNode isn\'t defined in this.nodes', () => {
      it('should add the the node to this.nodes', () => {
        const testData = sampleData().meta
        const targetDataSlice = testData.posts.allUsers
        const norm = mockNorm()

        const parent = {
          name: 'parent',
          subNodes: {allUsers: 'name'},
        }
        const newNode = {
          name: 'allUsers',
          ...defaultNode,
          ...defaultOptions,
        }
        norm.nodes.has = jest.fn(() => false)
        norm.nodes.get = jest.fn(() => newNode)

        norm.normalizeSubNodes(testData, parent)

        expect(norm.addNode).toBeCalledWith('allUsers', defaultNode, defaultOptions)
      })
    })
})
