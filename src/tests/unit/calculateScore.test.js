import { calculateScore } from '../../lib/mainCal';
import Result from '../../lib/Results';

const testScore = {
    chinese: 5,
    english: 4,
    maths: 5,
    ls: 3,
    ICT: 7,
    Chem: 6,
    aMaths: 5
}
test('get best 5 score', () => {
    const result = new Result(testScore, {}, {});
    const score = calculateScore(result, [5]);
    expect(score).toEqual(28);
    expect(result.calculatedSubjects).toEqual(expect.arrayContaining(['ICT', 'Chem', 'aMaths', 'chinese', 'maths']));
});

test('get best 5 score with bonusFor5', () => {
    const result = new Result(testScore, {}, {bonusFor5: true});
    const score = calculateScore(result, [5]);
    expect(score).toEqual(32);
    expect(result.calculatedSubjects).toEqual(expect.arrayContaining(['ICT', 'Chem', 'aMaths', 'chinese', 'maths']));
});

test('get best 5 score with otherLang', () => {
    const result = new Result({...testScore, otherLang: 'A', maths: 4}, {}, {}, 'HKU'); // Maths to 4 to reduce number of subjects with level 5 or higher to 5.
    const score = calculateScore(result, [5]);
    expect(score).toEqual(30);
    expect(result.calculatedSubjects).toEqual(expect.arrayContaining(['ICT', 'Chem', 'aMaths', 'chinese', 'otherLang']));
});

test('get best 5 score when ignoring otherLang', () => {
    const result = new Result({...testScore, otherLang: 'A'}, {}, { discardOtherLang: true });
    const score = calculateScore(result, [5]);
    expect(score).toEqual(28);
    expect(result.calculatedSubjects).toEqual(expect.arrayContaining(['ICT', 'Chem', 'aMaths', 'chinese', 'maths']));
});

test('get best 6 score', () => {
    const result = new Result(testScore, {}, {});
    const score = calculateScore(result, [6]);
    expect(score).toEqual(32);
    expect(result.calculatedSubjects).toEqual(expect.arrayContaining(['ICT', 'Chem', 'aMaths', 'chinese', 'maths', 'english']));
});

test('get 4c+1x score', () => {
    const result = new Result(testScore, {}, {});
    const score = calculateScore(result, ["main", 1]);
    expect(score).toEqual(24);
    expect(result.calculatedSubjects).toEqual(expect.arrayContaining(['chinese', 'english', 'maths', 'ls', 'ICT']));
});

test('get 4c+2x score', () => {
    const result = new Result(testScore, {}, {});
    const score = calculateScore(result, ["main", 2]);
    expect(score).toEqual(30);
    expect(result.calculatedSubjects).toEqual(expect.arrayContaining(['chinese', 'english', 'maths', 'ls', 'ICT', 'Chem']));
});

test('get chinese + english + best 4 score', () => {
    const result = new Result(testScore, {}, {});
    const score = calculateScore(result, ["chinese", "english", 4]);
    expect(score).toEqual(32);
    expect(result.calculatedSubjects).toEqual(expect.arrayContaining(['chinese', 'english', 'maths', 'aMaths', 'ICT', 'Chem']));
});

test('get specified subject + best 4 score', () => {
    const result = new Result(testScore, {}, {});
    const score = calculateScore(result, ["aMaths Phy Chem Bio", 4]);
    expect(score).toEqual(28);
    expect(result.calculatedSubjects).toEqual(expect.arrayContaining(['ICT', 'Chem', 'aMaths', 'chinese', 'maths']));
});

test('get specified subject + best 4 score without aMaths', () => {
    const result = new Result(testScore, {}, { aMaths: 'discard' });
    const score = calculateScore(result, ["Phy Chem Bio", 4]);
    expect(score).toEqual(27);
    expect(result.calculatedSubjects).toEqual(expect.arrayContaining(['ICT', 'Chem', 'english', 'chinese', 'maths']));
});

test('get best 5 with weighting', () => {
    const result = new Result({...testScore, aMaths: 4}, {english: 2}, {}); // aMaths set to 4 to make calculation prefer maths > aMaths
    const score = calculateScore(result, [5]);
    expect(score).toEqual(31);
    expect(result.calculatedSubjects).toEqual(expect.arrayContaining(['ICT', 'Chem', 'english', 'maths', 'chinese']));
});

test('get best 5 with multiple weighting', () => {
    const result = new Result({...testScore, aMaths: 4}, {english: 2, chinese: 1.5}, {}); // aMaths set to 4 to make calculation prefer maths > aMaths
    const score = calculateScore(result, [5]);
    expect(score).toEqual(33.5);
    expect(result.calculatedSubjects).toEqual(expect.arrayContaining(['ICT', 'Chem', 'english', 'maths', 'chinese']));
});

test('get best 5 with custom after custom weighting', () => {
    const result = new Result(testScore, { english: 2 }, {});
    const score = calculateScore(result, ["aMaths:2", 4]);
    expect(score).toEqual(36);
    expect(result.calculatedSubjects).toEqual(expect.arrayContaining(['ICT', 'Chem', 'english', 'aMaths', 'chinese']));
});

test('get best 5 with custom after custom weighting with multiple subjects', () => {
    const result = new Result({...testScore, maths: 6, aMaths: 4}, { english: 2 }, {});
    const score = calculateScore(result, ["aMaths maths:2", 4]);
    expect(score).toEqual(38);
    expect(result.calculatedSubjects).toEqual(expect.arrayContaining(['ICT', 'Chem', 'english', 'maths', 'chinese']));
});

test('get best 5 with custom after picking best subject from custom weighting', () => {
    const result = new Result(testScore, { english: 2 }, {});
    const score = calculateScore(result, ["aMaths:2/maths:1.5", 4]);
    expect(score).toEqual(36);
    expect(result.calculatedSubjects).toEqual(expect.arrayContaining(['ICT', 'Chem', 'english', 'aMaths', 'chinese']));
});