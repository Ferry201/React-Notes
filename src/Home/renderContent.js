import React , { useEffect , useState } from 'react';
import { Component } from 'react';
import { convertFromRaw } from 'draft-js';
import './note.css';
import Masonry from 'masonry-layout';
import dayjs from 'dayjs';

//todo 可切换的排序方式，让用户根据自己的需要选择排序方式。比如，给用户提供一个排序按钮，
// 可以选择“按更新时间排序”或“按创建时间排序”，每个note拥有两个key,分别是创建时间和最新修改时间
//目前想法是一个时间戳数组来存放这个对象,数组保存在localstorage里
const RenderContent = ({
	changeNote ,
	deleteNote ,
	ShowMode ,
	updateTime ,
}) => {
	const [contents , setContents] = useState([]);
	useEffect(() => {
		const fetchContents = () => {
			const storedContents = JSON.parse(localStorage.getItem('editorContents')) || [];
			setContents(storedContents.reverse()); // Ensure the order is reversed as needed
		};
		// localStorage.clear()
		fetchContents();
	} , []);
	const onDeleteNote = (index) => {
		deleteNote(index);
		setContents((prevContents) => prevContents.filter((_ , i) => i !== index)); // Update local state after deletion
	};
	
	// console.log(updateTime);
	
	class UlMode extends Component {
		render () {
			return <div className = "note-ul-mode">
				{ contents.map((content , index) => (
					<div
						key = { index }
						className = "note-ul-mode-item"
						onClick = { () => changeNote(content , index) }
					>
						<div style = { { width : '98%' } }>
							<span className = "note-ul-mode-title">{ convertFromRaw(content).getPlainText() }</span>
							<FormRelativeTimeComponent
								timeStamps = { updateTime }
								index = { index }
							/>
						</div>
						<div
							className = "ulMode-delete-note-btn"
							onClick = { (e) => {
								e.stopPropagation(); // Avoid triggering the parent element's event handler
								onDeleteNote(index);
							} }
						>
							<DeleteIcon />
						</div>
					</div>
				)) }
			</div>;
		}
	}
	
	class GridMode extends Component {
		constructor(props) {
			super(props);
			this.gridRef = React.createRef(); // 使用 ref 引用 DOM 元素
		}
		
		componentDidMount() {
			// 确保在组件挂载后初始化 Masonry 砖石/瀑布流布局
			if (this.gridRef.current) {//确保在访问 this.gridRef.current 之前，current 属性已经指向了一个有效的 DOM 元素。
				//初始时ref的 current 属性是 null。只有在组件挂载后，current 才会指向实际的 DOM 元素
				this.masonry = new Masonry(this.gridRef.current, {
					itemSelector: '.note-grid-mode-item', // grid-item 选择器
					columnWidth: '.note-grid-mode-item',  // 每个 item 的宽度
					percentPosition: true,      // 设置百分比定位
					gutter: 10                  // 设置间距（可选）
				});
			}
		}
		
		componentWillUnmount() {
			// 在组件卸载时销毁 Masonry 实例
			if (this.masonry) {
				this.masonry.destroy();
			}
		}
		render () {
			return (
				<div className = "note-grid-mode" ref={this.gridRef}>
					{ contents.map((content , index) => (
						<div
							key = { index }
							className = "note-grid-mode-item"
							onClick = { () => changeNote(content , index) }
						>
							<span className = "note-grid-mode-title">{ convertFromRaw(content).getPlainText() }</span>
							
							<div className = "gridMode-time-delete">
								<FormRelativeTimeComponent
									timeStamps = { updateTime }
									index = { index }
								/>
								<div
									className = "gridMode-delete-node-btn"
									onClick = { (e) => {
										e.stopPropagation(); // 防止触发父元素的事件处理程序
										onDeleteNote(index);
									} }
								>
									<DeleteIcon />
								</div>
							</div>
						</div>
					)) }
				</div>
			);
		}
	}
	
	
	return (
		ShowMode ? <UlMode /> : <GridMode />
	);
};

