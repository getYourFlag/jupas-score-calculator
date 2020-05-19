import courseData from '../../data/courseData.json';
import Result from '../../lib/Results';
import { otherLangRatio } from '../../data/university.json';

const demoScore = {
    'chinese': 5,
    'english': 4,
    'maths': 5,
    'ls': 5,
    'ICT': 5,
    'aMaths': 5,
    'Geog': 6
}

test('result object is instantiated with weighting', () => {
    let {weighting, specifications, school} = courseData['5200'];
    const result = new Result(demoScore, weighting, specifications, school);
    expect(result.rawScore).toEqual(demoScore);
    expect(result.score.chinese).toEqual(5);
    expect(result.score.english).toEqual(8);
    expect(result.score.aMaths).toEqual(7.5);
});

test('result object will not include aMath score if specification was set to discard', () => {
    let {weighting, specifications, school} = courseData['SU97'];
    const result = new Result(demoScore, weighting, specifications, school);
    expect(result.score.aMaths).toEqual(undefined);
});

test('result object is instantiated with respective other language score', () => {
    let {weighting, specifications, school} = courseData['1000'];
    const result = new Result({...demoScore, otherLang: 'A'}, weighting, specifications, school);
    expect(result.score.otherLang).toEqual(otherLangRatio[school]['A']);
});

test('result object is instantiated with other language score as 0 for unsupported institutions', () => {
    let {weighting, specifications, school} = courseData['5200'];
    const result = new Result({...demoScore, otherLang: 'A'}, weighting, specifications, school);
    expect(result.score.otherLang).toEqual(undefined);
});

test('result object is instantiated undefined other language score if related specification is set', () => {
    let {weighting, specifications, school} = courseData['4550'];
    const result = new Result({...demoScore, otherLang: 'A'}, weighting, specifications, school);
    expect(result.score.otherLang).toEqual(undefined);
});

test('result object is instantiated with bonusFor5 enabled', () => {
    let {weighting, specifications, school} = courseData['6016'];
    const result = new Result({...demoScore, ICT: 7}, weighting, specifications, school);
    expect(result.score.english).toEqual(4);
    expect(result.score.aMaths).toEqual(5.5);
    expect(result.score.Geog).toEqual(7);
    expect(result.score.ICT).toEqual(8.5);
    expect(result.rawScore.aMaths).toEqual(5);
    expect(result.rawScore.Geog).toEqual(6);
    expect(result.rawScore.ICT).toEqual(7);
});

test('result object is instantiated with bonusFor5 enabled but otherLang is not affected', () => {
    let {weighting, specifications, school} = courseData['6016'];
    const result = new Result({...demoScore, otherLang: 'A'}, weighting, specifications, school);
    expect(result.score.english).toEqual(4);
    expect(result.score.aMaths).toEqual(5.5);
    expect(result.score.Geog).toEqual(7);
    expect(result.score.otherLang).toEqual(7);

    expect(result.rawScore.aMaths).toEqual(5);
    expect(result.rawScore.Geog).toEqual(6);
});

test('result object is instantiated with weighting limit', () => {
    let {weighting, specifications, school} = courseData['4601'];
    const result = new Result({...demoScore, ICT: 4}, weighting, specifications, school);
    expect(result.score.aMaths).toEqual(10);
    expect(result.score.maths).toEqual(10);
    expect(result.score.Geog).toEqual(9);
    expect(result.score.ICT).toEqual(4); // Not weighted
    expect(result.score.chinese).toEqual(5); // Not weighted
    expect(result.score.english).toEqual(4); // Not weighted
});

test('checkUniversityRequirements can check core entry requirements', () => {
    const chineseLowScore = {...demoScore, 'chinese': 2}
    let {weighting, specifications, school} = courseData['1000'];

    const result1 = new Result(chineseLowScore, weighting, specifications, school);
    expect(result1.checkUniversityRequirements()).toBe(false);

    const englishLowScore = {...demoScore, 'english': 2}
    const result2 = new Result(englishLowScore, weighting, specifications, school);
    expect(result2.checkUniversityRequirements()).toBe(false);

    const mathsLowScore = {...demoScore, 'maths': 1}
    const result3 = new Result(mathsLowScore, weighting, specifications, school);
    expect(result3.checkUniversityRequirements()).toBe(false);

    const lsLowScore = {...demoScore, 'ls': 1}
    const result4 = new Result(lsLowScore, weighting, specifications, school);
    expect(result4.checkUniversityRequirements()).toBe(false);
});

