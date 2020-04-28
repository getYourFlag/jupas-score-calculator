import React from "react";

import "./Elective.css";
import "../components/InputField";
import { subjects, prohibitedCombinations } from "../data/subjects.json";

class Elective extends React.PureComponent {
    state = {
        value: "",
    }

    selectChangeHandler = (event) => {
        this.props.changeElective(this.state.value, event.target.value);
        this.setState({ value: event.target.value });
    }

    componentWillUnmount() {
        this.props.cleanup(this.state.value);
    }

    render() {
        let disabledElectives = [...this.props.electiveList];
        for (let subjectCode of disabledElectives) {
            if (prohibitedCombinations[subjectCode] && this.state.value !== subjectCode) {
                disabledElectives = disabledElectives.concat(prohibitedCombinations[subjectCode]);
                break;
            }
        }
        console.log(disabledElectives);

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
            <select className="dropdown" id={this.props.keyId} value={this.state.value} required onChange={this.selectChangeHandler}>
                <option value="" disabled>請選擇科目</option>
                {optionList}
            </select>
            {this.state.value ? 
                <div className="electiveFields">
                    <label>成績：</label>
                    <input type="text" onChange={event => this.props.scoreChange(this.state.value, event)} />
                </div>: null}
        </div>
        );
    }
}

export default Elective;