import './note.css';
import React , { Component } from 'react';
import 'rc-tabs/assets/index.css';
import {
	message ,
	Modal ,
	Divider ,
} from 'antd';
import { ExclamationCircleFilled } from '@ant-design/icons';
import isEqual from 'lodash/isEqual';
import { NoteSidebar } from './sidebar';
import { NoteManagePanel } from '@src/Home/note-manage-panel';
import { v4 as uuidv4 } from 'uuid';
import coverDefault from "@src/Home/img-collection/cover-default.png";
import dayjs from "dayjs";
import RichTextEditor , { AddNewNoteModal } from '../RichTextEditor/RichTextEditor';
import { NoteBookModal } from "@src/Home/addNoteBook_Model";
import { InputNewSortModal } from "@src/Home/inputNewSort_Modal";
import { SettingModal } from './setting_Modal';
import { convertFromRaw } from "draft-js";

const { confirm } = Modal;

const defaultNotebook = {
	title : '我的笔记本' ,
	cover : coverDefault ,
	emoji : '📘' ,
	id : 'default-notebook-id' ,
	createdTime : dayjs().valueOf() ,
	showMode : 'list-mode' ,//当前笔记显示模式
	currentTheme : 'blue-theme' ,//列表主题,类名
	belongSortID : 'default-sort-id' ,
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
			allSorts : [] ,
			isSidebarVisible : false ,
			currentNotebook : JSON.parse(localStorage.getItem('current-notebook')) || defaultNotebook ,
			selectedNotebookId : null ,
			activeModal : null ,
			isModalOpen : false ,
			notesAmount : 0 ,
			showFavoritedNotes : false ,
			searchKeyword : '' ,
			showSearchResults : false ,
			showRecycleNotes : false ,
			currentSortId : null ,
			settingItems : {} ,
		};
	}
	
	componentDidUpdate (prevProps , prevState) {
		const {
			noteListData ,
			noteBookData ,
			currentNotebook ,
			activeModal ,
			searchKeyword ,
			allSorts,
		} = this.state;
		
		const getFilteredNotes = () => {
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
		};
		
		// 确保 currentNotebook 存在并且 id 不同
		if ( currentNotebook && prevState.currentNotebook && currentNotebook.id !== prevState.currentNotebook.id ) {
			if ( currentNotebook.id !== 'searchResults-notes-id' ) {
				localStorage.setItem('current-notebook' , JSON.stringify(this.state.currentNotebook));
			}
			const fileredNotes = getFilteredNotes();
			this.setState({ notesAmount : fileredNotes.length });
		}
		
		
		if ( noteListData && prevState.noteListData && noteListData !== prevState.noteListData ) {
			const fileredNotes = getFilteredNotes();
			this.setState({ notesAmount : fileredNotes.length });
		}
		
		let allNotebooks = [...noteBookData];
		allNotebooks = allNotebooks.filter(notebook => notebook.id !== 'favorites-notes-id' && notebook.id !== 'searchResults-notes-id' && notebook.id !== 'recycle-notes-id' ,
		);
		
		if ( activeModal === 'deleteSortConfirm' && allSorts.length === 1 ) {
			message.error('至少需要一个分类存在 , 不能删除最后一个分类!');
			this.setState({
				activeModal : null ,
			});
		}
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
		
		if ( prevState.settingItems.themeMode !== this.state.settingItems.themeMode ) {
			document.body.className = this.state.settingItems.themeMode;
		}
	}
	
	
	componentDidMount () {
		document.body.className = this.state.settingItems.themeMode;
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
			let notDeletedNotes = this.state.noteListData.filter(note => note.isDeleted === false);
			let allMatchedNotes = notDeletedNotes.filter((note) => {
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
		
		const storedAllSorts = localStorage.getItem('all-sorts');
		if ( storedAllSorts === null ) {
			// 更新组件状态
			this.handleAddNewSort({
				title : '默认分类' ,
				id : 'default-sort-id' ,
				isCollapse : false ,
			});
		} else {
			// 如果有数据，从 localStorage 中加载
			this.setState({ allSorts : JSON.parse(storedAllSorts) });
		}
		
		//设置条目
		const storedSetting = localStorage.getItem('setting-items');
		if (!storedSetting) {
			const defaultSetting = {
				themeMode: 'note-light-mode',
				autoSwitch: false,
				notebookMode: 'plain-notebook',
				language: 'chinese',
				listModeGap:'comfy',
				cardModeColumn:'cardTwoColumn',
				gridModeColumn:'gridTwoColumn',
			};
			this.setState({ settingItems: defaultSetting }, () => {
				localStorage.setItem('setting-items', JSON.stringify(defaultSetting));
			});
		} else {
				const parsedSetting = JSON.parse(storedSetting);
				this.setState({ settingItems: parsedSetting });
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
				...noteInfoArray ,
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
		if ( this.state.currentNotebook.id !== 'recycle-notes-id' ) {
			this.handleOpenModal('addNewNote');
		} else {
			this.handleOpenModal('recoverConfirm');
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
		updatedList = updatedList.map(note => {
			if ( note.id === id ) {
				return {
					...note ,
					isDeleted : true ,
					deletedTime : dayjs().valueOf() ,
				};
			}
			return note;
		});
		
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
	handleMoveNote = (id , notebook) => {
		const {
			noteListData ,
		} = this.state;
		let updatedNoteList = [...noteListData];
		updatedNoteList = updatedNoteList.map(note => {
			if ( note.id === id ) {
				return {
					...note ,
					notebookID : notebook.id ,
					notebook : notebook.title ,
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
				currentSortId : null ,
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
	
	//笔记本 : 重命名 换封面 主题 模式 所属分类
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
		let updatedNotebook;
		this.setState(prevState => {
			updatedNotebook = {
				...prevState.currentNotebook ,
				[key] : value ,
			};
			return {
				currentNotebook : updatedNotebook ,
				noteBookData : updatedNotebooks ,
				noteListData : updatedNotes ,
			};
		} , () => {
			localStorage.setItem('current-notebook' , JSON.stringify(updatedNotebook));
			localStorage.setItem('notebook-array' , JSON.stringify(updatedNotebooks));
			localStorage.setItem('note-info-array' , JSON.stringify(updatedNotes));
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
			'searchResults-notes-id' ,
			'recycle-notes-id' ,
		];
		updatedNotebooks = updatedNotebooks.filter((notebook) => !filteredNotebooksID.includes(notebook.id));
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
			localStorage.setItem('notebook-array' , JSON.stringify(updatedNotebooks));
			localStorage.setItem('current-notebook' , JSON.stringify(newCurrentNotebook));
			localStorage.setItem('note-info-array' , JSON.stringify(updatedNoteList));
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
	//点击设置
	handleClickSetting = () => {
		const {
			noteBookData ,
			noteListData ,
		} = this.state;
		let favorites = noteBookData.find(item => item.id === 'setting-notes-id');
		if ( favorites === undefined ) {
			const newNoteBook = {
				title : '设置' ,
				cover : null ,
				id : 'setting-notes-id' ,
				createdTime : dayjs().valueOf() ,
				showMode : 'list-mode' ,
				currentTheme : 'yellow-theme' ,
			};
			this.addNoteBook(newNoteBook);
			favorites = newNoteBook;
		}
		this.setState({
			showFavoritedNotes : true ,
			showSearchResults : false ,
			showRecycleNotes : false ,
			currentNotebook : favorites ,
			selectedNotebookId : favorites.id ,
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
		let notDeletedNotes = noteListData.filter(note => note.isDeleted === false);
		const favoritedNotes = notDeletedNotes.filter(note => note.isFavorited === true);
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
		
		let notDeletedNotes = noteListData.filter(note => note.isDeleted === false);
		let allMatchedNotes = notDeletedNotes.filter((note) => {
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
		const trimKeyword = keyword.trim();
		if ( trimKeyword === '' ) {
			this.setState({ searchKeyword : '' });
		}
		if ( trimKeyword !== '' ) {
			this.setState({ searchKeyword : trimKeyword } , () => {
				this.showSearchResults(trimKeyword);
			});
		}
	};
	// 回收站
	handleClickRecycleBin = () => {
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
	};
	// 恢复删除的笔记
	handleRecoverDeletedNote = () => {
		const {
			noteListData ,
			currentID ,
		} = this.state;
		let newNoteList = [...noteListData];
		newNoteList = newNoteList.map(note => {
			if ( note.id === currentID ) {
				return {
					...note ,
					isDeleted : false ,
					deletedTime : null ,
				};
			}
			return note;
		});
		this.setState({
			noteListData : newNoteList ,
		} , () => {
			localStorage.setItem('note-info-array' , JSON.stringify(newNoteList));
		});
	};
	// 清空回收站
	handleClearRecycleBin = () => {
		const { noteListData } = this.state;
		let newNoteList = [...noteListData];
		newNoteList = newNoteList.filter(note => note.isDeleted === false);
		this.setState({
			noteListData : newNoteList ,
		} , () => {
			localStorage.setItem('note-info-array' , JSON.stringify(newNoteList));
		});
	};
	
	//添加新分类
	handleAddNewSort = (newSort) => {
		const { allSorts } = this.state;
		let newSorts = [...allSorts];
		newSorts.push(newSort);
		this.setState({ allSorts : newSorts } , () => {
			localStorage.setItem('all-sorts' , JSON.stringify(newSorts));
		});
	};
	//点击添加新笔记本
	handleClickAddNotebook = (id) => {
		this.setState({ currentSortId : id } , () => {
			this.handleOpenModal('addNotebook');
		});
	};
	//点击删除分类 
	handleClickDeleteSort = (id) => {
		this.setState({ currentSortId : id } , () => {
			this.handleOpenModal('deleteSortConfirm');
		});
	};
	//点击重命名
	handleClickRenameSort = (id) => {
		this.setState({ currentSortId : id });
	};
	//重命名分类
	handlerenameSort = (newTitle) => {
		const {
			allSorts ,
			currentSortId ,
		} = this.state;
		let newSorts = [...allSorts];
		newSorts = newSorts.map(sort => {
			if ( sort.id === currentSortId ) {
				return {
					...sort ,
					title : newTitle ,
				};
			}
			return sort;
		});
		this.setState({
			allSorts : newSorts ,
			currentSortId : null ,
		} , () => {
			localStorage.setItem('all-sorts' , JSON.stringify(newSorts));
		});
	};
	//删除分类
	handleDeleteSort = (id) => {
		const {
			allSorts ,
			noteBookData ,
		} = this.state;
		let newSorts = [...allSorts];
		let newNotebooks = [...noteBookData];
		newSorts = newSorts.filter(sort => sort.id !== id);
		newNotebooks = newNotebooks.filter(notebook => notebook.belongSortID !== id);
		this.setState({
			allSorts : newSorts ,
			currentSortId : null ,
			noteBookData : newNotebooks ,
		} , () => {
			localStorage.setItem('all-sorts' , JSON.stringify(newSorts));
			localStorage.setItem('notebook-array' , JSON.stringify(newNotebooks));
		});
	};
	handleClickCollapse = (id) => {
		this.setState({ currentSortId : id } , () => {
			this.handleCollapseSort(id);
		});
	};
	//折叠分类
	handleCollapseSort = (id) => {
		const {
			allSorts ,
			currentSortId ,
		} = this.state;
		let newSorts = [...allSorts];
		newSorts = newSorts.map(sort => {
			if ( sort.id === currentSortId ) {
				return {
					...sort ,
					isCollapse : !sort.isCollapse ,
				};
			}
			return sort;
		});
		this.setState({
			allSorts : newSorts ,
			currentSortId : null ,
		} , () => {
			localStorage.setItem('all-sorts' , JSON.stringify(newSorts));
		});
	};
	
	getRandomTheme = () => {
		const themes = [
			'blue-theme' , 'purple-theme' , 'red-theme' , 'green-theme' , 'gray-theme' , 'orange-theme' , 'pink-theme' , 'yellow-theme' ,
		];
		const randomIndex = Math.floor(Math.random() * themes.length);
		return themes[randomIndex];
	};
	
	updateNoteSettingItems = (key , value) => {
		const { settingItems } = this.state;
		let newSettingItems = { ...settingItems };
		newSettingItems[key] = value;
		this.setState({ settingItems : newSettingItems } , () => {
			localStorage.setItem('setting-items' , JSON.stringify(newSettingItems));
		});
	};
	
	
	
	render () {
		let allNotebooks = [...this.state.noteBookData];
		allNotebooks = allNotebooks.filter(notebook => notebook.id !== 'favorites-notes-id' && notebook.id !== 'searchResults-notes-id' && notebook.id !== 'recycle-notes-id');
		
		return <div className = "container">
			
			<NoteSidebar
				noteBookArray = { this.state.noteBookData }
				handleToggleNoteBook = { this.handleToggleNoteBook }
				selectedNotebookId = { this.state.selectedNotebookId }
				openModal = { this.handleOpenModal }
				clickFavorites = { this.handleClickFavorites }
				currentNotebook = { this.state.currentNotebook }
				setSearchKeyword = { this.setSearchKeyword }
				clickRecycleBin = { this.handleClickRecycleBin }
				sorts = { this.state.allSorts }
				handleClickDeleteSort = { this.handleClickDeleteSort }
				handleClickAddNotebook = { this.handleClickAddNotebook }
				handleClickRenameSort = { this.handleClickRenameSort }
				renameSort = { this.handlerenameSort }
				currentSortId = { this.state.currentSortId }
				handleClickCollapse = { this.handleClickCollapse }
				settingItems = { this.state.settingItems }
			/>
			<NoteManagePanel
				settingItems = { this.state.settingItems }
				noteList = { this.state.noteListData }
				notebooks = { this.state.noteBookData }
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
				handleMoveNote = { this.handleMoveNote }
				isShowRecycleNotes = { this.state.showRecycleNotes }
				sorts = { this.state.allSorts }
			/>
			
			
			{/*添加新笔记note*/ }
			{ this.state.activeModal === 'addNewNote' && <AddNewNoteModal
				open = { this.state.isModalOpen }
				onCloseModal = { this.handleCloseModal }
				onCancel = { this.handleCloseModal }
				onSave = { this.handleSaveNote }
				initialTitle = { this.state.currentNoteTitle }
				initialContent = { this.state.currentContent }
				currentNotebook = { this.state.currentNotebook }
				settingItems = { this.state.settingItems }
				keyword = { this.state.searchKeyword }
			
			/> }
			
			
			{/*添加笔记本 Modal*/ }
			{ this.state.activeModal === 'addNotebook' && (<NoteBookModal
				showTitleInput = { true }
				plainMode = { this.state.settingItems.notebookMode === 'cover-notebook' ? false : true }
				onOk = { ({
					title ,
					cover ,
					emoji,
				}) => {
					const newNoteBook = {
						title ,
						cover ,
						emoji,
						id : uuidv4() ,
						createdTime : dayjs().valueOf() ,
						showMode : 'list-mode' ,
						currentTheme : this.getRandomTheme() ,
						belongSortID : this.state.currentSortId ,
					};
					this.addNoteBook(newNoteBook);
				} }
				closeModal = { this.handleCloseModal }
				open = { this.state.isModalOpen }
			/>) }
			
			{/*修改笔记本封面 Modal*/ }
			{ this.state.activeModal === 'changeCover' && (<NoteBookModal
				showTitleInput = { false }
				plainMode={false}
				onOk = { ({
					cover ,
				}) => {
					this.updateNotebookInfo('cover' , cover);
				} }
				closeModal = { this.handleCloseModal }
				open = { this.state.isModalOpen }
			/>) }
			
			{/*设置Modal*/ }
			{ this.state.activeModal === 'settingModal' && (<SettingModal
				closeModal = { this.handleCloseModal }
				open = { this.state.isModalOpen }
				settingItems = { this.state.settingItems }
				updateNoteSettingItems = { this.updateNoteSettingItems }
			/>) }
			
			
			{/*添加新分类Modal*/ }
			{ this.state.activeModal === 'InputNewSortModal' && (<InputNewSortModal
				closeModal = { this.handleCloseModal }
				open = { this.state.isModalOpen }
				onOk = { this.handleAddNewSort }
			/>) }
			
			
			{/*  删除分类确认框*/ }
			{ this.state.activeModal === 'deleteSortConfirm' && this.state.allSorts.length !== 1 ? (useConfirmDialog(
				'确定删除该分类及属于该分类的笔记本吗?' ,
				'此操作会永久删除该分类及笔记本' ,
				this.state.isModalOpen ,
				() => {
					this.handleDeleteSort(this.state.currentSortId);
					this.handleCloseModal();
				} ,
				this.handleCloseModal ,
				'danger',
			)) : null }
			
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
					"danger")
			) : null }
			
			{/*  恢复删除笔记确认框*/ }
			{ this.state.activeModal === 'recoverConfirm' && useConfirmDialog(
				'回收站的笔记不可编辑' ,
				'恢复后可进行编辑 , 确定恢复已删除的笔记吗?' ,
				this.state.isModalOpen ,
				() => {
					this.handleRecoverDeletedNote();
					this.handleCloseModal();
				} ,
				this.handleCloseModal ,
			) }
			
			{/*  清空回收站确认框*/ }
			{ this.state.activeModal === 'clearRecycleConfirm' && useConfirmDialog(
				'确定清空回收站吗?' ,
				'此操作会永久删除回收站内的笔记' ,
				this.state.isModalOpen ,
				() => {
					this.handleClearRecycleBin();
					this.handleCloseModal();
				} ,
				this.handleCloseModal ,
				'danger' ,
			) }
		
		
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
	});
};


const AvatarIcon = () => {
	return <svg
		t = "1735076297817"
		className = "icon"
		viewBox = "0 0 1024 1024"
		version = "1.1"
		xmlns = "http://www.w3.org/2000/svg"
		p-id = "2414"
		width = "24"
		height = "24"
	>
		<path
			d = "M512 0.007C229.233 0.007 0.006 229.234 0.006 512.001c0 116.573 38.964 224.043 104.572 310.106a514.544 514.544 0 0 0 92.449 93.56c34.369 26.855 72.256 49.414 112.854 66.876 62.008 26.67 130.335 41.451 202.118 41.451 71.782 0 140.11-14.781 202.117-41.451 40.599-17.462 78.485-40.021 112.854-66.876a514.505 514.505 0 0 0 92.454-93.564c65.605-86.064 104.568-193.531 104.568-310.103C1023.993 229.234 794.766 0.007 512 0.007z m319.607 831.601c-34.275 34.274-73.195 62.459-115.998 84.059a454.565 454.565 0 0 1-27.691 12.832C632.232 952.052 573.045 963.994 512 963.994s-120.233-11.942-175.918-35.495a454.593 454.593 0 0 1-27.692-12.832c-42.803-21.6-81.724-49.784-115.999-84.059a459.579 459.579 0 0 1-4.492-4.562c6.345-2.848 14.245-5.729 23.918-9.08 8.408-2.914 17.111-5.929 25.845-9.618 14.907-6.285 30.451-12.971 46.14-19.715 23.398-10.057 47.578-20.449 69.995-29.666l30.563-8.35a33.222 33.222 0 0 0 10.139-4.712c12.417-8.538 22.049-22.939 30.785-39.576 0.767-1.452 1.502-2.988 2.253-4.467 0.417-0.814 0.824-1.631 1.232-2.447a569.712 569.712 0 0 0 7.364-15.315l1.502-3.233c2.09-4.481 3.085-9.264 3.094-14.016 0-0.098 0.017-0.196 0.017-0.286-0.009-1.265-0.148-2.515-0.294-3.763-0.041-0.359-0.034-0.719-0.09-1.079-0.146-0.979-0.424-1.942-0.661-2.905-0.147-0.604-0.237-1.224-0.417-1.819-0.326-1.071-0.776-2.107-1.217-3.145-0.188-0.456-0.326-0.938-0.538-1.396a33.693 33.693 0 0 0-5.51-8.22c-35.014-38.41-57.684-90.998-62.802-144.184a239.113 239.113 0 0 1-1.102-22.784c0-17.895 0.719-34.303 2.082-49.348 9.51-105.333 50.254-143.898 93.259-157.155 16.384-5.054 33.104-6.433 48.55-6.433 21.226 0 44.866 2.612 66.744 13.788 41.765 21.331 77.13 73.896 77.13 199.148 0 41.61-11.242 84.043-31.219 120.763-9.149 16.809-20.123 32.425-32.687 46.205a33.225 33.225 0 0 0-5.502 8.214 33.321 33.321 0 0 0-3.198 13.813c0 0.089-0.019 0.179-0.027 0.276-0.008 1.013 0.116 2.024 0.205 3.036 0.049 0.613 0.032 1.226 0.122 1.829 0.074 0.499 0.23 0.997 0.319 1.494 0.212 1.111 0.399 2.229 0.726 3.331 0.008 0.05 0.032 0.091 0.049 0.14a33.294 33.294 0 0 0 1.698 4.496l1.495 3.233c11.827 25.617 23.917 49.617 41.634 61.806a33.393 33.393 0 0 0 10.138 4.712l30.573 8.35c19.332 7.951 39.96 16.768 60.287 25.502 3.281 1.406 6.571 2.818 9.828 4.221h0.009c15.634 6.728 31.136 13.39 46.01 19.658 8.728 3.689 17.431 6.704 25.848 9.618 9.669 3.352 17.567 6.232 23.911 9.08a448.73 448.73 0 0 1-4.492 4.561z m48.364-57.002c-14.813-9.058-31.191-14.734-45.89-19.825-7.723-2.679-15.029-5.209-21.731-8.042-14.791-6.244-30.196-12.865-45.739-19.543a1668.28 1668.28 0 0 1-4.146-1.779c-23.021-9.903-46.623-20.034-68.77-29.104a34.286 34.286 0 0 0-3.92-1.329l-24.147-6.597c-2.891-3.992-6.351-10.344-9.486-16.564 6.687-8.579 12.858-17.568 18.612-26.841 30.858-49.708 48.01-108.477 48.01-167.711 0-115.636-28.652-185.581-69.323-226.627-40.671-41.046-93.359-53.185-141.433-53.185h-0.01c-87.136 0-189.434 39.871-207.842 219.477-1.91 18.579-2.914 38.654-2.914 60.336 0 4.392 0.098 8.784 0.276 13.167 0.409 9.527 1.291 19.021 2.556 28.467 1.648 12.27 3.976 24.441 7.028 36.417 2.033 8.001 4.408 15.902 7.045 23.715 0.155 0.466 0.285 0.931 0.449 1.396 0.441 1.274 0.939 2.53 1.388 3.804 11.298 31.602 27.429 61.349 47.879 87.586-0.303 0.597-0.613 1.185-0.915 1.78-0.555 1.07-1.103 2.146-1.666 3.199-0.253 0.467-0.497 0.914-0.751 1.372a172.445 172.445 0 0 1-2.016 3.608 99.177 99.177 0 0 1-1.29 2.189c-0.131 0.227-0.27 0.456-0.408 0.685a69.245 69.245 0 0 1-2.115 3.224l0.025 0.009c-0.114 0.156-0.237 0.359-0.343 0.507l-24.147 6.588c-1.34 0.367-2.646 0.808-3.919 1.329-23.461 9.616-48.605 20.435-72.933 30.884-15.543 6.678-30.939 13.299-45.732 19.543-6.71 2.833-14.008 5.363-21.731 8.042-14.702 5.092-31.081 10.768-45.895 19.826-19.277-26.941-35.513-55.919-48.527-86.688-23.553-55.686-35.495-114.873-35.495-175.918S71.947 391.77 95.5 336.085c22.762-53.816 55.361-102.16 96.891-143.69s89.874-74.128 143.69-96.891C391.767 71.949 450.955 60.007 512 60.007c61.045 0 120.232 11.942 175.918 35.495 53.815 22.763 102.159 55.361 143.689 96.891 41.529 41.53 74.128 89.875 96.891 143.69 23.553 55.685 35.495 114.873 35.495 175.918s-11.942 120.232-35.495 175.918c-13.015 30.769-29.251 59.746-48.527 86.687z"
			fill = "#040000"
			p-id = "2415"
		></path>
	</svg>;
};

class SettingIcon extends Component {
	render () {
		return <svg
			style = { { marginLeft : '16px' } }
			t = "1734470471720"
			className = "icon"
			viewBox = "0 0 1024 1024"
			version = "1.1"
			xmlns = "http://www.w3.org/2000/svg"
			p-id = "69469"
			width = "20"
			height = "20"
		>
			<path
				d = "M512 305.318a205.708 205.708 0 1 0 205.708 205.709A205.708 205.708 0 0 0 512 305.318z m0 346.2a140.816 140.816 0 1 1 140.816-140.816A140.816 140.816 0 0 1 512 651.842z"
				p-id = "69470"
				fill = "#000"
			></path>
			<path
				d = "M958.783 393.572L885.78 382.54a391.95 391.95 0 0 0-16.872-40.882l44.127-60.026a64.892 64.892 0 0 0 0-91.822l-77.222-77.87a64.892 64.892 0 0 0-91.822 0l-59.052 43.801a392.274 392.274 0 0 0-40.882-17.196L632.7 64.892A64.892 64.892 0 0 0 567.807 0H458.464a64.892 64.892 0 0 0-64.892 64.892l-11.032 72.68a392.598 392.598 0 0 0-40.882 16.872l-60.35-44.127a64.892 64.892 0 0 0-91.823 0l-77.546 77.546a64.892 64.892 0 0 0 0 91.823l44.127 60.025a392.274 392.274 0 0 0-16.548 39.909l-74.626 9.734A64.892 64.892 0 0 0 0 454.246v109.668a64.892 64.892 0 0 0 64.892 64.892l74.302 11.356a392.274 392.274 0 0 0 16.223 41.207l-45.1 60.999a64.892 64.892 0 0 0 0 91.822l77.546 77.546a64.892 64.892 0 0 0 91.823 0l60.674-44.775a392.598 392.598 0 0 0 39.26 16.547l11.356 75.6A64.892 64.892 0 0 0 455.868 1024h109.668a64.892 64.892 0 0 0 64.892-64.892l11.357-74.302a392.923 392.923 0 0 0 39.584-16.223l61.323 45.1a64.892 64.892 0 0 0 91.823 0l77.546-77.546a64.892 64.892 0 0 0 0-91.823l-44.127-60.025a392.274 392.274 0 0 0 16.872-39.909l74.626-11.356a64.892 64.892 0 0 0 64.892-64.892V458.464a64.892 64.892 0 0 0-65.54-64.892z m0 174.56h-9.734l-74.626 11.356-38.286 5.84-12.979 36.34a329.328 329.328 0 0 1-13.951 32.446L792.01 689.48l23.361 32.446 44.127 60.026 2.92 3.893 3.57 3.57-77.547 78.195-3.569-3.57-3.894-2.92-61.323-45.1-32.446-23.036-33.744 18.17a329.653 329.653 0 0 1-32.446 13.627l-36.989 12.978-6.489 38.287-11.356 74.301v9.734H455.868V949.05l-11.356-75.6-5.84-38.286-36.664-12.978a329.004 329.004 0 0 1-32.447-13.627l-35.366-16.872-32.446 23.036-60.674 44.776-3.894 2.92-3.569 3.57-77.546-77.547 3.569-3.569 2.596-3.894 45.424-61.323 23.037-32.446-16.872-35.042a329.328 329.328 0 0 1-13.627-32.446l-12.654-35.69-38.611-6.49-74.302-11.356h-9.734v-111.94h9.734l74.626-11.355 38.611-5.84 12.979-36.665a329.328 329.328 0 0 1 13.951-32.446l16.872-35.042-23.036-32.446-44.452-59.376-1.946-3.894-4.218-3.569 77.221-77.546 3.57 3.569 3.893 2.596 60.35 44.775 32.446 23.037 35.042-16.872a329.004 329.004 0 0 1 34.068-14.276l36.989-12.979 5.84-38.61 10.058-72.68v-9.734h110.317v9.734l11.356 73.653 4.867 38.286 36.665 12.979a329.004 329.004 0 0 1 34.392 14.276l35.367 17.196 32.446-23.36 59.376-43.479 4.218-1.946 3.57-3.57 77.546 77.547-3.57 3.569-2.92 3.893-44.45 59.377-23.038 32.446 17.521 33.744a328.68 328.68 0 0 1 13.952 34.068l12.654 36.989 38.936 5.84 73.003 11.032h9.734z"
				p-id = "69471"
				fill = "#000"
			></path>
		</svg>;
	}
}

export default NotesApp;