test('checkUniversityRequirements can check elective entry requirements on numbers', () => {
    const lowElectiveCount = {...demoScore};
    delete lowElectiveCount.aMaths;
    delete lowElectiveCount.ICT;

    let {weighting, specifications, school} = courseData['1000'];
    const cityUResult = new Result(lowElectiveCount, weighting, specifications, school);
    expect(cityUResult.checkUniversityRequirements()).toBe(false);

    ({weighting, specifications, school} = courseData['7101']);
    const lingUResult = new Result(lowElectiveCount, weighting, specifications, school);
    expect(lingUResult.checkUniversityRequirements()).toBe(true);
});

test('checkUniversityRequirements can check elective entry requirements on grades', () => {
    const lowElectiveGrade = {...demoScore, ICT: 2, aMaths: 2};

    let {weighting, specifications, school} = courseData['1000'];
    const cityUResult = new Result(lowElectiveGrade, weighting, specifications, school);
    expect(cityUResult.checkUniversityRequirements()).toBe(false);

    ({weighting, specifications, school} = courseData['7101']);
    const lingUResult = new Result(lowElectiveGrade, weighting, specifications, school);
    expect(lingUResult.checkUniversityRequirements()).toBe(true);
});

test('testHighDiplomaRequirements can check score on chinese / english', () => {
    const lowChineseScore = {...demoScore, chinese: 1}
    const lowEnglishScore = {...demoScore, english: 1}

    let {weighting, specifications, school} = courseData['1000'];
    const hdResult = new Result(lowChineseScore, weighting, specifications, school);
    expect(hdResult.checkHighDiplomaRequirements()).toBe(false);

    const hdResult2 = new Result(lowEnglishScore, weighting, specifications, school);
    expect(hdResult2.checkHighDiplomaRequirements()).toBe(false);
});

test('testHighDiplomaRequirements can check met requirements by other subjects', () => {
    const metReqs = {...demoScore, maths: 1, ls: 1}

    let {weighting, specifications, school} = courseData['1000'];
    const hdResult = new Result(metReqs, weighting, specifications, school);
    expect(hdResult.checkHighDiplomaRequirements()).toBe(true);
});

test('testHighDiplomaRequirements can check unmet requirements by other subjects', () => {
    const notMetReqs = {...demoScore, maths: 1, ls: 1, ICT: 1}
    let {weighting, specifications, school} = courseData['1000'];

    const hdResult = new Result(notMetReqs, weighting, specifications, school);
    expect(hdResult.checkHighDiplomaRequirements()).toBe(false);
});

test('checkProgramRequirements can validate failing general requirements', () => {
    const lowElectiveGrade = {...demoScore, ICT: 2, aMaths: 2};
    let {weighting, specifications, school, requirements} = courseData['1000'];

    const result = new Result(lowElectiveGrade, weighting, specifications, school);
    expect(result.checkProgramRequirements(requirements)).toBe(false);
});

test('checkProgramRequirements can validate passing main subject requirements', () => {
    let {weighting, specifications, school, requirements} = courseData['1000'];
    const bbaPassResult = new Result(demoScore, weighting, specifications, school);
    expect(bbaPassResult.checkProgramRequirements(requirements)).toBe(true);
});

test('checkProgramRequirements can validate failing main subject requirements', () => {
    let {weighting, specifications, school, requirements} = courseData['1061'];
    const lawResult = new Result(demoScore, weighting, specifications, school);
    expect(lawResult.checkProgramRequirements(requirements)).toBe(false);
});

test('checkProgramRequirements can validate passing HD requirements only', () => {
    let {weighting, specifications, school, requirements} = courseData['1091'];
    const result = new Result({...demoScore, chinese: 2}, weighting, specifications, school);
    expect(result.checkProgramRequirements(requirements)).toBe(true);
});

test('checkProgramRequirements can check unmet elective score requirements', () => {
    let lowScore = {...demoScore, ICT: 2};
    let {weighting, specifications, school, requirements} = courseData['5200'];
    const result = new Result(lowScore, weighting, specifications, school);
    expect(result.checkProgramRequirements(requirements)).toBe(false);
});

test('checkProgramRequirements can check unmet elective subject requirements', () => {
    let lowScore = {...demoScore};
    delete lowScore.ICT;
    let {weighting, specifications, school, requirements} = courseData['5200'];
    const result = new Result(lowScore, weighting, specifications, school);
    expect(result.checkProgramRequirements(requirements)).toBe(false);
});

