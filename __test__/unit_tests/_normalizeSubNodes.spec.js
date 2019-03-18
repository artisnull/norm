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
  describe('when resolve option is present', () => {
    it('should resolve the subNode', () => {
      const testData = sampleData().meta
      const targetDataSlice = testData.posts.allUsers
      const norm = mockNorm()

      const parent = {
        name: 'parent',
        subNodes: {[Symbol('user')]: 'name'},
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
        subNodes: {[Symbol('user')]: 'name'},
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
    it('should not throw error when resolve[nodeName] is undefined', () => {
      const testData = sampleData().meta
      const targetDataSlice = testData.posts.allUsers
      const norm = mockNorm()

      const parent = {
        name: 'parent',
        subNodes: {[Symbol('user')]: 'name'},
        resolve: {
          user: undefined
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

      expect(res).not.toThrowError('resolve must be an object, where the subNodes to resolve are the keys, and the resolve functions are the respective values.')
    });
    it('should throw error when resolve is not an object', () => {
      const testData = sampleData().meta
      const targetDataSlice = testData.posts.allUsers
      const norm = mockNorm()

      const parent = {
        name: 'parent',
        subNodes: {[Symbol('user')]: 'name'},
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
        subNodes: {[Symbol('notPresent')]: 'name'},
      }
      const newNode = {
        name: 'notPresent',
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
  it('should handle subSlice as an object', () => {
    const norm = mockNorm()
    const data = sampleData().posts[0]
    const node = {
      subNodes: {
        [Symbol('test')]: 'id'
      }
    }
    const subNode = {
      name: 'thumbnail'
    }
    norm.nodes.get = jest.fn(name => subNode)
    norm.normalizeSubNodes(data, node)  
    expect(norm._formatArr).toHaveBeenCalledWith({
      data: [sampleData().posts[0].thumbnail],
      id: 'id'
    })  
  })
  it('should handle subSlice as an array', () => {
    const norm = mockNorm()
    const data = sampleData()
    const node = {
      subNodes: {
        [Symbol('test')]: 'id'
      }
    }
    const subNode = {
      name: 'posts'
    }
    norm.nodes.get = jest.fn(name => subNode)
    norm.normalizeSubNodes(data, node)  
    expect(norm._formatArr).toHaveBeenCalledWith({
      data: sampleData().posts,
      id: 'id'
    })  
  })
  it('should handle no subnodes', () => {
    const norm = mockNorm()
    const eFunc = wrapError(() => norm.normalizeSubNodes({}, {}))
    expect(eFunc).not.toThrowError()
  })
})
