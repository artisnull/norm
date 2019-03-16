import Norm from '../src'
import { newNormStruct } from '../src/constants/defaults'
import sampleData from './sampleData'

describe('norm', () => {
  describe('default structure', () => {
    it('should be byId, allIds', () => {
      const struct = newNormStruct()
      expect(struct).toMatchObject({
        byId: {},
        allIds: [],
      })
    })
  })
  it('should normalize data', () => {
    const norm = new Norm()
    norm.addNode('root', { posts: 'id' }, { root: true, omit: true })
    const result = norm.normalize(sampleData())
    expect(result).toMatchObject({
      posts: {
        allIds: ['0000', '0001', '0002'],
        byId: {
          '0000': {
            description: 'A post about nothing',
            id: '0000',
            thumbnail: { id: '0003', url: 'pathToImage' },
            user: {
              name: 'Albert',
              thumbnail: { id: '0000', url: 'pathToImage' },
              type: 'normal',
            },
          },
          '0001': {
            description: 'A post about something',
            id: '0001',
            thumbnail: { id: '0004', url: 'pathToImage' },
            user: {
              name: 'James',
              thumbnail: { id: '0001', url: 'pathToImage' },
              type: 'normal',
            },
          },
          '0002': {
            description: 'A post about life',
            id: '0002',
            thumbnail: { id: '0004', url: 'pathToImage' },
            user: {
              name: 'Samantha',
              thumbnail: { id: '0002', url: 'pathToImage' },
              type: 'normal',
            },
          },
        },
      },
    })
  })
})