test('checkProgramRequirements can check met multiple electives requirements', () => {
    let {weighting, specifications, school, requirements} = courseData['5101'];

    const nonMetReqResult = new Result(demoScore, weighting, specifications, school);
    expect(nonMetReqResult.checkProgramRequirements(requirements)).toBe(false);

    const metReqResult = new Result({...demoScore, Bio: 5}, weighting, specifications, school);
    expect(metReqResult.checkProgramRequirements(requirements)).toBe(true);

    const notMetGradeResult = new Result({...demoScore, Bio: 2}, weighting, specifications, school);
    expect(notMetGradeResult.checkProgramRequirements(requirements)).toBe(false);
});

test('checkProgramRequirements can check the minimumScore property in requirements', () => {
    let highScore = {
        chinese: 7,
        english: 7,
        maths: 7,
        ls: 6,
        Chem: 7,
        Bio: 6,
        Phy: 6
    }

    let {weighting, specifications, school, requirements} = courseData['4502'];
    const highScoreResult = new Result(highScore, weighting, specifications, school);
    expect(highScoreResult.checkProgramRequirements(requirements)).toBe(true);

    ({weighting, specifications, school, requirements} = courseData['4502']);
    const lowerElectiveResult = new Result({...highScore, Chem: 6}, weighting, specifications, school);
    expect(lowerElectiveResult.checkProgramRequirements(requirements)).toBe(false);
});

test('getMain will return sum of main subjects and include them in includedSubjects', () => {
    let {weighting, specifications, school} = courseData['1005'];
    const result = new Result(demoScore, weighting, specifications, school);
    const mainScore = result.getMain();

    expect(mainScore).toEqual(19);
    expect(result.calculatedSubjects).toEqual(['chinese', 'english', 'maths', 'ls']);
});

test('getBestSubject will return the best subject and include it in includedSubjects', () => {
    let {weighting, specifications, school} = courseData['1005'];
    const result = new Result({...demoScore, ICT: 7}, weighting, specifications, school);
    const subjectScore = result.getBestSubject(null, null, false, false);

    expect(subjectScore).toEqual(7);
    expect(result.calculatedSubjects).toEqual(['ICT']);
});

test('getBestSubject will return the best subject within range when `include` is set', () => {
    let {weighting, specifications, school} = courseData['1005'];
    const result = new Result({...demoScore, ICT: 7}, weighting, specifications, school);
    const subjectScore = result.getBestSubject(['Geog', 'english', 'chinese'], null, false, false);

    expect(subjectScore).toEqual(6);
    expect(result.calculatedSubjects).toEqual(['Geog']);
});

test('getBestSubject will exclude subject in comparison when `exclude` is set', () => {
    let {weighting, specifications, school} = courseData['1005'];
    const result = new Result({...demoScore, ICT: 7}, weighting, specifications, school);
    const subjectScore = result.getBestSubject(null, ['ICT'], false, false);

    expect(subjectScore).toEqual(6);
    expect(result.calculatedSubjects).toEqual(['Geog']);
});

test('getBestSubject will use rawScore only if `rawScore` is set to true', () => {
    let {weighting, specifications, school} = courseData['1041'];
    const result = new Result({...demoScore, english: 7}, weighting, specifications, school);
    const subjectScore = result.getBestSubject(null, null, true, false);

    expect(subjectScore).toEqual(7);
    expect(result.calculatedSubjects).toEqual(['english']);
});

test('getBestSubject will return subject names if `subjectName` is set to true', () => {
    let {weighting, specifications, school} = courseData['1005'];
    const result = new Result(demoScore, weighting, specifications, school);
    const subjectInfo = result.getBestSubject(null, null, false, true);

    expect(subjectInfo).toBeInstanceOf(Array);
    expect(subjectInfo[0]).toEqual('Geog');
    expect(subjectInfo[1]).toEqual(6);
    expect(subjectInfo.length).toEqual(2);
});

test('calling getBestSubject twice will return the two best subject separately and include them in includedSubjects', () => {
    let {weighting, specifications, school} = courseData['1005'];
    const result = new Result({...demoScore, ICT: 7}, weighting, specifications, school);
    result.getBestSubject(null, null, false, false);

    const secondSubjectScore = result.getBestSubject(null, null, false, false);
    expect(secondSubjectScore).toEqual(6);
    expect(result.calculatedSubjects).toContain('ICT');
    expect(result.calculatedSubjects).toContain('Geog');
});

test('calling getBestSubjectStateless will return the best subject with no state storage', () => {
    let {weighting, specifications, school} = courseData['1005'];
    const result = new Result(demoScore, weighting, specifications, school);
    const score = result.getBestSubjectStateless(null, null, false, false);

    expect(score).toEqual(6);
    expect(result.calculatedSubjects).not.toContain('Geog');
});

