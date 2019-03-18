import Norm from '../src'
import { newNormStruct } from '../src/constants/defaults'
import sampleData from './sampleData'

describe('norm', () => {
  it('should normalize data', () => {
    const norm = new Norm()
    norm.addRoot('root', { posts: 'id' }, { omit: true })
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
  it('should handle simple nested data', () => {
    const data = {
      posts: [
        {
          id: '0000',
          description: 'A post about nothing',
          thumbnail: {
            url: 'pathToImage',
            id: '0003',
          },
        },
      ],
    }
    const norm = new Norm()
    norm.addRoot('posts', { pic: 'id' }, {resolve: {pic: slice => 'slice.thumbnail'}})

    const result = norm.normalize(data.posts)
    expect(result).toMatchObject({
      posts: {
        byId: {
          '0000': {
            id: '0000',
            description: 'A post about nothing',
            pic: ['0003'],
          },
        },
        allIds: ['0000'],
      },
      pic: {
        byId: {
          '0003': { url: 'pathToImage', id: '0003' },
        },
        allIds: ['0003'],
      },
    })
  })
  it('should handle every option', () => {
    const norm = new Norm()
    const { renamedPosts } = norm.addRoot(
      'root',
      { renamedPosts: 'id' },
      {
        resolve: {
          renamedPosts: slice => 'slice.posts',
        },
        omit: true,
      },
    )

    const { thumbnail } = renamedPosts.define(
      { thumbnail: 'id' },
      {
        resolve: {
          thumbnail: slice => 'slice.user.thumbnail',
        },
        filter: slice => slice.id === '0002',
        additionalIds: ['description'],
      },
    )

    thumbnail.define(
      {},
      {
        transform: slice => {
          // delete slice.url
          return slice
        },
      },
    )
    const result = norm.normalize(sampleData())
    expect(result).toMatchObject({
      renamedPosts: {
        allIds: [{ id: '0002', description: 'A post about life' }],
        byId: {
          '0002': {
            description: 'A post about life',
            id: '0002',
            user: {
              name: 'Samantha',
              thumbnail: ['0002'],
              type: 'normal',
            },
          },
        },
      },
      thumbnail: {
        byId: {
          '0000': { id: '0000',  },
          '0001': { id: '0001',  },
          '0002': { id: '0002',  },
        },
        allIds: ['0000', '0001', '0002'],
      },
    })
  })
})
