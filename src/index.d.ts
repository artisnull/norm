export interface Node extends Options {
  name: string
  subNodes: SubNodesDefinition,
  sym: symbol
}
export interface Resolve {
  [name: string]: Function
}
export interface Options {
  resolve: Resolve
  omit: boolean
  filter(): boolean
  transform(): object
  additionalIds: Array<string>
}
export interface SubNodesDefinition {
  [name: string]: string
}

export interface NormalStructure {
  byId: object
  allIds: string[]
}
