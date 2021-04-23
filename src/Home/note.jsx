import './note.css';
import React , { Component } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router , Route , Routes , Link } from 'react-router-dom';
import Tabs from 'rc-tabs';
import 'rc-tabs/assets/index.css';
import { useRef , useState } from 'react';
import { DownOutlined } from '@ant-design/icons';
import { Checkbox , Dropdown , Space } from 'antd';
import RichTextEditor from '../RichTextEditor/RichTextEditor';
import GetContentButton from './GetContentButton';
import RenderContent from './renderContent';
import AddNoteBookModal from './addNoteBook_Model';
import isEqual from 'lodash/isEqual';
import { NoteSidebar }  from './sidebar';
import { Empty } from 'antd';

import dayjs from 'dayjs';

/**
 * todo:宫格/列表模式也要localstorage!
 * todo 富文本按钮样式修改
 * todo 保存/取消按钮放大并优化样式与富文本区域区分开 , 排版位置固定 , 取消按钮的文本改为"取消并不保存修改"
 * todo 编辑界面左上角加一个回退按钮 , 类似于浏览器的回退, 点击效果是自动保存所有修改并返回上级
 */

// const noteCatalog = [
// 	{
// 		label : <div style = { { fontWeight : 'bold' } }>
// 			<AddNoteBookModal /></div> ,
// 		key : '0' ,
// 	} ,
// 	{
// 		label : <div>全部笔记&gt;</div> ,
// 		key : '1' ,
// 	} ,
// 	{
// 		label : <div>未分类&gt;</div> ,
// 		key : '4' ,
// 	} ,
// 	{
// 		label : <div></div> ,
// 		type : 'divider' ,
// 	} ,
// 	{
// 		label : <div>最近删除&gt;</div> ,
// 		key : '3' ,
// 	} ,
// ];

@reaxper
class NoteManagePanel extends Reaxlass {
	constructor (props) {
		super(props);
		this.inputRef = React.createRef();
	}
	
	state = {
		isSearch : false ,
		isHover : false ,//DefaultExpandIcon hover时改变显示的svg
		isModalVisible : false,
		noteCatalog: [
			{
				label: <div style={{ fontWeight: 'bold' }}><AddNoteBookModal openModal={this.showModal} /></div>,
				key: '0',
			},
			{
				label: <div>全部笔记&gt;</div>,
				key: '1',
			},
			{
				label: <div>未分类&gt;</div>,
				key: '4',
			},
			{
				label: <div></div>,
				type: 'divider',
			},
			{
				label: <div>最近删除&gt;</div>,
				key: '3',
			},
		],
	};
	
	componentDidMount () {
		this.inputRef.current?.focus();
	}
	
	handleSearchNote = () => {
	};
	
	handleMouseEnter = () => {
		this.setState({ isHover : true });
	};
	handleMouseLeave = () => {
		this.setState({ isHover : false });
	};
	
