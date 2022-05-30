const SkwFs = require('./skw-fs');
const common = require('./common');

function createUniqueMapKeyGenerator(map, keyLength = 8) {
    return () => {
        let sessionID = '';
        const possible = 'ABCDEFGHIJKLMNOPQRSTUVWKYZ0123456789';
        const numPossible = possible.length;
        do {
            for (let i = 0; i < keyLength; i++) {
                sessionID += possible.charAt((Math.random() * numPossible) | 0);
            }
        } while (map.has(sessionID))
        return sessionID;
    }
}

function pseudoInterfaceCheck(classPrototype, instance) {
    const proto = Object.getPrototypeOf(instance);
    const missing = Object.getOwnPropertyNames(classPrototype).find(name =>
        typeof classPrototype[name] === "function" && !proto.hasOwnProperty(name)
    );
    if (missing) throw new TypeError(`${instance.constructor.name} needs to implement ${missing}`);
}

module.exports = {
    SkwFs,
    common,
    createUniqueMapKeyGenerator,
    pseudoInterfaceCheck
}