class FormRelativeTimeComponent extends Component {
	constructor (props) {
		super(props);
		this.state = {
			relativeTimes : convertTimestampsToRelativeTimes(this.props.timeStamps).reverse() ,
		};
	}
	
	componentDidMount () {
		this.timer = setInterval(this._updateTimes , 3000);
	}
	
	componentWillUnmount () {
		clearInterval(this.timer);
	}
	
	_updateTimes = () => {
		const updateTimes = convertTimestampsToRelativeTimes(this.props.timeStamps).reverse();
		this.setState({
			relativeTimes : updateTimes ,
		});
	};
	
	render () {
		return <div className = "note-time">{ this.state.relativeTimes[this.props.index] }</div>;
		
	}
}

const convertTimestampsToRelativeTimes = (timeStampsArray) => {
	const newRelativeTimes = timeStampsArray.map((timeStamps) => {
		// const durationSeconds = (+ Date.now() - timeStamps) / 1000;
		const durationSeconds = (dayjs().valueOf() - timeStamps) / 1000;
		const durationMinutes = durationSeconds / 60;
		const durationHours = durationMinutes / 60;
		if ( dayjs().date() - dayjs(timeStamps).date() === 1 ) {
			return '昨天' + dayjs(timeStamps).format('HH:mm:ss');
		}
		if ( dayjs().date() - dayjs(timeStamps).date() > 1 ) {
			return dayjs(timeStamps).format('YYYY/MM/DD HH:mm');
		}
		if ( durationMinutes > 60 ) {
			return Math.round(durationHours) + '小时前';
		}
		if ( durationSeconds > 60 ) {
			return Math.round(durationMinutes) + '分钟前';
		}
		if ( durationSeconds < 60 ) {
			return Math.round(Math.max(durationSeconds , 1)) + '秒前';
		}
	});
	return newRelativeTimes;
};

class DeleteIcon extends Component {
	render () {
		return <svg
			className = "icon"
			style = { {
				width : '1em' ,
				height : '1em' ,
				verticalAlign : 'middle' ,
				fill : 'currentColor' ,
				overflow : 'hidden' ,
			} }
			viewBox = "0 0 1024 1024"
			version = "1.1"
			xmlns = "http://www.w3.org/2000/svg"
			p-id = "3990"
		>
			<path
				d = "M781.28 851.36a58.56 58.56 0 0 1-58.56 58.56H301.28a58.72 58.72 0 0 1-58.56-58.56V230.4h538.56z m-421.6-725.92a11.84 11.84 0 0 1 12-12h281.28a11.84 11.84 0 0 1 12 12V160H359.68zM956.8 160H734.72v-34.56a81.76 81.76 0 0 0-81.76-81.76H371.68a82.08 82.08 0 0 0-81.76 81.76V160H67.2a35.36 35.36 0 0 0 0 70.56h105.12v620.8a128.96 128.96 0 0 0 128.96 128.96h421.44a128.96 128.96 0 0 0 128.96-128.96V230.4H956.8a35.2 35.2 0 0 0 35.2-35.2 34.56 34.56 0 0 0-35.2-35.2zM512 804.16a35.2 35.2 0 0 0 35.2-35.36V393.92a35.2 35.2 0 1 0-70.4 0V768.8a35.2 35.2 0 0 0 35.2 35.36m-164.32 0a35.36 35.36 0 0 0 35.36-35.36V393.92a35.36 35.36 0 1 0-70.56 0V768.8a36.32 36.32 0 0 0 35.2 35.36m328.64 0a35.36 35.36 0 0 0 35.2-35.36V393.92a35.36 35.36 0 1 0-70.56 0V768.8a35.36 35.36 0 0 0 35.36 35.36"
				fill = "#D81E06"
				p-id = "3991"
			></path>
		</svg>;
	}
}

export default RenderContent;