	//如果在 setState 中提供了回调函数，回调会在状态更新完成并且 DOM 已经渲染之后执行,确保能获取到最新state
	
	
	render () {
		const {
			onChangeNote ,
			onDeleteNote ,
			noteAmount ,
			OnSwitchMode ,
			showMode ,
			createdNoteTime ,//保存的时间戳数组
			onToggleSidebar ,
			sidebarIsVisible ,
		} = this.props;
		const { isHover } = this.state;
		const {
			toggleSiderCollapse ,
			siderCollapsed ,
			resizing ,
		} = reaxel_sider();
		return <div className = { `note-container${ resizing ? ' resizing' : '' }` }>
			{/*右上角工具栏*/ }
			<div className = "top-tools">
				<div className = "search-box">
					<input
						ref = { this.inputRef }
						type = "text"
						className = "search-input"
						placeholder = "输入关键词..."
					/>
					<button className = "search-btn">
						<SearchNotes onSearch = { this.handleSearchNote } />
					</button>
				</div>
				<MoreNoteOptions
					onSwitchNoteMode = { OnSwitchMode }
					showMode = { showMode }
				/>
			</div>
			{/*下拉框( 新建笔记本 )和显示 sidebar 的按钮*/ }
			<div className = "dropdown-menu">
				<div className = "expandButton-title">
					<div
						onMouseEnter = { () => this.handleMouseEnter() }
						onMouseLeave = { () => this.handleMouseLeave() }
					>
						{/*{ sidebarIsVisible ? (<LeftExpandIcon*/ }
						{ !siderCollapsed ? (<LeftExpandIcon
							onclick = { () => {
								toggleSiderCollapse();
								onToggleSidebar();
								this.handleMouseLeave();
							} }
						/>) : (isHover ? (<RightExpandIcon
							onclick = { () => {
								toggleSiderCollapse();
								onToggleSidebar();
							} }
						/>) : (<DefaultExpandIcon />)) }
					</div>
					
					
					<h2>全部笔记</h2>
				</div>
				<Dropdown
					placement = "bottom"
					menu = { { items : this.state.noteCatalog } }
					trigger = { ['click' , 'hover'] }
				>
					<a onClick = { (e) => e.preventDefault() }>
						<DownOutLinedIcon />
					</a>
				</Dropdown>
			</div>
			<div className = "note-amount">{ noteAmount }篇笔记</div>
			{/*Note List*/ }
			<div
				style = { {
					height : '86%' ,
				} }
			>
				{ noteAmount === 0 ? (<div className = "empty-container">
					<Empty
						image = { Empty.PRESENTED_IMAGE_SIMPLE }
						description = "还没有笔记 , 点击右下角按钮创建吧!"
					/></div>) : <RenderContent
					  changeNote = { onChangeNote }
					  deleteNote = { onDeleteNote }
					  ShowMode = { showMode }
					  updateTime = { createdNoteTime }
				  /> }
			
			</div>
		
		</div>;
	}
};


class NotesApp extends Component {
	constructor (props) {
		super(props);
	}
	
	state = {
		currentContent : '' ,
		currentIndex : null ,
		isAddNote : false ,
		noteListData : [] ,
		saveNoteTime : [] ,
		noteAmount : JSON.parse(localStorage.getItem('editorContents')) === null ? 0 : (JSON.parse(localStorage.getItem('editorContents'))).length ,
		noteDisplayMode : true ,//默认列表布局
		isSidebarVisible : false ,
	};
	
	componentDidMount () {
		const storedNoteData = JSON.parse(localStorage.getItem('editorContents')) || [];
		this.setState({ noteListData : storedNoteData });
		const storedNoteTime = JSON.parse(localStorage.getItem('saveNotesTime')) || [];
		this.setState({ saveNoteTime : storedNoteTime });
	}
	
	
	handleSwitchMode = () => {
		this.setState(prevState => ({ noteDisplayMode : !prevState.noteDisplayMode }));
		
	};
	handleAddNote = () => {
		this.setState({//passing a function to setState instead of an object.
			isAddNote : !this.state.isAddNote ,// This function receives the previous state (prevState) as an argument,
			currentContent : '' ,
			currentIndex : null ,
		});// ensuring we work with the latest state,用回调函数也可以让state立即更新.
	};
	
