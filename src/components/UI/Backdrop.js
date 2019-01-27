import React from "react";
import "./Backdrop.css";

const backdrop = props => {
    const className = props.show ? "modal openModal" : "modal closeModal";

    return (
        <div className={className} onClick={props.close}>
            {props.children}
        </div>
    )
}

export default backdrop;