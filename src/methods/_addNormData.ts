export default function _addNormData({ byId, allIds, nodeName }): void {
  this.normData = {
    ...this.normData,
    [nodeName]: {
      ...this.normData[nodeName],
      byId: {
        ...(this.normData[nodeName].byId || {}),
        ...byId,
      },
      allIds: [...this.normData[nodeName].allIds, ...allIds],
    },
  }
}