	handleSaveNote = (rawContentState , saveTime) => {
		const {
			currentIndex ,
			noteListData ,
			saveNoteTime ,
		} = this.state;
		let updatedList = [...noteListData];
		let updateTime = [...saveNoteTime];
		//添加新note
		if ( currentIndex === null ) {
			updatedList.push(rawContentState);
			updateTime.push(saveTime);
			
			localStorage.setItem('editorContents' , JSON.stringify(updatedList));
			localStorage.setItem('saveNotesTime' , JSON.stringify(updateTime));
			//更新状态
			this.setState({
				isAddNote : false ,
				noteListData : updatedList ,
				currentIndex : null ,
				noteAmount : JSON.parse(localStorage.getItem('editorContents')).length ,
				saveNoteTime : updateTime ,
			});
		}
		//修改已存在的note,分两种情况:1,修改原内容; 2,未修改
		if ( currentIndex !== null ) {
			//rawContentState.blocks 中每个 block 代表的是编辑器中一个段落，而不是一个完整的文档.
			// 所以当调用 rawContentState.blocks[0].text 时，只会取到第一块的文本内容。
			// 如果有多行文本，通常会有多个 block，每个 block 里可能只有一行文本。
			let oldNoteContent = updatedList[updatedList.length - 1 - currentIndex].blocks;
			let newNoteContent = rawContentState.blocks;
			// console.log(oldNoteContent);
			// console.log(newNoteContent);
			if ( isEqual(oldNoteContent , newNoteContent) ) {
				console.log('没有变化');
				this.setState({ isAddNote : false });
				return;
			}
			
			// updateTime.splice(0,1)
			console.log(updateTime);
			// console.log(currentIndex);
			updateTime = updateTime.filter((_ , i) => updateTime.length - 1 - i !== currentIndex);
			updatedList = updatedList.filter((_ , index) => updatedList.length - 1 - index !== currentIndex);
			
			updateTime.push(saveTime);
			updatedList.push(rawContentState);
			localStorage.setItem('editorContents' , JSON.stringify(updatedList));
			localStorage.setItem('saveNotesTime' , JSON.stringify(updateTime));
			console.log(updateTime);
			//更新状态
			this.setState({
				isAddNote : false ,
				noteListData : updatedList ,
				currentIndex : null ,
				noteAmount : JSON.parse(localStorage.getItem('editorContents')).length ,
				saveNoteTime : updateTime ,
			});
			//currentIndex和localstorage,也就是updatedList的下标是converse的
		}
		
	};
	
	
	handleDeleteNote = (index) => {
		const {
			noteListData ,
			saveNoteTime ,
		} = this.state;
		const updatedList = noteListData.filter((_ , i) => noteListData.length - 1 - i !== index);
		const updateTime = saveNoteTime.filter((_ , i) => saveNoteTime.length - 1 - i !== index);
		localStorage.setItem('editorContents' , JSON.stringify(updatedList));
		localStorage.setItem('saveNotesTime' , JSON.stringify(updateTime));
		this.setState({
			noteListData : updatedList ,
			saveNoteTime : updateTime ,
			currentIndex : null ,
			noteAmount : JSON.parse(localStorage.getItem('editorContents')).length ,
		});
	};
	
	
	handleChangeNote = (noteContent , index) => {
		this.setState({
			isAddNote : !this.state.isAddNote ,
			currentContent : noteContent ,
			currentIndex : index ,
		});
		// console.log(noteContent);
		// console.log(index);
	};
	//控制sidebar显示/隐藏
	toggleSidebar = () => {
		this.setState(prevState => ({ isSidebarVisible : !prevState.isSidebarVisible }) , () => {
			console.log(this.state.isSidebarVisible);
		});
	};
	
	render () {
		const addNoteBtnClass = this.state.isAddNote ? 'add-new-button-disappear' : 'add-new-button';
		
		return <div className = "container">
			
			<AddNewNotebtn
				onClick = { this.handleAddNote }
				className = { addNoteBtnClass }
			/>
			{ this.state.isAddNote === true ? (
				<>
					
					<RichTextEditor
						onCancel = { this.handleAddNote }
						onSave = { this.handleSaveNote }
						initialContent = { this.state.currentContent }
					/>
				</>) : (
				  <div
					  style = { {
						  display : 'flex' ,
						  width : '100%' ,
					  } }
				  >
					  <NoteSidebar />
					  <NoteManagePanel
						  onChangeNote = { this.handleChangeNote }
						  onDeleteNote = { this.handleDeleteNote }
						  noteAmount = { this.state.noteAmount }
						  showMode = { this.state.noteDisplayMode }
						  OnSwitchMode = { this.handleSwitchMode }
						  createdNoteTime = { this.state.saveNoteTime }
						  onToggleSidebar = { this.toggleSidebar }
						  sidebarIsVisible = { this.state.isSidebarVisible }
					  /></div>)
				
			}
		
		
		</div>;
	}
	
	
}

