import { newNormStruct } from "../constants/defaults";

export default function _addNormData({ byId, allIds, nodeName }): void {
  const currData = this.normData[nodeName] || newNormStruct()
  const hasData = this.normData[nodeName]
  // don't repeat the id if it's already added
  const filteredIds = hasData ? allIds.filter(id => !this.normData[nodeName].byId[id]) : allIds

  this.normData = {
    ...this.normData,
    [nodeName]: {
      ...currData,
      byId: {
        ...currData.byId,
        ...byId,
      },
      allIds: [...currData.allIds, ...filteredIds],
    },
  }
}
