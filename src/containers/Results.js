import React from "react";
import "./Results.css";
import { Redirect } from "react-router-dom";

import Backdrop from "../components/UI/Backdrop";
import CourseNote from "../components/UI/courseNote";
import ResultTable from "../components/ResultTable";

import calculate from "../lib/mainCal";
import courseList from "../data/courseData.json";
import { uniNames, uniCategory } from "../data/university.json";
import logos from "../lib/logo";

class Results extends React.Component {
    state = {
        currentUni: null,
        showModal: false,
        modalContent: null,
        pageNum: 1,
        category: 'UGC'
    }

    changeUniHandler = event => {
        event.preventDefault();
        this.setState({currentUni: event.currentTarget.value, pageNum: 1});
    }

    changeCategoryHandler = event => {
        event.preventDefault();
        this.setState({category: event.currentTarget.value, currentUni: null})
    }

    openModalToggler = content => {
        this.setState({showModal: true, modalContent: content})
    }

    closeModalToggler = () => {
        this.setState({showModal: false, modalContent: null});
    }

    lastPageHandler = () => {
        this.setState({pageNum: this.state.pageNum - 1});
    }

    nextPageHandler = () => {
        this.setState({pageNum: this.state.pageNum + 1});
    }

    render() {
        let calculatedResult = this.props.result;
        if (!calculatedResult) {
            const scores = JSON.parse(localStorage.getItem('score'));
            const isRetaker = localStorage.getItem('isRetaker');
            if (!(scores && isRetaker)) {
                return <Redirect to="/cal" />
            }
            calculatedResult = calculate(scores, isRetaker);
        }
        
        let currentUniResults = null;
        if (this.state.currentUni) {
            currentUniResults = Object.keys(calculatedResult).filter(key => {
                return courseList[key].school === this.state.currentUni
            }).reduce((obj, key) => {
                return { 
                    ...obj, 
                    [key]: calculatedResult[key]
                }
            }, {});
        }

        let startIndex = (this.state.pageNum - 1) * 15;
        let uniButtons = Object.keys(uniNames)
            .filter(uni => uniCategory[this.state.category].indexOf(uni) !== -1)
            .map(uni => (
                <button value={uni} onClick={this.changeUniHandler} key={uni}
                    className={this.state.currentUni === uni ? 'selected' : ''}>
                    <h3>{uniNames[uni]}</h3>
                    <img src={logos[uni]} alt={uniNames[uni]}/>
                </button>
            )
        );

        return (
            <div className="resultPage">
                <Backdrop show={this.state.showModal} close={this.closeModalToggler}>
                    <CourseNote content={this.state.modalContent} close={this.closeModalToggler} />
                </Backdrop>
                <h3>計算結果</h3>
                <div className="categorySelect" id="categorySelect">
                    <button value="UGC"
                        onClick={this.changeCategoryHandler}
                        className={this.state.category === "UGC" ? 'selected' : ''}>
                            UGC資助學位
                    </button>
                    <button value="SF" 
                        onClick={this.changeCategoryHandler}
                        className={this.state.category === "SF" ? 'selected' : ''}>
                            自資學位
                    </button>
                    <button value="SSSDP"
                        onClick={this.changeCategoryHandler}
                        className={this.state.category === "SSSDP" ? 'selected' : ''}>
                            SSSDP學位
                    </button>
                </div>
                <div className="uniSelect" id="uniSelect">
                    {uniButtons}
                </div>
                <div id="tableTop"></div>
                {this.state.currentUni ? 
                    <ResultTable 
                        results={currentUniResults}
                        index={startIndex}
                        pageNum={this.state.pageNum}
                        lastPageHandler={this.lastPageHandler}
                        nextPageHandler={this.nextPageHandler}
                        openModal={this.openModalToggler}
                        uniName={uniNames[this.state.currentUni]}
                    /> : (<h3>請點選院校以查看該院校課程的入學機率</h3>) }
            </div>
        )
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.state.currentUni !== prevState.currentUni) {
            document.querySelector(".resultPage").scrollIntoView();
        } else if (this.state.category !== prevState.category) {
            document.querySelector(".resultPage").scrollIntoView();
        }
    }
}

export default Results;