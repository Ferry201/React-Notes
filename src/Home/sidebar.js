import { ResizableBox } from 'react-resizable';
import 'react-resizable/css/styles.css';
import React , {
	Component ,
	useState ,
	createRef ,
} from 'react';
import { UserOutlined } from '@ant-design/icons';
import {
	Avatar ,
	Space ,
	Divider ,
	message ,
	Collapse ,
	Popover ,
	Tooltip , Dropdown,
} from 'antd';
import './note.css';
import {
	DownOutlined ,
	UpOutlined ,
} from '@ant-design/icons';
import { v4 as uuidv4 } from 'uuid';
import dayjs from "dayjs";
import coverDefault from './img-collection/cover-default.png';


@reaxper
export class NoteSidebar extends Component {
	constructor (props) {
		super(props);
		this.searchInputRef = React.createRef();
		this.renameInputRef=React.createRef()
	}
	
	state = {
		siderbarWidth : 448 ,
		searchKeyword : '' ,
		isRenameSort:false,
	};
	
	componentDidUpdate (prevProps,prevState) {
		if ( prevProps.currentNotebook.id === 'searchResults-notes-id' && this.props.currentNotebook.id !== 'searchResults-notes-id' ) {
			this.setState({
				searchKeyword : '' ,
			});
		}
	}
	componentDidMount () {
		if(this.props.currentNotebook.title){
			this.setState({activeItem:this.props.currentNotebook.title})
		}
	}
	
	handleSetWidth = (width) => {
		this.setState({ siderbarWidth : width });
	};
	
	handleFocusSearchInput = () => {
		this.searchInputRef.current.focus();
	};
	
	handleImageError = (e) => {
		if ( e.target.src !== coverDefault ) {  // 仅当图片的 src 不是默认封面时才替换
			e.target.src = coverDefault; // 设置默认封面
			message.error('图片加载失败，使用默认封面');
		}
	};
	
	
	
	handleSearchKeyword = (keyword) => {
		this.setState({ searchKeyword : keyword } , () => {
			this.props.setSearchKeyword(keyword);
		});
	};
	handleKeyDown = (e) => {
		if ( e.key === 'Enter' ) {
			this.handleBlurRenameInput(e);
		}
	};
	handleBlurRenameInput = (e) => {
		this.setState({ isRenameSort : false } , () => {
			this.props.renameSort(e.target.value);
		});
	};
	handleClickRename = (id) => {
		this.setState({ isRenameSort : true } , () => {
			setTimeout(() => {
				if (this.renameInputRef.current) {
					this.renameInputRef.current.focus();
				}
			}, 0);
			this.props.handleClickRenameSort(id);
		});
	};
	
