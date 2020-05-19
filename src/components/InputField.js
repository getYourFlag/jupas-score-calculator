import React from "react";
import "./InputField.css";

import GradeSelector from './UI/GradeSelector';

const InputField = props => {
    return (
        <div className="inputFields">
            <span>{props.children}</span>
            <GradeSelector
                {...props}
            />
        </div>
    )
}

export default InputField;