import Norm from '../../src'

describe('Norm constructor', () => {
    it('should properly set defaults', () => {
        const norm = new Norm()
        expect(norm).toMatchObject({
            nodes: new Map(),
            root: null,
            normData: {},
            silent:true,
            allowDuplicates: false,
        })
    });
    it('should handle silent config option', () => {
        const norm = new Norm({silent: false})
        expect(norm).toMatchObject({
            nodes: new Map(),
            root: null,
            normData: {},
            silent: false,
            allowDuplicates: false,
        })
    });
    it('should handle allowDuplicates config option', () => {
        const norm = new Norm({allowDuplicates: true})
        expect(norm).toMatchObject({
            nodes: new Map(),
            root: null,
            normData: {},
            silent: true,
            allowDuplicates: true,
        })
    });
});