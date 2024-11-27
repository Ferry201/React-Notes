import './note.css';
import React , { Component } from 'react';
import { useRef , useState } from 'react';
import { BrowserRouter as Router , Route , Routes , Link } from 'react-router-dom';
import 'rc-tabs/assets/index.css';
import { Checkbox , Dropdown , Space } from 'antd';
import RichTextEditor from '../RichTextEditor/RichTextEditor';
import isEqual from 'lodash/isEqual';
import { NoteSidebar } from './sidebar';
import { NoteManagePanel } from '@src/Home/note-manage-panel';
import { v4 as uuidv4 } from 'uuid';
import { current } from "@reduxjs/toolkit";

class NotesApp extends Component {
	constructor (props) {
		super(props);
	}
	
	state = {
		currentContent : '' ,
		currentID : null ,
		isAddNote : false ,
		noteListData : [] ,
		noteDisplayMode : true ,//默认列表布局
		isSidebarVisible : false ,
		currentNoteBook : '我的笔记本' ,
	};
	
	componentDidMount () {
		const storedNoteData = JSON.parse(localStorage.getItem('note-info-array')) || [];
		this.setState({ noteListData : storedNoteData });
	}
	
	
	handleSwitchMode = () => {
		this.setState(prevState => ({ noteDisplayMode : !prevState.noteDisplayMode }));
		
	};
	
	handleAddNote = () => {
		this.setState({
			isAddNote : !this.state.isAddNote ,
			currentContent : '' ,
			currentID : null ,
		});
	};
	
	//保存note
	handleSaveNote = (rawContentState , saveTime) => {
		const {
			currentID ,
			noteListData ,
			currentNoteBook ,
		} = this.state;
		let noteInfoArray = [...noteListData];
		//
		let newNoteInfo = {
			noteContent : rawContentState ,
			saveTime : saveTime ,
			notebook : currentNoteBook ,
			id : uuidv4() ,
		};
		
		//添加新note
		if ( currentID === null ) {
			noteInfoArray.unshift(newNoteInfo);
			
			localStorage.setItem('note-info-array' , JSON.stringify(noteInfoArray));
			const currentList = noteInfoArray.filter((note) => note.notebook === currentNoteBook);
			//更新状态
			this.setState({
				isAddNote : false ,
				noteListData : noteInfoArray ,
				currentID : null ,
			});
		}
		
		//修改已存在的note, 分两种情况:1,修改原内容; 2,未修改
		if ( currentID !== null ) {
			//rawContentState.blocks 中每个 block 代表的是编辑器中一个段落，而不是一个完整的文档.
			// 所以当调用 rawContentState.blocks[0].text 时，只会取到第一块的文本内容。
			// 如果有多行文本，通常会有多个 block，每个 block 里可能只有一行文本。
			let oldNote = noteInfoArray.find((note) => note.id === currentID);
			let oldNoteContent = oldNote.noteContent.blocks;
			let newNoteContent = rawContentState.blocks;
			
			if ( isEqual(oldNoteContent , newNoteContent) ) {
				console.log('没有变化');
				this.setState({ isAddNote : false });
				return;
			}
			noteInfoArray = noteInfoArray.filter((note) => note.id !== currentID);
			
			noteInfoArray.unshift(newNoteInfo);
			localStorage.setItem('note-info-array' , JSON.stringify(noteInfoArray));
			
			
			const currentList = noteInfoArray.filter((note) => note.notebook === currentNoteBook);
			//更新状态
			this.setState({
				isAddNote : false ,
				noteListData : noteInfoArray ,
				currentID : null ,
			});
		}
		
	};
	
	//删除note
	handleDeleteNote = (id) => {
		const {
			noteListData ,
			currentNoteBook,
		} = this.state;
		
		const updatedList = noteListData.filter((note) => note.id !== id);
		const currentList = updatedList.filter((note) => note.notebook === currentNoteBook);
		localStorage.setItem('note-info-array' , JSON.stringify(updatedList));
		this.setState({
			noteListData : updatedList ,
			currentID : null ,
		});
	};
	
	//修改old note
	handleChangeNote = (noteContent , id) => {
		console.log(noteContent);
		this.setState({
			isAddNote : !this.state.isAddNote ,
			currentContent : noteContent ,
			currentID : id ,
		});
	};
	
	//控制sidebar显示/隐藏
	toggleSidebar = () => {
		this.setState(prevState => ({ isSidebarVisible : !prevState.isSidebarVisible }) , () => {
			console.log(this.state.isSidebarVisible);
		});
	};
	
	handleToggleNoteBook = (notebook) => {
		this.setState({
			currentNoteBook : notebook ,
			
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
					  <NoteSidebar handleToggleNoteBook = { this.handleToggleNoteBook } />
					  <NoteManagePanel
						  onChangeNote = { this.handleChangeNote }
						  onDeleteNote = { this.handleDeleteNote }
						  showMode = { this.state.noteDisplayMode }
						  OnSwitchMode = { this.handleSwitchMode }
						  onToggleSidebar = { this.toggleSidebar }
						  sidebarIsVisible = { this.state.isSidebarVisible }
						  currentNoteBook = { this.state.currentNoteBook }
					  />
				  </div>)
				
			}
		
		
		</div>;
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

export default NotesApp;