	render () {
		const {
			siderCollapsed ,
			resizing ,
			toggleResizing ,
		} = reaxel_sider();
		
		let notebooks = this.props.noteBookArray.filter(notebook => notebook.id !== 'favorites-notes-id' && notebook.id !== 'searchResults-notes-id' && notebook.id !== 'recycle-notes-id');
		
		const NotebookSortAndOperates = ({
			title ,
			id ,
			isCollapse,
			notebooksInSort,
		}) => {
			return <div
				className = "notebook-operation-bar"
				onClick = { () => {
					this.props.handleClickCollapse(id);
				} }
			>
				<div className = "notebook-amount">
					<span className = { `expand-sort-notebook-icon ${ isCollapse ? 'fold-sort-icon' : "" }` }><ExpandSortNotebookIcon /></span>
					{ this.state.isRenameSort && this.props.currentSortId === id ? <input
						defaultValue = { title }
						onBlur = { this.handleBlurRenameInput }
						onKeyDown = { this.handleKeyDown }
						ref = { this.renameInputRef }
						className = "rename-sort-input"
					/> :
						  <span>{ title }({ notebooksInSort.length })</span>
					   }</div>
				
				
				<span
					className = "add-and-more-button"
					onClick = { (e) => {
						e.stopPropagation();
					} }
				>
					<ListSortOptions
						handleClickDeleteSort = { this.props.handleClickDeleteSort }
						id = { id }
						isCollapse = { isCollapse }
						handleClickRename = { this.handleClickRename }
						handleClickCollapse = { this.props.handleClickCollapse }
					/>
					
					<Tooltip
						title = "添加笔记本"
						placement = "top"
						zIndex = "1"
						arrow = { false }
					>
						<span
							className = "add-notebook-icon-box"
							onClick = { () => {
								this.props.handleClickAddNotebook(id);
							} }
						>
							<AddNewBookIcon />
						</span>
					</Tooltip>
				</span>
			</div>;
		}
		
		return <div
			style = { {
				height : '100%' , // width : siderCollapsed ? '0px' : 'unset' ,
				display : 'inline-block' , // position:"relative",
				transform : `translateX(-${ (siderCollapsed ? this.state.siderbarWidth + 100 : 0) }px)` ,
				transition : resizing ? 'unset' : 'all ease .3s 0s' ,
			} }
		>
			<ResizableBox
				width = { siderCollapsed ? 0 : this.state.siderbarWidth }
				axis = "x" // 只允许水平拖动
				minConstraints = { [
					356 ,
					0 ,
				] } // 设置最小宽度
				maxConstraints = { [
					550 ,
					0 ,
				] } // 设置最大宽度
				resizeHandles = { ['e'] } // 右边缘 east
				onResizeStart = { (e , data) => {
					toggleResizing(true);
					
				} }
				onResizeStop = { (e , data) => {
					toggleResizing(false);
					this.handleSetWidth(data.size.width);
				} }
				style = { {
					overflow : 'auto' ,
					position : 'relative' ,
					height : '100%' ,
				} }
				className = { `resizable-box ${ siderCollapsed ? 'collpased' : '' } ${ resizing ? 'resizing' : '' } ${this.props.settingItems.themeMode} ${this.props.currentNotebook.currentTheme}`}
				handle = { <div className = "resize-handle-container">
					<div className = "custom-resize-handle" />
				</div> }
			>
				
				<div className = "sidebar-container">
					{/*sidebar主要功能菜单列表*/ }
					
					<div className = "sidebar-top-bar">
						<SidebarMenu
							clickFavorites = { this.props.clickFavorites }
							clickRecycle = { this.props.clickRecycleBin }
							openModal = { this.props.openModal }
						/>
						
						<span className = "notebooks-list-text">笔记本列表</span>
						<Tooltip
							title = "添加分类"
							placement = "right"
							arrow = { false }
						>
							<span
								className = "topbar-icon add-new-sort-icon"
								onClick = { () => {
									this.props.openModal('InputNewSortModal');
								} }
							><AddNewSortIcon /></span>
						</Tooltip>
					</div>
					<Divider style = { { borderColor : '#e4e4e4' } } />
					
					<div
						onClick = { () => {
							// this.setState({ activeItem : '搜索' });
							this.handleFocusSearchInput();
						} }
						className = "menu-item seach-note-menu"
					>
						<SearchIcon />
						<input
							ref = { this.searchInputRef }
							className = "search-input"
							// className = {`search-input ${ this.state.activeItem==='搜索'?'active-search-input':''}`}
							placeholder = { '搜索笔记' }
							value = { this.state.searchKeyword }
							onChange = { (e) => {
								this.handleSearchKeyword(e.target.value);
							} }
						/>
					</div>
					
					<div className = "sidebar-content-panel">
						{/*<div className = "avatar-username-email">*/ }
						{/*	<AvatarIcon />*/ }
						{/*	<div className = "username-email">*/ }
						{/*		<p>username</p>*/ }
						{/*		<p>xxxxxxxxxxx@qq.com</p>*/ }
						{/*	</div>*/ }
						{/*</div>*/ }
						
						{/*搜索*/ }
						
						
						{/*笔记本列表*/ }
						<div className = "all-sorts-notebook">
							{ this.props.sorts.map((sort) => {
								const notebooksInSort = notebooks.filter(
									notebook => notebook.belongSortID === sort.id ,
								);
								return <div key = { sort.id }>
									{/*分类标题*/ }
									<NotebookSortAndOperates
										title = { sort.title }
										id = { sort.id }
										isCollapse = { sort.isCollapse }
										notebooksInSort = { notebooksInSort }
									/>
									{/*笔记本列表*/ }
									{ !sort.isCollapse && (!this.props.settingItems.coverMode?<VisualNotebookList
										notebooks = { notebooksInSort }
										selectedNotebookId = { this.props.selectedNotebookId }
										handleToggleNoteBook = { this.props.handleToggleNoteBook }
									/>:<PlainNotebookList
										notebooks = { notebooksInSort }
										selectedNotebookId = { this.props.selectedNotebookId }
										handleToggleNoteBook = { this.props.handleToggleNoteBook }/>) }
								
								</div>;
							}) }
						</div>
					
					
					</div>
				</div>
			</ResizableBox>
		</div>;
	}
}

const PlainNotebookList = ({
	notebooks ,
	selectedNotebookId ,
	handleToggleNoteBook ,
}) => {
	return <div className = "plain-note-book-list">
		{ notebooks.map((book , index) => {
			const isSelected = selectedNotebookId === book.id;
			return <div
				key = { `plain-${ book.title }-${ index }` }
				className = { `plain-note-book-item ${isSelected?'isSelected':''}` }
				onClick = { () => {
					handleToggleNoteBook(book);
				} }
			><PlainNotebookIcon/>{ book.title }</div>;
		}) }
	</div>;
};

