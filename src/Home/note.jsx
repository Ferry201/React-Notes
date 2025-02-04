import './note.css';
import React , { Component } from 'react';
import 'rc-tabs/assets/index.css';
import {
	message ,
	Modal,
} from 'antd';
import { ExclamationCircleFilled } from '@ant-design/icons';
import isEqual from 'lodash/isEqual';
import { NoteSidebar } from './sidebar';
import { NoteManagePanel } from '@src/Home/note-manage-panel';
import { v4 as uuidv4 } from 'uuid';
import coverDefault from "@src/Home/img-collection/cover-default.png";
import dayjs from "dayjs";
import { AddNewNoteModal } from '../RichTextEditor/RichTextEditor';
import { NoteBookModal } from "@src/Home/addNoteBook_Model";
import {SettingModal} from './setting_Modal'
import { convertFromRaw } from "draft-js";

const { confirm } = Modal;

const defaultNotebook = {
	title : '我的笔记本' ,
	cover : coverDefault ,
	id : 'default-notebook-id' ,
	createdTime : dayjs().valueOf() ,
	showMode : 'list-mode' ,//当前笔记显示模式
	currentTheme : 'blue-theme' ,//列表主题,类名
};

class NotesApp extends Component {
	constructor (props) {
		super(props);
		
		this.state = {
			currentContent : '' ,
			currentNoteTitle : "" ,
			currentID : null ,
			noteListData : [] ,
			noteBookData : [] ,
			isSidebarVisible : false ,
			currentNotebook : JSON.parse(localStorage.getItem('current-notebook')) || defaultNotebook ,
			selectedNotebookId : null ,
			activeModal : null ,
			isModalOpen : false ,
			notesAmount : 0 ,
			showFavoritedNotes : false ,
			searchKeyword : '' ,
			showSearchResults : false ,
			showRecycleNotes:false,
		};
	}
	
