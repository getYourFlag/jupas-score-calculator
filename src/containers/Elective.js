import React from "react";

import "./Elective.css";
import "../components/InputField";
import subjects from "../data/subjects.json";

class Elective extends React.PureComponent {
    state = {
        value: "",
    }

    selectChangeHandler = (event) => {
        this.props.changeElective(this.state.value);
        this.setState({ value: event.target.value }, () => this.props.dropdown(this.state.value));
    }

    componentWillUnmount() {
        this.props.cleanup(this.state.value);
    }

    render() {
        let optionList = [];
        for (let subject in subjects) {
            let disabled = this.props.currentList.includes(subject);
            optionList.push(<option key={subject} value={subject} disabled={disabled}>{subjects[subject]}</option>);
        }

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