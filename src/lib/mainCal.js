import courseList from "../data/courseData.json";
import Result from "../lib/Results";

function calculate(score, isRetaker = false) {
    let calculateResult = {};
    for (let courseCode in courseList) {
        let course = courseList[courseCode];
        if (!course.scores) continue;

        let result = new Result(score, course.weighting, course.specifications, course.school);
        calculateResult[courseCode] = calculateChance(result, course, isRetaker);
    }
    return calculateResult;
}

function calculateChance(result, course, isRetaker = false) {
    let eligibility = result.checkProgramRequirements(course.requirements);
    if (!eligibility) return {chance: -1, score: "--"};

    let admissionScore = calculateScore(result, course.countedSubjects);

    if (course.specifications && course.specifications.retakeRatio && isRetaker) {
        admissionScore = admissionScore * course.specifications.retakeRatio;
    }

    return {chance: giveChance(admissionScore, course.scores), score: admissionScore};
}

function calculateScore(result, subjectArray) {
    let admissionScore = 0;

    for (let subject of subjectArray) {

        if (typeof subject === 'number') {

            admissionScore += result.getBestSubjects(subject);

        } else if (subject === 'main') {

            admissionScore += result.getMain();

        } else if (subject.indexOf(':') !== -1) {

            const weightObject = parseWeightedSubjectString(subject);
            admissionScore += result.getBestSubjectWithCustomWeighting(weightObject, false);

        } else {

            const includedSubjects = subject.split(" ");
            admissionScore += result.getBestSubject(includedSubjects);

        }
    }

    return admissionScore;
}

function giveChance(admissionScore, scores) {
    const { median, lq } = scores;

    let diff = median - lq; // Difference between LQ & Median for estimation.
    if (diff === 0) diff = Math.round(median / 20);

    const uq = scores.uq || median + diff;
    const min = scores.min || lq - diff;

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

function parseWeightedSubjectString(subjects) {
    if (subjects.indexOf("/") !== -1) {
        return subjects.split("/").reduce((obj, category) => Object.assign(obj, parseWeightedSubjectString(category)), {});
    }

    let [targetSubjects, ratio] = subjects.split(":");
    ratio = parseFloat(ratio);
    return targetSubjects.split(" ").reduce((obj, subject) => subject !== "" ? Object.assign(obj, {[subject]: ratio}) : obj, {});
}

export default calculate;
export { calculate, calculateScore, calculateChance, giveChance, parseWeightedSubjectString };