let valueLen = [];


class SearchNotes extends Component {
	
	render () {
		return <svg
			onClick = { () => {
				this.props.onSearch();
			} }
			className = "search-notes"
			style = { {
				width : ' 1em' ,
				height : '1em' ,
				verticalAlign : 'middle' ,
				fill : 'currentColor' ,
				overflow : 'hidden' ,
			} }
			viewBox = "0 0 1024 1024"
			version = "1.1"
			xmlns = "http://www.w3.org/2000/svg"
			p-id = "9664"
		>
			<path
				d = "M974.00547 967.39343L694.834457 643.915973c130.349584-141.025575 136.925532-361.142986 8.539348-509.913886A382.790921 382.790921 0 0 0 413.339123 1.270436a382.863104 382.863104 0 0 0-250.052051 93.044974C85.848245 161.143212 39.073114 254.130438 31.573213 356.140646s25.170506 200.844325 92.005527 278.268715a382.805357 382.805357 0 0 0 290.056337 132.753306 382.776484 382.776484 0 0 0 215.605921-66.676216l279.192669 323.499112 65.571803-56.592133zM189.150543 577.824447c-51.712505-59.919808-76.998506-136.391372-71.194925-215.331623s41.99656-150.885887 101.923587-202.605611a296.242493 296.242493 0 0 1 193.459918-72.003384 296.242493 296.242493 0 0 1 224.462879 102.710391c106.752686 123.708671 92.987227 311.198985-30.699789 417.944452a296.293021 296.293021 0 0 1-417.95167-30.714225z"
				fill = "#231815"
				p-id = "9665"
			></path>
		</svg>;
	}
}

const MoreNoteOptions = ({
	onSwitchNoteMode ,
	showMode ,
}) => {
	const moreNoteOptions = [
		{
			label : <div
				style = { {
					width : '100%' ,
					height : '100%' ,
				} }
				onClick = { () => {
					onSwitchNoteMode();
				} }
			>{ showMode ? '宫格模式' : '列表模式' }</div> ,
			key : '0' ,
		} ,
		{
			label : <div>设置&gt;</div> ,
			key : '1' ,
		} ,
		{
			label : <div>编辑&gt;</div> ,
			key : '2' ,
		} ,
	];
	return (
		<Dropdown
			// dropdownRender = { () => {
			// 	return <div
			// 		className='moreOptionContainer'
			// 	>
			// 		<div
			// 			className='option-item'
			// 			onClick = { () => {
			// 				onSwitchNoteMode();
			// 			} }
			// 		>{ showMode ? '宫格模式' : '列表模式' }</div>
			// 		<div className='option-item'>设置></div>
			// 		<div className='option-item'>编辑></div>
			// 	</div>;
			//	
			// } }
			placement = "bottomLeft"
			overlayStyle = { {} }
			menu = { { items : moreNoteOptions } }
			trigger = { ['click' , 'hover'] }
		>
			<a onClick = { (e) => e.preventDefault() }>
				<Space>
					<MoreOptionsIcon />
				</Space>
			</a>
		</Dropdown>
	);
};

class MoreOptionsIcon extends Component {
	render () {
		return <svg
			className = "icon"
			style = { {
				width : '20px' ,
				height : ' 20px' ,
				verticalAlign : 'middle' ,
				fill : 'currentColor' ,
				overflow : 'hidden' ,
			} }
			viewBox = "0 0 1024 1024"
			version = "1.1"
			xmlns = "http://www.w3.org/2000/svg"
			p-id = "11550"
		>
			<path
				d = "M512 256a85.333333 85.333333 0 1 1 0-170.666667 85.333333 85.333333 0 0 1 0 170.666667z m0 341.333333a85.333333 85.333333 0 1 1 0-170.666666 85.333333 85.333333 0 0 1 0 170.666666z m0 341.333334a85.333333 85.333333 0 1 1 0-170.666667 85.333333 85.333333 0 0 1 0 170.666667z"
				fill = "#2E2F30"
				p-id = "11551"
			></path>
		</svg>;
	}
}


