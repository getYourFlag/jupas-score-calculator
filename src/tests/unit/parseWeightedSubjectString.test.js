import { parseWeightedSubjectString } from '../../lib/mainCal';

test('Parse single subject string', () => {
    const weighting = parseWeightedSubjectString('Chem:2');
    expect(weighting).toEqual({Chem: 2});
});

test('Parse multiple subjects with same ratio', () => {
    const weighting = parseWeightedSubjectString('Chem english:2');
    expect(weighting).toEqual({Chem: 2, english: 2});
});

test('Parse 2 ratio with 1 subject per ratio', () => {
    const weighting = parseWeightedSubjectString('english:2/maths:2.5');
    expect(weighting).toEqual({english: 2, maths: 2.5});
});

test('Parse multiple ratios with 1 subject per ratio', () => {
    const weighting = parseWeightedSubjectString('chinese:1.5/english:2/maths:2.5');
    expect(weighting).toEqual({chinese: 1.5, english: 2, maths: 2.5});
});

test('Parse multiple ratios with 2 subject per ratio', () => {
    const weighting = parseWeightedSubjectString('chinese english:1.5/maths aMaths:2/Bio Phy:2.5');
    expect(weighting).toEqual({chinese: 1.5, english: 1.5, maths: 2, aMaths: 2, Bio: 2.5, Phy: 2.5});
});

test('Spaces around slashes should not affect parsing', () => {
    const weighting = parseWeightedSubjectString('english:2 / maths:2.5');
    expect(weighting).toEqual({english: 2, maths: 2.5});
});

test('Spaces around colons should not affect parsing', () => {
    const weighting = parseWeightedSubjectString('english : 2 / maths : 2.5');
    expect(weighting).toEqual({english: 2, maths: 2.5});
});