jest.mock('../../src/Node')
import Node from '../../src/Node'
import { addRoot, defaultNode, defaultConfig, defaultOptions, newNormStruct } from '../../src'

const mockNorm = (function() {
  return () => ({
    silent: true,
    nodes: {},
    addRoot
  })
})()
const mockNode = function(fn) {
  return (name, norm) => ({
    define: fn,
    sym: 'sym'
  })
}

const wrapError = cb => cb

describe('norm :: addRoot', () => {
  it('should set node as root', () => {
    const nodeName = 'test'
    const norm = mockNorm()
    const define = jest.fn()
    Node.mockImplementation(() => mockNode(define)(nodeName))
    norm.addRoot(nodeName, undefined)
    expect(norm.root).toBe('sym')
  });
  it('should throw error if no name is defined', () => {
    const norm = mockNorm()
    const eFunc = wrapError(norm.addRoot)
    expect(eFunc).toThrowError('Nodes must be named.')
  })
  it('should not handle subNodes as an array', () => {
    const norm = mockNorm()

    const eFunc = wrapError(() => norm.addRoot('test', ['node'] ))

    expect(eFunc).toThrowError('SubNodes must be an object in the form {[subNodeName]: idToNormalizeBy}')
   
  })
  
})
