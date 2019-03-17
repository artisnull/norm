import Node from '../../src/Node'
import { defaultNode, defaultOptions } from '../../src/constants/defaults';

describe('Node', () => {
    describe('constructor', () => {
        it('should properly set name and sym', () => {
            const node = new Node('name', 'norm')
            expect(node.name).toBe('name')
            expect(node.sym.toString()).toBe('Symbol(name)')
            expect(typeof node.sym).toBe('symbol')
            expect(node.norm).toBe('norm')
        });
    });
    describe('toObject', () => {
        it('should take properties from node and return an object', () => {
            const node = new Node('name', 'norm')
            expect(node.toObject()).toMatchObject({
                ...defaultOptions,
                ...defaultNode,
                name: 'name',
            })            
        });
    });
});