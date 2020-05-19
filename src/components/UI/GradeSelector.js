import React from 'react';
import "./GradeSelector.css";

const defaultOptions = [2, 3, 4, 5, 6, 7];
const defaultDisplay = {
    2: '2',
    3: '3',
    4: '4',
    5: '5',
    6: '5*',
    7: '5**'
}

const GradeSelector = props => {
    const options = props.options || defaultOptions;
    const display = props.display || defaultDisplay;

    return (
        <div className="grade-selector-container">
            {props.children ? <span>{props.children}</span> : null}
            <div className="grade-selector">
                {props.nullable ? 
                    <div className={props.selected == null ? 'selected' : ''} onClick={_ => props.input(null)} >
                        <p>未修讀</p>
                    </div>
                : null}
                {options.map(value => (
                    <div key={value} className={value === props.selected ? 'selected' : ''} onClick={_ => props.input(value)} >
                        <p>{display[value]}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default GradeSelector;