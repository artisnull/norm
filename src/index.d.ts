export interface Node extends Options {
  name: string
  subNodes: SubNodesDefinition
  _dupNode?: boolean
  _rename?: object
}
export interface Resolve {
  [name: string]: Function
}
export interface Options {
  resolve: Resolve
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
