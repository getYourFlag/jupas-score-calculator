import React from "react";
import "./InputField.css";

const InputField = props => {
    return (
        <div className="inputFields">
            <label>{props.children}</label>
            <input type="text" id={props.id} onChange={props.changed} />
        </div>
    )
}

export default InputField;