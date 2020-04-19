const mainSubjects = ['chinese', 'english', 'maths', 'ls'];
const specialSubjects = ['aMaths', 'otherLang'];

class Result {
    constructor(score, weighting, specifications) {
        if (typeof score !== 'object' || score === null) {
            throw new TypeError("No score object is given!");
        }

        for (let subject of mainSubjects) {
            if (!score[subject]) throw new TypeError(`Subject ${subject} is not found!`);
        }
        this.electives = [];
        this.score = {};
        this.rawScore = {};
        this.calculatedSubjects = [];

        for (let subject in score) {
            if (specialSubjects.indexOf(subject) !== -1) continue;
            this.rawScore[subject] = score[subject];
            weighting = weighting[subject] || 1;
            this.score[subject] = score[subject] * weighting;
        }

        if (score.aMaths) {
            switch (specifications.aMaths) {
                case 'half-maths':
                    // Calculate maths score by 1/2 compulsory maths and 1/2 M1/M2 score.
                    this.score.maths = score.maths * 0.5 + score.aMaths * 0.5;
                    break;
                case 'discard':
                    // Disregard M1/M2 results.
                    break;
                case 'selective': 
                    // Treat M1/M2 as elective, but cannot be used in calculating entry requirements.
                    this.score.aMaths = score.aMaths * (weighting.aMaths || 1);
                    break;
                default: 
                    // Treat M1/M2 as elective.
                    this.rawScore.aMaths = score.aMaths;
                    this.score.aMaths = score.aMaths * (weighting.aMaths || 1);
            }
        }

        if (score.otherLang && specifications.discardOtherLang !== true) {
            this.score.otherLang = specifications.otherLangRatio[score.otherLang];
            this.rawScore.otherLang = this.score.otherLang;
        }
    }

    checkUniversityRequirements(electiveMinGrade = 2, electiveMinCount = 1) {
        if (this.rawScore.chinese < 3 || this.rawScore.english < 3 || this.rawScore.maths < 2 || this.rawScore.ls < 2) return false;
        let countedElectives = [];
        for (let i = 0; i < electiveMinCount; i++) {
            let [name, score] = this.getBestElective(null, countedElectives, true, false);
            if (score < electiveMinGrade) return false;
            countedElectives.push(name); 
        }
        return true;
    }

    checkHighDiplomaRequirements() {
        if (this.rawScore.chinese < 2 || this.rawScore.english < 2) return false;
        return this.getBestSubjects(3, null, ['chinese', 'english'], true, false) >= 6;
    }

    checkProgramRequirements(requirements, electiveMinGrade, electiveMinCount) {
        requirements = requirements || {};
        let checkBasicRequirements = requirements.highDiploma ? this.checkHighDiplomaRequirements : this.checkUniversityRequirements;
        if (!checkBasicRequirements.bind(this, electiveMinGrade, electiveMinCount)) return false;

        let testedSubjects = [];
        for (let req in requirements) {
            let testSubjects = req.split(" ");
            let testPassed = false;
            let requiredGrade = requirements[req];

            for (let subject in testSubjects) {
                if (testedSubjects.indexOf(subject) !== -1) continue;
                if (this.rawScore[subject] && this.rawScore[subject] >= requiredGrade) {
                    // Found a subject in the list that has the required grade.
                    testPassed = true;
                    testedSubjects.push(subject); // Exclude this subject from further testing.
                    break;
                }
            }
            if (!testPassed) return false;
        }
        return true;
    }

    getBestSubject(include = null, exclude = null, rawScore = false, storeSubject = true, getSubjectName = false) {
        const scores = rawScore ? this.rawScore : this.score;
        let bestSubjectName = "";
        let bestSubjectScore = 0;

        if (!Array.isArray(exclude)) exclude = [];
        exclude.concat(this.calculatedSubjects);
        for (let subject in scores) {
            if (include && include.indexOf(subject) === -1) continue;
            if (exclude && exclude.indexOf(subject) !== -1) continue;
            if (bestSubjectScore === 0 || scores[subject] > bestSubjectScore) {
                bestSubjectName = subject;
                bestSubjectScore = scores[subject];
            }
        }

        if (storeSubject) this.calculatedSubjects.push(bestSubjectName);
        if (getSubjectName) return [bestSubjectName, bestSubjectScore];
        return bestSubjectScore;
    }

    getBestSubjects(count = 1, include = null, exclude = null, rawScore = false, storeSubject = true) {
        let totalScore = 0;
        for (let i = 0; i < count; i++) {
            totalScore += this.getBestSubject(include, exclude, rawScore, storeSubject);
        }
        return totalScore;
    }

    getBestElective(include = null, exclude = null, rawScore = false, storeSubject = true) {
        if (!Array.isArray(exclude)) exclude = [];
        return this.getBestSubject(include, exclude.concat(mainSubjects), rawScore, storeSubject);
    }

    getBestElectives(count = 1, include = null, exclude = null, rawScore = false, storeSubject = true) {
        if (!Array.isArray(exclude)) exclude = [];
        return this.getBestSubjects(count, include, exclude.concat(mainSubjects), rawScore, storeSubject);
    }

    getMain() {
        this.calculatedSubjects.concat(mainSubjects);
        return this.score.chinese + this.score.english + this.score.maths + this.score.ls;
    }
}

export default Result;