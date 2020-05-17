import React from "react";
import "./Navigation.css";
import { Link } from "react-router-dom";

import logo from "../assets/logo.png";

const NavBar = props => {
    return (
        <div className="NavBar">
            <img src={logo} alt="DSE Score Calculator" onClick={props.drawer}/>
            <h3>綜合升學計分器</h3>
            <ul>
                <li><Link to="/">主頁</Link></li>
                <li><Link to="/cal">輸入成績</Link></li>
                <li><Link to="/result">計算結果</Link></li>
                <li><a href="https://github.com/getYourFlag/dsecal" target="blank">演算法說明</a></li>
                <li><a href="https://github.com/getYourFlag/dsecal" target="blank">GitHub</a></li>
            </ul>
        </div>
    )
}

export default NavBar;