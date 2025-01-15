import React , { useEffect , useState , useRef } from 'react';
import { Component } from 'react';
import { convertFromRaw } from 'draft-js';
import './note.css';
import Masonry from 'masonry-layout';
import GetContentButton from '@src/Home/GetContentButton';
import dayjs from 'dayjs';
import { message , Tooltip } from 'antd';
import RichTextEditor from '../RichTextEditor/RichTextEditor';


const RenderContent = ({
	noteList ,
	changeNote ,
	deleteNote ,
	ShowMode ,
	currentNotebook ,
	pinNote ,
	favoriteNote ,//收藏笔记
	isShowFavorites ,//是否展示收藏夹笔记列表
	openModal ,
	onSave ,
	onCancel ,
}) => {
	const inputAddNoteRef = React.useRef();
	const wrapperRef = React.useRef();
	
	const [contents , setContents] = useState([]);
	const [isExpandNoteEditSection , setIsExpandNoteEditSection] = useState(false);
	
	let notes = noteList;
	let isShowFavoritesNotes = isShowFavorites;
	if ( currentNotebook.id === 'favorites-notes-id' ) {
		isShowFavoritesNotes = true;
	}
	const placeholders = [
		'输入笔记...' ,
		'记录你的闪光灵感✨' ,
		'有什么心得吗？在这里记录下来吧',
	];
	
	useEffect(() => {
		let currentIndex = 0;
		
		const intervalId = setInterval(() => {
			if ( inputAddNoteRef.current ) {
				currentIndex = (currentIndex + 1) % placeholders.length;
				inputAddNoteRef.current.placeholder=placeholders[currentIndex]
			}
		} , 5000);
		
		return () => clearInterval(intervalId); // 清理定时器，防止内存泄漏
	} , [placeholders]);
	
	useEffect(() => {
		if ( isShowFavoritesNotes ) {
			const FavoritesNotes = notes.filter(note => note.isFavorited === true);
			setContents(FavoritesNotes);
		} else {
			const currentNotes = notes.filter(note => note.notebookID === currentNotebook.id);
			setContents(currentNotes);
		}
	} , [currentNotebook , notes]);
	
	
	useEffect(() => {
		// 添加全局事件监听
		document.addEventListener('mousedown' , handleClickOutside);
		document.addEventListener('keydown' , handleEscapeKey);
		
		// 清除全局事件监听,相当于componentWillUnmount
		return () => {
			document.removeEventListener('mousedown' , handleClickOutside);
			document.removeEventListener('keydown' , handleEscapeKey);
		};
	} , [currentNotebook , notes , isExpandNoteEditSection]);
	const handleClickOutside = (event) => {
		// 如果点击的区域不在输入框范围内，收起输入框
		if ( wrapperRef.current && !wrapperRef.current.contains(event.target) ) {
			setIsExpandNoteEditSection(false);
		}
	};
	const handleEscapeKey = (event) => {
		// 如果按下 ESC 键，收起输入框
		if ( event.key === 'Escape' ) {
			setIsExpandNoteEditSection(false);
		}
	};
	const handleCancelEdit = () => {
		setIsExpandNoteEditSection(false);
	};
	const handleExpandNoteEditSection = () => {
		setIsExpandNoteEditSection(true);
	};
	const handleInputNote = (e) => {
		const textarea = inputAddNoteRef.current;
		textarea.style.height = "auto"; // 重置高度
		textarea.style.height = `${ textarea.scrollHeight }px`;//输入笔记内容时根据内容自动调整高度
		
	};
	const onAddNote = () => {
		
	};
	const onDeleteNote = (id) => {
		deleteNote(id);
		setContents(contents.filter(content => content.id !== id));
	};
	
	const onPinNote = (id) => {
		pinNote(id);
		setContents((prevNotes) => prevNotes.map((note) => note.id === id ? {
			...note ,
			isPinned : !note.isPinned ,
			pinnedTime : !note.isPinned ? Date.now() : null , // 置顶记录时间，取消置顶重置时间
		} : note));
	};
	
	const onFavoriteNote = (id) => {
		const targetNote = contents.find(note => note.id === id);
		//取消收藏时从收藏夹列表删除
		if ( currentNotebook.id === 'favorites-notes-id' && targetNote.isFavorited === true ) {
			setContents(contents.filter(content => content.id !== id));
		}
		
		favoriteNote(id);
		setContents((prevNotes) => prevNotes.map((note) => note.id === id ? {
			...note ,
			isFavorited : !note.isFavorited ,
			favoritedTime : !note.isFavorited ? Date.now() : null ,//记录收藏时间
		} : note));
	};
	
	let pinnedNotes;
	let otherNotes;
	if ( isShowFavoritesNotes ) {
		pinnedNotes = contents.sort((a , b) => b.favoritedTime - a.favoritedTime); // 按收藏时间降序排列，新收藏的排前面
	} else {
		pinnedNotes = contents.filter((note) => note.isPinned) // 已置顶的笔记
		.sort((a , b) => b.pinnedTime - a.pinnedTime); // 按置顶时间降序排列，新置顶的排前面
		otherNotes = contents.filter(note => !note.isPinned);
	}
	
	//通用部分
	class NoteList extends Component {
		render () {
			const {
				id ,
				noteContent ,
				noteTitle ,
				isPinned ,
				isFavorited ,
				itemClassName ,
				titleClassName ,
				notebook ,
			} = this.props;
			
			return <div
				key = { id }
				className = { `${ itemClassName } ${ currentNotebook.currentTheme }` }
				onClick = { () => changeNote(noteTitle , noteContent , id) }
			>
				{ noteTitle && <span className = "note-item-title">{ noteTitle }</span> }
				<span className = { `${ titleClassName }` }>{ convertFromRaw(noteContent).getPlainText() }</span>
				{/*note details : 时间 ,置顶 ,收藏 ,删除 , 显示收藏夹时显示所属书籍*/ }
				<div className = "note-details">
					<FormatTime id = { id } />
					{ isShowFavoritesNotes && <div
						className = { `show-note-book-text ${ currentNotebook.currentTheme }` }
					>|{ notebook }</div> }
					<div
						className = "note-operation-buttons"
						onClick = { (e) => {
							e.stopPropagation();
						} }
					>
						{ !isShowFavoritesNotes && <PinNoteIcon
							isPinned = { isPinned }
							handlePinNote = { () => {
								onPinNote(id);
							} }
						/> }
						
						<FavoriteIcon
							isFavorited = { isFavorited }
							handleFavoriteNote = { () => {
								onFavoriteNote(id);
							} }
						/>
						<div
							onClick = { () => {
								onDeleteNote(id);
							} }
						>
							<DeleteIcon />
						</div>
					
					</div>
				</div>
			</div>;
		}
	}
	
	class CardMode extends Component {
		render () {
			return <div>
				{ pinnedNotes.length > 0 && <div>
					{ !isShowFavoritesNotes && <p className = "note-list-sub-title">已置顶</p> }
					<div className = "note-card-mode">
						{ pinnedNotes.map(({
							id ,
							noteContent ,
							noteTitle ,
							isPinned ,
							isFavorited ,
							notebook ,
						}) => {
							return <NoteList
								id = { id }
								noteContent = { noteContent }
								noteTitle = { noteTitle }
								isPinned = { isPinned }
								isFavorited = { isFavorited }
								key = { id }
								itemClassName = "note-card-mode-item"
								titleClassName = "note-card-mode-content"
								notebook = { notebook }
							/>;
						}) }
					</div>
				</div> }
				
				{ !isShowFavoritesNotes && <div>{ otherNotes.length > 0 && <div>
					{ pinnedNotes.length > 0 && <p className = "note-list-sub-title">其他</p> }
					<div className = "note-card-mode">
						{ otherNotes.map(({
							id ,
							noteContent ,
							noteTitle ,
							isPinned ,
							isFavorited ,
							notebook ,
						}) => {
							return <NoteList
								id = { id }
								noteContent = { noteContent }
								noteTitle = { noteTitle }
								isPinned = { isPinned }
								isFavorited = { isFavorited }
								key = { id }
								itemClassName = "note-card-mode-item"
								titleClassName = "note-card-mode-content"
								notebook = { notebook }
							/>;
						}) }
					</div>
				</div> }</div> }
			
			</div>;
		}
	}
	
	class UlMode extends Component {
		render () {
			return <div>
				{ pinnedNotes.length > 0 && <div>
					{ !isShowFavoritesNotes && <p className = "note-list-sub-title">已置顶</p> }
					<div className = "note-ul-mode">
						{ pinnedNotes.map(({
							id ,
							noteContent ,
							noteTitle ,
							isPinned ,
							isFavorited ,
							notebook ,
						}) => {
							return <NoteList
								id = { id }
								noteContent = { noteContent }
								noteTitle = { noteTitle }
								isPinned = { isPinned }
								isFavorited = { isFavorited }
								key = { id }
								itemClassName = "note-ul-mode-item"
								titleClassName = "note-ul-mode-content"
								notebook = { notebook }
							/>;
						}) }
					</div>
				</div> }
				
				{ !isShowFavoritesNotes && <div>{ otherNotes.length > 0 && <div>
					{ pinnedNotes.length > 0 && <p className = "note-list-sub-title">其他</p> }
					<div className = "note-ul-mode">
						{ otherNotes.map(({
							id ,
							noteContent ,
							noteTitle ,
							isPinned ,
							isFavorited ,
							notebook ,
						}) => {
							return <NoteList
								id = { id }
								noteContent = { noteContent }
								noteTitle = { noteTitle }
								isPinned = { isPinned }
								isFavorited = { isFavorited }
								key = { id }
								itemClassName = "note-ul-mode-item"
								titleClassName = "note-ul-mode-content"
								notebook = { notebook }
							/>;
						}) }
					</div>
				</div> }</div> }
			
			</div>;
		}
	}
	
	class GridMode extends Component {
		constructor (props) {
			super(props);
			this.gridRefPinned = React.createRef(); // 使用一个 ref 引用已置顶笔记的 DOM 元素
			this.gridRefOther = React.createRef(); // 使用另一个 ref 引用其他笔记的 DOM 元素
		}
		
		componentDidMount () {
			// 确保在组件挂载后初始化 Masonry 砖石/瀑布流布局
			if ( this.gridRefPinned.current ) {
				this.masonryPinned = new Masonry(this.gridRefPinned.current , {
					itemSelector : '.note-grid-mode-item' , // grid-item 选择器
					columnWidth : '.note-grid-mode-item' , // 每个 item 的宽度
					percentPosition : true , // 设置百分比定位
					gutter : 16 , // 设置间距
				});
			}
			if ( this.gridRefOther.current ) {
				this.masonryOther = new Masonry(this.gridRefOther.current , {
					itemSelector : '.note-grid-mode-item' ,
					columnWidth : '.note-grid-mode-item' ,
					percentPosition : true ,
					gutter : 16 ,
				});
			}
		}
		
		componentDidUpdate () {
			// 如果已置顶的笔记更新，重新布局
			if ( this.masonryPinned ) {
				this.masonryPinned.layout();
			}
			// 如果其他笔记更新，重新布局
			if ( this.masonryOther ) {
				this.masonryOther.layout();
			}
		}
		
		componentWillUnmount () {
			// 在组件卸载时销毁 Masonry 实例
			if ( this.masonryPinned ) {
				this.masonryPinned.destroy();
			}
			if ( this.masonryOther ) {
				this.masonryOther.destroy();
			}
		}
		
		render () {
			return (<div>
				{ pinnedNotes.length > 0 && (<div>
					{ !isShowFavoritesNotes && <p className = "note-list-sub-title">已置顶</p> }
					<div
						className = "note-grid-mode"
						ref = { this.gridRefPinned }
					>
						{ pinnedNotes.map(({
							id ,
							noteContent ,
							noteTitle ,
							isPinned ,
							isFavorited ,
							notebook ,
						}) => {
							return <NoteList
								id = { id }
								noteContent = { noteContent }
								noteTitle = { noteTitle }
								isPinned = { isPinned }
								isFavorited = { isFavorited }
								key = { id }
								itemClassName = "note-grid-mode-item"
								titleClassName = "note-grid-mode-content"
								notebook = { notebook }
							/>;
						}) }
					</div>
				</div>) }
				{ !isShowFavoritesNotes && <div>{ otherNotes.length > 0 && (<div>
					{ pinnedNotes.length > 0 && <p className = "note-list-sub-title">其他</p> }
					
					<div
						className = "note-grid-mode"
						ref = { this.gridRefOther }
					>
						{ otherNotes.map(({
							id ,
							noteContent ,
							noteTitle ,
							isPinned ,
							isFavorited ,
							notebook ,
						}) => {
							return <NoteList
								id = { id }
								noteContent = { noteContent }
								noteTitle = { noteTitle }
								isPinned = { isPinned }
								isFavorited = { isFavorited }
								key = { id }
								itemClassName = "note-grid-mode-item"
								titleClassName = "note-grid-mode-content"
								notebook = { notebook }
							/>;
						}) }
					</div>
				</div>) }</div> }
			</div>);
		}
	}
	
	
	const FormatTime = ({ id }) => {
		const [timeIDArray , setTimeIDArray] = useState([]);
		
		useEffect(() => {
			const fetchTimeArray = () => {
				
				let initialTimeArray = notes.map(({
					id ,
					saveTime ,
				}) => ({
					id ,
					saveTime ,
					relativeTime : convertTimestampsToRelativeTimes(saveTime) ,
				}));
				setTimeIDArray(initialTimeArray);
			};
			
			fetchTimeArray();
			
			const timer = setInterval(() => {
				
				setTimeIDArray(prevTimeIDArray => {
					return prevTimeIDArray.map(item => {
						
						const newRelativeTime = convertTimestampsToRelativeTimes(item.saveTime);
						if ( item.relativeTime === newRelativeTime ) return item; // 不变时直接返回
						return {
							...item ,
							relativeTime : newRelativeTime ,
						};
					});
				});
				
			} , 3000);
			
			return () => {
				clearInterval(timer);
			};
		} , []);
		
		return (<div className = "note-time">{ timeIDArray.find(item => item.id === id)?.relativeTime }</div>);
		
	};
	
	return (<div className = "show-mode-box">
		{/*输入笔记区*/ }
		{ currentNotebook.id !== 'favorites-notes-id' && <div className = "add-new-note-section">
			{ isExpandNoteEditSection ? <div
				ref = { wrapperRef }
				className = { `note-info-input-section ${ currentNotebook.currentTheme }` }
			>
				<div className = "input-and-edit">
					
					<RichTextEditor
						onSave = { onSave }
						onCancel = { onCancel }
						showAllOptions = { false }
						openModal = { openModal }
						cancelExpandNoteEditSection = { handleCancelEdit }
						changeNoteEdit = { changeNote }
					/>
				</div>
				<div className = "edit-item-cancel-button">
					<CancelEditIcon handleCancel = { handleCancelEdit } />
				</div>
			</div> : <input
				  ref = { inputAddNoteRef }
				  onClick = { handleExpandNoteEditSection }
				  type = "text"
				  className = { `add-note-input ${ currentNotebook.currentTheme }` }
				  placeholder = "输入笔记内容..."
			  /> }
		</div> }
		
		{ contents.length === 0 ? (<div className = {`empty-container ${currentNotebook.currentTheme}`}>
			<EmptyIcon />
			{ isShowFavoritesNotes ? <p>收藏夹空空如也</p> : <p>还没有笔记 , 点击上方输入框创建吧 !</p> }
		</div>) : (<div className = "show-noteList-box">
			{ ShowMode === 'list-mode' && <UlMode /> }
			{ ShowMode === 'grid-mode' && <GridMode /> }
			{ ShowMode === 'card-mode' && <CardMode /> }
		</div>) }
	</div>);
};


