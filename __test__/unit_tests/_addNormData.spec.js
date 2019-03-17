import { _addNormData } from '../../src'

const mockNorm = (function() {
    return () => ({
      normData: {
          fullNode: {
              byId: {
                  0: {
                      id: 0
                  }
              },
              allIds: [0]
          }
      },
      addNormData: _addNormData
    })
  })()

describe('norm :: _addNormData', () => {
    it('should add data to normData', () => {
        const norm = mockNorm()
        const testNode = {
            byId:  {
                testId: {
                    id: 'testId'
                }
            },
            allIds: ['testId'],
            nodeName: 'emptyNode'
        }
        norm.addNormData(testNode)
        expect(norm.normData.emptyNode).toMatchObject({
            byId: testNode.byId,
            allIds: testNode.allIds
        })
    });
    it('should merge data for existing nodes', () => {
        const norm = mockNorm()
        const testNode = {
            byId:  {
                testId: {
                    id: 'testId'
                }
            },
            allIds: ['testId'],
            nodeName: 'fullNode'
        }
        norm.addNormData(testNode)
        expect(norm.normData.fullNode).toMatchObject({
            byId: {
                testId: {
                    id: 'testId'
                },
                0: {
                    id: 0
                }    
            },
            allIds: [0, 'testId']
        })
    });
    it('should merge data for existing ids within a node', () => {
        const norm = mockNorm()
        const testNode = {
            byId:  {
                0: {
                    id: 0,
                    newData: true
                }
            },
            allIds: [0],
            nodeName: 'fullNode'
        }
        norm.addNormData(testNode)
        expect(norm.normData.fullNode).toMatchObject({
            byId: {
                0: {
                    id: 0,
                    newData: true
                }    
            },
            allIds: [0]
        })
    });
})
