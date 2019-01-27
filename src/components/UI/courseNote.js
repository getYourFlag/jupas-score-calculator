import React from "react";
import "./courseNote.css";

const courseNote = props => {
    return (
        <div className="courseNote" onClick={null}>
            <p>{props.content}</p>
            <button onClick={props.close}>關閉</button>
        </div>
    )
}

export default courseNote;