const convertTimestampsToRelativeTimes = (timestamp) => {
	const now = dayjs(); // 当前时间
	const timestampDay = dayjs(timestamp); // 时间戳对应的时间
	
	const durationSeconds = (now.valueOf() - timestamp) / 1000; // 时间差（秒）
	const durationMinutes = durationSeconds / 60; // 时间差（分钟）
	const durationHours = durationMinutes / 60; // 时间差（小时）
	
	// 1. 判断最近的时间段
	if ( durationSeconds < 3 ) {
		return '刚刚';
	}
	if ( durationSeconds < 60 ) {
		return Math.round(durationSeconds) + '秒前';
	}
	if ( durationMinutes < 60 ) {
		return Math.round(durationMinutes) + '分钟前';
	}
	if ( durationHours < 2 ) {
		return Math.round(durationHours) + '小时前';
	}
	if ( timestampDay.isSame(now , 'day') ) {
		return '今天 ' + timestampDay.format('HH:mm:ss');
	}
	
	// 2. 判断是否昨天
	if ( timestampDay.isSame(now.subtract(1 , 'day') , 'day') ) {
		return '昨天 ' + timestampDay.format('HH:mm');
	}
	
	// 3. 其他日期，直接显示完整日期时间
	return timestampDay.format('YYYY/MM/DD HH:mm');
};


