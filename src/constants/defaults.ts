import {Options, NormalStructure} from '../index.d'

export const defaultNode = { subNodes: {} }
export const defaultOptions: Options = {
  root: false,
  omit: false,
  resolve: undefined,
  rename: undefined,
  filter: undefined,
  transform: undefined,
  additionalIds: undefined,
}
export const defaultConfig = { silent: true, allowDuplicates: false }

export const newNormStruct = () : NormalStructure => {
    return {
      byId: {},
      allIds: [],
    }
  }