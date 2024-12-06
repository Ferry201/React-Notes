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
import coverDefault from "@src/Home/img-collection/cover-default.png";
import dayjs from "dayjs";
import { AddNoteModal } from '../RichTextEditor/RichTextEditor';
import { NoteBookModal } from "@src/Home/addNoteBook_Model";

const defaultNotebook = {
	title : '我的笔记本' ,
	cover : coverDefault ,
	id : 'default-notebook-id' ,
	createdTime : dayjs().valueOf() ,
};

class NotesApp extends Component {
	constructor (props) {
		super(props);
		
		this.state = {
			currentContent : '' ,
			currentID : null ,
			isAddNote : false ,
			noteListData : [] ,
			noteBookData : [] ,
			noteDisplayMode : true ,//默认列表布局
			isSidebarVisible : false ,
			currentNotebook : JSON.parse(localStorage.getItem('current-notebook')) || defaultNotebook ,
			selectedNotebookId : null ,
			activeModal : null ,
			isModalOpen : false ,
		};
	}
	
	componentDidUpdate (prevProps , prevState) {
		// 确保 currentNotebook 存在并且 id 不同
		if ( this.state.currentNotebook && prevState.currentNotebook && this.state.currentNotebook.id !== prevState.currentNotebook.id ) {
			localStorage.setItem('current-notebook' , JSON.stringify(this.state.currentNotebook));
		}
	}
	
	
	componentDidMount () {
		const storedNoteData = JSON.parse(localStorage.getItem('note-info-array')) || [];
		this.setState({ noteListData : storedNoteData });
		
		const storedNoteBooks = localStorage.getItem('notebook-array');
		if ( storedNoteBooks === null ) {
			// 更新组件状态
			this.setState({ noteBookData : [defaultNotebook] },()=>{
				// 将默认笔记本存入 localStorage
				localStorage.setItem('notebook-array' , JSON.stringify([defaultNotebook]));
			});
		} else {
			// 如果有数据，从 localStorage 中加载
			this.setState({ noteBookData : JSON.parse(storedNoteBooks) });
		}
		this.setState({selectedNotebookId:this.state.currentNotebook.id})
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
			currentNotebook ,
		} = this.state;
		let noteInfoArray = [...noteListData];
		//
		let newNoteInfo = {
			noteContent : rawContentState ,
			saveTime : saveTime ,
			notebook : currentNotebook.title ,
			notebookID : currentNotebook.id ,
			id : uuidv4() ,
		};
		
