import { SubNodesDefinition, Resolve } from "./index.d";
import define from "./methods/define";
import Norm from "./Norm";

export default class Node {
    public name: string
    public subNodes: SubNodesDefinition = {}
    public sym: symbol
    public norm: Norm
    public resolve: Resolve
    public omit: boolean = false
    public root: boolean
    public filter: Function
    public transform: Function
    public additionalIds: Array<string>
    constructor(name: string, norm: Norm) {
        this.name = name
        this.sym = Symbol(name)
        this.norm = norm
        return this
    }

    public define : Function = define
    public toObject() : object {
        return [
            'name',
            'subNodes',
            'sym',
            'resolve',
            'omit',
            'filter',
            'transform',
            'additionalIds'
        ].reduce((acc, curr) : object => {
            acc[curr] = this[curr]
            return acc
        }, {})
    }
}