class AddNewNotebtn extends Component {
	constructor () {
		super();
	}
	
	render () {
		const {
			onClick ,
			className ,
		} = this.props;
		return <div
			className = { className }
			onClick = { onClick }
		
		>
			<svg
				t = "1731896096497"
				className = "icon"
				viewBox = "0 0 1024 1024"
				version = "1.1"
				xmlns = "http://www.w3.org/2000/svg"
				p-id = "29491"
				width = "50"
				height = "50"
			>
				<path
					d = "M512 512m-512 0a512 512 0 1 0 1024 0 512 512 0 1 0-1024 0Z"
					fill = "black"
					p-id = "29492"
				></path>
				<path
					d = "M215.578947 485.052632m26.947369 0l538.947368 0q26.947368 0 26.947369 26.947368l0 0q0 26.947368-26.947369 26.947368l-538.947368 0q-26.947368 0-26.947369-26.947368l0 0q0-26.947368 26.947369-26.947368Z"
					fill = "#FFFFFF"
					p-id = "29493"
				></path>
				<path
					d = "M485.052632 808.421053m0-26.947369l0-538.947368q0-26.947368 26.947368-26.947369l0 0q26.947368 0 26.947368 26.947369l0 538.947368q0 26.947368-26.947368 26.947369l0 0q-26.947368 0-26.947368-26.947369Z"
					fill = "#FFFFFF"
					p-id = "29494"
				></path>
			</svg>
		</div>;
		
	}
}

class DownOutLinedIcon extends Component {
	render () {
		return <svg
			className = "icon"
			style = { {
				width : '20px' ,
				height : '20px' ,
				verticalAlign : 'middle' ,
				fill : 'black' ,
				overflow : 'hidden' ,
			} }
			viewBox = "0 0 1117 1024"
			version = "1.1"
			xmlns = "http://www.w3.org/2000/svg"
			p-id = "3808"
		>
			<path
				d = "M93.090909 345.460364L155.648 279.272727 558.545455 705.442909 961.442909 279.272727l62.557091 66.187637L558.545455 837.818182z"
				fill = "black"
				p-id = "3809"
			></path>
		</svg>;
	}
}

class DefaultExpandIcon extends Component {
	render () {
		return <svg
			className = "default-expand-icon"
			style = { {
				width : '24px' ,
				height : '24px' ,
				verticalAlign : 'middle' ,
				fill : ' #555' ,
				overflow : 'hidden' ,
			} }
			viewBox = "0 0 1024 1024"
			version = "1.1"
			xmlns = "http://www.w3.org/2000/svg"
			p-id = "5005"
		>
			<path
				d = "M896 768c25.6 0 42.666667 17.066667 42.666667 42.666667s-17.066667 42.666667-42.666667 42.666666H128c-25.6 0-42.666667-17.066667-42.666667-42.666666s17.066667-42.666667 42.666667-42.666667h768z m0-298.666667c25.6 0 42.666667 17.066667 42.666667 42.666667s-17.066667 42.666667-42.666667 42.666667H128c-25.6 0-42.666667-17.066667-42.666667-42.666667s17.066667-42.666667 42.666667-42.666667h768z m0-298.666666c25.6 0 42.666667 17.066667 42.666667 42.666666s-17.066667 42.666667-42.666667 42.666667H128c-25.6 0-42.666667-17.066667-42.666667-42.666667s17.066667-42.666667 42.666667-42.666666h768z"
				fill = "#555"
				p-id = "5006"
			></path>
		</svg>;
	}
}

class RightExpandIcon extends Component {
	
