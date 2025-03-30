import './note.css';
import React , { Component , useState , useRef , useEffect } from 'react';
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
import { translations } from "@src/Home/translations";
import { defaults } from "lodash/object";
import { RecoverDeletedNoteConfirm } from './recoverDeletedNoteConfirm';

const defaultNotebook = {
	title : 'My Notebook' ,
	cover : coverDefault ,
	emoji : '📘' ,
	id : 'default-notebook-id' ,
	createdTime : dayjs().valueOf() ,
	showMode : 'list-mode' ,//当前笔记显示模式
	currentTheme : 'blue-theme' ,//列表主题,类名
	belongSortID : 'default-sort-id' ,
	isTodoMode : 'false',
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
			belongNotebook : null ,
		};
	}
	
	componentDidUpdate (prevProps , prevState) {
		const {
			noteListData ,
			noteBookData ,
			currentNotebook ,
			activeModal ,
			searchKeyword ,
			allSorts ,
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
		
		if ( noteListData && noteListData !== prevState.noteListData ) {
			let currentTime = dayjs().valueOf();
			//todo 15
			let gapTime = 15 * 24 * 60 * 60 * 1000;
			let deletedNotes = noteListData.filter(note => note.isDeleted === true);
			deletedNotes.forEach(note => {
				if ( currentTime - Number(note.deletedTime) > gapTime ) {
					this.handleCompletelyDelete(note.id);
				}
			});
		}
		
		let allNotebooks = [...noteBookData];
		allNotebooks = allNotebooks.filter(notebook => notebook.id !== 'favorites-notes-id' && notebook.id !== 'searchResults-notes-id' && notebook.id !== 'recycle-notes-id' ,
		);
		
		if ( activeModal === 'deleteSortConfirm' && allSorts.length === 1 ) {
			message.error(translations[this.state.settingItems.language].atLeastOneSort , 3);
			this.setState({
				activeModal : null ,
			});
		}
		if ( activeModal === 'deleteConfirm' && allNotebooks.length === 1 ) {
			message.error(translations[this.state.settingItems.language].atLeastOneNotebook , 3);
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
		
		if ( this.state.settingItems && prevState.settingItems && prevState.settingItems.language !== this.state.settingItems.language ) {
			const defaultSort = this.state.allSorts.find(sort => sort.id === 'default-sort-id');
			
			if ( defaultSort?.title === '默认分类' || defaultSort?.title === 'Default Category' ) {
				this.setState({ currentSortId : 'default-sort-id' } , () => {
					this.handlerenameSort(translations[this.state.settingItems.language].defaultCategory);
				});
			}
			if ( noteBookData ) {
				let defaultBook = noteBookData.find(book => book.id === 'default-notebook-id');
				
				if ( defaultBook?.title === '我的笔记本' || defaultBook?.title === 'My Notebook' ) {
					this.updatedDefaultBookTitle(defaultBook.id);
					if ( currentNotebook.id === defaultBook.id ) {
						this.updateNotebookInfo('title' , translations[this.state.settingItems.language].myBook);
					}
				}
			}
		}
	}
	
	
	componentDidMount () {
		const {
			noteListData ,
			currentNotebook ,
		} = this.state;
		document.body.className = this.state.settingItems.themeMode;
		const storedNoteData = JSON.parse(localStorage.getItem('note-info-array')) || [];
		const currentNotes = storedNoteData.filter(note => note.notebookID === this.state.currentNotebook.id);
		this.setState({
			noteListData : storedNoteData ,
			notesAmount : currentNotes.length ,
		});
		
		if ( currentNotebook.id === 'favorites-notes-id' ) {
			const favoritedNotes = storedNoteData.filter(note => note.isFavorited === true);
			this.setState({ notesAmount : favoritedNotes.length });
		}
		if ( currentNotebook.id === 'searchResults-notes-id' ) {
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
		if ( !storedSetting ) {
			const defaultSetting = {
				themeMode : 'note-light-mode' ,
				autoSwitch : false ,
				notebookMode : 'cover-notebook' ,
				language : 'en' ,
				listModeGap : 'comfy' ,
				cardModeColumn : 'cardThreeColumn' ,
				gridModeColumn : 'gridTwoColumn' ,
			};
			this.setState({ settingItems : defaultSetting } , () => {
				localStorage.setItem('setting-items' , JSON.stringify(defaultSetting));
			});
		} else {
			const parsedSetting = JSON.parse(storedSetting);
			this.setState({ settingItems : parsedSetting });
		}
		
		
		if ( this.state.currentNotebook.id !== 'searchResults-notes-id' ) {
			this.setState({
				selectedNotebookId : this.state.currentNotebook.id ,
			});
		}
	}
	
	//更改默认笔记本翻译
	updatedDefaultBookTitle = (id) => {
		const { noteBookData } = this.state;
		let newNotebookData = [...noteBookData];
		newNotebookData = newNotebookData.map(book => {
			if ( book.id === id ) {
				return {
					...book ,
					title : translations[this.state.settingItems.language].myBook,
				};
			}
			return book;
		});
		this.setState({ noteBookData : newNotebookData } , () => {
			localStorage.setItem('notebook-array' , JSON.stringify(newNotebookData));
		});
	};
	
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
			isCompleted : false ,
			completedTime : null,
			deadlineDate:null,
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
				isCompleted:oldNote.isCompleted,
				completedTime:oldNote.completedTime,
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
	
	//trash Completely delete
	handleCompletelyDelete = (id) => {
		const {
			noteListData ,
		} = this.state;
		let updatedList = [...noteListData];
		updatedList = updatedList.filter(note => note.id !== id);
		
		this.setState({
			noteListData : updatedList ,
		} , () => {
			localStorage.setItem('note-info-array' , JSON.stringify(updatedList));
		});
	};
	
	//set deadline
	handleSetDeadline = (id , date) => {
		const {
			noteListData ,
		} = this.state;
		let updatedNoteList = [...noteListData];
		updatedNoteList = updatedNoteList.map(note => {
			if ( note.id === id ) {
				return {
					...note ,
					deadlineDate : date,
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
	//set deadline
	handleDeleteDeadline = (id) => {
		const {
			noteListData ,
		} = this.state;
		let updatedNoteList = [...noteListData];
		updatedNoteList = updatedNoteList.map(note => {
			if ( note.id === id ) {
				return {
					...note ,
					deadlineDate : null,
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
	
	//删除选中笔记
	handleDeleteCheckedNote = (checkedIdArray) => {
		const {
			noteListData ,
		} = this.state;
		let updatedList = [...noteListData];
		updatedList = updatedList.map(note => {
			if ( checkedIdArray.includes(note.id) ) {
				return {
					...note ,
					isDeleted : true ,
					deletedTime : dayjs().valueOf() ,
				};
			}
			return note;
		});
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
	
	//置顶单个note
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
	//置顶选中的多个笔记
	handlePinCheckedNote = (checkedIdArray) => {
		const {
			noteListData ,
		} = this.state;
		let updatedNoteList = [...noteListData];
		updatedNoteList = updatedNoteList.map(note => {
			if ( checkedIdArray.includes(note.id) ) {
				return {
					...note ,
					isPinned : !note.isPinned ,
					pinnedTime : !note.isPinned ? dayjs().valueOf() : null ,
				};
			}
			return note;
		});
		
		this.setState({ noteListData : updatedNoteList } , () => {
			localStorage.setItem('note-info-array' , JSON.stringify(updatedNoteList));
		});
	};
	
	//标记待办为已完成
	handleCompletedTodo=(id)=>{
		const {
			noteListData ,
		} = this.state;
		let updatedNoteList = [...noteListData];
		updatedNoteList = updatedNoteList.map(note => {
			if ( note.id === id ) {
				return {
					...note ,
					isCompleted : !note.isCompleted ,
					completedTime : !note.isCompleted ? dayjs().valueOf() : null ,
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
	
	//移动选中的笔记到别的笔记本
	handleMoveCheckedNote = (checkedIdArray , notebook) => {
		const {
			noteListData ,
		} = this.state;
		let updatedNoteList = [...noteListData];
		updatedNoteList = updatedNoteList.map(note => {
			if ( checkedIdArray.includes(note.id) ) {
				return {
					...note ,
					notebookID : notebook.id ,
					notebook : notebook.title ,
				};
			}
			return note;
		});
		
		this.setState({ noteListData : updatedNoteList } , () => {
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
			settingItems ,
		} = this.state;
		//todo
		let updatedNotebooks = [...noteBookData];
		let updatedNoteList = [...noteListData];
		let newSettingItems = { ...settingItems };
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
		// updatedNoteList = updatedNoteList.filter((note) => note.notebookID !== currentNotebook.id);
		let deletedNoteIdArray = updatedNoteList.filter(note => note.notebookID === currentNotebook.id).map(note => note.id);
		this.handleDeleteCheckedNote(deletedNoteIdArray);
		
		
		this.setState({
			noteBookData : updatedNotebooks ,
			currentNotebook : newCurrentNotebook ,
			// noteListData : updatedNoteList ,
			selectedNotebookId : newCurrentNotebook.id ,
		} , () => {
			localStorage.setItem('notebook-array' , JSON.stringify(updatedNotebooks));
			localStorage.setItem('current-notebook' , JSON.stringify(newCurrentNotebook));
			// localStorage.setItem('note-info-array' , JSON.stringify(updatedNoteList));
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
				emoji : '🔍' ,
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
				emoji : '🗑️' ,
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
	//移动到别的笔记本并恢复删除的笔记
	moveAndRecoverDeletedNote = (book) => {
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
					notebookID : book.id ,
					notebook : book.title ,
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
	
	//移动分类
	handleMoveSort = (index , direction) => {
		const newSorts = [...this.state.allSorts];
		const targetIndex = index + direction;
		if ( targetIndex >= 0 && targetIndex < newSorts.length ) {
			// 交换位置
			[newSorts[index] , newSorts[targetIndex]] = [newSorts[targetIndex] , newSorts[index]];
			
			this.setState({ allSorts : newSorts } , () => {
				localStorage.setItem('all-sorts' , JSON.stringify(newSorts));
			});
		}
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
			noteListData ,
			settingItems ,
		} = this.state;
		let newSorts = [...allSorts];
		let newNotebooks = [...noteBookData];
		let newNoteLists = [...noteListData];
		let newSettingItems = { ...settingItems };
		newSorts = newSorts.filter(sort => sort.id !== id);
		let updatedNotebooks = newNotebooks.filter(notebook => notebook.belongSortID !== id);
		let deletedNotebooks = newNotebooks.filter(notebook => notebook.belongSortID === id);
		
		let deletedNotes = newNoteLists.filter(note => deletedNotebooks.some(book => book.id === note.notebookID));
		let deletedNotesIdArray = deletedNotes.map(note => note.id);
		this.handleDeleteCheckedNote(deletedNotesIdArray);
		
		this.setState({
			allSorts : newSorts ,
			currentSortId : null ,
			noteBookData : updatedNotebooks ,
		} , () => {
			localStorage.setItem('all-sorts' , JSON.stringify(newSorts));
			localStorage.setItem('notebook-array' , JSON.stringify(updatedNotebooks));
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
	
	//更改设置
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
				handleMoveSort = { this.handleMoveSort }
			/>
			<NoteManagePanel
				settingItems = { this.state.settingItems }
				noteList = { this.state.noteListData }
				notebooks = { this.state.noteBookData }
				onChangeNote = { this.handleChangeNote }
				onDeleteNote = { this.handleDeleteNote }
				handleDeleteCheckedNote = { this.handleDeleteCheckedNote }
				onToggleSidebar = { this.toggleSidebar }
				sidebarIsVisible = { this.state.isSidebarVisible }
				currentNotebook = { this.state.currentNotebook }
				updateNotebookInfo = { this.updateNotebookInfo }
				openModal = { this.handleOpenModal }
				notesAmount = { this.state.notesAmount }
				pinNote = { this.handlePinNote }
				completedTodo={this.handleCompletedTodo}
				handlePinCheckedNote = { this.handlePinCheckedNote }
				favoriteNote = { this.handleFavoriteNote }
				isShowFavorites = { this.state.showFavoritedNotes }
				onSave = { this.handleSaveNote }
				onCancel = { this.handleCloseModal }
				searchKeyword = { this.state.searchKeyword }
				isShowSearchResults = { this.state.showSearchResults }
				handleMoveNote = { this.handleMoveNote }
				handleMoveCheckedNote = { this.handleMoveCheckedNote }
				isShowRecycleNotes = { this.state.showRecycleNotes }
				sorts = { this.state.allSorts }
				handleSetDeadline={this.handleSetDeadline}
				handleDeleteDeadline={this.handleDeleteDeadline}
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
					emoji ,
				}) => {
					const newNoteBook = {
						title ,
						cover ,
						emoji ,
						id : uuidv4() ,
						createdTime : dayjs().valueOf() ,
						showMode : 'list-mode' ,
						currentTheme : this.getRandomTheme() ,
						belongSortID : this.state.currentSortId ,
						isTodoMode:false,
					};
					this.addNoteBook(newNoteBook);
				} }
				closeModal = { this.handleCloseModal }
				open = { this.state.isModalOpen }
				settingItems = { this.state.settingItems }
			/>) }
			
			{/*修改笔记本封面 Modal*/ }
			{ this.state.activeModal === 'changeCover' && (<NoteBookModal
				showTitleInput = { false }
				plainMode = { false }
				onOk = { (cover) => {
					this.updateNotebookInfo('cover' , cover);
				} }
				closeModal = { this.handleCloseModal }
				open = { this.state.isModalOpen }
				settingItems = { this.state.settingItems }
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
				settingItems = { this.state.settingItems }
			/>) }
			
			
			{/*  删除分类确认框*/ }
			{ this.state.activeModal === 'deleteSortConfirm' && this.state.allSorts.length !== 1 ? (useConfirmDialog(
				`${ translations[this.state.settingItems.language].deleteSortConfirm }` ,
				`${ translations[this.state.settingItems.language].deleteSortConfirmDetail }` ,
				this.state.isModalOpen ,
				() => {
					this.handleDeleteSort(this.state.currentSortId);
					this.handleCloseModal();
				} ,
				this.handleCloseModal ,
				'danger' ,
				`${ translations[this.state.settingItems.language].done }` ,
				`${ translations[this.state.settingItems.language].cancel }`,
			)) : null }
			
			{/*  删除笔记本确认框*/ }
			{ this.state.activeModal === 'deleteConfirm' && allNotebooks.length !== 1 ? (useConfirmDialog(
					(<div>{ translations[this.state.settingItems.language].deleteNotebookConfirm }
						<span className = "delete-confirm-title">{ this.state.currentNotebook.title }</span>
						? </div>) ,
					(<div>{ translations[this.state.settingItems.language].deleteBookConfirmDetail }</div>) ,
					this.state.isModalOpen ,
					() => {
						this.deleteNotebook();
						this.handleCloseModal();
					} ,
					this.handleCloseModal ,
					"danger" ,
					`${ translations[this.state.settingItems.language].done }` ,
					`${ translations[this.state.settingItems.language].cancel }`,
				)
			) : null }
			
			{/*  恢复删除笔记确认框*/ }
			{ this.state.activeModal === 'recoverConfirm' &&
				<RecoverDeletedNoteConfirm
					onCancel = { this.handleCloseModal }
					open = { this.state.isModalOpen }
					noteListData = { this.state.noteListData }
					noteBookData = { this.state.noteBookData }
					currentID = { this.state.currentID }
					settingItems = { this.state.settingItems }
					allSorts = { this.state.allSorts }
					recoverDeletedNote = { this.handleRecoverDeletedNote }
					moveAndRecoverDeletedNote = { this.moveAndRecoverDeletedNote }
				/> }
			
			
			{/*  清空回收站确认框*/ }
			{ this.state.activeModal === 'clearRecycleConfirm' && useConfirmDialog(
				`${ translations[this.state.settingItems.language].clearTheCycle }` ,
				`${ translations[this.state.settingItems.language].clearCycleDetail }` ,
				this.state.isModalOpen ,
				() => {
					this.handleClearRecycleBin();
					this.handleCloseModal();
				} ,
				this.handleCloseModal ,
				'danger' ,
				`${ translations[this.state.settingItems.language].done }` ,
				`${ translations[this.state.settingItems.language].cancel }`,
			) }
		
		
		</div>;
	}
}


const useConfirmDialog = (title , content , open , clickOk , clickCancel , okType , okText , cancelText) => {
	confirm({
		icon : <ExclamationCircleFilled /> ,
		title : title ,
		content : content ,
		okText : okText ,
		okType : okType || "primary" ,
		cancelText : cancelText ,
		open : open ,
		destroyOnClose : true ,
		onOk () {
			clickOk();
		} ,
		onCancel () {
			clickCancel();
		} ,
	});
};


const DropDownIcon = () => {
	return <svg
		t = "1740763462331"
		className = "icon"
		viewBox = "0 0 1024 1024"
		version = "1.1"
		xmlns = "http://www.w3.org/2000/svg"
		p-id = "318414"
		width = "16"
		height = "16"
	>
		<path
			d = "M562.5 771c-14.3 14.3-33.7 27.5-52 23.5-18.4 3.1-35.7-11.2-50-23.5L18.8 327.3c-22.4-22.4-22.4-59.2 0-81.6s59.2-22.4 81.6 0L511.5 668l412.1-422.3c22.4-22.4 59.2-22.4 81.6 0s22.4 59.2 0 81.6L562.5 771z"
			p-id = "318415"
			fill = "#bfbfbf"
		></path>
	</svg>;
};
export default NotesApp;
