import React from "react";
import "./Results.css";
import { Redirect } from "react-router-dom";

import courseList from "../data/courseData.json";
import { uniNames } from "../data/university.json";
import admissionStyles from "../data/admissionStyles.json";
import Backdrop from "../components/UI/Backdrop";
import PageTurn from "../components/UI/PageTurn";
import CourseNote from "../components/UI/courseNote";

import cityULogo from "../assets/CityU_logo.svg";
import USTLogo from "../assets/UST.svg";
import BULogo from "../assets/BU_logo.png";
import LULogo from "../assets/LU_logo.svg";
import CULogo from "../assets/CUHK_logo.png";

class Results extends React.Component {
    state = {
        currentUni: null,
        showModal: false,
        modalContent: null,
        pageNum: 1
    }

    changeUniHandler = event => {
        event.preventDefault();
        this.setState({currentUni: event.currentTarget.value, pageNum: 1});
    }

    openModalToggler = content => {
        this.setState({showModal: true, modalContent: content})
    }

    closeModalToggler = () => {
        this.setState({showModal: false, modalContent: null});
    }

    lastPageHandler = () => {
        this.setState({pageNum: this.state.pageNum - 1});
        document.getElementById("tableTop").scrollIntoView();
    }

    nextPageHandler = () => {
        this.setState({pageNum: this.state.pageNum + 1});
        document.getElementById("tableTop").scrollIntoView();
    }

    render() {
        if (!this.props.result) return <Redirect to="/cal" />

        let resultKeys = []; let calResultsArr = [];
        if (this.props.result && this.state.currentUni) {
            resultKeys = Object.keys(this.props.result).filter(key => courseList[key].school === this.state.currentUni);
        }
        let resultKeysTotalLength = resultKeys.length;
        let startIndex = (this.state.pageNum - 1) * 15;
        resultKeys = resultKeys.slice(startIndex, startIndex + 15);

        for (let course of resultKeys) {
            let [admissionChance, admissionStyle] = admissionStyles[this.props.result[course].chance];
            let row = (
                <tbody key={courseList[course].code}>
                    <tr>
                        <td className="subjectCode">{courseList[course].code}</td>
                        <td 
                            className={courseList[course].note ? "additionalInfo" : ""}
                            onClick={() => courseList[course].note ? this.openModalToggler(courseList[course].note): null}
                            >{courseList[course].name}</td>
                        <td className="calMethod">{courseList[course].showMethod}</td>
                        <td>{courseList[course].median}</td>
                        <td>{this.props.result[course].score}</td>
                        <td className={admissionStyle}>{admissionChance}</td>
                    </tr>
                </tbody>
            );
            calResultsArr.push(row);
        }

        let resultTable = this.state.currentUni ? (
            <div id="tableTop">
               <h3>{uniNames[this.state.currentUni]} 課程入學機率</h3>
                <table className="resultTable">
                    <tbody>
                        <tr>
                            <th>編號</th>
                            <th className="subjectName">科目</th>
                            <th className="calMethod">計分方法</th>
                            <th>中位數</th>
                            <th>你的分數</th>
                            <th className="entryChance">入讀機率</th>
                        </tr>
                    </tbody>
                    {calResultsArr}
                </table>
            </div>
        ) : <h3>請點選院校以查看該院校課程的入學機率</h3>;

        return (
            <div className="resultPage">
                <Backdrop show={this.state.showModal} close={this.closeModalToggler}>
                    <CourseNote content={this.state.modalContent} close={this.closeModalToggler} />
                </Backdrop>
                <h3>計算結果</h3>
                <div className="uniSelect" id="uniSelect">
                    <button value="CityU" onClick={this.changeUniHandler}>
                        <h3>香港城市大學</h3>
                        <img src={cityULogo} alt="城市大學"></img>
                    </button>
                    <button value="BU" onClick={this.changeUniHandler}>
                        <h3>香港浸會大學</h3>
                        <img src={BULogo} alt="浸會大學"></img>
                    </button>
                    <button value="LU" onClick={this.changeUniHandler}>
                        <h3>嶺南大學</h3>
                        <img src={LULogo} alt="嶺南大學"></img>
                    </button>
                    <button value="CU" onClick={this.changeUniHandler}>
                        <h3>香港中文大學</h3>
                        <img src={CULogo} alt="中文大學"></img>
                    </button>
                    <button value="UST" onClick={this.changeUniHandler}>
                        <h3>香港科技大學</h3>
                        <img src={USTLogo} alt="科技大學"></img>
                    </button>
                </div>
                {resultTable}
                {this.state.currentUni ? <PageTurn
                    number={this.state.pageNum} 
                    maxNumber={Math.ceil(resultKeysTotalLength / 15)} 
                    lastPage={this.lastPageHandler}
                    nextPage={this.nextPageHandler} /> : null}
            </div>
        )
    }
}

export default Results;