test('`include` option in getBestSubjectStateless functions the same as getBestSubject', () => {
    let {weighting, specifications, school} = courseData['1005'];
    const result = new Result(demoScore, weighting, specifications, school);
    const score = result.getBestSubjectStateless(['chinese', 'english'], null, false, false);

    expect(score).toEqual(5);
    expect(result.calculatedSubjects).not.toContain('chinese');
});

test('`exclude` option in getBestSubjectStateless functions the same as getBestSubject', () => {
    let {weighting, specifications, school} = courseData['1005'];
    const result = new Result({...demoScore, ICT: 7}, weighting, specifications, school);
    const score = result.getBestSubjectStateless(null, ['ICT'], false, false);

    expect(score).toEqual(6);
    expect(result.calculatedSubjects).not.toContain('Geog');
});

test('`rawScore` option in getBestSubjectStateless functions the same as getBestSubject', () => {
    let {weighting, specifications, school} = courseData['1041'];
    const result = new Result({...demoScore, english: 7}, weighting, specifications, school);
    const score = result.getBestSubjectStateless(null, null, true, false);

    expect(score).toEqual(7);
    expect(result.calculatedSubjects).not.toContain('english');
});

test('`rawScore` option in getBestSubjectStateless functions the same as getBestSubject', () => {
    let {weighting, specifications, school} = courseData['1041'];
    const result = new Result({...demoScore, english: 7}, weighting, specifications, school);
    const score = result.getBestSubjectStateless(null, null, true, false);

    expect(score).toEqual(7);
    expect(result.calculatedSubjects).not.toContain('english');
});

test('calling getBestSubjects will return the number of best subjects and include them in includedSubjects', () => {
    let {weighting, specifications, school} = courseData['1005'];
    const result = new Result({...demoScore, ICT: 7}, weighting, specifications, school);

    const score = result.getBestSubjects(2, null, null, false);
    expect(score).toEqual(13);
    expect(result.calculatedSubjects).toContain('ICT');
    expect(result.calculatedSubjects).toContain('Geog');
});

test('getBestSubjects will only consider subjects in `include` if set', () => {
    let {weighting, specifications, school} = courseData['1005'];
    const result = new Result({...demoScore, ICT: 7}, weighting, specifications, school);

    const score = result.getBestSubjects(2, ['Geog', 'chinese', 'english'], null, false);
    expect(score).toEqual(11);
    expect(result.calculatedSubjects).not.toContain('ICT');
    expect(result.calculatedSubjects).toContain('Geog');
    expect(result.calculatedSubjects).toContain('chinese');
});

test('getBestSubjects will not consider subjects in `exclude` if set', () => {
    let {weighting, specifications, school} = courseData['1005'];
    const result = new Result({...demoScore, ICT: 7}, weighting, specifications, school);

    const score = result.getBestSubjects(2, null, ['ICT', 'chinese'], false);
    expect(score).toEqual(11);
    expect(result.calculatedSubjects).not.toContain('ICT');
    expect(result.calculatedSubjects).toContain('Geog');
    expect(result.calculatedSubjects).toContain('maths');
});

test('getBestSubjects will use rawScore if `rawScore` is set', () => {
    let {weighting, specifications, school} = courseData['1041'];
    const result = new Result({...demoScore, english: 7}, weighting, specifications, school);

    const score = result.getBestSubjects(2, null, null, true);
    expect(score).toEqual(13);
    expect(result.calculatedSubjects).toContain('Geog');
    expect(result.calculatedSubjects).toContain('english');
});

test('getBestSubjects will be stateless if `useState` is false', () => {
    let {weighting, specifications, school} = courseData['1005'];
    const result = new Result({...demoScore, english: 7}, weighting, specifications, school);

    const score = result.getBestSubjects(2, null, null, true, false);
    expect(score).toEqual(13);
    expect(result.calculatedSubjects.length).toEqual(0);
});

test('getBestSubjectWithCustomWeighting will give score with custom weighting without affecting values in object', () => {
    let {weighting, specifications, school} = courseData['1005'];
    const customWeighting = {
        'english': 2
    }
    const result = new Result(demoScore, weighting, specifications, school);

    const score = result.getBestSubjectWithCustomWeighting(customWeighting, false);
    expect(score).toEqual(8);
    expect(result.calculatedSubjects).toEqual(['english']);
    expect(result.score.english).toEqual(4);
});

