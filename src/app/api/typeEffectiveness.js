import typeEffectiveness from '../party-builder/data/typeEffectiveness.json';

export const getEffectiveTypes = (opponentType) => {
    const effectiveTypes = [];

    for (const [type, effectiveness] of Object.entries(typeEffectiveness)) {
        if (effectiveness[opponentType] > 1) {
            effectiveTypes.push(type);
        }
    }

    return effectiveTypes;
};