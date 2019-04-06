import React from "react";
import "./Calculator.css";
import { Redirect } from "react-router-dom";

import parseResult from "../lib/parseResult";
import calculate from "../lib/mainCal";

import InputField from "../components/InputField";
import Elective from "./Elective";

class Calculator extends React.Component {
    state = {
        score: {
            elective: {}
        },
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
        console.log(`OldValue: ${oldValue}, newValue: ${newValue}`)
        const newList = [...this.state.electiveList];
        const newScore = JSON.parse(JSON.stringify(this.state.score));
        const orgGrade = newScore.elective[oldValue];
        let index = newList.indexOf(oldValue);
        index !== -1 ? newList[index] = newValue : newList.push(newValue);
        delete newScore.elective[oldValue];
        newScore.elective[newValue] = orgGrade;
        console.log(`newScore: ${newScore}, newList: ${newList}`);
        this.setState({ score: newScore , electiveList: newList });
    }

    aMathHandler = event => {
        this.setState({aMath: event.target.checked});
    }

    otherLangHandler = event => {
        this.setState({otherLang: event.target.checked});
    }

    otherLangChangeHandler = event => {
        let score = {...this.state.score};
        let character = event.target.value;
        if (!["A", "B", "C", "D", "E", "F"].includes(character.toUpperCase())) character = null;
        score.otherLang = character;
        this.setState({ score: score });
    }

    electiveScoreHandler = (name, event) => {
        let electiveScore = {...this.state.score};
        let newScore = parseResult(event.target.value);
        if (electiveScore.elective[name] && newScore <= electiveScore.elective[name]) return;
        electiveScore.elective[name] = newScore;
        this.setState({score: electiveScore});
    }

    electiveDeleteHandler = (name) => {
        let newList = [...this.state.electiveList];
        let newScore = {...this.state.score};
        let index = newList.indexOf(name);
        if (index !== -1) {
            newList.splice(index, 1);
            delete newScore.elective[name];
            this.setState({score: newScore, electiveList: newList});
        }
    }

    calculationHandler = () => {
        let score = {...this.state.score};
        let result = calculate(score);
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

        if (this.state.aMath) {
            aMathInput = <InputField id="aMath" changed={event => this.inputHandler("aMath", event)}>成績：</InputField>;
        }
        if (this.state.otherLang) {
            otherLangInput = <InputField id="otherLang" changed={this.otherLangChangeHandler}>成績：</InputField>;
        }

        for (let i = 0; i < this.state.electiveCount; i++) {
            electiveItems.push(
                <Elective 
                    key={`Elective${i}`}
                    keyId={`Elective${i}`}
                    dropdown={this.electiveAddHandler} 
                    scoreChange={this.electiveScoreHandler} 
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
                        <InputField id="chin" changed={event => this.inputHandler("chin", event)}>中文：</InputField>
                        <InputField id="eng" changed={event => this.inputHandler("eng", event)}>英文：</InputField>
                        <InputField id="math" changed={event => this.inputHandler("math", event)}>數學：</InputField>
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

                    <p><span>重讀生專用</span></p>
                    <div className="inputContainer" onChange={this.retakeHandler}>
                        <div>
                            <label>重讀生請勾選：</label><input type="checkbox" onClick={this.retakeHandler} />
                        </div>
                    </div>

                </form>
                <div className="submit">
                    <button onClick={this.calculationHandler}>計算</button>
                </div>
            </div>
        )
    }
}

export default Calculator;