const EmptyIcon = () => {
	return <svg
		t = "1732626472883"
		className = "icon"
		viewBox = "0 0 1133 1024"
		version = "1.1"
		xmlns = "http://www.w3.org/2000/svg"
		p-id = "20098"
		width = "80"
		height = "80"
	>
		<path
			d = "M252.427907 254.809302a40.483721 40.483721 0 0 0 80.967442 0 40.483721 40.483721 0 0 0-80.967442 0c0 22.35654 0 0 0 0zM438.176744 264.334884a40.483721 40.483721 0 0 0 80.967442 0 40.483721 40.483721 0 0 0-80.967442 0c0 22.35654 0 0 0 0zM674.268279 670.639033c-1.924167-1.728893-4.700874-1.300242-6.405953 0.647739-1.709842 1.943219-1.285953 4.753265 0.638214 6.482158 0 0 3.205358 2.810047 8.544446 7.572837 0.85254 0.857302 1.919405 1.081153 2.991033 1.081154 1.281191 0 2.557619-0.428651 3.419683-1.514568a4.553228 4.553228 0 0 0-0.428651-6.48692c-5.343851-4.753265-8.544447-7.572837-8.758772-7.7824z m25.204688 23.3472c-1.919405-1.728893-4.696112-1.728893-6.405953 0.219088-1.705079 1.943219-1.709842 4.758028 0.214326 6.482158 5.553414 5.405767 10.892502 10.592447 15.807702 15.783888 0.85254 0.862065 2.13373 1.514567 3.205358 1.514568 1.066865 0 2.348056-0.428651 3.205358-1.295479 1.709842-1.728893 1.919405-4.758028 0.214326-6.486921a1160.015777 1160.015777 0 0 0-16.241117-16.217302z m157.862698 85.615925c-7.477581 1.947981-14.526512 3.462549-21.361116 4.53894-2.557619 0.433414-4.272223 2.810047-3.843572 5.191442 0.428651 2.381395 2.348056 3.8912 4.481786 3.8912h0.642977c7.04893-1.081153 14.740837-2.810047 22.427981-4.758028a4.686586 4.686586 0 0 0 3.205358-5.620093c-0.638214-2.381395-3.205358-3.8912-5.553414-3.243461z m81.605656-34.158735a287.062921 287.062921 0 0 1-19.870363 10.159033 4.5056 4.5056 0 0 0-2.13373 6.05827c0.85254 1.728893 2.348056 2.590958 4.057898 2.590958 0.638214 0 1.281191-0.219088 1.919404-0.433414a444.720819 444.720819 0 0 0 20.084689-10.382884c2.13373-1.290716 2.98627-3.886437 1.919404-6.26307a4.248409 4.248409 0 0 0-5.982065-1.733656v0.004763z m-39.950288 19.460763a312.324763 312.324763 0 0 1-20.722903 8.001488 4.596093 4.596093 0 0 0-2.776707 5.834419c0.638214 1.943219 2.352819 3.024372 4.272224 3.024372 0.428651 0 1.071628 0 1.495516-0.214325a382.213953 382.213953 0 0 0 21.14679-8.215814c2.352819-1.085916 3.424447-3.676874 2.352819-6.053507-0.85254-2.162307-3.419684-3.462549-5.762977-2.381396h-0.004762z m78.395534-41.945898c-6.405953 4.105526-12.811907 8.001488-19.008297 11.668838-2.138493 1.300242-2.991033 4.110288-1.709842 6.272595 0.857302 1.514567 2.352819 2.381395 3.848335 2.381395 0.85254 0 1.495516-0.219088 2.348056-0.647739 6.191628-3.676874 12.81667-7.572837 19.227386-11.678363a4.59133 4.59133 0 0 0 1.495516-6.267833c-1.281191-2.162307-4.057898-3.24346-6.191628-1.728893h-0.004763z m-163.201786 63.130791h-1.066865c-7.263256 0-14.09786-0.64774-20.294251-1.947981-2.562381-0.428651-4.910437 1.085916-5.343851 3.676874-0.428651 2.590958 1.071628 4.972353 3.634009 5.405768 6.834605 1.514567 14.312186 2.162307 22.213656 2.162307h1.071628a4.53894 4.53894 0 0 0 4.486549-4.53894 4.634195 4.634195 0 0 0-4.700875-4.758028zM1111.540093 661.551628l1.495516-3.024372h1.495517c6.834605 0 12.392781-5.620093 12.392781-12.540428S1121.370493 633.451163 1114.531126 633.451163c-6.834605 0-12.383256 5.620093-12.383256 12.540428 0 3.024372 1.066865 6.048744 2.98627 8.215814l-2.138493 4.324614a41.874456 41.874456 0 0 0-7.477582-0.64774c-8.544447 0-16.236353 2.810047-22.642307 7.572837l-6.834605-6.272595c0.85254-1.728893 1.281191-3.462549 1.281191-5.405768 0-6.915572-5.553414-12.540428-12.392781-12.540427-6.834605 0-12.388019 5.620093-12.388019 12.540427s5.553414 12.540428 12.388019 12.540428c1.714605 0 3.205358-0.428651 4.486549-0.862065l6.620279 6.267833a31.039107 31.039107 0 0 0-3.843572 5.405767 35.701879 35.701879 0 0 0-5.129526-1.514567c-0.214326 0-0.428651 0-0.428651-0.219089a48.932912 48.932912 0 0 0-9.825637-1.081153c-19.222623 0-35.244651 17.946195-37.378382 28.972056-1.285953-0.433414-2.562381-0.219088-3.848335 0.647739-3.205358 2.162307-6.405953 4.324614-9.396986 6.482158-2.13373 1.300242-2.776707 4.324614-1.28119 6.486921a4.762791 4.762791 0 0 0 3.843572 2.162307c0.857302 0 1.714605-0.219088 2.562381-0.862065a230.28093 230.28093 0 0 0 9.182661-6.272595c3.848335 10.382884 16.450679 22.69946 31.620167 24.861767h0.428651c1.276428 0.219088 2.771944 0.219088 4.053135 0.219089a43.33187 43.33187 0 0 0 20.722902-5.191442c0.428651-0.214326 0.642977-0.428651 1.071628-0.64774 1.495516-0.857302 2.991033-1.943219 4.272224-3.024372 6.405953 4.53894 14.09786 7.348986 22.432744 7.348986 21.146791 0 38.445247-17.508019 38.445246-38.912 0.214326-15.350474-8.968335-28.75773-22.004093-35.025563h0.004763z m-56.820093-4.324614a3.39587 3.39587 0 0 1-3.419684-3.457786c0-1.947981 1.495516-3.462549 3.419684-3.462549 1.919405 0 3.419684 1.514567 3.419684 3.462549a3.39587 3.39587 0 0 1-3.419684 3.457786z m59.5968-14.483647c1.919405 0 3.419684 1.514567 3.419684 3.462549a3.39587 3.39587 0 0 1-3.419684 3.457786 3.39587 3.39587 0 0 1-3.419684-3.457786c0-1.947981 1.495516-3.462549 3.419684-3.462549z m-95.913079 63.130791c0-2.381395 3.843572-8.868316 9.825637-14.054995-0.428651 1.295479-0.638214 2.810047-0.852539 4.324614-1.281191 8.001488-0.638214 17.727107 2.776707 26.162009-7.263256-5.191442-11.749805-12.540428-11.749805-16.431628z m28.410046 22.266047h-1.709841c-8.758772-7.568074-10.254288-20.537153-8.758773-30.481861 1.285953-8.215814 4.272223-11.892688 5.129526-12.321339 0.638214-0.219088 1.066865-0.64774 1.495516-1.085917 1.285953-0.214326 2.562381-0.428651 3.848335-0.428651h0.209563c-2.776707 5.405767-4.481786 12.535665-4.272223 19.456 0.428651 9.944707 4.700874 18.374847 11.96413 23.780614a31.724949 31.724949 0 0 1-7.906233 1.081154z m18.374847-5.401005c-10.68294-4.53894-13.245321-13.19293-13.459647-19.889414-0.428651-8.43014 2.776707-15.350474 5.129526-17.727107 0.638214 0.214326 1.066865 0.428651 1.705079 0.428651a38.611944 38.611944 0 0 0-1.705079 11.244949c0 9.511293 3.419684 18.374847 9.18266 25.295181-0.214326 0.219088-0.428651 0.428651-0.857302 0.64774z m30.115126 3.8912c-16.236353 0-29.262586-13.407256-29.262587-29.619795 0-16.21254 13.240558-29.619795 29.262587-29.619796 16.022028 0 29.267349 13.407256 29.267348 29.619796 0 16.21254-13.030995 29.619795-29.267348 29.619795z"
			p-id = "20099"
		></path>
		<path
			d = "M1071.627907 692.986047a7.144186 7.144186 0 1 0 14.288372 0 7.144186 7.144186 0 1 0-14.288372 0c0 3.948353 0 0 0 0zM1104.967442 692.986047a7.144186 7.144186 0 1 0 14.288372 0 7.144186 7.144186 0 1 0-14.288372 0c0 3.948353 0 0 0 0zM837.917767 215.016186c5.372428-1.72413 27.281265 4.096 43.822438 20.041823 8.811163 8.615888 18.26054 22.623256 13.321525 40.721861a9.439851 9.439851 0 0 0 6.22973 11.421172c0.857302 0.219088 1.714605 0.428651 2.571907 0.428651 4.081712 0 7.734772-2.581433 8.811163-6.677433 5.796316-20.903888-0.64774-42.01734-18.260539-59.044316-18.26054-17.669953-47.475498-29.091126-62.297303-24.347386-4.729451 1.509805-7.525209 6.677433-6.015404 11.635498 1.92893 4.74374 7.087033 7.329935 11.811721 5.82013z m6.658382-48.699535c5.801079-1.081153 42.317395 1.076391 69.170009 23.270996 19.979907 16.593563 30.077023 40.297972 30.077023 70.251162 0 5.167628 4.081712 9.263628 9.020726 9.263628s9.239814-4.096 9.239814-9.049302c0.214326-35.987647-12.245135-64.431033-36.735405-84.687182-30.72-25.214214-72.180093-29.519777-84.425228-27.147906-4.939014 1.076391-8.163423 5.810605-7.087032 10.768669a9.373172 9.373172 0 0 0 10.740093 7.325172zM197.112856 715.585488c-62.945042-16.160149-54.781619-92.445767-54.352968-95.674939 0.64774-4.953302-3.000558-9.697042-7.949097-10.344782-4.939014-0.642977-9.668465 3.019609-10.311442 7.972912-0.214326 0.862065-2.790995 23.918735 3.867386 49.347274 9.239814 34.911256 31.36774 57.963163 64.011907 66.369489 0.862065 0.214326 1.509805 0.214326 2.367107 0.214325 4.081712 0 7.734772-2.800521 8.811163-6.89652 1.505042-4.738977-1.505042-9.906605-6.444056-10.987759z"
			p-id = "20100"
		></path>
		<path
			d = "M707.741172 830.268726l1.081154-10.763907 82.858269-36.16387a13.240558 13.240558 0 0 0 3.453024-2.581433l183.843721-218.48826a9.049302 9.049302 0 0 0 0.428651-11.192558c-2.376633-3.44826-6.906047-4.738977-10.787721-3.233935l-59.553935 23.680595V445.811498c0-2.795758-1.295479-5.381953-3.453023-7.101321a9.220763 9.220763 0 0 0-7.772875-1.72413l-80.481637 18.727293-14.240744-21.308726c42.293581-11.625972 73.580353-50.371274 73.580353-96.441749 0-55.105488-44.879777-99.875721-100.118623-99.875721s-100.11386 44.770233-100.11386 99.875721c0 6.67267 0.642977 13.34534 1.938455 19.803684l-80.052986 6.239256V281.352335C598.349395 126.142512 471.897302 0 316.33027 0 160.753712 0 34.311144 126.142512 34.311144 281.347572v592.614995C12.0832 886.879256 0 901.08666 0 915.937042 0 975.567181 196.788986 1024 439.748465 1024c242.964242 0 439.748465-48.437581 439.748465-108.062958-0.857302-34.873153-67.75546-65.869395-171.755758-85.673079v0.004763z m26.109619-41.764912l15.964874-18.293879 0.64774 1.285953c1.938456 2.586195 4.096 4.953302 6.253544 7.106084l-22.870921 9.906605z m171.108018-195.66973l36.035275-14.426493-159.029582 189.001823-15.745786 6.886995a45.403684 45.403684 0 0 1-8.420614-8.606362 5.015219 5.015219 0 0 0-2.586195-1.724131l149.746902-171.131832z m-14.669395-135.401377v120.974884l-256.985898 76.85239-6.691721-136.263441 263.677619-61.568596v0.004763z m-114.149805-200.837358c45.098865 0 81.781879 36.592521 81.781879 81.586604 0 44.984558-36.683014 81.581842-81.777116 81.581842-45.103628 0-81.781879-36.597284-81.781879-81.586604 0-44.989321 36.683014-81.586605 81.777116-81.586605z m-92.779162 119.255516c14.883721 36.378195 50.918995 62.211572 92.779162 62.211572 2.157544 0 4.529414 0 6.691721-0.219088l14.888484 22.385116-182.76733 42.626977a9.287442 9.287442 0 0 0-7.120372 9.468428l5.824893 119.68893-146.727293-239.158772 216.421209-17.007926h0.004763z m-308.562159 244.321637c0-27.124093-10.787721-51.661991-28.481488-69.527218L450.750512 401.250828l147.160707 239.806512-97.527666-56.400968c-3.886437-2.152781-8.630177-1.290716-11.654548 1.933693L346.969302 752.559033l-24.1664-44.989321c30.858121-16.788837 52.004912-49.723535 52.004912-87.39721z m-100.332948 81.586605c-45.098865 0-81.777116-36.597284-81.777117-81.586605 0-44.989321 36.678251-81.586605 81.777117-81.586604 45.094102 0 81.777116 36.597284 81.777116 81.586604 0 44.989321-36.683014 81.586605-81.777116 81.586605z m137.449376 254.866456c-28.052837 3.662586-60.201674 5.810605-96.236949 5.810604-172.836912 0-248.789135-54.029098-263.677618-65.869395V281.357098c0-145.088893 118.245805-263.04893 263.677618-263.048931s263.677619 117.960037 263.677619 263.048931v84.158511l-128.8192 9.906605c-0.219088 0-0.64774 0.214326-0.862065 0.214326h-0.64774l-1.938455 0.647739a4.686586 4.686586 0 0 0-1.728893 1.076391l-1.724131 1.72413-111.558846 159.296298a99.151777 99.151777 0 0 0-57.605954-18.298642c-55.243609 0-100.118623 44.770233-100.118623 99.875721 0 55.105488 44.879777 99.885247 100.113861 99.885246 11.002047 0 21.365879-1.72413 31.291534-4.953302l28.267163 52.524056-48.3328 56.400967a8.477767 8.477767 0 0 0-1.943218 7.749061c0.64774 2.800521 2.376633 5.167628 4.962828 6.458344l128.8192 63.068874-5.610568 55.538903h-0.004763z m-104.438474-129.58601l44.451125-52.095404 0.428652-0.428651 145.431814-170.060205 112.635237 65.012093-185.567851 215.044763-117.38374-57.472596h0.004763z m376.312856 62.211573l-254.828354 83.301209L436.081116 903.025116l253.537637-76.847628-5.829655 63.073638z m-228.718735-11.192559l174.989693-202.780576 241.668763-72.108651-126.447331 144.43639-0.214325-0.214325c-4.315088-5.596279-9.063591-11.621209-14.459833-17.650903-1.72413-1.938456-4.524651-2.152781-6.472632-0.428651-1.938456 1.719367-2.157544 4.515126-0.428651 6.453582a382.356837 382.356837 0 0 1 14.026418 17.222251c0.428651 0.64774 1.076391 1.081153 1.72413 1.290716l-44.665451 51.019014-239.725544 72.756391z"
			p-id = "20101"
		></path>
	</svg>;
};

