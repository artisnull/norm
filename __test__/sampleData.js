export default function() {
  return {
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
          id: '0004',
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
        ]
      }
    }
  }
}