	componentDidUpdate (prevProps , prevState) {
		const {
			noteListData ,
			noteBookData,
			currentNotebook ,
			activeModal,
			searchKeyword
		} = this.state;
		
		const getFilteredNotes=()=>{
			let notDeletedNotes = noteListData.filter(note => note.isDeleted === false);
			if ( currentNotebook.id === 'favorites-notes-id' ) {
				return notDeletedNotes.filter(note => note.isFavorited === true);
			} else if ( currentNotebook.id === 'searchResults-notes-id' ) {
				return notDeletedNotes.filter((note) => {
					const plainText = convertFromRaw(note.noteContent).getPlainText();
					const matchedContent = plainText.toLowerCase().includes(searchKeyword.toLowerCase());
					const matchedTitle = note.noteTitle?.toLowerCase().includes(searchKeyword.toLowerCase());
					
					return matchedContent || matchedTitle;
				});
			} else if ( currentNotebook.id === 'recycle-notes-id' ) {
				return noteListData.filter(note => note.isDeleted === true);
			} else {
				return notDeletedNotes.filter(note => note.notebookID === this.state.currentNotebook.id);
			}
		}
		
		// 确保 currentNotebook 存在并且 id 不同
		if ( currentNotebook && prevState.currentNotebook && currentNotebook.id !== prevState.currentNotebook.id ) {
			if(currentNotebook.id !== 'searchResults-notes-id' ) {
				localStorage.setItem('current-notebook' , JSON.stringify(this.state.currentNotebook));
			}
			const fileredNotes=getFilteredNotes();
			this.setState({notesAmount : fileredNotes.length})
		}
		
		if ( noteListData && prevState.noteListData && noteListData !== prevState.noteListData ) {
			const fileredNotes=getFilteredNotes();
			this.setState({notesAmount : fileredNotes.length})
		}
		
		let allNotebooks = [...noteBookData];
		allNotebooks = allNotebooks.filter(notebook => notebook.id !== 'favorites-notes-id' && notebook.id !== 'searchResults-notes-id' && notebook.id !== 'recycle-notes-id'
		);
		if ( activeModal === 'deleteConfirm' && allNotebooks.length === 1 ) {
			message.error('至少需要一个笔记本存在 , 不能删除最后一个笔记本!');
			this.setState({
				activeModal : null ,
			});
		}
		// 当 searchKeyword 从非空变为空时，恢复到上一个选中的笔记本
		if ( prevState.searchKeyword !== '' && this.state.searchKeyword === '' ) {
			const prevNotebook = noteBookData.find(book => book.id === prevState.selectedNotebookId);
			this.setState({
				showSearchResults : false ,
				selectedNotebookId : prevState.selectedNotebookId ,
				currentNotebook : prevNotebook ,
			});
		}
	}
	
	
	componentDidMount () {
		const storedNoteData = JSON.parse(localStorage.getItem('note-info-array')) || [];
		const currentNotes = storedNoteData.filter(note => note.notebookID === this.state.currentNotebook.id);
		this.setState({
			noteListData : storedNoteData ,
			notesAmount : currentNotes.length ,
		});
		
		if ( this.state.currentNotebook.id === 'favorites-notes-id' ) {
			const favoritedNotes = storedNoteData.filter(note => note.isFavorited === true);
			this.setState({ notesAmount : favoritedNotes.length });
		}
		if ( this.state.currentNotebook.id === 'searchResults-notes-id' ) {
			let allMatchedNotes = this.state.noteListData.filter((note) => {
				const plainText = convertFromRaw(note.noteContent).getPlainText();
				const matchedContent = plainText.toLowerCase().includes(this.state.searchKeyword.toLowerCase());
				const matchedTitle = note.noteTitle?.toLowerCase().includes(this.state.searchKeyword.toLowerCase());
				
				return matchedContent || matchedTitle;
			});
			this.setState({ notesAmount : allMatchedNotes.length });
		}
		
		const storedNoteBooks = localStorage.getItem('notebook-array');
		if ( storedNoteBooks === null ) {
			// 更新组件状态
			this.setState({ noteBookData : [defaultNotebook] } , () => {
				// 将默认笔记本存入 localStorage
				localStorage.setItem('notebook-array' , JSON.stringify([defaultNotebook]));
			});
		} else {
			// 如果有数据，从 localStorage 中加载
			this.setState({ noteBookData : JSON.parse(storedNoteBooks) });
		}
		
		if ( this.state.currentNotebook.id !== 'searchResults-notes-id' ) {
			this.setState({
				selectedNotebookId : this.state.currentNotebook.id ,
			});
		}
	}
	
	
	//保存note
	handleSaveNote = (noteTitle , rawContentState , saveTime) => {
		const {
			currentID ,
			noteListData ,
			currentNotebook ,
		} = this.state;
		
		let noteInfoArray = [...noteListData];
		
		let newNoteInfo = {
			noteContent : rawContentState ,
			noteTitle : noteTitle ,
			saveTime : saveTime ,
			notebook : currentNotebook.title ,
			notebookID : currentNotebook.id ,
			id : currentID || uuidv4() ,
			isPinned : false ,
			pinnedTime : null ,
			isFavorited : false ,
			favoritedTime : null ,
			isDeleted : false ,
			deletedTime : null ,
		};
		
		let editInFavoritesOrSearchPage = currentNotebook.id === 'favorites-notes-id' || currentNotebook.id === 'searchResults-notes-id';
		//在收藏夹or搜索结果里修改已存在笔记时:
		if ( editInFavoritesOrSearchPage && currentID !== null ) {
			const oldNote = noteInfoArray.find(note => note.id === currentID);
			if ( oldNote ) {
				newNoteInfo.notebookID = oldNote.notebookID; // 保留原来的 notebookID
				newNoteInfo.notebook = oldNote.notebook;     // 保留原来的 notebook 名称
			}
		}
		
		//添加新note
		if ( currentID === null ) {
			noteInfoArray = [
				newNoteInfo ,
				...noteInfoArray,
			];
		} else {
			//修改已存在的note, 分两种情况:1,修改原内容; 2,未修改
			//rawContentState.blocks 中每个 block 代表的是编辑器中一个段落，而不是一个完整的文档.
			// 所以当调用 rawContentState.blocks[0].text 时，只会取到第一块的文本内容。
			// 如果有多行文本，通常会有多个 block，每个 block 里可能只有一行文本。
			let oldNote = noteInfoArray.find((note) => note.id === currentID);
			let oldNoteContent = oldNote.noteContent.blocks;
			let newNoteContent = rawContentState.blocks;
			let oldNoteTitle = oldNote.noteTitle;
			let newNoteTitle = noteTitle;
			
			if ( isEqual(oldNoteContent , newNoteContent) && isEqual(oldNoteTitle , newNoteTitle) ) {
				console.log('没有变化');
				this.handleCloseModal();
				return;
			}
			noteInfoArray = noteInfoArray.filter((note) => note.id !== currentID);
			noteInfoArray.unshift({
				...newNoteInfo ,
				isPinned : oldNote.isPinned ,
				pinnedTime : oldNote.pinnedTime ,
				isFavorited : oldNote.isFavorited ,
				favoritedTime : oldNote.favoritedTime ,
				// isDeleted : oldNote.isDeleted ,
				// deletedTime : oldNote.deletedTime,
			});
		}
		
		const currentNotes = noteInfoArray.filter(note => note.notebookID === currentNotebook.id);
		//更新状态
		this.setState({
			noteListData : noteInfoArray ,
			currentID : null ,
			currentNoteTitle : null ,
			currentContent : null ,
			notesAmount : currentNotes.length ,
		} , () => {
			this.handleCloseModal();
			localStorage.setItem('note-info-array' , JSON.stringify(noteInfoArray));
		});
	};
	
	
	//修改old note
	handleChangeNote = (noteTitle , noteContent , id) => {
		this.setState({
			currentNoteTitle : noteTitle ,
			currentContent : noteContent ,
			currentID : id ,
		});
		if(this.state.currentNotebook.id !== 'recycle-notes-id'){
			this.handleOpenModal('addNewNote');
		}else{
			this.handleOpenModal('recoverConfirm')
		}
	};
	