test('getBestSubjectWithCustomWeighting will give score with multiple subjects', () => {
    let {weighting, specifications, school} = courseData['1005'];
    const customWeighting = {
        'english': 2,
        'maths': 2
    }
    const result = new Result(demoScore, weighting, specifications, school);

    const score = result.getBestSubjectWithCustomWeighting(customWeighting, false);
    expect(score).toEqual(10);
    expect(result.calculatedSubjects).toEqual(['maths']);
    expect(result.score.english).toEqual(4);
    expect(result.score.maths).toEqual(5);
});

test('getBestSubjectWithCustomWeighting will function as getBestSubject if none of the weighted subject is found', () => {
    let {weighting, specifications, school} = courseData['1005'];
    const customWeighting = {
        'Design': 2,
        'EngLit': 2
    }
    const result = new Result(demoScore, weighting, specifications, school);

    const score = result.getBestSubjectWithCustomWeighting(customWeighting, false);
    expect(score).toEqual(6);
    expect(result.calculatedSubjects).toEqual(['Geog']);
});

test('getBestSubjectWithCustomWeighting will return a weighted subject even if the weighted score is still lower than other subjects', () => {
    let {weighting, specifications, school} = courseData['1005'];
    const customWeighting = {
        'Geog': 2
    }
    const result = new Result({...demoScore, Geog: 3, english: 7}, weighting, specifications, school);

    const score = result.getBestSubjectWithCustomWeighting(customWeighting, false);
    expect(score).toEqual(6);
    expect(result.calculatedSubjects).toEqual(['Geog']);
});

test('getBestSubjectWithCustomWeighting will give score with multiple subjects AND multiple weighting', () => {
    let {weighting, specifications, school} = courseData['1005'];
    const customWeighting = {
        'english': 2,
        'maths': 1.5
    }
    const result = new Result(demoScore, weighting, specifications, school);

    const score = result.getBestSubjectWithCustomWeighting(customWeighting, false);
    expect(score).toEqual(8);
    expect(result.calculatedSubjects).toEqual(['english']);
    expect(result.score.english).toEqual(4);
    expect(result.score.maths).toEqual(5);
});

test('getBestSubjectWithCustomWeighting will return subject name if `subjectName` is true', () => {
    let {weighting, specifications, school} = courseData['1005'];
    const customWeighting = {
        'english': 2
    }
    const result = new Result(demoScore, weighting, specifications, school);

    const subjectInfo = result.getBestSubjectWithCustomWeighting(customWeighting, true);
    expect(subjectInfo).toBeInstanceOf(Array);
    expect(subjectInfo[0]).toEqual('english');
    expect(subjectInfo[1]).toEqual(8);
    expect(result.calculatedSubjects).toEqual(['english'])
    expect(result.score.english).toEqual(4);
});

test('getBestSubjectWithCustomWeighting will be stateless if `useState` is false', () => {
    let {weighting, specifications, school} = courseData['1005'];
    const customWeighting = {
        'english': 2
    }
    const result = new Result(demoScore, weighting, specifications, school);

    const score = result.getBestSubjectWithCustomWeighting(customWeighting, false, false);
    expect(score).toEqual(8);
    expect(result.calculatedSubjects.length).toEqual(0);
    expect(result.score.english).toEqual(4);
});

test('getMain and getBestSubject will work together', () => {
    let {weighting, specifications, school} = courseData['1005'];
    const result = new Result(demoScore, weighting, specifications, school);
    const mainScore = result.getMain();
    const electiveScore = result.getBestSubject();

    expect(mainScore).toEqual(19);
    expect(electiveScore).toEqual(6);
    expect(result.calculatedSubjects).toEqual(['chinese', 'english', 'maths', 'ls', 'Geog']);
});

test('getMain and getBestSubjects will work together', () => {
    let {weighting, specifications, school} = courseData['1005'];
    const result = new Result({...demoScore, ICT: 7}, weighting, specifications, school);
    const mainScore = result.getMain();
    const electiveScore = result.getBestSubjects(2);

    expect(mainScore).toEqual(19);
    expect(electiveScore).toEqual(13);
    expect(result.calculatedSubjects).toEqual(['chinese', 'english', 'maths', 'ls', 'ICT', 'Geog']);
});

test('getMain and getBestSubjectWithCustomWeighting will work together', () => {
    let {weighting, specifications, school} = courseData['1005'];
    const result = new Result({...demoScore, ICT: 7}, weighting, specifications, school);
    const mainScore = result.getMain();

    const customWeighting = {
        ICT: 2
    }
    const electiveScore = result.getBestSubjectWithCustomWeighting(customWeighting);

    expect(mainScore).toEqual(19);
    expect(electiveScore).toEqual(14);
    expect(result.calculatedSubjects).toEqual(['chinese', 'english', 'maths', 'ls', 'ICT']);
});