class DeleteIcon extends Component {
	render () {
		return <div className = "note-buttons-common">
			<svg
				t = "1734625609334"
				className = "delete-note-icon"
				viewBox = "0 0 1024 1024"
				version = "1.1"
				xmlns = "http://www.w3.org/2000/svg"
				p-id = "84258"
				width = "16"
				height = "16"
			>
				<path
					d = "M725.333333 170.666667h213.333334v85.333333h-85.333334v640a42.666667 42.666667 0 0 1-42.666666 42.666667H213.333333a42.666667 42.666667 0 0 1-42.666666-42.666667V256H85.333333V170.666667h213.333334V85.333333h426.666666v85.333334zM384 384v341.333333h85.333333V384H384z m170.666667 0v341.333333h85.333333V384h-85.333333z"
					p-id = "84259"
					fill = "#bfbfbf"
				></path>
			</svg>
		</div>;
	}
}

class FavoriteIcon extends Component {
	
	state = {
		isFavorite : this.props.isFavorited ,
	};
	handleFavorite = () => {
		this.setState({ isFavorite : !this.state.isFavorite } , () => {
			console.log(this.state.isFavorite);
		});
	};
	
	render () {
		const {
			isFavorited ,
			handleFavoriteNote ,
		} = this.props;
		return <div
			className = "note-buttons-common star-container"
			onClick = { () => {
				handleFavoriteNote();
				this.handleFavorite();
				// this.setState({isFavorite:!this.state.isFavorite})
			} }
		>
			<svg
				t = "1734625347615"
				className = { this.state.isFavorite ? 'star-button-active' : 'star-button' }
				viewBox = "0 0 1024 1024"
				version = "1.1"
				xmlns = "http://www.w3.org/2000/svg"
				p-id = "74981"
				width = "16"
				height = "16"
			>
				<path
					d = "M1003.52 390.826667c-6.826667-20.48-23.893333-34.133333-44.373333-37.546667l-273.066667-42.666667L563.2 49.493333C554.666667 29.013333 534.186667 17.066667 512 17.066667s-40.96 11.946667-51.2 32.426666l-122.88 261.12-273.066667 40.96c-20.48 3.413333-37.546667 17.066667-44.373333 37.546667-6.826667 20.48-1.706667 42.666667 13.653333 56.32l199.68 204.8L186.026667 938.666667c-3.413333 20.48 5.12 42.666667 23.893333 54.613333 17.066667 11.946667 40.96 13.653333 59.733333 3.413333L512 865.28l244.053333 136.533333c8.533333 3.413333 17.066667 6.826667 25.6 6.826667 30.72 0 56.32-25.6 56.32-56.32 0-6.826667-1.706667-11.946667-3.413333-17.066667l-44.373333-279.893333 199.68-204.8c15.36-17.066667 20.48-39.253333 13.653333-59.733333z"
					fill = "#bfbfbf"
					p-id = "74982"
				></path>
			</svg>
		</div>;
	}
}