	//删除note
	handleDeleteNote = (id) => {
		const {
			noteListData ,
			currentNotebook ,
			searchKeyword ,
		} = this.state;
		let updatedList = [...noteListData];
		// updatedList = updatedList.filter((note) => note.id !== id);
		updatedList=updatedList.map(note=>{
			if(note.id===id){
				return {
					...note,
					isDeleted : true ,
					deletedTime : dayjs().valueOf(),
				}
			}
			return note
		})
		
		// let currentNotes;
		// if ( currentNotebook.id === 'favorites-notes-id' ) {
		// 	currentNotes = updatedList.filter(note => note.isFavorited === true);
		// } else if ( currentNotebook.id === 'searchResults-notes-id' ) {
		// 	currentNotes = updatedList.filter((note) => {
		// 		const plainText = convertFromRaw(note.noteContent).getPlainText();
		// 		return plainText.toLowerCase().includes(searchKeyword.toLowerCase());
		// 	});
		// } else {
		// 	currentNotes = updatedList.filter(note => note.notebookID === currentNotebook.id);
		// }
		
		this.setState({
			noteListData : updatedList ,
			currentID : null ,
			currentContent : null ,
			currentNoteTitle : null ,
			// notesAmount : currentNotes.length ,
		} , () => {
			localStorage.setItem('note-info-array' , JSON.stringify(updatedList));
		});
	};
	
	//置顶note
	handlePinNote = (id) => {
		const {
			noteListData ,
		} = this.state;
		let updatedNoteList = [...noteListData];
		updatedNoteList = updatedNoteList.map(note => {
			if ( note.id === id ) {
				return {
					...note ,
					isPinned : !note.isPinned ,
					pinnedTime : !note.isPinned ? dayjs().valueOf() : null ,
				};
			}
			return note;
		});
		this.setState({
			noteListData : updatedNoteList ,
		} , () => {
			localStorage.setItem('note-info-array' , JSON.stringify(updatedNoteList));
		});
	};
	//收藏note
	handleFavoriteNote = (id) => {
		const {
			noteListData ,
		} = this.state;
		let updatedNoteList = [...noteListData];
		updatedNoteList = updatedNoteList.map(note => {
			if ( note.id === id ) {
				return {
					...note ,
					isFavorited : !note.isFavorited ,
					favoritedTime : !note.isFavorited ? dayjs().valueOf() : null ,
				};
			}
			return note;
		});
		
		this.setState({
			noteListData : updatedNoteList ,
		} , () => {
			localStorage.setItem('note-info-array' , JSON.stringify(updatedNoteList));
		});
	};
	
