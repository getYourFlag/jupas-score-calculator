import { courseData } from "../data/courseData.json";
import otherLangScore from "../data/otherLangScore.json";

function main(scoreFromCalculator) {
    let calculateResult = {};
    for (let course in courseData) {
        let score = JSON.parse(JSON.stringify(scoreFromCalculator));
        let chance = giveChance(score, courseData[course]);
        calculateResult[course] = chance;
    }
    return calculateResult;
}

function giveChance(score, course) {
    let eligibility = interpretEligibility(score, course); // Score object will be mutated.
    if (!eligibility) return {chance: -1, score: "--"};

    addWeighting(score, course); // Score object will be mutated.
    let admissionScore = calculateScore(score, course);

    return {chance: calculateChance(admissionScore, course), score: admissionScore};
}

function interpretEligibility(score, course) {
    let require1ElectiveOnly = ["BU", "LU", "EDU", "OU"];
    let electiveCount = course.electiveCount || (require1ElectiveOnly.includes(course.school) ? 1 : 2);
    let electiveLevel = course.electiveLevel || (require1ElectiveOnly.includes(course.school) ? 2 : 3);

    if (score.aMath) {
        switch (course.extras.aMath) {
            case undefined:
            case false:
                delete score.aMath;
                break;
            case "notForEntry":
            case "math":
                break;
            default:
                score.elective.aMath = score.aMath;
        }
    }
    if (score.otherLang && course.extras.otherLang !== false) {
        score.otherLang = score.otherLang.toUpperCase();
        score.elective.otherLang = otherLangScore[course.school][score.otherLang];
    } else { delete score.otherLang; }

    // Check mutual exclusions of score, indicated by "mutual" property in extra.
    // Delete subjects that are not the highest in mutual exclusion scenarios.
    if (course.extras.mutual) {
        let highest = "";
        let extras = Object.keys(course.extras).filter(v => v !== "mutual");
        for (let subject in extras) {
            if (score[subject] && (!score[highest] || score[subject] > score[highest])) highest = subject;
        }
        if (highest) {
            for (let subject in extras) {
                if (score[subject] && subject !== highest) delete score[subject];
            }
        }
    }

    if (score.chin < 3 || score.eng < 3 || score.math < 2 || score.ls < 2) return false; // Return false if score does not meet 3322.
    /** ElectiveCount is used as the score required by electives during comparison.
     *  Universities which require level 2 in electives require a minimum of 1 elective in intake.
     *  Universities which require level 3 in electives require a minimum of 2 electives in intake.
     * */ 
    let numOfPassedElective = Object.values(score.elective).filter(v => v >= electiveLevel);
    if (numOfPassedElective.length < electiveCount) return false;

    for (let subject in score.elective) {
        score[subject] = score.elective[subject];
    }
    delete score.elective;

    let matchedSubject = []; // This array is used to prevent recalculate each subject for multiple times.
    for (let subject in course.requirement) {
        let result = matchCourseRequirement(score, subject, course.requirement[subject], matchedSubject)
        if (!result) return false;
        matchedSubject.push(result); // Add the calculated subject to array.
    }

    return true;
}

function matchCourseRequirement(score, subject, target, matched) {
    if (subject.indexOf(" ") !== -1) {
        let newList = subject.split(" ");
        for (let subSubject of newList) {
            if (!score[subSubject] || matched.includes(subSubject)) continue;
            if (matchCourseRequirement(score, subSubject, target, matched)) return subSubject;
        }
        return false;
    }
    if (!score[subject] || score[subject] < target) return false; 
    return subject;
}

function addWeighting(score, course) {
    let weightingList = Object.keys(course.weighting);

    for (let item of weightingList) {
        let subjectList = item.split(" ");
        if (subjectList[0] === "highest") { // Check if the weighting applies to only the elective with highest score.
            let maxSubject = null;
            for (let subject in score) {
                if (subjectList.includes(subject) && (score[subject] > score[maxSubject] || !maxSubject)) {
                    maxSubject = subject;
                }
            }
            if (score[maxSubject]) score[maxSubject] *= course.weighting[item];
        } else {
            for (let subject in score) {
                if (subjectList.includes(subject)) score[subject] *= course.weighting[item];
            }
        }
    }

    if (typeof(course.extras.aMath) === "string" && course.extras.aMath.match(/math/)) {
        if (score.aMath > score.math) {
            score.math = score.aMath;
            delete score.aMath;
        }
        if (course.extras.aMath === "math") delete score.aMath;
    }
}

function calculateScore(score, course) {
    let subjectCount = course.subjectCount;
    let ownScore = 0;

    for (let item of course.mustInclude) {
        if (item === "MAIN") {
            ownScore += (score.chin + score.eng + score.math + score.ls);
            subjectCount -= 4;
            delete score.chin;
            delete score.eng;
            delete score.math;
            delete score.ls;
            continue;
        }

        let subjectList = item.split(" ");
        if (subjectList.length > 1) {
            let bestSubject = "";
            for (let subject of subjectList) {
                if (score[subject] && (bestSubject === "" || score[subject] > score[bestSubject])) bestSubject = subject;
            }
            subjectList[0] = bestSubject;
        }
        ownScore += score[subjectList[0]];
        subjectCount--;
        delete score[subjectList[0]];
    }

    let remainingScore = Object.values(score).sort((a, b) => b > a);
    for (let i = 0; i < subjectCount; i++) {
        ownScore += remainingScore[i];
    }

    return ownScore;
}

function calculateChance(admissionScore, course) {
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

export default main;