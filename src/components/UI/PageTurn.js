import React from "react";
import "./PageTurn.css";

const pageTurn = props => {
    let iconClassPrev = "material-icons";
    let iconClassNext = "material-icons";
    if (props.number === 1) iconClassPrev += " hidePageButton";
    if (props.number === props.maxNumber) iconClassNext += " hidePageButton";

    return (
        <div className="pageTurner">
            <i className={iconClassPrev} onClick={props.lastPage}>arrow_left</i>
            <p>第 {props.number} / {props.maxNumber} 頁</p>
            <i className={iconClassNext} onClick={props.nextPage}>arrow_right</i>
        </div>
    )
}

export default pageTurn;