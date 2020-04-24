import React from "react";
import "./Results.css";
import { Redirect } from "react-router-dom";

import Backdrop from "../components/UI/Backdrop";
import CourseNote from "../components/UI/courseNote";
import ResultTable from "../components/ResultTable";

import courseList from "../data/courseData.json";
import { uniNames } from "../data/university.json";
import logos from "../lib/logo";

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
        
        let currentUniResults = null;
        if (this.props.result && this.state.currentUni) {
            currentUniResults = Object.keys(this.props.result).filter(key => {
                return courseList[key].school === this.state.currentUni
            }).reduce((obj, key) => {
                return { 
                    ...obj, 
                    [key]: this.props.result[key]
                }
            }, {});
        }

        let startIndex = (this.state.pageNum - 1) * 15;
        
        let uniButtons = Object.keys(uniNames).map(uni => {
            return (
                <button value={uni} onClick={this.changeUniHandler} key={uni}>
                    <h3>{uniNames[uni]}</h3>
                    <img src={logos[uni]} alt={uniNames[uni]}/>
                </button>
            )
        });

        return (
            <div className="resultPage">
                <Backdrop show={this.state.showModal} close={this.closeModalToggler}>
                    <CourseNote content={this.state.modalContent} close={this.closeModalToggler} />
                </Backdrop>
                <h3>計算結果</h3>
                <div className="uniSelect" id="uniSelect">
                    {uniButtons}
                </div>
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
}

export default Results;