const VisualNotebookList = ({
	notebooks ,
	selectedNotebookId ,
	handleToggleNoteBook ,
}) => {
	return <div className = "notebook-lists-content">
		<div className = "sub-menu-content">
			{ notebooks.map((book , index) => {
				const isSelected = selectedNotebookId === book.id;
				return (<div
					key = { `${ book.title }-${ index }` }
					className = "notebook-option"
				>
					<img
						src = { book.cover }
						alt = { book.title }
						className = { `notebook-cover` }
						// className = { `notebook-cover ${ isSelected ? 'selected' : '' }` }
						// onError = { this.handleImageError }
						onClick = { () => {
							handleToggleNoteBook(book);
						} }
					/>
					{ isSelected && <span className='current-editing-icon'><EditingIcon/></span> }
						{/*<span className = { `notebook-title ${ isSelected ? 'selected-notebook-title' : '' } ` }>{ book.title }</span>*/ }
						<span className = "notebook-title">{ book.title }</span>
				</div>);
			}) }
		</div>
	</div>;
}

const SidebarMenu = ({
	clickFavorites ,
	clickRecycle ,
	openModal,
}) => {
	const modeOptions = [
		// {
		// 	label : <div>收藏夹</div> ,
		// 	key : 'dropdown-favorites' ,
		// } ,
		{
			label : <div>设置</div> ,
			key : 'dropdown-setting' ,
		} ,
		{
			label : <div>回收站</div> ,
			key : 'dropdown-recycle-bin' ,
		} ,
		
	];
	return (<Dropdown
		destroyTooltipOnHide = { true }
		getPopupContainer = { (triggerNode) => triggerNode.parentElement }
		overlayClassName = "sidebar-menu-dropdown"
		destroyPopupOnHide = { true }
		placement = "bottomLeft"
		menu = { {
			items : modeOptions ,
			selectable : true ,
			onClick : ({ key }) => {
				// if ( key === 'dropdown-favorites' ) {
				// 	clickFavorites();
				// }
				if ( key === 'dropdown-recycle-bin' ) {
					clickRecycle();
				}
				if ( key === 'dropdown-setting' ) {
					openModal('settingModal');
				}
			} ,
		} }
		trigger = { ['click'] }
	>
		<a onClick = { (e) => e.preventDefault() }>
			<Space>
				<Tooltip
					title = "菜单"
					placement = "right"
					arrow = { false }
				>
					<span className = "topbar-icon expand-drawer-icon"><SettingIcon/></span>
				</Tooltip>
			</Space>
		</a>
	</Dropdown>);
};


const ListSortOptions = ({
	handleClickDeleteSort ,
	id,
	isCollapse,
	handleClickRename,
	handleClickCollapse
}) => {
	const modeOptions = [
		{
			label : <div>重命名</div> ,
			key : 'rename-sort' ,
		} ,
		
		{
			label : <div>移动</div> ,
			key : 'move-sort' ,
			children : [
				{
					key : 'move-top-direction' ,
					label : <div>
						向上移动
					</div> ,
				} ,
				{
					key : 'move-bottom-direction' ,
					label : <div>
						向下移动
					</div> ,
				} ,
			] ,
		} ,
		{
			label : <div>{ isCollapse ? '展开' : '折叠' }</div> ,
			key : 'collapse-sort' ,
		} ,
		{
			label : <div className = 'delete-current-sort'>删除</div> ,
			key : 'delete-sort' ,
		} ,
	];
	return (<Dropdown
		destroyPopupOnHide = { true }
		placement = "bottomLeft"
		menu = { {
			items : modeOptions ,
			selectable : true ,
			// defaultSelectedKeys : [showMode] ,
			onClick : ({ key }) => {
			 if(key==='delete-sort'){
				 handleClickDeleteSort(id)
			 }
			 if(key==='rename-sort'){
				 handleClickRename(id)
			 }
			 if(key==='collapse-sort'){
				 handleClickCollapse(id)
			 }
				 
			} ,
		} }
		trigger = { ['click'] }
	>
		<a onClick = { (e) => e.preventDefault() }>
			<Space>
				<Tooltip
					title = "重命名..."
					placement = "top"
					zIndex = "1"
					arrow = { false }
				>
					<span className='list-sort-options'><MoreOperatesIcon /></span>
				</Tooltip>
			</Space>
		</a>
	</Dropdown>);
};


