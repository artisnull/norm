import { _normalizeNode } from '../../src'

const mockNorm = (function() {
  return () => ({
    normalizeNode: _normalizeNode,
    _normalizeSubNodes: jest.fn()
  })
})()


describe('norm :: _normalizeNode', () => {
  it('should not call _normalizeSubNodes if data is empty', () => {
      const norm = mockNorm()
      const node = {isNode: true}
      norm.normalizeNode(null, node)
      expect(norm._normalizeSubNodes).not.toHaveBeenCalled()
  });
  it('should call _normalizeSubNodes for each item if data is an array', () => {
    const norm = mockNorm()
    const node = {isNode: true}
    norm.normalizeNode([{data: true}, {data: true}], node)
    expect(norm._normalizeSubNodes).toHaveBeenCalledTimes(2)
  });
  it('should call _normalizeSubNodes once for data if data is an object', () => {
    const norm = mockNorm()
    const node = {isNode: true}
    norm.normalizeNode({data: true}, node)
    expect(norm._normalizeSubNodes).toHaveBeenCalledTimes(1)
  });
})
