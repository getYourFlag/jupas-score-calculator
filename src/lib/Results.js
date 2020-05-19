import { basicElectiveRequirements, otherLangRatio } from "../data/university.json"

const mainSubjects = ['chinese', 'english', 'maths', 'ls'];
const specialSubjects = ['aMaths', 'otherLang'];

class Result {
    constructor(score, weighting, specifications, school) {
        if (typeof score !== 'object' || score === null) {
            throw new TypeError("No score object is given!");
        }

        for (let subject of mainSubjects) {
            if (!score[subject]) throw new TypeError(`Core subject ${subject} is not found!`);
        }

        if (!specifications) specifications = Object.create(null);
        if (!weighting) weighting = Object.create(null);
        score = Object.assign({}, score);

        this.school = school;
        this.score = {};
        this.rawScore = {};
        this.calculatedSubjects = [];
        this.courseLevel = specifications.highDiploma ? 'subDegree' : 'degree';

        for (let subject in score) {
            if (specialSubjects.indexOf(subject) !== -1) continue;
            this.rawScore[subject] = score[subject];
            let weightedScore = score[subject];

            // Calculates bonus points for grade 5 or above (applicable for HKU)
            if (specifications.bonusFor5) {
                weightedScore += (weightedScore - 4) * 0.5;
            }

            // Calculate weighting;
            weightedScore *= (weighting[subject] || 1);
            this.score[subject] = weightedScore;
        }

        if (score.aMaths) {
            let aMathsScore = score.aMaths;
            if (specifications.bonusFor5 && aMathsScore >= 5) aMathsScore += (aMathsScore -4) * 0.5;

            switch (specifications.aMaths) {
                case 'half-maths':
                    // Calculate maths score by 1/2 compulsory maths and 1/2 M1/M2 score.
                    this.score.maths = score.maths * 0.5 + aMathsScore * 0.5;
                    break;
                case 'discard':
                    // Not including M1/M2 results.
                    break;
                case 'selective': 
                    // Treat M1/M2 as elective, but cannot be used in calculating entry requirements.
                    this.score.aMaths = aMathsScore * (weighting.aMaths || 1);
                    break;
                default: 
                    // Treat M1/M2 as elective.
                    this.rawScore.aMaths = score.aMaths;
                    this.score.aMaths = aMathsScore * (weighting.aMaths || 1);
            }
        }

        if (score.otherLang && specifications.discardOtherLang !== true && otherLangRatio[this.school]) {
            this.rawScore.otherLang = otherLangRatio[this.school][score.otherLang];
            this.score.otherLang = this.rawScore.otherLang;
        }

        if (specifications.weightingLimit) {
            let subjectWithWeighting = [];
            for (let subject in this.score) {

                if (!weighting[subject]) continue;
                if (subjectWithWeighting.length < specifications.weightingLimit) {
                    subjectWithWeighting.push(subject);
                    continue;
                }

                // Get the lowest weighted score in this.score by Array.reduce
                let lowestSubject = subjectWithWeighting.reduce((value, currentSubject) => {
                    if (value === '' || this.score[currentSubject] < this.score[value]) return currentSubject;
                    return value;
                });

                if (this.score[subject] > this.score[lowestSubject]) {
                    subjectWithWeighting[subjectWithWeighting.indexOf(lowestSubject)] = subject;
                    this.score[lowestSubject] = this.score[lowestSubject] / weighting[lowestSubject];
                } else {
                    this.score[subject] = this.score[subject] / weighting[subject];
                }
            }
        }
    }

    checkUniversityRequirements() {
        if (this.rawScore.chinese < 3 || this.rawScore.english < 3 || this.rawScore.maths < 2 || this.rawScore.ls < 2) return false;

        const [electiveMinGrade, electiveMinCount] = basicElectiveRequirements[this.school] || [2, 1];
        const countedElectives = [];
        for (let i = 0; i < electiveMinCount; i++) {
            let [name, score] = this.getBestSubjectStateless(null, countedElectives.concat(mainSubjects), true, true);
            if (score < electiveMinGrade) return false;
            countedElectives.push(name);
        }
        return true;
    }