const EditingIcon=()=> {
	return <svg
		t = "1739872645433"
		className = "icon"
		viewBox = "0 0 1024 1024"
		version = "1.1"
		xmlns = "http://www.w3.org/2000/svg"
		p-id = "54494"
		width = "16"
		height = "16"
	>
		<path
			d = "M469.333333 209.066667h85.333334v640h-85.333334z"
			p-id = "54495"
		></path>
		<path
			d = "M42.666667 870.4c-23.466667 0-42.666667-19.2-42.666667-42.666667V134.4c0-12.8 4.266667-25.6 14.933333-36.266667 17.066667-17.066667 42.666667-17.066667 57.6-17.066666h279.466667c81.066667 0 164.266667 44.8 202.666667 108.8 12.8 19.2 6.4 46.933333-14.933334 57.6-19.2 12.8-46.933333 6.4-57.6-14.933334-23.466667-38.4-78.933333-66.133333-128-66.133333H85.333333v661.333333c0 23.466667-19.2 42.666667-42.666666 42.666667z"
			p-id = "54496"
		></path>
		<path
			d = "M981.333333 849.066667c-23.466667 0-42.666667-19.2-42.666666-42.666667v-640H693.333333C640 166.4 576 198.4 554.666667 234.666667c-12.8 19.2-38.4 27.733333-57.6 14.933333-19.2-12.8-27.733333-38.4-14.933334-57.6 42.666667-70.4 140.8-108.8 213.333334-108.8h279.466666c6.4 0 23.466667 0 36.266667 12.8 12.8 12.8 12.8 29.866667 12.8 36.266667v674.133333c0 23.466667-19.2 42.666667-42.666667 42.666667zM522.666667 942.933333c-12.8 0-25.6-6.4-34.133334-17.066666-23.466667-32-76.8-55.466667-128-55.466667H42.666667c-23.466667 0-42.666667-19.2-42.666667-42.666667s19.2-42.666667 42.666667-42.666666h317.866666c76.8 0 155.733333 36.266667 196.266667 89.6 14.933333 19.2 10.666667 44.8-8.533333 59.733333-8.533333 6.4-17.066667 8.533333-25.6 8.533333z"
			p-id = "54497"
		></path>
		<path
			d = "M522.666667 942.933333c-8.533333 0-17.066667-2.133333-25.6-8.533333-19.2-14.933333-23.466667-40.533333-8.533334-59.733333 40.533333-53.333333 119.466667-89.6 196.266667-89.6H981.333333c23.466667 0 42.666667 19.2 42.666667 42.666666s-19.2 42.666667-42.666667 42.666667H684.8c-49.066667 0-102.4 23.466667-128 55.466667-8.533333 10.666667-21.333333 17.066667-34.133333 17.066666z"
			p-id = "54498"
		></path>
	</svg>
}
const PlainNotebookIcon = () => {
	return <svg
		t = "1739822289353"
		className = "icon"
		viewBox = "0 0 1024 1024"
		version = "1.1"
		xmlns = "http://www.w3.org/2000/svg"
		p-id = "27642"
		width = "16"
		height = "16"
	>
		<path
			d = "M814.92195555-0.63715555a139.81013333 139.81013333 0 0 1 139.81013334 139.81013333v745.65404444a139.81013333 139.81013333 0 0 1-139.81013334 139.81013333H209.07804445a139.81013333 139.81013333 0 0 1-139.81013334-139.81013333V139.17297778a139.81013333 139.81013333 0 0 1 139.81013334-139.81013333h605.8439111z m0 69.90506666H209.07804445a69.90506667 69.90506667 0 0 0-69.78855823 65.80396942L139.17297778 139.17297778v745.65404444a69.90506667 69.90506667 0 0 0 65.80396942 69.78855823L209.07804445 954.73208889h605.8439111a69.90506667 69.90506667 0 0 0 69.78855823-65.80396942L884.82702222 884.82702222V139.17297778a69.90506667 69.90506667 0 0 0-65.80396942-69.78855823L814.92195555 69.26791111zM570.25422222 535.30168889a34.95253333 34.95253333 0 0 1 0 69.90506666h-302.92195555a34.95253333 34.95253333 0 0 1 0-69.90506666h302.92195555z m186.41351111-256.31857778a34.95253333 34.95253333 0 0 1 0 69.90506667h-489.33546666a34.95253333 34.95253333 0 0 1 0-69.90506667h489.33546666z"
			fill = "#131415"
			p-id = "27643"
		></path>
	</svg>;
};
const ExpandSortNotebookIcon = () => {
	return <svg
		t = "1739339998541"
		className = "icon"
		viewBox = "0 0 1024 1024"
		version = "1.1"
		xmlns = "http://www.w3.org/2000/svg"
		p-id = "12188"
		width = "16"
		height = "16"
	>
		<path
			d = "M1024 0v1024H0V0z"
			fill = "#555555"
			fillOpacity = "0"
			p-id = "12189"
		></path>
		<path
			d = "M968.533333 371.797333l-435.456 426.666667-30.464 29.866667-29.866666-30.464-417.877334-426.666667 60.928-59.733333 388.010667 396.117333 404.992-396.8z"
			fill = "#555555"
			p-id = "12190"
		></path>
	</svg>;
};
const AddNewSortIcon = () => {
	return <svg
		t = "1739011322726"
		className = "icon"
		viewBox = "0 0 1024 1024"
		version = "1.1"
		xmlns = "http://www.w3.org/2000/svg"
		p-id = "117229"
		width = "22"
		height = "22"
	>
		<path
			d = "M901.05641384 103.49076547a38.90564137 38.90564137 0 0 1 1.45896152 77.7853457L901.05641384 181.30204823H45.13230341a38.90564137 38.90564137 0 0 1-1.45896154-77.78534564L45.13230341 103.49076547h855.92411043zM901.05641384 414.73589654a38.90564137 38.90564137 0 0 1 1.45896152 77.78534567L901.05641384 492.54717931H45.16472476a38.90564137 38.90564137 0 0 1-1.45896156-77.78534566l1.45896156-0.02593711H901.05641384zM550.90564137 725.98102762a38.90564137 38.90564137 0 0 1 1.45896157 77.78534567L550.90564137 803.79231035H45.16472476a38.90564137 38.90564137 0 0 1-1.45896156-77.78534565l1.45896156-0.02593708H550.90564137zM978.86769659 726.0069647a38.90564137 38.90564137 0 0 1 1.45896154 77.78534565l-1.45896154 0.02593713h-233.43384828a38.90564137 38.90564137 0 0 1-1.45896157-77.7788614l1.45896157-0.03242138h233.43384828z"
			fill = "#555555"
			p-id = "117230"
		></path>
		<path
			d = "M862.15077245 609.29004056a38.90564137 38.90564137 0 0 1 38.87970428 37.44667982l0.02593711 1.45896155v233.43384832a38.90564137 38.90564137 0 0 1-77.78534568 1.45896153l-0.02593711-1.45896153v-233.43384832a38.90564137 38.90564137 0 0 1 38.9056414-38.90564137z"
			fill = "#555555"
			p-id = "117231"
		></path>
	</svg>
}
const SiderbarMenuIcon = () => {
	return <svg
		t = "1738935585295"
		className = "icon"
		viewBox = "0 0 1024 1024"
		version = "1.1"
		xmlns = "http://www.w3.org/2000/svg"
		p-id = "75556"
		width = "22"
		height = "22"
	>
		<path
			d = "M904 160H120c-4.4 0-8 3.6-8 8v64c0 4.4 3.6 8 8 8h784c4.4 0 8-3.6 8-8v-64c0-4.4-3.6-8-8-8z m0 624H120c-4.4 0-8 3.6-8 8v64c0 4.4 3.6 8 8 8h784c4.4 0 8-3.6 8-8v-64c0-4.4-3.6-8-8-8z m0-312H120c-4.4 0-8 3.6-8 8v64c0 4.4 3.6 8 8 8h784c4.4 0 8-3.6 8-8v-64c0-4.4-3.6-8-8-8z"
			fill = "#555555"
			p-id = "75557"
		></path>
	</svg>;
};
const MoreOperatesIcon = () => {
	return <svg
		t = "1738833067354"
		className = "icon"
		viewBox = "0 0 1024 1024"
		version = "1.1"
		xmlns = "http://www.w3.org/2000/svg"
		p-id = "4593"
		width = "14"
		height = "14"
	>
		<path
			d = "M106.666667 512m-106.666667 0a106.666667 106.666667 0 1 0 213.333333 0 106.666667 106.666667 0 1 0-213.333333 0Z"
			fill = "#9c9a9a"
			p-id = "4594"
		></path>
		<path
			d = "M512 512m-106.666667 0a106.666667 106.666667 0 1 0 213.333334 0 106.666667 106.666667 0 1 0-213.333334 0Z"
			fill = "#9c9a9a"
			p-id = "4595"
		></path>
		<path
			d = "M917.333333 512m-106.666666 0a106.666667 106.666667 0 1 0 213.333333 0 106.666667 106.666667 0 1 0-213.333333 0Z"
			fill = "#9c9a9a"
			p-id = "4596"
		></path>
	</svg>;
};

