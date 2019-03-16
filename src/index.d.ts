export interface Node extends Options {
  name: string
  subNodes: SubNodesDefinition
  _dupNode?: boolean
}
export interface Resolve {
  [name: string]: Function
}
export interface Options {
  resolve: Resolve
  parent: string
  rename: string
  omit: boolean
  root: boolean
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
