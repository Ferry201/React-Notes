import React , { useEffect , useState } from 'react';
import { Component } from 'react';
import { convertFromRaw } from 'draft-js';
import './note.css';
import Masonry from 'masonry-layout';
import dayjs from 'dayjs';


const RenderContent = ({
	changeNote ,
	deleteNote ,
	ShowMode ,
}) => {
	
	const storedContents = JSON.parse(localStorage.getItem('note-info-array')) || [];
	let timeStampArray = storedContents.map(item => item.saveTime);
	const [contents , setContents] = useState([]);
	useEffect(() => {
		const fetchContents = () => {
			const allNoteContents = storedContents.map(item => item.noteContent);
			setContents(allNoteContents); // Ensure the order is reversed as needed
		};
		fetchContents();
	} , []);
	
	const onDeleteNote = (index) => {
		deleteNote(index);
		setContents((prevContents) => prevContents.filter((_ , i) => i !== index)); // Update local state after deletion
	};
	
	
	class UlMode extends Component {
		render () {
			return <div className = "note-ul-mode">
				{ contents.map((content , index) => (
					<div
						key = { index }
						className = "note-ul-mode-item"
						onClick = { () => changeNote(content , index) }
					>
						<span className = "note-ul-mode-title">{ convertFromRaw(content).getPlainText() }</span>
						<div className = "note-details">
							<FormRelativeTimeComponent
								timeStamps = { timeStampArray }
								index = { index }
							/>
							<div
								className = "note-operation-buttons"
								onClick = { (e) => {
									e.stopPropagation();
									
								} }
							>
								<TopUpIcon />
								<UnselectedFavoriteIcon />
								<div
									onClick = { () => {
										onDeleteNote(index);
									} }
								>
									<DeleteIcon />
								</div>
							
							</div>
						</div>
					</div>
				)) }
			</div>;
		}
	}
	
	class GridMode extends Component {
		constructor (props) {
			super(props);
			this.gridRef = React.createRef(); // 使用 ref 引用 DOM 元素
		}
		
		componentDidMount () {
			// 确保在组件挂载后初始化 Masonry 砖石/瀑布流布局
			if ( this.gridRef.current ) {//确保在访问 this.gridRef.current 之前，current 属性已经指向了一个有效的 DOM 元素。
				//初始时ref的 current 属性是 null。只有在组件挂载后，current 才会指向实际的 DOM 元素
				this.masonry = new Masonry(this.gridRef.current , {
					itemSelector : '.note-grid-mode-item' , // grid-item 选择器
					columnWidth : '.note-grid-mode-item' ,  // 每个 item 的宽度
					percentPosition : true ,      // 设置百分比定位
					gutter : 10 ,                  // 设置间距（可选）
				});
			}
		}
		
		componentWillUnmount () {
			// 在组件卸载时销毁 Masonry 实例
			if ( this.masonry ) {
				this.masonry.destroy();
			}
		}
		
		render () {
			return (
				<div
					className = "note-grid-mode"
					ref = { this.gridRef }
				>
					{ contents.map((content , index) => (
						<div
							key = { index }
							className = "note-grid-mode-item"
							onClick = { () => changeNote(content , index) }
						>
							<span className = "note-grid-mode-title">{ convertFromRaw(content).getPlainText() }</span>
							
							<div className = "note-details">
								<FormRelativeTimeComponent
									timeStamps = { timeStampArray }
									index = { index }
								/>
								<div
									className = "note-operation-buttons"
									onClick = { (e) => {
										e.stopPropagation();
									} }
								>
									<TopUpIcon />
									<UnselectedFavoriteIcon />
									<div
										onClick = { () => {
											onDeleteNote(index);
										} }
									>
										<DeleteIcon />
									</div>
								
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
			relativeTimes : convertTimestampsToRelativeTimes(this.props.timeStamps) ,
		};
	}
	
	componentDidMount () {
		this.timer = setInterval(this._updateTimes , 3000);
	}
	
	componentWillUnmount () {
		clearInterval(this.timer);
	}
	
	_updateTimes = () => {
		const updateTimes = convertTimestampsToRelativeTimes(this.props.timeStamps);
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
				width : '18px' ,
				height : '18px' ,
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

class UnselectedFavoriteIcon extends Component {
	state = {
		isFavorite : false ,
	};
	handleFavorite = () => {
		this.setState({ isFavorite : !this.state.isFavorite } , () => {
			console.log(this.state.isFavorite);
		});
	};
	
	render () {
		return <svg
			onClick = { this.handleFavorite }
			className = { this.state.isFavorite ? 'star-active' : 'star' }
			style = { {
				width : '24px' ,
				height : '24px' ,
				verticalAlign : 'middle' ,
				overflow : 'hidden' ,
			} }
			t = "1732367885599"
			viewBox = "0 0 1024 1024"
			version = "1.1"
			xmlns = "http://www.w3.org/2000/svg"
			p-id = "103841"
			width = "24"
			height = "24"
			data-immersive-translate-walked = "9cfe9fc8-a3e8-4c35-aeea-d58e109df866"
		>
			<path
				d = "M877.278357 375.394762l-219.339544-31.618115-98.800213-199.579501c-5.929036-11.857049-19.761066-19.760043-33.593096-19.760043s-25.689079 7.902994-33.593096 21.735024l-94.850252 201.558575-219.339544 31.614022c-13.83203 1.974981-25.689079 11.857049-29.640064 25.689079-3.953032 13.83203 0 27.66406 9.878998 37.544081L318.061986 598.685291 288.419875 819.999816c-1.974981 13.831007 3.953032 27.66406 13.831007 35.571147 5.929036 3.948939 13.83203 7.902994 21.736047 7.902994 5.928013 0 11.857049-1.979074 17.785062-3.954055L529.494443 754.790652l185.747471 102.755292c5.928013 1.973958 11.857049 3.948939 17.785062 3.948939 19.761066 0 35.5691-15.805988 35.5691-37.543058l0-7.902994-29.639041-219.339544 158.082388-158.082388c9.877975-9.882068 13.83203-23.714098 9.877975-37.546128C900.992455 387.247718 891.110387 377.369743 877.278357 375.394762L877.278357 375.394762zM367.462093 594.734306c1.974981-11.857049-1.978051-25.689079-11.857049-33.593096L203.450668 422.815795l213.411531-29.640064c11.857049-1.974981 23.710005-9.877975 29.639041-21.735024l79.043241-183.77249 86.944188 179.818435c5.928013 11.857049 15.810081 19.761066 29.642111 21.74014l207.482495 33.589003L701.409884 565.091172c-9.877975 7.904017-13.83203 21.735024-9.877975 33.593096l23.710005 205.507514-167.961386-98.801237c-9.878998-5.928013-23.711028-3.953032-35.5691 1.974981l-171.914418 94.850252L367.462093 594.734306 367.462093 594.734306z"
				fill = "#dbdbdb"
				p-id = "103842"
				data-immersive-translate-walked = "9cfe9fc8-a3e8-4c35-aeea-d58e109df866"
			></path>
			<path
				d = "M527.520485 160.494321 422.460708 363.108948 178.913832 412.227646 353.216647 588.236312 318.083475 827.689962 537.071002 725.359342 729.452567 817.4569 706.939831 594.376149 866.575598 424.50732 637.355009 383.575072Z"
				fill = "#dbdbdb"
				p-id = "103843"
				data-immersive-translate-walked = "9cfe9fc8-a3e8-4c35-aeea-d58e109df866"
			></path>
		</svg>;
	}
}

const TopUpIcon = () => {
	return <svg
		t = "1732603952055"
		className = "icon"
		viewBox = "0 0 1024 1024"
		version = "1.1"
		xmlns = "http://www.w3.org/2000/svg"
		p-id = "2318"
		width = "24"
		height = "24"
	>
		<path
			d = "M128 128l768 0 0 89.6-768 0 0-89.6ZM732.288 496 555.7888 309.8624c-10.9504-11.2064-26.4128-18.4896-43.7888-18.4896s-32.832 7.2832-43.6032 18.6048L291.5264 495.8656c-9.2288 10.0224-15.1104 22.9696-15.1104 37.3248 0 30.816 26.3808 55.8016 58.8992 55.8016 0.4544 0 0.896-0.0576 1.344-0.0704l0 0.352L416 589.2736 416 896l192 0L608 589.2736l77.1904 0 0-0.448c1.1648 0.064 2.3104 0.1792 3.5008 0.1792 32.5248 0 58.8992-24.992 58.8992-55.8144C747.5904 518.8352 741.7024 505.8944 732.288 496z"
			fill = "#dbdbdb"
			p-id = "2319"
		></path>
	</svg>;
};
export default RenderContent;
