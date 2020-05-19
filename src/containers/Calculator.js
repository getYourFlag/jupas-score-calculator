import React from "react";
import "./Calculator.css";
import { Redirect } from "react-router-dom";

import calculate from "../lib/mainCal";
import GradeSelector from "../components/UI/GradeSelector";
import Elective from "./Elective";

class Calculator extends React.Component {
    state = {
        score: {},
        electiveCount: 1,
        electiveList: [],
        error: false,
        calculated: false,
        retaker: false
    }

    inputHandler = (subject, value) => {
        let score = {...this.state.score};
        if (value === null || value === this.state.score[subject]) {
            delete score[subject];
        } else {
            score[subject] = value;
        }
        this.setState({score: score});
    }

    electiveIncreaseHandler = event => {
        event.preventDefault();
        if (this.state.electiveCount >= 4) return;
        this.setState({ electiveCount: this.state.electiveCount + 1});
    }

    electiveDecreaseHandler = event => {
        event.preventDefault();
        if (this.state.electiveCount <= 1) return;
        this.setState({ electiveCount: this.state.electiveCount - 1});
    }

    electiveChangeHandler = (oldSubject, newSubject) => {
        const electiveList = [...this.state.electiveList];
        const score = {...this.state.score};
        const grade = score[oldSubject];

        let eIndex = electiveList.indexOf(oldSubject);
        eIndex !== -1 ? electiveList[eIndex] = newSubject : electiveList.push(newSubject);

        delete score[oldSubject];
        score[newSubject] = grade;
        this.setState({ score, electiveList });
    }

    electiveDeleteHandler = (name) => {
        let electiveList = [...this.state.electiveList];
        let score = {...this.state.score};

        let eIndex = electiveList.indexOf(name);
        if (eIndex !== -1) {
            electiveList.splice(eIndex, 1);
            delete score[name];
        }
        this.setState({ score, electiveList });
    }

    calculationHandler = () => {
        let score = {...this.state.score};

        // Validation
        let electiveCount = 0;
        let mainSubjects = ["chinese", "english", "maths", "ls"];

        for (let subject in score) {
            let index = mainSubjects.indexOf(subject);
            if (index === -1 && score[subject]) {
                electiveCount += 1; 
            } else {
                mainSubjects.splice(index, 1);
            }
        }

        if (mainSubjects.length !== 0) {
            return this.setState({error: "你並未輸入全部主修科的成績！"});
        } else if (electiveCount === 0) {
            return this.setState({error: "你並未輸入任何選修科的資料！"});
        }
        // Store to local storage.
        localStorage.setItem('score', JSON.stringify(this.state.score));
        localStorage.setItem('isRetaker', this.state.retaker);

        // Calculate
        let result = calculate(score, this.state.retaker);
        this.props.redirect(result, () => {this.setState({calculated: true})});
    }

    retakeHandler = _ => {
        this.setState({retaker: !this.state.retaker});
    }

    render() {
        if (this.state.calculated) return <Redirect to="/result" />
        let electiveItems = [];

        for (let i = 0; i < this.state.electiveCount; i++) {
            electiveItems.push(
                <Elective 
                    key={`Elective${i}`}
                    keyId={`Elective${i}`}
                    scoreChange={this.inputHandler} 
                    electiveList={this.state.electiveList} 
                    cleanup={this.electiveDeleteHandler}
                    subjectChange={this.electiveChangeHandler} 
                />);
        }

        return (
            <div className="calculator">
                <h3>輸入成績</h3>
                {this.props.location ? this.props.location.state ? this.props.location.state.message ? 
                    <div className="alert">
                        {this.props.location.state.message}
                    </div>
                : null : null : null}

                <form>

                    <p><span>主修科目</span></p>
                    <div className="inputContainer">
                        <GradeSelector input={value => this.inputHandler("chinese", value)} selected={this.state.score.chinese}>中文：</GradeSelector>
                        <GradeSelector input={value => this.inputHandler("english", value)} selected={this.state.score.english}>英文：</GradeSelector>
                        <GradeSelector input={value => this.inputHandler("maths", value)} selected={this.state.score.maths}>數學：</GradeSelector>
                        <GradeSelector input={value => this.inputHandler("ls", value)} selected={this.state.score.ls}>通識：</GradeSelector>
                    </div>

                    <p><span>數學延伸部分（ M1/M2 ）</span></p>
                    <div className="inputContainer">
                        <GradeSelector 
                            nullable
                            input={value => this.inputHandler('aMaths', value)}
                            selected={this.state.score.aMaths ? this.state.score.aMaths : null}
                        >成績：</GradeSelector>
                    </div>

                    <p><span>甲類選修科目</span></p>
                    <div className="inputRow">
                        <label>科目數量：</label>
                        <button onClick={this.electiveIncreaseHandler} disabled={this.state.electiveCount >= 4}>+</button>
                        {this.state.electiveCount}
                        <button onClick={this.electiveDecreaseHandler} disabled={this.state.electiveCount <= 1}>-</button>
                    </div>

                    <div className="inputContainer">
                        {electiveItems}
                    </div>

                    <p><span>其他語言科目</span></p>
                    <div className="inputContainer">
                        <GradeSelector 
                            nullable
                            input={value => this.inputHandler('otherLang', value)}
                            selected={this.state.score.otherLang ? this.state.score.otherLang : null}
                            options={['A', 'B', 'C', 'D', 'E', 'F']}
                            display={['A', 'B', 'C', 'D', 'E', 'F'].reduce((obj, value) => ({...obj, [value]: value}), {})}
                        >
                            成績：
                        </GradeSelector>
                    </div>

                    <p><span>考生資料</span></p>
                    <div className="inputContainer" onChange={this.retakeHandler}>
                        <div>
                            <label>是否重讀生：</label><input type="checkbox" onClick={this.retakeHandler} />
                        </div>
                    </div>

                </form>

                <div className="submit">
                    <button onClick={this.calculationHandler}>計算</button>
                </div>

                {this.state.error ? (
                    <div className="alert">
                        <p>{this.state.error}</p>
                    </div>
                ) : null}
            </div>
        )
    }
}

export default Calculator;