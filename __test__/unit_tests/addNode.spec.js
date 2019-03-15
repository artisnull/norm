import Norm, { defaultNode, defaultConfig, defaultOptions } from '../../src'

const mockNorm = (function() {
  return (isUnique = true) => {
    if (isUnique) {
      return {
        nodes: {
          has: jest.fn(name => false),
          get: jest.fn(),
          set: jest.fn(),
        },
        root: null,
        normData: {},
        ...defaultConfig,
        addNode: new Norm().addNode,
      }
    } else {
      return {
        nodes: {
          has: jest.fn(name => true),
          get: jest.fn(parent => ({ parentInfo: true })),
          set: jest.fn(),
        },
        root: null,
        normData: {},
        silent: true,
        addNode: new Norm().addNode,
      }
    }
  }
})()

const wrapError = cb => cb

describe('norm :: addNode', () => {
  describe('when node is unique', () => {
    it('should throw error if no name is defined', () => {
      const norm = mockNorm()
      const eFunc = wrapError(norm.addNode)
      expect(eFunc).toThrowError('Nodes must be named.')
    })
    it('should handle omit option', () => {
      const norm = mockNorm()

      norm.addNode('test', undefined, { omit: true })

      expect(norm.nodes.set).toBeCalledWith('test', {
        ...defaultNode,
        omit: true,
        name: 'test',
      })
      expect(norm.normData.test).toBeUndefined()
    })
    it('should throw error if root is defined twice', () => {
      const norm = mockNorm()
      norm.root = 'someNode'

      const eFunc = wrapError(() => norm.addNode('test', undefined, { root: true }))
      expect(eFunc).toThrowError('Only one root allowed')
    })
    it('should handle shorthand call', () => {
      const norm = mockNorm()

      norm.addNode('test')

      expect(norm.nodes.set).toBeCalledWith('test', {
        ...defaultNode,
        ...defaultOptions,
        name: 'test',
      })
      expect(norm.normData.test).toMatchObject(Norm.newNormStruct())
    })

    it('should handle subNodes as a string', () => {
      const norm = mockNorm()

      norm.addNode('test', { subNodes: 'node' })

      expect(norm.nodes.set).toBeCalledWith('test', {
        ...defaultNode,
        ...defaultOptions,
        subNodes: ['node'],
        name: 'test',
      })
      expect(norm.normData.test).toMatchObject(Norm.newNormStruct())
    })

    it('should handle subNodes as an array', () => {
      const norm = mockNorm()

      norm.addNode('test', { subNodes: ['node'] })

      expect(norm.nodes.set).toBeCalledWith('test', {
        ...defaultNode,
        ...defaultOptions,
        subNodes: ['node'],
        name: 'test',
      })
      expect(norm.normData.test).toMatchObject(Norm.newNormStruct())
    })
  })
  describe('when node is duplicate', () => {
    it('should use parent info to resolve name', () => {
      const norm = mockNorm(false)

      norm.addNode('test', undefined, { parent: 'parent' })

      expect(norm.nodes.set).toBeCalledWith('test', {
        parent: {
          ...defaultNode,
          parent: 'parent',
          name: 'test',
        },
        _dupNode: true,
        parentInfo: true,
      })
      expect(norm.normData.test).toMatchObject(Norm.newNormStruct())
    })
    describe('when config.allowDuplicates is true', () => {
      it('should throw error when no options.parent is defined', () => {
        const norm = mockNorm(false)
        norm.allowDuplicates = true

        const eFunc = wrapError(() => norm.addNode('test'))
        expect(eFunc).not.toThrowError('Duplicate node')
      })
    })
    describe('when config.allowDuplicates is false', () => {
      it('should throw error when no options.parent is defined', () => {
        const norm = mockNorm(false)

        const eFunc = wrapError(() => norm.addNode('test'))
        expect(eFunc).toThrowError('Duplicate node')
      })
    })
  })
})