const AddNewBookIcon = () => {
	return <svg
		t = "1738833324834"
		className = "icon"
		viewBox = "0 0 1024 1024"
		version = "1.1"
		xmlns = "http://www.w3.org/2000/svg"
		p-id = "7324"
		width = "14"
		height = "14"
	>
		<path
			d = "M972.8 460.8H563.2V51.2c0-33.792-17.408-51.2-51.2-51.2s-51.2 17.408-51.2 51.2v409.6H51.2c-33.792 0-51.2 17.408-51.2 51.2s17.408 51.2 51.2 51.2h409.6v409.6c0 33.792 17.408 51.2 51.2 51.2s51.2-17.408 51.2-51.2V563.2h409.6c33.792 0 51.2-17.408 51.2-51.2s-17.408-51.2-51.2-51.2z"
			fill = "#9c9a9a"
			p-id = "7325"
		></path>
	</svg>;
};



class MarkNoteIcon extends Component {
	render () {
		return <svg
			t = "1734470588560"
			className = "icon"
			viewBox = "0 0 1024 1024"
			version = "1.1"
			xmlns = "http://www.w3.org/2000/svg"
			p-id = "72142"
			width = "20"
			height = "20"
		>
			<path
				d = "M998.272 476.8256c23.296-22.016 31.744-56.32 21.76-87.296a84.224 84.224 0 0 0-68.608-57.6l-240.128-35.072c-6.912-1.024-12.8-5.12-15.616-11.008l-107.264-217.6c-14.336-29.184-44.8-47.616-76.032-47.36-31.744 0.512-62.464 18.176-76.544 47.36l-107.264 217.344c-3.072 6.144-8.704 10.24-15.616 11.264l-240.128 35.072c-32.256 4.352-58.368 26.624-68.608 57.6-9.984 30.976-1.536 65.28 21.504 87.296l173.824 169.728a20.48 20.48 0 0 1 5.888 18.176l-40.96 238.848c-5.632 31.744 7.68 64.256 33.792 83.2 26.624 19.2 60.928 21.504 89.344 6.4l214.784-112.896c6.144-3.072 13.056-3.072 19.2 0l214.528 112.64c12.288 6.656 25.6 10.24 39.68 10.24 17.92 0 35.84-5.888 49.92-16.384a85.4272 85.4272 0 0 0 34.048-83.2l-40.96-239.36c-1.28-6.656 1.024-13.312 5.632-18.176l173.824-169.216z m-242.944 198.656l40.96 239.616c1.28 7.424-1.792 15.104-8.192 19.712-6.4 4.608-14.848 5.12-21.76 1.28l-214.784-112.64c-4.608-2.56-9.728-4.608-15.104-6.144-1.28-2.048-25.088-3.84-25.088-3.84-13.824 0.256-27.136 3.84-38.656 9.984l-215.04 112.896c-6.912 3.584-15.36 3.072-21.76-1.536a19.8912 19.8912 0 0 1-7.936-20.224l40.96-239.104c4.608-27.392-4.352-55.552-24.32-75.264l-174.08-169.472a19.6352 19.6352 0 0 1-4.864-21.248c2.048-7.424 8.448-12.544 16.384-13.568l240.128-35.072c27.392-3.84 51.2-20.992 64.256-46.336l107.264-217.856c3.328-7.168 9.984-11.264 18.432-11.264h0.256c7.424-0.256 14.592 4.096 18.176 11.52l107.264 217.856c12.8 25.088 36.864 42.24 64 46.08l240.64 35.072c7.68 1.024 13.824 6.144 16.384 14.336a20.48 20.48 0 0 1-5.376 20.736l-173.824 169.472a83.712 83.712 0 0 0-24.32 75.008z"
				p-id = "72143"
				fill = "#000"
			></path>
		</svg>;
	}
}

