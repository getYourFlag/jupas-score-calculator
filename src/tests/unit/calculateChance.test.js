import { calculateChance } from '../../lib/mainCal';
import courseData from '../../data/courseData.json';
import Result from '../../lib/Results';

const testScore = {
    chinese: 5,
    english: 5,
    maths: 5,
    ls: 4,
    ChinLit: 6,
    CHis: 6,
    Phy: 4
}

test('return -1 chance for courses that does not met requirements', () => {
    const {weighting, specifications, school} = courseData['1061'];
    const result = new Result({...testScore, english: 4}, weighting, specifications, school);

    const {chance, score} = calculateChance(result, courseData['1061']);
    expect(chance).toEqual(-1);
    expect(score).toEqual('--');
});

test('return 4 for courses with score higher than uq', () => {
    const {weighting, specifications, school} = courseData['1061'];
    const result = new Result(testScore, weighting, specifications, school);

    const {chance, score} = calculateChance(result, courseData['1061']);
    expect(chance).toEqual(4);
    expect(score).toEqual(31);
});

test('return 3 for courses with score equal or higher than uq', () => {
    const {weighting, specifications, school} = courseData['1061'];
    const result = new Result({...testScore, chinese: 3}, weighting, specifications, school);

    const {chance, score} = calculateChance(result, courseData['1061']);
    expect(chance).toEqual(3);
    expect(score).toEqual(29);
});

test('return 2 for courses with score equal or higher than lq', () => {
    const {weighting, specifications, school} = courseData['1061'];
    const result = new Result({...testScore, chinese: 3, maths: 4}, weighting, specifications, school);

    const {chance, score} = calculateChance(result, courseData['1061']);
    expect(chance).toEqual(2);
    expect(score).toEqual(28);
});

test('return 1 for courses with score equal or higher than min', () => {
    const {weighting, specifications, school} = courseData['1061'];
    const result = new Result({...testScore, chinese: 3, maths: 3}, weighting, specifications, school);

    const {chance, score} = calculateChance(result, courseData['1061']);
    expect(chance).toEqual(1);
    expect(score).toEqual(27);
});

test('return 0 for courses with score lower than min', () => {
    const {weighting, specifications, school} = courseData['1061'];
    const result = new Result({...testScore, chinese: 3, maths: 3, ChinLit: 5}, weighting, specifications, school);

    const {chance, score} = calculateChance(result, courseData['1061']);
    expect(chance).toEqual(0);
    expect(score).toEqual(26);
});