	render () {
		return <div
			className = "expand-icon"
			onClick = { () => {
				this.props.onclick();
			} }
		>
			<svg
				className = "right-expand-icon"
				style = { {
					width : '20px' ,
					height : '20px' ,
					verticalAlign : 'middle' ,
					fill : ' #555' ,
					overflow : 'hidden' ,
					cursor : 'pointer' ,
				} }
				viewBox = "0 0 1024 1024"
				version = "1.1"
				xmlns = "http://www.w3.org/2000/svg"
				p-id = "14276"
			>
				<path
					d = "M458.176 512l-384.704 384.64000001a48.704 48.704 0 0 0-1.024 68.8 48.704 48.704 0 0 0 68.8-0.96000001L558.656 547.264a49.92 49.92 0 0 0 11.136-17.408c0.896-2.112 0.89600001-4.48 1.472-6.71999999 0.768-3.648 1.984-7.296 1.98399999-11.13600001s-1.152-7.424-1.98399999-11.13600001c-0.576-2.176-0.576-4.608-1.472-6.71999999a49.28 49.28 0 0 0-11.136-17.408l-417.344-417.28a48.64 48.64 0 0 0-68.8-1.024 48.64 48.64 0 0 0 1.024 68.736L458.176 512zM850.24 512l-384.70400001 384.64a48.704 48.704 0 0 0-1.02399999 68.80000001 48.64 48.64 0 0 0 68.864-0.89600001l417.28-417.216a49.92 49.92 0 0 0 11.136-17.408c0.896-2.112 0.89600001-4.48 1.40800001-6.784 0.832-3.648 2.048-7.296 2.04799999-11.136s-1.216-7.424-2.048-11.072c-0.57600001-2.24-0.576-4.608-1.408-6.784a49.28 49.28 0 0 0-11.136-17.408l-417.28-417.21600001a48.64 48.64 0 0 0-68.864-1.08799998 48.704 48.704 0 0 0 0.96 68.79999999L850.24 512z"
					p-id = "14277"
				></path>
			</svg>
		</div>;
	}
}

class LeftExpandIcon extends Component {
	render () {
		return <div
			className = "expand-icon"
			onClick = { () => {
				this.props.onclick();
			} }
		>
			<svg
				className = "left-expand-icon"
				style = { {
					width : '20px' ,
					height : '20px' ,
					verticalAlign : 'middle' ,
					fill : ' #555' ,
					overflow : 'hidden' ,
				} }
				viewBox = "0 0 1024 1024"
				version = "1.1"
				xmlns = "http://www.w3.org/2000/svg"
				p-id = "48865"
			>
				<path
					d = "M565.824 512l384.704-384.64000001a48.704 48.704 0 0 0 1.024-68.8 48.704 48.704 0 0 0-68.8 0.96000001L465.344 476.736a49.92 49.92 0 0 0-11.136 17.408c-0.896 2.112-0.89600001 4.48-1.472 6.71999999-0.768 3.648-1.984 7.296-1.98399999 11.13600001s1.152 7.424 1.98399999 11.13600001c0.576 2.176 0.576 4.608 1.472 6.71999999a49.28 49.28 0 0 0 11.136 17.408l417.344 417.28a48.64 48.64 0 0 0 68.8 1.024 48.64 48.64 0 0 0-1.024-68.736L565.824 512z"
					fill = "#555"
					p-id = "48866"
				></path>
				<path
					d = "M173.76 512l384.70400001-384.64a48.704 48.704 0 0 0 1.02399999-68.80000001 48.64 48.64 0 0 0-68.864 0.89600001l-417.28 417.216a49.92 49.92 0 0 0-11.136 17.408c-0.896 2.112-0.89600001 4.48-1.40800001 6.784-0.832 3.648-2.048 7.296-2.04799999 11.136s1.216 7.424 2.048 11.072c0.57600001 2.24 0.576 4.608 1.408 6.784a49.28 49.28 0 0 0 11.136 17.408l417.28 417.21600001a48.64 48.64 0 0 0 68.864 1.08799998 48.704 48.704 0 0 0-0.96-68.79999999L173.76 512z"
					fill = "#555"
					p-id = "48867"
				></path>
			</svg>
		</div>;
	}
}

export default NotesApp;

import { reaxel_sider } from './sider.reaxel';
import { reaxper , Reaxlass } from 'reaxes-react';
