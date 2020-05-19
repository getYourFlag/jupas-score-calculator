import { giveChance } from '../../lib/mainCal';

const testScore = {
    uq: 41,
    median: 39,
    lq: 37,
    min: 35
}

const lowerTestScore = {
    median: 21,
    lq: 21
}

test('giveChance returns 4 for scores upper than uq', () => {
    const chance = giveChance(42, testScore);
    expect(chance).toEqual(4);
});

test('giveChance returns 3 for scores equal to uq', () => {
    const chance = giveChance(41, testScore);
    expect(chance).toEqual(3);
});

test('giveChance returns 3 for scores higher to median', () => {
    const chance = giveChance(40, testScore);
    expect(chance).toEqual(3);
});

test('giveChance returns 3 for scores equal to median', () => {
    const chance = giveChance(39, testScore);
    expect(chance).toEqual(3);
});

test('giveChance returns 2 for scores higher than lower quartile', () => {
    const chance = giveChance(38, testScore);
    expect(chance).toEqual(2);
});

test('giveChance returns 2 for scores equal to lower quartile', () => {
    const chance = giveChance(37, testScore);
    expect(chance).toEqual(2);
});

test('giveChance returns 1 for scores higher than min', () => {
    const chance = giveChance(36, testScore);
    expect(chance).toEqual(1);
});

test('giveChance returns 1 for scores equal to min', () => {
    const chance = giveChance(35, testScore);
    expect(chance).toEqual(1);
});

test('giveChance returns 0 for scores less than min', () => {
    const chance = giveChance(34, testScore);
    expect(chance).toEqual(0);
});

test('giveChance estimates min by difference in media & lq (test value = 2)', () => {
    const scoreWithoutMin = {...testScore};
    delete scoreWithoutMin.min;

    let chance = giveChance(34, scoreWithoutMin);
    expect(chance).toEqual(0);

    chance = giveChance(35, scoreWithoutMin);
    expect(chance).toEqual(1);
});

test('giveChance estimates uq by difference in media & lq (test value = 2)', () => {
    const scoreWithoutUq = {...testScore};
    delete scoreWithoutUq.uq;

    let chance = giveChance(41, scoreWithoutUq);
    expect(chance).toEqual(3);

    chance = giveChance(42, scoreWithoutUq);
    expect(chance).toEqual(4);
});

test('giveChance estimates min & uq by median / 20 when median & lq is the same', () => {
    expect(giveChance(22, lowerTestScore)).toEqual(3);
    expect(giveChance(23, lowerTestScore)).toEqual(4);
    expect(giveChance(21, lowerTestScore)).toEqual(3);
    expect(giveChance(20, lowerTestScore)).toEqual(1);
    expect(giveChance(19, lowerTestScore)).toEqual(0);
});