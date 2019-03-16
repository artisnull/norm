import { NormalStructure } from '../index.d'

// turn [data] into {byId, allIds}
export default function _formatArr({
  data,
  id,
  additionalIds = [],
  transform = (x: object) => x,
  filter = (dataSlice: object) => true,
}): NormalStructure {
  let byId = {},
    allIds = []

  // iterate through each item and structure into byId,allIds format
  data.forEach(item => {
    // ensure items pass filter
    if (filter(item)) {
      // make byId
      byId[item[id]] = {
        ...transform(item), // transform the object data if desired
        id: item[id], // always include id
      }

      // make allIds
      // if no additional ids, don't make an object, just push the id
      if (additionalIds.length < 1) {
        allIds.push(item[id])
      } else {
        // additionalIds are present
        let idObj = { id: item[id] }
        additionalIds.forEach(key => {
          idObj[key] = item[key]
        })
        allIds.push(idObj)
      }
    } else if (
      process.env.NODE_ENV === 'development' ||
      (process.env.NODE_ENV === 'dev' && !filter(item))
    ) {
      // Item has been filtered
      !this.silent &&
        console.warn({
          message: 'Data element has been filtered',
          element: item,
          fn: filter.toString(),
        })
    }
  })
  return { byId, allIds }
}
