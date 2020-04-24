import React, { Fragment } from 'react';
import PageTurn from './UI/PageTurn';
import "./ResultTable.css";

import courseList from "../data/courseData.json";
import { admissionStyles } from "../data/admissions.json";

const getMethod = methods => {
    let subjectCount = 0;
    let coreCounted = false;

    for (let method of methods) {
        if (method === "main") {
            coreCounted = true;
        } else if (typeof method === 'number') {
            subjectCount += method;
        } else {
            subjectCount += 1;
        }
    }

    if (coreCounted) return `4C+${subjectCount}X`;
    return `Best ${subjectCount}`;
}

const ResultTable = props => {
    let rows = Object.keys(props.results).slice(props.index, props.index + 15).map(code => {
        let [admissionChance, admissionStyle] = admissionStyles[props.results[code].chance];
        let course = courseList[code];

        return (
            <tr key={course.code}>
                <td className="subjectCode">{course.code}</td>
                <td 
                    className={course.notice ? "additionalInfo" : ""}
                    onClick={() => course.notice ? props.openModal(course.notice): null}
                    >{course.name}</td>
                <td className="calMethod">{getMethod(course.countedSubjects)}</td>
                <td>{course.scores.median}</td>
                <td>{props.results[code].score}</td>
                <td className={admissionStyle}>{admissionChance}</td>
            </tr>
        );
    });

    return (
        <Fragment>
            <div id="tableTop">
                <h3>{props.uniName} 課程入學機率</h3>
                <table className="resultTable">
                    <thead>
                        <tr>
                            <th>編號</th>
                            <th className="subjectName">科目</th>
                            <th className="calMethod">計分方法</th>
                            <th>中位數</th>
                            <th>你的分數</th>
                            <th className="entryChance">入讀機率</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows}
                    </tbody>
                </table>
            </div>
            <PageTurn
                number={props.pageNum} 
                maxNumber={Math.ceil(Object.keys(props.results).length / 15)} 
                lastPage={props.lastPageHandler}
                nextPage={props.nextPageHandler} /> 
        </Fragment>
    );
}

export default ResultTable;