const PinNoteIcon = ({
	isPinned ,
	handlePinNote ,
}) => {
	const [pin , setPin] = useState(isPinned); // 本地状态，初始化为 isPinned
	return <div
		className = "note-buttons-common"
		onClick = { () => {
			setPin(!pin);
			handlePinNote();
		} }
	>
		<svg
			t = "1734625720322"
			className = { `pin-note-button ${ pin ? 'pin-note' : '' }` }
			viewBox = "0 0 1024 1024"
			version = "1.1"
			xmlns = "http://www.w3.org/2000/svg"
			p-id = "85415"
			width = "16"
			height = "16"
		>
			<path
				d = "M951.296 424.96L1024 352.256 671.744 0 599.04 72.704l70.144 70.656-168.96 168.96a296.96 296.96 0 0 0-286.72 75.264L143.36 458.24 72.704 387.584 0 460.8l245.248 245.248-139.776 139.776 72.704 72.704 140.288-140.288L563.2 1024l72.704-72.704-70.144-70.656 70.144-70.144a296.96 296.96 0 0 0 75.776-287.232l168.96-168.96z"
				fill = "#bfbfbf"
				p-id = "85416"
			></path>
		</svg>
	</div>;
};

class AddNewNotebtn extends Component {
	constructor () {
		super();
	}
	