    checkHighDiplomaRequirements() {
        if (this.rawScore.chinese < 2 || this.rawScore.english < 2) return false;

        const countedSubjects = ["chinese", "english"];
        for (let i = 0; i < 3; i++) {
            let [name, score] = this.getBestSubjectStateless(null, countedSubjects, true, true);
            if (score < 2) return false;
            countedSubjects.push(name);
        }
        return true;
    }

    checkProgramRequirements(requirements) {
        requirements = Object.assign({}, requirements);

        let checkBasicRequirements = this.courseLevel === 'subDegree' ? this.checkHighDiplomaRequirements : this.checkUniversityRequirements;
        if (!checkBasicRequirements.call(this)) return false;

        if (requirements.minimumScore) {
            let totalScore = this.getBestSubjects(7, null, null, true, false);
            if (totalScore < requirements.minimumScore) return false;
            delete requirements.minimumScore;
        }

        let testedSubjects = [];
        for (let [subjects, grade] of Object.entries(requirements)) {
            subjects = subjects.split(" "); // Deal with get-one-then-satisfy subject requirements.

            let [subjectName, score] = this.getBestSubjectStateless(subjects, testedSubjects, true, true);
            if (subjectName === "" || score < grade) return false;
            testedSubjects.push(subjectName);
        }
        return true;
    }

    getBestSubject(include = null, exclude = null, rawScore = false, getSubjectName = false, useState = true) {
        const scores = rawScore ? this.rawScore : this.score;
        let bestSubjectName = "";
        let bestSubjectScore = 0;

        if (!Array.isArray(exclude)) exclude = [];
        if (useState) exclude = exclude.concat(this.calculatedSubjects);

        for (let subject in scores) {
            if (include && include.indexOf(subject) === -1) continue;
            if (exclude && exclude.indexOf(subject) !== -1) continue;
            if (bestSubjectScore === 0 || scores[subject] > bestSubjectScore) {
                bestSubjectName = subject;
                bestSubjectScore = scores[subject];
            }
        }

        if (useState && bestSubjectName) this.calculatedSubjects.push(bestSubjectName);
        if (getSubjectName) return [bestSubjectName, bestSubjectScore];
        return bestSubjectScore;
    }

    getBestSubjectWithCustomWeighting(weighting, getSubjectName = false, useState = true) {
        const scores = Object.assign({}, this.rawScore);
        let bestSubjectName = "";
        let bestSubjectScore = 0;
        let excludes = useState ? this.calculatedSubjects : [];

        for (let subject in scores) {

            let subjScore = scores[subject];
            if (excludes.indexOf(subject) !== -1) continue;
            subjScore *= (weighting[subject] || 1);
            if (subjScore > bestSubjectScore || (weighting[subject] && !weighting[bestSubjectName])) {
                bestSubjectScore = subjScore;
                bestSubjectName = subject;
            }
        }

        if (useState && bestSubjectName !== "") this.calculatedSubjects.push(bestSubjectName);
        if (getSubjectName) return [bestSubjectName, bestSubjectScore];
        return bestSubjectScore;
    }

    getBestSubjectStateless(include = null, exclude = null, rawScore = false, getSubjectName = false) {
        return this.getBestSubject(include, exclude, rawScore, getSubjectName, false);
    }

    getBestSubjects(count = 1, include = null, exclude = null, rawScore = false, useState = true) {
        let totalScore = 0;
        exclude = Array.isArray(exclude) ? exclude : [];
        for (let i = 0; i < count; i++) {
            let [subjectName, subjectScore] = this.getBestSubject(include, exclude, rawScore, true, useState);
            totalScore += subjectScore;
            if (!useState) exclude.push(subjectName);
        }
        return totalScore;
    }

    getMain() {
        this.calculatedSubjects = this.calculatedSubjects.concat(mainSubjects);
        return this.score.chinese + this.score.english + this.score.maths + this.score.ls;
    }
}

export default Result;