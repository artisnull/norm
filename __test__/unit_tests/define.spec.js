jest.mock('../../src/Node')
import Node from '../../src/Node'
import { define, defaultNode, defaultConfig, defaultOptions, newNormStruct } from '../../src'

const mockNorm = (function() {
  return () => ({
    nodes: {
      set: jest.fn(),
      has: jest.fn(name => false),
      get: jest.fn(name => {
        existingNode: true
      }),
    },
    allowDuplicates: true,
    normData: {}
  })
})()
const mockNode = (function() {
  return (name, norm) => ({
    define,
    sym: 'sym',
    norm: mockNorm(),
    toObject: jest.fn()
  })
})()

const wrapError = cb => cb

describe('node :: define', () => {
  it('should add create and add nodes per subnode', () => {
    const node = mockNode()
    const newNode = mockNode()
    Node.mockImplementation(() => newNode)
    const name = 'test'

    const res = node.define({[name]: {isNode: true}})
    expect(node.norm.nodes.set).toHaveBeenCalledWith('sym', {
      ...defaultOptions,
      subNodes: {
        sym : {
          isNode: true
        }
      }
    })
    expect(node.norm.nodes.set).toHaveBeenCalledTimes(2)
    expect(res).toMatchObject({test: newNode})
  })
  it('should handle undefined subNodes', () => {
    const node = mockNode()
    node.norm.allowDuplicates = false
    Node.mockImplementation(mockNode)
    const name = 'test'

    node.define(undefined, {})
    expect(node.norm.nodes.set).toHaveBeenCalledWith('sym', {
      subNodes: {}
    })
    expect(node.norm.nodes.set).toHaveBeenCalledTimes(1)
  })
  it('should not handle subNodes as an array', () => {
    const node = mockNode()
    Node.mockImplementation(() => mockNode(nodeName))

    const eFunc = wrapError(() => node.define(['node'] ))

    expect(eFunc).toThrowError('SubNodes must be an object in the form {[subNodeName]: idToNormalizeBy}')
   
  })
})
