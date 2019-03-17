export default function _addNormData({ byId, allIds, nodeName }): void {
  const hasData = this.normData[nodeName].allIds.length > 0
  // don't repeat the id if it's already added
  const filteredIds = hasData ? allIds.filter(id => !this.normData[nodeName].byId[id]) : allIds

  this.normData = {
    ...this.normData,
    [nodeName]: {
      ...this.normData[nodeName],
      byId: {
        ...this.normData[nodeName].byId,
        ...byId,
      },
      allIds: [...this.normData[nodeName].allIds, ...filteredIds],
    },
  }
}