	//移动note到别的笔记本
	handleMoveNote=(id,notebook)=>{
		const {
			noteListData ,
		} = this.state;
		let updatedNoteList = [...noteListData];
		updatedNoteList = updatedNoteList.map(note => {
			if ( note.id === id ) {
				return {
					...note ,
					notebookID:notebook.id,
					notebook:notebook.title
				};
			}
			return note;
		});
		
		this.setState({
			noteListData : updatedNoteList ,
		} , () => {
			localStorage.setItem('note-info-array' , JSON.stringify(updatedNoteList));
		});
	}
	//控制sidebar显示/隐藏
	toggleSidebar = () => {
		this.setState(prevState => ({ isSidebarVisible : !prevState.isSidebarVisible }) , () => {
			console.log(this.state.isSidebarVisible);
		});
	};
	//传给addNotebookModal
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
			if ( newNoteBook.id !== 'searchResults-notes-id' ) {
				this.handleToggleNoteBook(newNoteBook);
			}
		});
	};
	//传给sidebar
	handleToggleNoteBook = (notebook) => {
		this.setState({
			currentNotebook : notebook ,
			selectedNotebookId : notebook.id ,//添加后立刻显示新添加笔记本页面
			showFavoritedNotes : false ,
			showSearchResults : false ,
			showRecycleNotes : false ,
		});
	};
	
	//笔记本 : 重命名 换封面 主题 模式
	updateNotebookInfo = (key , value) => {
		const {
			noteBookData ,
			currentNotebook ,
			noteListData ,
		} = this.state;
		let updatedNotebooks = [...noteBookData];
		let updatedNotes = [...noteListData];
		updatedNotebooks = updatedNotebooks.map(notebook => {
			if ( notebook.id === currentNotebook.id ) {
				return {
					...notebook ,
					[key] : value ,
				};
			}
			return notebook;
		});
		//重命名笔记时修改笔记列表中noteBook的值
		if ( key === 'title' ) {
			updatedNotes = updatedNotes.map((note) => {
				if ( note.notebookID === currentNotebook.id ) {
					return {
						...note ,
						notebook : value ,
					};
				}
				return note;
			});
		}
		
		this.setState(prevState => {
			const updatedNotebook = {
				...prevState.currentNotebook ,
				[key] : value ,
			};
			return {
				currentNotebook : updatedNotebook ,
				noteBookData : updatedNotebooks ,
				noteListData : updatedNotes ,
			};
		} , () => {
			localStorage.setItem('current-notebook' , JSON.stringify(this.state.currentNotebook));
			localStorage.setItem('notebook-array' , JSON.stringify(this.state.noteBookData));
			localStorage.setItem('note-info-array' , JSON.stringify(this.state.noteListData));
		});
	};
	
	//删除笔记本
	deleteNotebook = () => {
		const {
			noteBookData ,
			currentNotebook ,
			noteListData ,
		} = this.state;
		
		let updatedNotebooks = [...noteBookData];
		let updatedNoteList = [...noteListData];
		let filteredNotebooksID = [
			currentNotebook.id ,
			'favorites-notes-id' ,
			'searchResults-notes-id',
		];
		updatedNotebooks=updatedNotebooks.filter((notebook)=>!filteredNotebooksID.includes(notebook.id))
		let newCurrentNotebook = null;
		if ( updatedNotebooks.length > 0 ) {
			const currentIndex = noteBookData.findIndex((notebook) => notebook.id === currentNotebook.id);
			const nextIndex = currentIndex < updatedNotebooks.length ? currentIndex : updatedNotebooks.length - 1;
			newCurrentNotebook = updatedNotebooks[nextIndex];
		}
		//删掉该笔记本中所有笔记
		updatedNoteList = updatedNoteList.filter((note) => note.notebookID !== currentNotebook.id);
		
		this.setState({
			noteBookData : updatedNotebooks ,
			currentNotebook : newCurrentNotebook ,
			noteListData : updatedNoteList ,
			selectedNotebookId : newCurrentNotebook.id ,
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
		this.setState({
			isModalOpen : false ,
			activeModal : null ,
			currentID : null ,
			currentNoteTitle : null ,
			currentContent : null ,
		});
	};
	
	//点击收藏夹:
	handleClickFavorites = () => {
		const {
			noteBookData ,
			noteListData ,
		} = this.state;
		let favorites = noteBookData.find(item => item.id === 'favorites-notes-id');
		if ( favorites === undefined ) {
			const newNoteBook = {
				title : '收藏夹' ,
				cover : null ,
				id : 'favorites-notes-id' ,
				createdTime : dayjs().valueOf() ,
				showMode : 'list-mode' ,
				currentTheme : 'yellow-theme' ,
			};
			this.addNoteBook(newNoteBook);
			favorites = newNoteBook;
		}
		const favoritedNotes = noteListData.filter(note => note.isFavorited === true);
		this.setState({
			showFavoritedNotes : true ,
			showSearchResults : false ,
			showRecycleNotes : false ,
			currentNotebook : favorites ,
			selectedNotebookId : favorites.id ,
			notesAmount : favoritedNotes.length ,
		});
	};
	//点击搜索
	showSearchResults = (keyword) => {
		const {
			noteBookData ,
			noteListData ,
		} = this.state;
		let searchResults = noteBookData.find(item => item.id === 'searchResults-notes-id');
		if ( searchResults === undefined ) {
			const newNoteBook = {
				title : '搜索结果' ,
				cover : null ,
				id : 'searchResults-notes-id' ,
				createdTime : dayjs().valueOf() ,
				showMode : 'list-mode' ,
				currentTheme : 'blue-theme' ,
			};
			this.addNoteBook(newNoteBook);
			searchResults = newNoteBook;
		}
		let allMatchedNotes = noteListData.filter((note) => {
			const plainText = convertFromRaw(note.noteContent).getPlainText();
			const matchedContent = plainText.toLowerCase().includes(keyword.toLowerCase());
			const matchedTitle = note.noteTitle?.toLowerCase().includes(keyword.toLowerCase());
			
			return matchedContent || matchedTitle;
		});
		
		this.setState({
			showSearchResults : true ,
			showRecycleNotes : false ,
			showFavoritedNotes : false ,
			currentNotebook : searchResults ,
			notesAmount : allMatchedNotes.length ,
		});
	};
	setSearchKeyword = (keyword) => {
		if ( keyword.trim() === '' ) {
			this.setState({ searchKeyword : '' });
		}
		if ( keyword.trim() !== '' ) {
			this.setState({ searchKeyword : keyword.trim() } , () => {
				this.showSearchResults(keyword);
			});
		}
	};
	// 回收站
	handleClickRecycleBin=()=>{
		const {
			noteBookData ,
			noteListData ,
		} = this.state;
		let recycleBin = noteBookData.find(item => item.id === 'recycle-notes-id');
		if ( recycleBin === undefined ) {
			const newNoteBook = {
				title : '回收站' ,
				cover : null ,
				id : 'recycle-notes-id' ,
				createdTime : dayjs().valueOf() ,
				showMode : 'list-mode' ,
				currentTheme : 'gray-theme' ,
			};
			this.addNoteBook(newNoteBook);
			recycleBin = newNoteBook;
		}
		const deletedNotes = noteListData.filter(note => note.isDeleted === true);
		this.setState({
			showRecycleNotes : true ,
			showFavoritedNotes : false ,
			showSearchResults : false ,
			currentNotebook : recycleBin ,
			selectedNotebookId : recycleBin.id ,
			notesAmount : deletedNotes.length ,
		});
	}
	// 恢复删除的笔记
	handleRecoverDeletedNote = () => {
		const { noteListData ,currentID} = this.state;
		let newNoteList = [...noteListData];
		newNoteList = newNoteList.map(note => {
			if ( note.id === currentID ) {
				return {
					...note ,
					isDeleted : false ,
					deletedTime : null ,
				};
			}
			return note
		})
		this.setState({
			noteListData : newNoteList,
		} , () => {
			localStorage.setItem('note-info-array' , JSON.stringify(newNoteList));
		});
	}
	// 清空回收站
	handleClearRecycleBin = () => {
		const { noteListData } = this.state;
		let newNoteList = [...noteListData];
		newNoteList = newNoteList.filter(note => note.isDeleted === false);
		this.setState({
			noteListData : newNoteList,
		} , () => {
			localStorage.setItem('note-info-array' , JSON.stringify(newNoteList));
		});
	}
	
	render () {
		let allNotebooks = [...this.state.noteBookData];
		allNotebooks = allNotebooks.filter(notebook => notebook.id !== 'favorites-notes-id' && notebook.id !== 'searchResults-notes-id'&& notebook.id !== 'recycle-notes-id');
		
		return <div className = "container">
			{/*添加新笔记note*/}
			{ this.state.activeModal === 'addNewNote' && <AddNewNoteModal
				open = { this.state.isModalOpen }
				onCloseModal = {this.handleCloseModal }
				onCancel = { this.handleCloseModal }
				onSave = { this.handleSaveNote }
				initialTitle = { this.state.currentNoteTitle }
				initialContent = { this.state.currentContent }
				currentNotebook={this.state.currentNotebook}
				keyword={this.state.searchKeyword}
			/> }
			
			{ <div
				style = { {
					display : 'flex' ,
					width : '100%' ,
				} }
			>
				<NoteSidebar
					noteBookArray = { this.state.noteBookData }
					handleToggleNoteBook = { this.handleToggleNoteBook }
					selectedNotebookId = { this.state.selectedNotebookId }
					openModal = { this.handleOpenModal }
					clickFavorites = { this.handleClickFavorites }
					currentNotebook = { this.state.currentNotebook }
					setSearchKeyword = { this.setSearchKeyword }
					clickRecycleBin={this.handleClickRecycleBin}
				/>
				
				
				<NoteManagePanel
					noteList = { this.state.noteListData }
					notebooks={this.state.noteBookData}
					onChangeNote = { this.handleChangeNote }
					onDeleteNote = { this.handleDeleteNote }
					onToggleSidebar = { this.toggleSidebar }
					sidebarIsVisible = { this.state.isSidebarVisible }
					currentNotebook = { this.state.currentNotebook }
					updateNotebookInfo = { this.updateNotebookInfo }
					openModal = { this.handleOpenModal }
					notesAmount = { this.state.notesAmount }
					pinNote = { this.handlePinNote }
					favoriteNote = { this.handleFavoriteNote }
					isShowFavorites = { this.state.showFavoritedNotes }
					onSave = { this.handleSaveNote }
					onCancel = { this.handleCloseModal }
					searchKeyword = { this.state.searchKeyword }
					isShowSearchResults = { this.state.showSearchResults }
					handleMoveNote={this.handleMoveNote}
					isShowRecycleNotes={this.state.showRecycleNotes}
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
							showMode : 'list-mode' ,
							currentTheme : 'blue-theme' ,
						};
						this.addNoteBook(newNoteBook);
					} }
					closeModal = {  this.handleCloseModal }
					open = { this.state.isModalOpen }
				/>) }
				
				{/*修改笔记本封面 Modal*/ }
				{ this.state.activeModal === 'changeCover' && (<NoteBookModal
					showTitleInput = { false }
					onOk = { ({ cover }) => {
						this.updateNotebookInfo('cover' , cover);
					} }
					closeModal = { this.handleCloseModal}
					open = { this.state.isModalOpen }
				/>) }
				
				{/*设置Modal*/}
				{ this.state.activeModal === 'settingModal' && (<SettingModal
					closeModal = { this.handleCloseModal }
					open = { this.state.isModalOpen }
				/>) }
				
				
				{/*  删除笔记本确认框*/ }
				{ this.state.activeModal === 'deleteConfirm' && allNotebooks.length !== 1 ? (useConfirmDialog(
						(<div>确定删除笔记本: <span className = "delete-confirm-title">{ this.state.currentNotebook.title }</span>吗? </div>) ,
						(<div>此操作将永久删除该笔记本及该笔记本中所有笔记</div>) ,
						this.state.isModalOpen ,
						() => {
							this.deleteNotebook();
							this.handleCloseModal();
						} ,
						this.handleCloseModal ,
						"danger" ,)
				) : null }
				
				{/*  恢复删除笔记确认框*/ }
				{ this.state.activeModal === 'recoverConfirm' && useConfirmDialog(
					'回收站的笔记不可编辑',
					'恢复后可进行编辑 , 确定恢复已删除的笔记吗?',
					this.state.isModalOpen , 
					() => {
					this.handleRecoverDeletedNote();
					this.handleCloseModal();
					} , 
					this.handleCloseModal
				) }
				
				{/*  清空回收站确认框*/ }
				{ this.state.activeModal === 'clearRecycleConfirm' && useConfirmDialog(
					'确定清空回收站吗?',
					'此操作会永久删除回收站内的笔记' ,
					this.state.isModalOpen ,
					() => {
						this.handleClearRecycleBin();
						this.handleCloseModal();
					} ,
					this.handleCloseModal ,
					'danger',
				) }
				
			
			</div> }
		</div>;
	}
}
const useConfirmDialog = (title , content , open , clickOk , clickCancel , okType) => {
	confirm({
		icon : <ExclamationCircleFilled /> ,
		title : title ,
		content : content ,
		okText : '确定' ,
		okType : okType || "primary" ,
		cancelText : '我再想想' ,
		open : open ,
		onOk () {
			clickOk();
		} ,
		onCancel () {
			clickCancel();
		} ,
	})
}

export default NotesApp;