class RecycleBinIcon extends Component {
	render () {
		return <svg
			t = "1734470387204"
			className = "icon"
			viewBox = "0 0 1024 1024"
			version = "1.1"
			xmlns = "http://www.w3.org/2000/svg"
			p-id = "67981"
			width = "20"
			height = "20"
		>
			<path
				d = "M896.993 282.294125v524.404125c0 85.3335-69.4575 154.791-154.791 154.791H281.798c-85.3335 0-154.791-69.4575-154.791-154.791V282.294125c0-14.88375-11.907-26.79075-26.79075-26.79075h-10.91475c-14.88375 0-26.79075-11.907-26.79075-26.79075v-10.91475c0-14.88375 11.907-26.79075 26.79075-26.79075h139.411125c14.88375 0 26.79075-11.907 26.79075-26.79075v-10.91475c0-50.108625 40.68225-90.790875 90.790875-90.790875h331.907625c50.108625 0 90.790875 40.68225 90.790875 90.790875v10.91475c0 14.88375 11.907 26.79075 26.79075 26.79075h139.411125c14.88375 0 26.79075 11.907 26.79075 26.79075V229.20875c0 14.88375-11.907 26.79075-26.79075 26.79075h-10.91475c-15.379875 0-27.286875 11.907-27.286875 26.294625z m-219.28725-154.791H346.29425c-14.88375 0-26.79075 11.907-26.79075 26.79075v10.91475c0 14.88375 11.907 26.79075 26.79075 26.79075h331.907625c14.88375 0 26.79075-11.907 26.79075-26.79075v-10.91475c-0.496125-14.88375-12.403125-26.79075-27.286875-26.79075z m128.496375 128.496375H217.797875c-14.88375 0-26.79075 11.907-26.79075 26.79075v524.404125c0 50.108625 40.68225 90.790875 90.790875 90.790875h459.907875c50.108625 0 90.790875-40.68225 90.790875-90.790875V282.294125c0-14.387625-11.907-26.294625-26.294625-26.294625z m-203.41125 128.00025h10.91475c14.88375 0 26.79075 11.907 26.79075 26.79075v331.907625c0 14.88375-11.907 26.79075-26.79075 26.79075h-10.91475c-14.88375 0-26.79075-11.907-26.79075-26.79075V410.7905c0-14.88375 11.907-26.79075 26.79075-26.79075z m-192.4965 0h10.91475c14.88375 0 26.79075 11.907 26.79075 26.79075v331.907625c0 14.88375-11.907 26.79075-26.79075 26.79075h-10.91475c-14.88375 0-26.79075-11.907-26.79075-26.79075V410.7905c0-14.88375 11.907-26.79075 26.79075-26.79075z"
				p-id = "67982"
				fill = "#000"
			></path>
		</svg>;
	}
}


