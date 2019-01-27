import React from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logo.png";

import "./SideDrawer.css";

const sideDrawer = props => {
    let styleName = "sideDrawer closeDrawer";
    if (props.show) styleName = "sideDrawer openDrawer"

    return (
        <div className={styleName}>
            <button className="closeButton" onClick={props.drawer}>X</button>
            <img src={logo} alt="DSE Score Calculator" className="drawerlogo"/>
            <h3>綜合升學計分器</h3>
            <ul>
                <li><Link to="/" onClick={props.drawer}>主頁</Link></li>
                <li><Link to="/cal" onClick={props.drawer}>計算器</Link></li>
                <li><Link to="/" onClick={props.drawer}>演算法說明</Link></li>
                <li><a href="https://github.com/getYourFlag/dsecal" target="blank">GitHub</a></li>
            </ul>
        </div>
    );
}

export default sideDrawer;