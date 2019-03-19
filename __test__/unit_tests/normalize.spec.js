import { normalize } from '../../src'

const mockNorm = (function() {
  return () => ({
    root: null,
    normData: {
        isNormalized: true
    },
    normalize,
    _normalizeNode: jest.fn(),
    nodes: {
      get: jest.fn(id => ({isNode: true, name: 'root'})),
    },
  })
})()

const wrapError = cb => cb

describe('norm :: normalize', () => {
  it('should throw error if no root is defined', () => {
    const norm = mockNorm()
    const data = { data: true }
    const eFunc = wrapError( () => norm.normalize(data))
    expect(eFunc).toThrowError('No root is defined.')
  })
  it('should throw error if data is not array or object', () => {
    const norm = mockNorm()
    norm.root = 'rootNodeId'
    const data ='notAnObject'
    const eFunc = wrapError( () => norm.normalize(data))
    expect(eFunc).toThrowError('Data must be an array or object.')
  })
  it('should call _normalizeNode() with the root node', () => {
    const norm = mockNorm()
    norm.root = 'rootNodeId'
    const data = { data: true }
    norm.normalize(data)
    expect(norm._normalizeNode).toHaveBeenCalledWith({'root': data}, {isNode: true, name: 'root'})
  });
  it('should return normData from data array', () => {
    const norm = mockNorm()
    norm.root = 'rootNodeId'
    const data = [{ data: true }]
    const res = norm.normalize(data)
    expect(res).toMatchObject(norm.normData)
  });
  it('should return normData from data object', () => {
    const norm = mockNorm()
    norm.root = 'rootNodeId'
    const data = { data: true }
    const res = norm.normalize(data)
    expect(res).toMatchObject(norm.normData)
  });
})