const FeedbackIcon = () => {
	return <svg
		style = { { marginLeft : '16px' } }
		t = "1734469824786"
		className = "icon"
		viewBox = "0 0 1024 1024"
		version = "1.1"
		xmlns = "http://www.w3.org/2000/svg"
		p-id = "62600"
		width = "20"
		height = "20"
	>
		<path
			d = "M874 80.5H150.7c-47.4 0-86 38.6-86 86v550c0 1.2 0.1 2.5 0.2 3.7l-0.2 192.2c0 14.5 8.7 27.7 22.2 33.3 4.5 1.9 9.2 2.8 13.8 2.8 9.3 0 18.5-3.6 25.4-10.5l136.2-135.4H874c47.4 0 86-38.6 86-86v-550c0-47.5-38.6-86.1-86-86.1z m14 636c0 7.7-6.3 14-14 14H249.5c-9.8-0.5-19.8 2.9-27.4 10.4l-85.4 84.8 0.1-109.2c0-1.3-0.1-2.5-0.2-3.7V166.5c0-7.7 6.3-14 14-14H874c7.7 0 14 6.3 14 14v550z"
			p-id = "62601"
			fill = "#000"
		></path>
		<path
			d = "M750.3 297h-476c-19.9 0-36 16.1-36 36s16.1 36 36 36h475.9c19.9 0 36-16.1 36-36s-16.1-36-35.9-36zM505.5 513.4H274.3c-19.9 0-36 16.1-36 36s16.1 36 36 36h231.2c19.9 0 36-16.1 36-36s-16.1-36-36-36z"
			p-id = "62602"
			fill = "#000"
		></path>
	</svg>;
};

class SearchIcon extends Component {
	render () {
		return <svg
			t = "1739340216124"
			className = "icon"
			viewBox = "0 0 1024 1024"
			version = "1.1"
			xmlns = "http://www.w3.org/2000/svg"
			p-id = "13904"
			width = "16"
			height = "16"
		>
			<path
				d = "M469.333333 0C209.066667 0 0 209.066667 0 469.333333s209.066667 469.333333 469.333333 469.333334 469.333333-209.066667 469.333334-469.333334S729.6 0 469.333333 0z m0 853.333333c-213.333333 0-384-170.666667-384-384s170.666667-384 384-384 384 170.666667 384 384-170.666667 384-384 384z"
				fill = "#303133"
				p-id = "13905"
			></path>
			<path
				d = "M738.133333 742.4c17.066667-17.066667 42.666667-17.066667 59.733334 0l209.066666 200.533333c17.066667 17.066667 17.066667 42.666667 0 59.733334-17.066667 17.066667-42.666667 17.066667-59.733333 0l-209.066667-200.533334c-17.066667-17.066667-17.066667-42.666667 0-59.733333z"
				fill = "#303133"
				p-id = "13906"
			></path>
		</svg>;
	}
}

