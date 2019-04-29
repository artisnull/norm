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
    let finalId = item[id]
    
    // handle id as function
    if (typeof id === 'function') {
      finalId = id(item)
    }
    
    // ensure items pass filter
    if (filter(item)) {
      // make byId
      byId[finalId] = {
        ...transform(item), // transform the object data if desired
        id: finalId, // always include id
      }

      // make allIds
      // if no additional ids, don't make an object, just push the id
      if (additionalIds.length < 1) {
        allIds.push(finalId)
      } else {
        // additionalIds are present
        let idObj = { id: finalId }
        additionalIds.forEach(key => {
          idObj[key] = item[key]
        })
        allIds.push(idObj)
      }
    } else if (!this.silent) {
      // Item has been filtered

      console.warn({
        message: 'Data element has been filtered',
        element: item,
        fn: filter.toString(),
      })
    }
  })
  return { byId, allIds }
}
