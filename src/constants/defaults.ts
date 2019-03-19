import {Options, NormalStructure} from '../index.d'

export const defaultNode = { subNodes: {} }
export const defaultOptions: Options = {
  omit: false,
  resolve: undefined,
  filter: undefined,
  transform: undefined,
  additionalIds: undefined,
}
export const defaultConfig = { silent: true }

export const newNormStruct = () : NormalStructure => {
    return {
      byId: {},
      allIds: [],
    }
  }