const EditAccountIcon = () => {
	return <svg
		t = "1738731407821"
		className = "icon"
		viewBox = "0 0 1024 1024"
		version = "1.1"
		xmlns = "http://www.w3.org/2000/svg"
		p-id = "2380"
		width = "16"
		height = "16"
	>
		<path
			d = "M34.133333 1024v-111.479467h955.733334V1024H34.133333z m220.501334-185.821867H34.133333V615.2192L502.784 128.341333l206.6432 208.896 52.155733-52.6336L554.325333 75.093333l51.131734-53.248a73.1136 73.1136 0 0 1 104.0384 0l103.970133 105.130667c28.672 29.013333 28.672 76.049067 0 105.0624l-558.6944 606.139733z"
			fill = "#8a8a8a"
			p-id = "2381"
		></path>
	</svg>;
};
const CopyMailIcon = () => {
	return <svg
		t = "1734555085112"
		className = "icon"
		viewBox = "0 0 1024 1024"
		version = "1.1"
		xmlns = "http://www.w3.org/2000/svg"
		p-id = "9066"
		width = "24"
		height = "24"
	>
		<path
			d = "M761.088 715.3152a38.7072 38.7072 0 0 1 0-77.4144 37.4272 37.4272 0 0 0 37.4272-37.4272V265.0112a37.4272 37.4272 0 0 0-37.4272-37.4272H425.6256a37.4272 37.4272 0 0 0-37.4272 37.4272 38.7072 38.7072 0 1 1-77.4144 0 115.0976 115.0976 0 0 1 114.8416-114.8416h335.4624a115.0976 115.0976 0 0 1 114.8416 114.8416v335.4624a115.0976 115.0976 0 0 1-114.8416 114.8416z"
			p-id = "9067"
			fill = "#8a8a8a"
		></path>
		<path
			d = "M589.4656 883.0976H268.1856a121.1392 121.1392 0 0 1-121.2928-121.2928v-322.56a121.1392 121.1392 0 0 1 121.2928-121.344h321.28a121.1392 121.1392 0 0 1 121.2928 121.2928v322.56c1.28 67.1232-54.1696 121.344-121.2928 121.344zM268.1856 395.3152a43.52 43.52 0 0 0-43.8784 43.8784v322.56a43.52 43.52 0 0 0 43.8784 43.8784h321.28a43.52 43.52 0 0 0 43.8784-43.8784v-322.56a43.52 43.52 0 0 0-43.8784-43.8784z"
			p-id = "9068"
			fill = "#8a8a8a"
		></path>
	</svg>;
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
			t = "1734470471720"
			className = "icon"
			viewBox = "0 0 1024 1024"
			version = "1.1"
			xmlns = "http://www.w3.org/2000/svg"
			p-id = "69469"
			width = "22"
			height = "22"
		>
			<path
				d = "M512 305.318a205.708 205.708 0 1 0 205.708 205.709A205.708 205.708 0 0 0 512 305.318z m0 346.2a140.816 140.816 0 1 1 140.816-140.816A140.816 140.816 0 0 1 512 651.842z"
				p-id = "69470"
				fill = "#555555"
			></path>
			<path
				d = "M958.783 393.572L885.78 382.54a391.95 391.95 0 0 0-16.872-40.882l44.127-60.026a64.892 64.892 0 0 0 0-91.822l-77.222-77.87a64.892 64.892 0 0 0-91.822 0l-59.052 43.801a392.274 392.274 0 0 0-40.882-17.196L632.7 64.892A64.892 64.892 0 0 0 567.807 0H458.464a64.892 64.892 0 0 0-64.892 64.892l-11.032 72.68a392.598 392.598 0 0 0-40.882 16.872l-60.35-44.127a64.892 64.892 0 0 0-91.823 0l-77.546 77.546a64.892 64.892 0 0 0 0 91.823l44.127 60.025a392.274 392.274 0 0 0-16.548 39.909l-74.626 9.734A64.892 64.892 0 0 0 0 454.246v109.668a64.892 64.892 0 0 0 64.892 64.892l74.302 11.356a392.274 392.274 0 0 0 16.223 41.207l-45.1 60.999a64.892 64.892 0 0 0 0 91.822l77.546 77.546a64.892 64.892 0 0 0 91.823 0l60.674-44.775a392.598 392.598 0 0 0 39.26 16.547l11.356 75.6A64.892 64.892 0 0 0 455.868 1024h109.668a64.892 64.892 0 0 0 64.892-64.892l11.357-74.302a392.923 392.923 0 0 0 39.584-16.223l61.323 45.1a64.892 64.892 0 0 0 91.823 0l77.546-77.546a64.892 64.892 0 0 0 0-91.823l-44.127-60.025a392.274 392.274 0 0 0 16.872-39.909l74.626-11.356a64.892 64.892 0 0 0 64.892-64.892V458.464a64.892 64.892 0 0 0-65.54-64.892z m0 174.56h-9.734l-74.626 11.356-38.286 5.84-12.979 36.34a329.328 329.328 0 0 1-13.951 32.446L792.01 689.48l23.361 32.446 44.127 60.026 2.92 3.893 3.57 3.57-77.547 78.195-3.569-3.57-3.894-2.92-61.323-45.1-32.446-23.036-33.744 18.17a329.653 329.653 0 0 1-32.446 13.627l-36.989 12.978-6.489 38.287-11.356 74.301v9.734H455.868V949.05l-11.356-75.6-5.84-38.286-36.664-12.978a329.004 329.004 0 0 1-32.447-13.627l-35.366-16.872-32.446 23.036-60.674 44.776-3.894 2.92-3.569 3.57-77.546-77.547 3.569-3.569 2.596-3.894 45.424-61.323 23.037-32.446-16.872-35.042a329.328 329.328 0 0 1-13.627-32.446l-12.654-35.69-38.611-6.49-74.302-11.356h-9.734v-111.94h9.734l74.626-11.355 38.611-5.84 12.979-36.665a329.328 329.328 0 0 1 13.951-32.446l16.872-35.042-23.036-32.446-44.452-59.376-1.946-3.894-4.218-3.569 77.221-77.546 3.57 3.569 3.893 2.596 60.35 44.775 32.446 23.037 35.042-16.872a329.004 329.004 0 0 1 34.068-14.276l36.989-12.979 5.84-38.61 10.058-72.68v-9.734h110.317v9.734l11.356 73.653 4.867 38.286 36.665 12.979a329.004 329.004 0 0 1 34.392 14.276l35.367 17.196 32.446-23.36 59.376-43.479 4.218-1.946 3.57-3.57 77.546 77.547-3.57 3.569-2.92 3.893-44.45 59.377-23.038 32.446 17.521 33.744a328.68 328.68 0 0 1 13.952 34.068l12.654 36.989 38.936 5.84 73.003 11.032h9.734z"
				p-id = "69471"
				fill = "#555555"
			></path>
		</svg>;
	}
}

import { reaxel_sider } from './sider.reaxel';
import { reaxper } from 'reaxes-react';
