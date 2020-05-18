const mainSubjects = ['chinese', 'english', 'maths', 'ls'];
const specialSubjects = ['aMaths', 'otherLang'];

class Result {
    constructor(score, weighting, specifications) {
        if (typeof score !== 'object' || score === null) {
            throw new TypeError("No score object is given!");
        }

        for (let subject of mainSubjects) {
            if (!score[subject]) throw new TypeError(`Core subject ${subject} is not found!`);
        }

        this.electives = [];
        this.score = {};
        this.rawScore = {};
        this.calculatedSubjects = [];

        for (let subject in score) {
            if (specialSubjects.indexOf(subject) !== -1) continue;
            this.rawScore[subject] = score[subject];
            let weightedScore = score[subject];

            // Calculates bonus points for grade 5 or above (applicable for HKU)
            if (specifications.bonusFor5) {
                weightedScore = (weightedScore - 4) * 0.5;
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

        if (score.otherLang && specifications.discardOtherLang !== true) {
            this.score.otherLang = specifications.otherLangRatio[score.otherLang];
            this.rawScore.otherLang = this.score.otherLang;
        }

        if (specifications.weightingLimit) {
            let limit = specifications.weightingLimit;
            let weightedSubjects = Object.keys(this.score).filter(key => weighting[key] !== undefined);

            if (weightedSubjects.length > limit) {
                let highestWeightedSubjects = [];
                weightedSubjects.forEach(subject => {
                    if (Object.keys(highestWeightedSubjects).length < limit) {
                        highestWeightedSubjects.push(subject);
                    } else {
                        for (let remainingSubject in highestWeightedSubjects) {
                            if (this.score[subject] > this.score[remainingSubject]) {
                                this.score[remainingSubject] = this.score[remainingSubject] / weighting[remainingSubject];
                                highestWeightedSubjects.push(subject);
                            }
                        }
                    }
                });
            }
        }
    }

    checkUniversityRequirements(electiveMinGrade = 2, electiveMinCount = 1) {
        if (this.rawScore.chinese < 3 || this.rawScore.english < 3 || this.rawScore.maths < 2 || this.rawScore.ls < 2) return false;
        let countedElectives = [];
        for (let i = 0; i < electiveMinCount; i++) {
            let [name, score] = this.getBestElectiveStateless(null, countedElectives, true, true);
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
        if (!checkBasicRequirements.call(this, electiveMinGrade, electiveMinCount)) return false;

        if (requirements.maxGradeSubjects) {
            let maxGradeSubjects = Object.values(this.rawScore).filter(v => v === 7);
            if (maxGradeSubjects.length < requirements.maxGradeSubjects) return false;
            delete requirements.maxGradeSubjects;
        }

        let testedSubjects = [];
        for (let req in requirements) {
            let requiredSubjects = req.split(" "); // Deal with get-one-then-satisfy subject requirements.
            let requiredGrade = requirements[req];

            let [subjectName, score] = this.getBestSubjectStateless(requiredSubjects, testedSubjects, true, true);
            if (subjectName === "" || score < requiredGrade) return false;
            testedSubjects.push(subjectName);
        }
        return true;
    }

    getBestSubject(include = null, exclude = null, rawScore = false, getSubjectName = false, useState = true) {
        const scores = rawScore ? this.rawScore : this.score;
        let bestSubjectName = "";
        let bestSubjectScore = 0;

        if (!Array.isArray(exclude)) exclude = [];
        if (useState) exclude.concat(this.calculatedSubjects);
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
        let weightedSubjects = Object.keys(weighting);

        for (let subject in scores) {
            let subjScore = scores[subject];
            if (excludes.indexOf(subject) !== -1) continue;
            if (weightedSubjects.indexOf(subject) !== -1) subjScore *= weighting[subject];
            if (subjScore > bestSubjectScore) {
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
        for (let i = 0; i < count; i++) {
            totalScore += this.getBestSubject(include, exclude, rawScore, false, useState);
        }
        return totalScore;
    }

    getBestElective(include = null, exclude = null, rawScore = false, getSubjectName = false, useState = true) {
        if (!Array.isArray(exclude)) exclude = [];
        return this.getBestSubject(include, exclude.concat(mainSubjects), rawScore, getSubjectName, useState);
    }

    getBestElectiveStateless(include = null, exclude = null, rawScore = false, getSubjectName = false) {
        return this.getBestElective(include, exclude, rawScore, getSubjectName, false);
    }

    getBestElectives(count = 1, include = null, exclude = null, rawScore = false, useState = true) {
        if (!Array.isArray(exclude)) exclude = [];
        return this.getBestSubjects(count, include, exclude.concat(mainSubjects), rawScore, useState);
    }

    getMain() {
        this.calculatedSubjects.concat(mainSubjects);
        return this.score.chinese + this.score.english + this.score.maths + this.score.ls;
    }
}

export default Result;