		//添加新note
		if ( currentID === null ) {
			noteInfoArray.unshift(newNoteInfo);
			
			localStorage.setItem('note-info-array' , JSON.stringify(noteInfoArray));
			
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
		} = this.state;
		const updatedList = noteListData.filter((note) => note.id !== id);
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
	//传给modal
	addNoteBook = (newNoteBook) => {
		this.setState((prevState) => {
			const updatedNotebooks = [
				newNoteBook ,
				...prevState.noteBookData ,
			];
			return {
				noteBookData : updatedNotebooks ,
			};
		} , () => {
			localStorage.setItem('notebook-array' , JSON.stringify(this.state.noteBookData));
			this.handleToggleNoteBook(newNoteBook);//添加后立刻显示新添加笔记本页面
		});
	};
	//传给sidebar
	handleToggleNoteBook = (notebook) => {
		this.setState({
			currentNotebook : notebook ,
			selectedNotebookId : notebook.id ,
		});
	};
	//笔记本 : 重命名 换封面
	updateNotebookInfo = (key , value) => {
		const {
			noteBookData ,
			currentNotebook ,
		} = this.state;
		let updatedNotebooks = [...noteBookData];
		updatedNotebooks = updatedNotebooks.map(notebook => {
			if ( notebook.id === currentNotebook.id ) {
				return {
					...notebook ,
					[key] : value ,
				};
			}
			return notebook;
		});
		this.setState(prevState => {
			const updatedNotebook = {
				...prevState.currentNotebook ,
				[key] : value ,
			};
			return {
				currentNotebook : updatedNotebook ,
				noteBookData : updatedNotebooks ,
			};
		} , () => {
			localStorage.setItem('current-notebook' , JSON.stringify(this.state.currentNotebook));
			localStorage.setItem('notebook-array' , JSON.stringify(this.state.noteBookData));
		});
	};
	//删除笔记本
	deleteNotebook = () => {
		const {
			noteBookData ,
			currentNotebook ,
			noteListData ,
		} = this.state;
		if ( noteBookData.length === 1 ) {
			alert('至少需要一个笔记本存在 , 不能删除最后一个笔记本!');
			return;
		}
		alert(`将删除${ currentNotebook.title }及该笔记本所有笔记 , 确定删除吗?`);
		let updatedNotebooks = [...noteBookData];
		let updatedNoteList = [...noteListData];
		updatedNotebooks = updatedNotebooks.filter((notebook) => notebook.id !== currentNotebook.id);
		let newCurrentNotebook = null;
		if ( updatedNotebooks.length > 0 ) {
			const currentIndex = noteBookData.findIndex((notebook) => notebook.id === currentNotebook.id);
			const nextIndex = currentIndex < updatedNotebooks.length ? currentIndex : updatedNotebooks.length - 1;
			newCurrentNotebook = updatedNotebooks[nextIndex];
		}
		updatedNoteList = updatedNoteList.filter((note) => note.notebookID !== currentNotebook.id);
		
		this.setState({
			noteBookData : updatedNotebooks ,
			currentNotebook : newCurrentNotebook ,
			noteListData : updatedNoteList ,
			selectedNotebookId:newCurrentNotebook.id,
		} , () => {
			localStorage.setItem('notebook-array' , JSON.stringify(this.state.noteBookData));
			localStorage.setItem('current-notebook' , JSON.stringify(this.state.currentNotebook));
			localStorage.setItem('note-info-array' , JSON.stringify(this.state.noteListData));
		});
	};
	//Modal
	handleOpenModal = (type) => {
		this.setState({ isModalOpen : true });
		this.setState({ activeModal : type });
	};
	handleCloseModal = () => {
		this.setState({ isModalOpen : false });
		this.setState({ activeModal : null });
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
					  <NoteSidebar
						  noteBookArray = { this.state.noteBookData }
						  handleToggleNoteBook = { this.handleToggleNoteBook }
						  selectedNotebookId = { this.state.selectedNotebookId }
						  addNoteBook = { this.addNoteBook }
						  openModal = { this.handleOpenModal }
					  />
					  <NoteManagePanel
						  onChangeNote = { this.handleChangeNote }
						  onDeleteNote = { this.handleDeleteNote }
						  showMode = { this.state.noteDisplayMode }
						  OnSwitchMode = { this.handleSwitchMode }
						  onToggleSidebar = { this.toggleSidebar }
						  sidebarIsVisible = { this.state.isSidebarVisible }
						  currentNotebook = { this.state.currentNotebook }
						  updateNotebookInfo = { this.updateNotebookInfo }
						  deleteNotebook = { this.deleteNotebook }
						  openModal = { this.handleOpenModal }
					  />
					  
					  {/*添加笔记本 Modal*/ }
					  { this.state.activeModal === 'addNotebook' && (<NoteBookModal
						  showTitleInput = { true }
						  onOk = { ({
							  title ,
							  cover ,
						  }) => {
							  const newNoteBook = {
								  title ,
								  cover ,
								  id : uuidv4() ,
								  createdTime : dayjs().valueOf() ,
							  };
							  this.addNoteBook(newNoteBook);
						  }
						  }
						  closeModal = { () => this.handleCloseModal() }
						  open = { this.state.isModalOpen }
					  />) }
					  
					  {/*修改笔记本封面 Modal*/ }
					  { this.state.activeModal === 'changeCover' && (<NoteBookModal
						  showTitleInput = { false }
						  onOk = { ({ cover }) => {
							  this.updateNotebookInfo('cover' , cover);
						  } }
						  closeModal = { () => this.handleCloseModal() }
						  open = { this.state.isModalOpen }
					  />) }
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
