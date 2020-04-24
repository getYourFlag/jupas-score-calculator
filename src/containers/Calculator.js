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

    electiveChangeHandler = (oldValue, newValue) => {
        const newList = [...this.state.electiveList];
        const newScore = {...this.state.score};
        const orgGrade = newScore[oldValue];
        let index = newList.indexOf(oldValue);
        index !== -1 ? newList[index] = newValue : newList.push(newValue);
        delete newScore[oldValue];
        newScore[newValue] = orgGrade;
        this.setState({ score: newScore , electiveList: newList });
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
        let newList = [...this.state.electiveList];
        let newScore = {...this.state.score};
        let index = newList.indexOf(name);
        if (index !== -1) {
            newList.splice(index, 1);
            delete newScore[name];
            this.setState({score: newScore, electiveList: newList});
        }
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

        let increElective = this.state.electiveCount >= 4;
        let decreElective = this.state.electiveCount <= 1;
        let aMathInput = null; let otherLangInput = null; let electiveItems = [];
        let errorMessage = null;

        if (this.state.aMath) {
            aMathInput = <InputField 
                id="aMaths" 
                changed={event => this.inputHandler("aMaths", event)}
            >成績：</InputField>;
        }
        if (this.state.otherLang) {
            otherLangInput = <InputField 
                id="otherLang" 
                changed={this.otherLangChangeHandler}
            >成績：</InputField>;
        }
        if (this.state.error) {
            errorMessage = (<div className="alert">
                <p>{this.state.error}</p>
            </div>);
        }

        for (let i = 0; i < this.state.electiveCount; i++) {
            electiveItems.push(
                <Elective 
                    key={`Elective${i}`}
                    keyId={`Elective${i}`}
                    dropdown={this.electiveAddHandler} 
                    scoreChange={this.inputHandler} 
                    currentList={this.state.electiveList} 
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
                        {aMathInput}
                    </div>

                    <p><span>甲類選修科目</span></p>
                    <div className="inputRow">
                        <label>科目數量：</label>
                        <button onClick={this.electiveIncreaseHandler} disabled={increElective}>+</button>
                        {this.state.electiveCount}
                        <button onClick={this.electiveDecreaseHandler} disabled={decreElective}>-</button>
                    </div>
                    <div className="inputContainer">
                        {electiveItems}
                    </div>

                    <p><span>其他語言科目</span></p>
                    <div className="inputContainer">
                        <div>
                            <label>有否修讀：</label><input type="checkbox" onChange={this.otherLangHandler}/>
                        </div>
                        {otherLangInput}
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

                {errorMessage}
            </div>
        )
    }
}

export default Calculator;