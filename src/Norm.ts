// Author Zachariah Lambert
import { Node } from './index.d'
import { defaultConfig } from './constants/defaults'
import {
  addRoot,
  normalize,
  _normalizeSubNodes,
  _addNormData,
  _formatArr,
  _normalizeNode,
} from './methods'

class Norm {
  nodes: Map<string, Node>
  root: Node
  normData: object
  silent: boolean
  allowDuplicates: boolean

  constructor({ silent = true, allowDuplicates = false } = defaultConfig) {
    this.nodes = new Map()
    this.root = null
    this.normData = {}
    this.silent = silent
    this.allowDuplicates = allowDuplicates
  }

  addRoot = addRoot
  normalize = normalize
  _normalizeSubNodes = _normalizeSubNodes
  _normalizeNode = _normalizeNode
  _formatArr = _formatArr
  _addNormData = _addNormData
}

export default Norm
