import React, { useState, useEffect } from 'react';
import './note.css'; // 可选：添加样式文件


function getCalendarData(year, month) {
	const firstDay = new Date(year, month, 1).getDay(); // 获取当前月第一天是星期几
	const daysInMonth = new Date(year, month + 1, 0).getDate(); // 获取当前月有多少天
	
	// 当前月日期
	const days = [];
	for (let i = 1; i <= daysInMonth; i++) {
		days.push(i);
	}
	
	// 上个月的尾部日期
	const prevMonthDays = new Date(year, month, 0).getDate(); // 上个月的最后一天
	const prevDays = Array.from({ length: firstDay }, (_, i) => prevMonthDays - firstDay + i + 1);
	
	// 下个月的开头日期
	const totalCells = 7 * 6; // 7 列 * 6 行
	const currentTotal = prevDays.length + days.length;
	const nextDays = Array.from({ length: totalCells - currentTotal }, (_, i) => i + 1);
	
	// 返回一个包含所有数据的对象
	return {
		allDays: [...prevDays, ...days, ...nextDays],
		prevDaysLength: prevDays.length,
		daysLength: days.length,
	};
}

const DeadlinePicker = ({
	getDeadline ,
	deadline,
	currentLanguage,
	deleteDeadline,
}) => {
	
	const todayDate = new Date().getDate();
	const todayOfMonth = new Date().getMonth();
	const todayOfYear = new Date().getFullYear();
	
	const [year , setYear] = useState(new Date().getFullYear());
	const [month , setMonth] = useState(new Date().getMonth());
	const [selectDate , setSelectDate] = useState(deadline);	
	
	
	// 获取日历数据
	const { allDays, prevDaysLength, daysLength } = getCalendarData(year, month);
	
	const handlePrevMonth = () => {
		if (month === 0) {
			setYear(year - 1);
			setMonth(11);
		} else {
			setMonth(month - 1);
		}
	};
	
	const handleNextMonth = () => {
		if (month === 11) {
			setYear(year + 1);
			setMonth(0);
		} else {
			setMonth(month + 1);
		}
	};
	const handlePrevYear = () => {
		setYear(year - 1);
	};
	const handleNextYear = () => {
		setYear(year + 1);
	};
	const setTodoDeadline=(date)=>{
		setSelectDate(date);
		getDeadline(date)
	}
	
	return (
		<div className='dead-line-calender'>
			<div className='calender-top-bar'>
				<span>
					<span onClick = { handlePrevYear } className='switch-calender'><DoubleLeftArrowIcon /></span>
					<span onClick = { handlePrevMonth } className='switch-calender'><LeftArrowIcon /></span>
				</span>
				<span className='current-year-month'>{ year }年 { month + 1 }月</span>
				<span>
					<span onClick = { handleNextMonth } className='switch-calender'><RightArrowIcon /></span>
					<span onClick = { handleNextYear } className='switch-calender'><DoubleRightArrowIcon /></span>
				</span>
			</div>
			<div className="divider"></div>
			<div className = "calender-grid">
				{ ["日" , "一" , "二", "三", "四", "五", "六"].map((d) => (
					<div key = { `calender-${ year }-${ month }-${ d }` }
						className = "day-box"
					>{ d }</div>)) }
				
				{ allDays.map((day , index) => {
					let currentDateObject = {
						year : year ,
						month : month ,
						date : day ,
					};
					return <div
						key = { `date-${ day }-${ index }` }
						className = { `date-box ${ index < prevDaysLength || index >= prevDaysLength + daysLength ? "other-date-box" : "current-date-box" } ${ JSON.stringify(selectDate) === JSON.stringify(currentDateObject) ? 'selected-date' : '' } ${ todayDate === day && todayOfMonth === month  && todayOfYear===year? "today-date" : '' }` }
						onClick = { () => {
							setTodoDeadline({
								year : year ,
								month : month,
								date : day ,
							})
						} }
					>
						{ day }
					</div>;
				}) }
			</div>
			{ selectDate&&<div className = "delete-deadline" onClick={deleteDeadline}>
				{ currentLanguage?.deleteDeadline }
			</div> }
		
		</div>
	);
};

