const Norm = require('./dist').default

const sampleData = () => ({
  posts: [
    {
      id: '0000',
      description: 'A post about nothing',
      thumbnail: {
        url: 'pathToImage',
        id: '0003',
      },
      user: {
        name: 'Albert',
        type: 'normal',
        thumbnail: {
          url: 'pathToImage',
          id: '0000',
        },
      },
    },
    {
      id: '0001',
      description: 'A post about something',
      thumbnail: {
        url: 'pathToImage',
        id: '0004',
      },
      user: {
        name: 'James',
        type: 'normal',
        thumbnail: {
          url: 'pathToImage',
          id: '0001',
        },
      },
    },
    {
      id: '0002',
      description: 'A post about life',
      thumbnail: {
        url: 'pathToImage',
        id: '0005',
      },
      user: {
        name: 'Samantha',
        type: 'normal',
        thumbnail: {
          url: 'pathToImage',
          id: '0002',
        },
      },
    },
  ],
  meta: {
    posts: {
      allUsers: [
        {
          name: 'Albert',
          type: 'normal',
          thumbnail: {
            url: 'pathToImage',
            id: '0000',
          },
        },
        {
          name: 'James',
          type: 'normal',
          thumbnail: {
            url: 'pathToImage',
            id: '0001',
          },
        },
        {
          name: 'Samantha',
          type: 'normal',
          thumbnail: {
            url: 'pathToImage',
            id: '0002',
          },
        },
      ],
    },
  },
})

const norm = new Norm()
const { posts } = norm.addRoot('root', { posts: 'id' }, { omit: true })
const { user } = posts.define({ thumbnail: 'id', user: 'name' })
user.define({ thumbnail: 'id' })
const result = norm.normalize(sampleData())
console.log(JSON.stringify(result))
/*
result = {
  posts: {
    byId: {
      '0000': {
        id: '0000',
        description: 'A post about nothing',
        thumbnail: { url: 'pathToImage', id: '0003' },
        user: { name: 'Albert', type: 'normal', thumbnail: ['0000'] },
      },
      '0001': {
        id: '0001',
        description: 'A post about something',
        thumbnail: { url: 'pathToImage', id: '0004' },
        user: { name: 'James', type: 'normal', thumbnail: ['0001'] },
      },
      '0002': {
        id: '0002',
        description: 'A post about life',
        thumbnail: { url: 'pathToImage', id: '0005' },
        user: { name: 'Samantha', type: 'normal', thumbnail: ['0002'] },
      },
    },
    allIds: ['0000', '0001', '0002'],
  },
  thumbnail: {
    byId: {
      '0003': { url: 'pathToImage', id: '0003' },
      '0000': { url: 'pathToImage', id: '0000' },
      '0004': { url: 'pathToImage', id: '0004' },
      '0001': { url: 'pathToImage', id: '0001' },
      '0005': { url: 'pathToImage', id: '0005' },
      '0002': { url: 'pathToImage', id: '0002' },
    },
    allIds: ['0003', '0000', '0004', '0001', '0005', '0002'],
  },
  user: {
    byId: {
      Albert: {
        name: 'Albert',
        type: 'normal',
        thumbnail: { url: 'pathToImage', id: '0000' },
        id: 'Albert',
      },
      James: {
        name: 'James',
        type: 'normal',
        thumbnail: { url: 'pathToImage', id: '0001' },
        id: 'James',
      },
      Samantha: {
        name: 'Samantha',
        type: 'normal',
        thumbnail: { url: 'pathToImage', id: '0002' },
        id: 'Samantha',
      },
    },
    allIds: ['Albert', 'James', 'Samantha'],
  },
}
*/