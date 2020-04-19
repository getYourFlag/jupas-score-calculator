import courseList from "../data/newCourseData.json";
import Result from "../lib/Results";
import { basicElectiveRequirements, otherLangRatio } from "../data/university.json"

function calculate(score) {
    let calculateResult = {};
    for (let courseCode in courseList) {
        let course = courseList[courseCode];

        let specifications = course.specifications || {};
        specifications.otherLangRatio = otherLangRatio[course.school];
        let weighting = course.weighting || {};

        let result = new Result(score, weighting, specifications);
        calculateResult[courseCode] = calculateChance(result, course);
    }
    return calculateResult;
}

function calculateChance(result, course) {
    let [electiveCount, electiveGrade] = basicElectiveRequirements[course.school];

    let eligibility = result.checkProgramRequirements(course.requirement, electiveCount, electiveGrade); // Score object will be mutated.
    if (!eligibility) return {chance: -1, score: "--"};

    let admissionScore = calculateScore(result, course);
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
            let [ratio, countSubjects] = subject.split(":");
            resultScore += result.getBestSubject(countSubjects.split(" "), null) * ratio;
        } else {
            let includedSubjects = subject.split(" ");
            resultScore += result.getBestSubject(includedSubjects, null);
        }
    }

    return resultScore;
}

function giveChance(admissionScore, course) {
    let diff = course.median - course.lq; // Difference between LQ & Median for estimation.
    if (diff === 0) diff = Math.round(course.median / 20);
    let uq = course.uq || course.median + diff;
    let min = course.min || course.lq - diff;
    if (admissionScore > uq) return 4;
    if (admissionScore >= course.median) return 3;
    if (admissionScore >= course.lq) return 2;
    if (admissionScore >= min) return 1;
    return 0;
}

export default calculate;