const LeftArrowIcon=()=> {
	return <svg
		t = "1741669811752"
		className = "icon"
		viewBox = "0 0 1024 1024"
		version = "1.1"
		xmlns = "http://www.w3.org/2000/svg"
		p-id = "126348"
		width = "16"
		height = "16"
	>
		<path
			d = "M723.413333 895.701333c-9.6 0-19.328-3.2-27.434666-9.6l-423.765334-340.906666a43.733333 43.733333 0 0 1 0-68.096l421.973334-339.114667a43.690667 43.690667 0 0 1 54.698666 68.096L369.28 511.146667l381.525333 306.901333a43.690667 43.690667 0 0 1-27.392 77.696z"
			fill = "#2c2c2c"
			p-id = "126349"
		></path>
	</svg>
}
const RightArrowIcon = () => {
	return <svg
		t = "1741669728118"
		className = "icon"
		viewBox = "0 0 1024 1024"
		version = "1.1"
		xmlns = "http://www.w3.org/2000/svg"
		p-id = "125012"
		width = "16"
		height = "16"
	>
		<path
			d = "M300.586667 895.701333c9.6 0 19.328-3.2 27.392-9.6l423.808-340.906666a43.733333 43.733333 0 0 0 0-68.096L329.813333 137.984A43.690667 43.690667 0 0 0 275.114667 206.08l379.605333 305.109333-381.525333 306.773334a43.690667 43.690667 0 0 0 27.392 77.738666z"
			fill = "#2c2c2c"
			p-id = "125013"
		></path>
	</svg>
};
const DoubleLeftArrowIcon = () => {
	return <svg
		t = "1741668563137"
		className = "icon"
		viewBox = "0 0 1024 1024"
		version = "1.1"
		xmlns = "http://www.w3.org/2000/svg"
		p-id = "121606"
		width = "16"
		height = "16"
	>
		<path
			d = "M464.512 136.96l-4.010667 3.541333-341.333333 341.333334a42.666667 42.666667 0 0 0-3.562667 56.32l3.562667 4.010666 341.333333 341.333334a42.666667 42.666667 0 0 0 63.893334-56.32l-3.562667-4.010667L209.706667 512 520.832 200.832a42.666667 42.666667 0 0 0 3.562667-56.32l-3.562667-4.010667a42.666667 42.666667 0 0 0-56.32-3.562666z m384 0l-4.010667 3.541333-341.333333 341.333334a42.666667 42.666667 0 0 0-3.562667 56.32l3.562667 4.010666 341.333333 341.333334a42.666667 42.666667 0 0 0 63.893334-56.32l-3.562667-4.010667L593.706667 512 904.832 200.832a42.666667 42.666667 0 0 0 3.562667-56.32l-3.562667-4.010667a42.666667 42.666667 0 0 0-56.32-3.562666z"
			fill = "#2c2c2c"
			p-id = "121607"
		></path>
	</svg>
}
const DoubleRightArrowIcon = () => {
	return <svg
		t = "1741669356466"
		className = "icon"
		viewBox = "0 0 1024 1024"
		version = "1.1"
		xmlns = "http://www.w3.org/2000/svg"
		p-id = "123891"
		width = "16"
		height = "16"
	>
		<path
			d = "M559.488 136.96l4.010667 3.541333 341.333333 341.333334a42.666667 42.666667 0 0 1 3.562667 56.32l-3.562667 4.010666-341.333333 341.333334a42.666667 42.666667 0 0 1-63.893334-56.32l3.562667-4.010667L814.293333 512 503.168 200.832a42.666667 42.666667 0 0 1-3.562667-56.32l3.562667-4.010667a42.666667 42.666667 0 0 1 56.32-3.562666z m-384 0l4.010667 3.541333 341.333333 341.333334a42.666667 42.666667 0 0 1 3.562667 56.32l-3.562667 4.010666-341.333333 341.333334a42.666667 42.666667 0 0 1-63.893334-56.32l3.562667-4.010667L430.293333 512 119.168 200.832a42.666667 42.666667 0 0 1-3.562667-56.32l3.562667-4.010667a42.666667 42.666667 0 0 1 56.32-3.562666z"
			fill = "#2c2c2c"
			p-id = "123892"
		></path>
	</svg>
}

export { DeadlinePicker };