	render () {
		const {
			onClick ,
		} = this.props;
		return <div>
			<Tooltip
				title = "添加笔记"
				placement = "bottom"
				zIndex = "1"
			>
				<div
					className = "add-new-button"
					onClick = { onClick }
				>
					<svg
						t = "1736084509838"
						className = "icon"
						viewBox = "0 0 1024 1024"
						version = "1.1"
						xmlns = "http://www.w3.org/2000/svg"
						p-id = "128954"
						width = "16"
						height = "16"
					>
						<path
							d = "M482 481.3V130.1c0-17.6 14.3-31.9 31.9-31.9 17.6 0 31.9 14.3 31.9 31.9v351.2H897c17.6 0 31.9 14.3 31.9 31.9 0 17.6-14.3 31.9-31.9 31.9H545.8v351.2c0 17.6-14.3 31.9-31.9 31.9-17.6 0-31.9-14.3-31.9-31.9V545.1H130.8c-17.6 0-31.9-14.3-31.9-31.9 0-17.6 14.3-31.9 31.9-31.9H482z"
							p-id = "128955"
							fill = "#515151"
						></path>
					</svg>
				</div>
			</Tooltip>
		</div>;
		
	}
}

const CancelEditIcon = ({ handleCancel }) => {
	return <>
		<Tooltip
			color='gray'
			title = "取消编辑"
			placement = "bottom"
			zIndex = "1"
		>
			<svg
				onClick = { handleCancel }
				t = "1736085320917"
				className = "icon"
				viewBox = "0 0 1024 1024"
				version = "1.1"
				xmlns = "http://www.w3.org/2000/svg"
				p-id = "136123"
				width = "14"
				height = "14"
			>
				<path
					d = "M103.34374999 866.46875001l354.65625001-354.65625001L103.34374999 157.0625c-14.90625001-14.90625001-14.90625001-39.09375001 2e-8-54 14.90625001-14.90625001 39.09375001-14.90625001 54 0L512 457.71874999 866.75 103.0625c14.90625001-14.90625001 39.09375001-14.90625001 54 0 14.90625001 14.90625001 14.90625001 39.09375001 0 54L566 511.71874999 920.75 866.46875001c14.90625001 14.90625001 14.90625001 39.09375001 0 53.99999998-7.50000001 7.40625001-17.25 11.15625001-27 11.15625001s-19.50000001-3.75-27-11.15625001L512.09375001 565.71875001 157.34374999 920.375c-7.50000001 7.40625001-17.25 11.15625001-26.99999998 11.15625001-9.75 0-19.50000001-3.75-27-11.15625001-14.90625001-14.90625001-14.90625001-39 0-53.90625001z"
					fill = "#707070"
					p-id = "136124"
				></path>
			</svg>
		</Tooltip>
	</>;
};
export default RenderContent;
