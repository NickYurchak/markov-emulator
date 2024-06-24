function markovAlgorithmStep(rules, word, state, maxIterations = 1000) {
    if (!state) {
        state = {
            index: -1,
            count: { applied: 0 },
            word: word,
            appliedRuleIndex: -1,
            hasReachedMaxIterations: false // Додано
        };
    }

    if (state.count.applied >= maxIterations) {
        if (!state.hasReachedMaxIterations) {
            state.hasReachedMaxIterations = true; // Додано
        }
        return { word: state.word, count: state.count, done: true, appliedRuleIndex: -1, hasReachedMaxIterations: state.hasReachedMaxIterations };
    }

    for (let i = 0; i < rules.sample.length; i++) {
        const ai = rules.sample[i];
        const bi = rules.substitution[i];

        state.index = state.word.indexOf(ai);
        if (state.index !== -1) {
            state.count.applied += 1;
            state.appliedRuleIndex = i;

            if (bi[bi.length - 1] === '.') {
                state.word = state.word.slice(0, state.index) + bi.slice(0, -1) + state.word.slice(state.index + ai.length);
                return { word: state.word, count: state.count, done: true, appliedRuleIndex: i, hasReachedMaxIterations: state.hasReachedMaxIterations };
            } else {
                state.word = state.word.slice(0, state.index) + bi + state.word.slice(state.index + ai.length);
                return { word: state.word, count: state.count, done: false, appliedRuleIndex: i, hasReachedMaxIterations: state.hasReachedMaxIterations };
            }
        }
    }

    return { word: state.word, count: state.count, done: true, appliedRuleIndex: -1, hasReachedMaxIterations: state.hasReachedMaxIterations };
}

function markovAlgorithmComplete(rules, word, maxIterations = 1000) {
    let state = null;
    let result;
    do {
        result = markovAlgorithmStep(rules, word, state, maxIterations);
        word = result.word;
        state = result.done ? null : result;
    } while (state && !result.done && !state.hasReachedMaxIterations);

    return result;
}