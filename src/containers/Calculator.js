import React from "react";
import "./Calculator.css";
import { Redirect } from "react-router-dom";

import calculate from "../lib/mainCal";
import InputField from "../components/InputField";
import Elective from "./Elective";

function parseResult(input) {
    if (!input.match(/^[0-7]{1}\*{0,2}$/)) return null;
    if (input.length === 1) return +input; // Return the number;
    let firstNum = Number(input.substring(0, 1));
    if (firstNum !== 5) return null; // Does not allow * appearing in grades other than 5.
    return firstNum + input.length - 1;
}

class Calculator extends React.Component {
    state = {
        score: {},
        electiveCount: 1,
        electiveList: [],
        aMath: false,
        otherLang: false,
        error: false,
        calculated: false,
        retaker: false
    }

    inputHandler = (type, event) => {
        let score = {...this.state.score};
        score[type] = parseResult(event.target.value);
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

    aMathHandler = event => {
        const score = {...this.state.score};
        if (!event.target.checked && score.aMaths) {
            delete score.aMaths
        } 
        this.setState({score, aMath: event.target.checked});
    }

    otherLangHandler = event => {
        const score = {...this.state.score};
        if (!event.target.checked && score.otherLang) {
            delete score.otherLang
        } 
        this.setState({score, otherLang: event.target.checked});
    }

    otherLangChangeHandler = event => {
        let score = {...this.state.score};
        let character = event.target.value;
        if (!["A", "B", "C", "D", "E", "F"].includes(character.toUpperCase())) character = null;
        score.otherLang = character;
        this.setState({ score: score });
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
                    changeElective={this.electiveChangeHandler} />);
        }

        return (
            <div className="calculator">
                <h3>輸入成績</h3>
                <form>

                    <p><span>主修科目</span></p>
                    <div className="inputContainer">
                        <InputField id="chinese" changed={event => this.inputHandler("chinese", event)}>中文：</InputField>
                        <InputField id="english" changed={event => this.inputHandler("english", event)}>英文：</InputField>
                        <InputField id="maths" changed={event => this.inputHandler("maths", event)}>數學：</InputField>
                        <InputField id="ls" changed={event => this.inputHandler("ls", event)}>通識：</InputField>
                    </div>

                    <p><span>數學延伸部分（ M1/M2 ）</span></p>
                    <div className="inputContainer">
                        <div>
                            <label>有否修讀：</label><input type="checkbox" onChange={this.aMathHandler}/>
                        </div>
                        {this.state.aMath ? (
                            <InputField 
                                id="aMaths" 
                                changed={event => this.inputHandler("aMaths", event)}
                            >成績：</InputField>
                        ): null}
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
                        <div>
                            <label>有否修讀：</label><input type="checkbox" onChange={this.otherLangHandler}/>
                        </div>
                        {this.state.otherLang ? (
                            <InputField 
                                id="otherLang" 
                                changed={this.otherLangChangeHandler}
                            >成績：</InputField>
                        ) : null}
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