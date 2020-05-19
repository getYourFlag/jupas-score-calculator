import React from "react";

import "./Elective.css";
import GradeSelector from "../components/UI/GradeSelector";
import { subjects, prohibitedCombinations } from "../data/subjects.json";

class Elective extends React.PureComponent {
    state = {
        subjectName: "",
        subjectGrade: 0
    }

    subjectChangeHandler = (event) => {
        this.props.subjectChange(this.state.subjectName, event.target.value);
        this.setState({ subjectName: event.target.value });
    }

    scoreChangeHandler = value => {
        this.props.scoreChange(this.state.subjectName, value);
        this.setState({ subjectGrade: value });
    }

    componentWillUnmount() {
        this.props.cleanup(this.state.subjectName);
    }

    render() {
        let disabledElectives = [...this.props.electiveList];
        for (let subjectCode of disabledElectives) {
            if (prohibitedCombinations[subjectCode] && this.state.subjectName !== subjectCode) {
                disabledElectives = disabledElectives.concat(prohibitedCombinations[subjectCode]);
                break;
            }
        }

        let optionList = Object.entries(subjects).map(([subjectCode, subjectName]) => {
            return (
                <option 
                    key={subjectCode} 
                    value={subjectCode} 
                    disabled={disabledElectives.includes(subjectCode)}>
                        {subjectName}
                </option>
            );
        });

        return (
        <div className="electiveInput">
            <select className="dropdown" id={this.props.keyId} value={this.state.subjectName} required onChange={this.subjectChangeHandler}>
                <option value="" disabled>請選擇科目</option>
                {optionList}
            </select>
            {this.state.subjectName ?
                <GradeSelector selected={this.state.subjectGrade} input={this.scoreChangeHandler}>
                    成績：
                </GradeSelector>
            : null}
        </div>
        );
    }
}

export default Elective;