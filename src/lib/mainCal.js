import courseList from "../data/courseData.json";
import Result from "../lib/Results";
import { basicElectiveRequirements, otherLangRatio } from "../data/university.json"

function calculate(score, isRetaker = false) {
    let calculateResult = {};
    for (let courseCode in courseList) {
        let course = courseList[courseCode];

        let specifications = course.specifications || {};
        specifications.otherLangRatio = otherLangRatio[course.school];
        let weighting = course.weighting || {};

        let result = new Result(score, weighting, specifications);
        calculateResult[courseCode] = calculateChance(result, course, isRetaker);
    }
    return calculateResult;
}

function calculateChance(result, course, isRetaker = false) {
    let [electiveCount, electiveGrade] = basicElectiveRequirements[course.school];

    let eligibility = result.checkProgramRequirements(course.requirements, electiveCount, electiveGrade); // Score object will be mutated.
    if (!eligibility) return {chance: -1, score: "--"};

    let admissionScore = calculateScore(result, course);

    if (course.specifications && course.specifications.retakeRatio && isRetaker) {
        admissionScore = admissionScore * course.specifications.retakeRatio;
    }

    return {chance: giveChance(admissionScore, course), score: admissionScore};
}

function calculateScore(result, course) {
    let resultScore = 0;

    for (let subject of course.countedSubjects) {

        if (typeof subject === 'number') {

            resultScore += result.getBestSubjects(subject);

        } else if (subject === 'main') {

            resultScore += result.getMain();

        } else if (subject.indexOf(':') !== -1) {

            let [targetSubjects, ratio] = subject.split(":");
            ratio = parseFloat(ratio);
            targetSubjects = targetSubjects.split(" ");
            resultScore += result.getBestSubjectWithCustomWeighting(targetSubjects, ratio, false);

        } else {

            let includedSubjects = subject.split(" ");
            resultScore += result.getBestSubject(includedSubjects, null);

        }
    }

    return resultScore;
}

function giveChance(admissionScore, course) {
    if (course.specifications && course.specifications.minimumScore && admissionScore < course.specifications.minimumScore) return -1;

    let median = course.score.median;
    let lq = course.score.lq;
    let diff = median - lq; // Difference between LQ & Median for estimation.
    if (diff === 0) diff = Math.round(median / 20);
    let uq = course.score.uq || median + diff;
    let min = course.score.min || lq - diff;
    if (admissionScore >= median) {
        if (admissionScore > uq) return 4;
        return 3;
    } else if (admissionScore >= min) {
        if (admissionScore >= lq) return 2;
        return 1;
    } else {
        return 0;
    }
}

export default calculate;