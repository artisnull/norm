import { _formatArr } from '../../src'
import sampleData from '../sampleData'

const mockNorm = (function() {
  return () => ({
    silent: true,
    formatArr: _formatArr,
  })
})()

describe('norm :: _formatArr', () => {
  describe('basic functionality', () => {
    it('should take a data array and return {byId, allIds}', () => {
      const data = sampleData().posts
      const id = 'id'
      const norm = mockNorm()
      const res = norm.formatArr({ data, id })
      expect(res).toMatchObject({
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
      })
    })
  })
  describe('when using filter()', () => {
    it('should only normalize items that pass filter', () => {
      global.console.warn = jest.fn()
      const data = sampleData().posts
      const id = 'id'
      const filter = ({ id }) => id === '0000'
      const norm = mockNorm()
      const res = norm.formatArr({ data, id, filter })
      expect(res).toMatchObject({
        allIds: ['0000'],
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
        },
      })
      expect(global.console.warn).not.toHaveBeenCalled()
    })
    it('should warn user when not silent and item has been filtered', () => {
      global.console.warn = jest.fn()

      const data = sampleData().posts
      const id = 'id'
      const filter = ({ id }) => id === '0000'
      const norm = mockNorm()
      norm.silent = false
      const res = norm.formatArr({ data, id, filter })
      expect(res).toMatchObject({
        allIds: ['0000'],
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
        },
      })

      expect(global.console.warn).toHaveBeenCalledTimes(2)
    })
  })
  describe('when using transform()', () => {
    it('should transform each slice', () => {
      const data = sampleData().posts
      const id = 'id'
      const transform = slice => {
        slice.description = `${slice.description} - transformed`
        return slice
      }
      const norm = mockNorm()
      const res = norm.formatArr({ data, id, transform })
      expect(res).toMatchObject({
        allIds: ['0000', '0001', '0002'],
        byId: {
          '0000': {
            description: 'A post about nothing - transformed',
            id: '0000',
            thumbnail: { id: '0003', url: 'pathToImage' },
            user: {
              name: 'Albert',
              thumbnail: { id: '0000', url: 'pathToImage' },
              type: 'normal',
            },
          },
          '0001': {
            description: 'A post about something - transformed',
            id: '0001',
            thumbnail: { id: '0004', url: 'pathToImage' },
            user: {
              name: 'James',
              thumbnail: { id: '0001', url: 'pathToImage' },
              type: 'normal',
            },
          },
          '0002': {
            description: 'A post about life - transformed',
            id: '0002',
            thumbnail: { id: '0004', url: 'pathToImage' },
            user: {
              name: 'Samantha',
              thumbnail: { id: '0002', url: 'pathToImage' },
              type: 'normal',
            },
          },
        },
      })
    })
  })
  describe('when using additionalIds', () => {
    it('should add the additional fields to allIds', () => {
      const data = sampleData().posts
      const id = 'id'
      const additionalIds = ['description']
      const norm = mockNorm()
      const res = norm.formatArr({ data, id, additionalIds })
      expect(res).toMatchObject({
        allIds: [
          { description: 'A post about nothing', id: '0000' },
          { description: 'A post about something', id: '0001' },
          { description: 'A post about life', id: '0002' },
        ],
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
      })
    })
  })
})
