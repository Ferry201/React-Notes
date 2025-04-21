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
import { translations } from "@src/Home/translations";


@reaxper
export class NoteSidebar extends Component {
	constructor (props) {
		super(props);
		this.searchInputRef = React.createRef();
		this.renameInputRef=React.createRef()
	}
	
	state = {
		siderbarWidth : 458 ,
		searchKeyword : '' ,
		isRenameSort:false,
		currentLanguage:'',
	};
	
	componentDidUpdate (prevProps,prevState) {
		if ( prevProps.currentNotebook.id === 'searchResults-notes-id' && this.props.currentNotebook.id !== 'searchResults-notes-id' ) {
			this.setState({
				searchKeyword : '' ,
			});
		}
		if ( prevProps.settingItems !== this.props.settingItems ) {
			this.setState({ currentLanguage : translations[this.props.settingItems.language] });
		}
	}
	componentDidMount () {
		// if(this.props.currentNotebook.title){
		// 	this.setState({activeItem:this.props.currentNotebook.title})
		// }
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
			message.error('图片加载失败，使用默认封面',1);
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
			toggleSiderCollapse,
			siderCollapsed ,
			resizing ,
			toggleResizing ,
		} = reaxel_sider();
		
		let notebooks = this.props.noteBookArray.filter(notebook => notebook.id !== 'favorites-notes-id' && notebook.id !== 'searchResults-notes-id' && notebook.id !== 'recycle-notes-id');
		
		const NotebookSortAndOperates = ({
			title ,
			id ,
			index,
			isCollapse,
			notebooksInSort,
			currentLanguage,
		}) => {
			return <div
				className = "notebook-operation-bar"
				onClick = { () => {
					this.props.handleClickCollapse(id);
				} }
			>
				<div className = "notebook-amount">
					<span className = { `expand-sort-notebook-icon ${ isCollapse ? 'fold-sort-icon' : "" }` }>
						{/*<ExpandSortNotebookIcon />*/}
						<SidebarNotebookIcon />
					</span>
					{ this.state.isRenameSort && this.props.currentSortId === id ? <input
						                                                             defaultValue = { title }
						                                                             onBlur = { this.handleBlurRenameInput }
						                                                             onKeyDown = { this.handleKeyDown }
						                                                             ref = { this.renameInputRef }
						                                                             maxLength='16'
						                                                             className = "rename-sort-input"
					                                                             /> :
					  <span>{ title }
						  {/*({ notebooksInSort.length })*/}
					  </span>
					}
				</div>
				
				
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
						handleMoveSort={this.props.handleMoveSort}
						index={index}
						currentLanguage={currentLanguage}
					/>
					
					<Tooltip
						title = {this.state.currentLanguage?.addNotebook}
						placement = "top"
						zIndex = "1"
						arrow = { false }
						color='#a6aaad'
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
					566 ,
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
						{/*<SidebarMenu*/ }
						{/*	clickFavorites = { this.props.clickFavorites }*/ }
						{/*	clickRecycle = { this.props.clickRecycleBin }*/ }
						{/*	openModal = { this.props.openModal }*/ }
						{/*	currentLanguage = { this.state.currentLanguage }*/ }
						{/*/>*/ }
						
						<Tooltip
							title = { this.state.currentLanguage.setting }
							placement = "right"
							arrow = { false }
							color = "#a6aaad"
						>
							<span
								onClick = { () => {
									this.props.openModal('settingModal');
								} }
								className = "topbar-icon "
							>
								<SettingIcon />
							</span>
						</Tooltip>
						
						
						{/*<span className = "notebooks-list-text">{ this.state.currentLanguage?.notebookList }</span>*/ }
						
						<span className = "collapse-sidebar-and-add-new-sort">
							<Tooltip
								title = { this.state.currentLanguage?.collapseSidebar }
								placement = "bottom"
								arrow = { false }
								color = "#a6aaad"
							>
								<span
									className = "topbar-icon collapse-sidebar-icon"
									onClick = { () => {
										toggleSiderCollapse();
									} }
								><DrawerIcon /></span>
							</Tooltip>
							<Tooltip
								title = { this.state.currentLanguage?.addCategory }
								placement = "bottom"
								arrow = { false }
								color = "#a6aaad"
							>
								<span
									className = "topbar-icon add-new-sort-icon"
									onClick = { () => {
										this.props.openModal('InputNewSortModal');
									} }
								><AddNewSortIcon /></span>
							</Tooltip>
						</span>
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
							placeholder = { this.state.currentLanguage?.searchNote }
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
							{ this.props.sorts.map((sort , index) => {
								const notebooksInSort = notebooks.filter(
									notebook => notebook.belongSortID === sort.id ,
								);
								return <div key = { sort.id }>
									{/*分类标题*/ }
									<NotebookSortAndOperates
										index = { index }
										title = { sort.title }
										id = { sort.id }
										isCollapse = { sort.isCollapse }
										notebooksInSort = { notebooksInSort }
										currentLanguage = { this.state.currentLanguage }
									/>
									{/*笔记本列表*/ }
									{ !sort.isCollapse && (this.props.settingItems.notebookMode === 'cover-notebook' ? <VisualNotebookList
										notebooks = { notebooksInSort }
										selectedNotebookId = { this.props.selectedNotebookId }
										handleToggleNoteBook = { this.props.handleToggleNoteBook }
									/> : <PlainNotebookList
										                       notebooks = { notebooksInSort }
										                       selectedNotebookId = { this.props.selectedNotebookId }
										                       handleToggleNoteBook = { this.props.handleToggleNoteBook }
									                       />) }
								
								</div>;
							}) }
							
							
							<div className = "menu-item archive-notebook-menu ">
								<ArchiveIcon />
								<span>{ this.state.currentLanguage?.sidebarArchivedText }</span>
							</div>
							
							
							{/*<div className = "menu-item archive-notebook-menu ">*/}
							{/*	<SidebarTagIcon />*/}
							{/*	<span>{ this.state.currentLanguage?.sidebarTagsText }</span>*/}
							{/*</div>*/}
							
							
							
							<div
								className = "menu-item archive-notebook-menu "
								onClick = { () => {
									this.props.clickRecycleBin();
								} }
							>
								<RecycleIcon />
								<span>{ this.state.currentLanguage?.trash }</span>
							</div>
						</div>
					
					
					</div>
					
					
					{/*<div className = "menu-item archive-notebook-menu ">*/ }
					{/*	<SidebarTagIcon />*/ }
					{/*	<span>{ this.state.currentLanguage?.sidebarTagsText }</span>*/ }
					{/*</div>*/ }
					{/*<div>*/ }
					{/*	<svg*/ }
					{/*		t = "1743510039069"*/ }
					{/*		className = "icon"*/ }
					{/*		viewBox = "0 0 1024 1024"*/ }
					{/*		version = "1.1"*/ }
					{/*		xmlns = "http://www.w3.org/2000/svg"*/ }
					{/*		p-id = "20672"*/ }
					{/*		width = "16"*/ }
					{/*		height = "16"*/ }
					{/*	>*/ }
					{/*		<path*/ }
					{/*			d = "M896 960l-384-192-384 192V192c0-70.4 57.6-128 128-128h512c70.4 0 128 57.6 128 128v768z m-384-268.8l320 160V192c0-32-32-64-64-64H256c-32 0-64 32-64 64v665.6l320-166.4z"*/ }
					{/*			fill = "#8a8a8a"*/ }
					{/*			p-id = "20673"*/ }
					{/*		></path>*/ }
					{/*	</svg>*/ }
					{/*</div>*/ }
					
					
					{/*<div className = "menu-item archive-notebook-menu ">*/ }
					{/*	<SidebarNotebookIcon />*/ }
					{/*	<span>{ this.state.currentLanguage?.sidebarNotebookText }</span>*/ }
					{/*</div>*/ }
				
				
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
				className = { `plain-note-book-item ${ isSelected ? 'isSelected' : '' }` }
				onClick = { () => {
					handleToggleNoteBook(book);
				} }
			>
				<span className = "plain-notebook-icon">
					{/*<PlainNotebookIcon />*/ }
					{ book.emoji }
				</span>
				{ book.title }</div>;
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
	currentLanguage,
}) => {
	const modeOptions = [
		{
			label : <div>{currentLanguage.settings}</div> ,
			key : 'dropdown-setting' ,
		} ,
		// {
		// 	label : <div>收藏夹</div> ,
		// 	key : 'dropdown-favorites' ,
		// } ,
		{
			label : <div>{currentLanguage.trash}</div> ,
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
					title = {currentLanguage.menu}
					placement = "right"
					arrow = { false }
					color='#a6aaad'
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
	handleClickCollapse,
	handleMoveSort,
	index,
	currentLanguage
}) => {
	const modeOptions = [
		{
			label : <div>{currentLanguage.rename}</div> ,
			key : 'rename-sort' ,
		} ,
		
		{
			label : <div>{currentLanguage.move}</div> ,
			key : 'move-sort' ,
			children : [
				{
					key : 'move-up-direction' ,
					label : <div>
						{currentLanguage.moveUp}
					</div> ,
				} ,
				{
					key : 'move-down-direction' ,
					label : <div>
						{currentLanguage.moveDown}
					</div> ,
				} ,
			] ,
		} ,
		{
			label : <div>{ isCollapse ? `${currentLanguage.expand}` : `${currentLanguage.collapse}` }</div> ,
			key : 'collapse-sort' ,
		} ,
		{
			label : <div className = 'delete-current-sort'>{currentLanguage.delete}</div> ,
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
				
				if(key==='move-up-direction'){
					handleMoveSort(index,-1)
				}
				
				if(key==='move-down-direction'){
					handleMoveSort(index,1)
				}
				
			} ,
		} }
		trigger = { ['click'] }
	>
		<a onClick = { (e) => e.preventDefault() }>
			<Space>
				<Tooltip
					title = {currentLanguage.renameCategory}
					placement = "top"
					zIndex = "1"
					arrow = { false }
					color='#a6aaad'
				>
					<span className='list-sort-options'><MoreOperatesIcon /></span>
				</Tooltip>
			</Space>
		</a>
	</Dropdown>);
};


const ArchiveIcon=()=> {
	return <svg
		t = "1743415882197"
		className = "icon"
		viewBox = "0 0 1024 1024"
		version = "1.1"
		xmlns = "http://www.w3.org/2000/svg"
		p-id = "2340"
		width = "16"
		height = "16"
	>
		<path
			d = "M997.236364 458.705455L892.741818 98.676364a92.788364 92.788364 0 0 0-88.203636-63.767273L220.16 34.676364c-40.029091 0-75.636364 25.6-88.901818 65.396363L26.996364 458.007273c-17.221818 17.454545-26.763636 40.494545-26.763637 65.163636L0 895.767273c0 51.432727 41.658182 93.090909 93.090909 93.090909l837.585455 0.465454c51.2 0 93.090909-41.658182 93.090909-93.090909l0.232727-372.363636c0-25.367273-10.24-48.407273-26.763636-65.163636zM220.16 127.767273l583.912727-1.396364 88.203637 304.407273h-124.043637c-24.901818 0-48.174545 9.774545-65.861818 27.229091-17.687273 17.454545-27.461818 40.727273-27.461818 65.629091v92.392727l-326.981818-0.232727 0.698182-91.694546c0.232727-25.134545-9.309091-48.64-26.996364-66.327273a92.974545 92.974545 0 0 0-66.094546-27.461818H131.723636l88.436364-302.545454z m710.516364 768.465454L93.090909 895.767273l0.232727-372.363637h162.443637l-0.698182 91.694546c-0.232727 25.134545 9.309091 48.64 26.996364 66.327273 17.687273 17.687273 40.96 27.461818 66.094545 27.461818l326.749091 0.465454c24.901818 0 48.174545-9.774545 65.861818-27.229091 17.687273-17.454545 27.229091-40.96 27.229091-65.861818V523.636364h162.909091l-0.232727 372.596363z"
			fill = "#707070"
			p-id = "2341"
		></path>
	</svg>;
}
const RecycleIcon=()=> {
	return <svg
		t = "1743491655150"
		className = "icon"
		viewBox = "0 0 1024 1024"
		version = "1.1"
		xmlns = "http://www.w3.org/2000/svg"
		p-id = "39882"
		width = "16"
		height = "16"
	>
		<path
			d = "M170.666667 159.3361h682.666666c25.493776 0 45.322268 20.536653 45.322269 45.322268v774.019364c0 25.493776-20.536653 45.322268-45.322269 45.322268H170.666667c-25.493776 0-45.322268-20.536653-45.322269-45.322268V204.658368c0-25.493776 20.536653-45.322268 45.322269-45.322268z m637.344398 774.019363V250.688797H215.988935v682.666666h592.02213z"
			p-id = "39883"
		></path>
		<path
			d = "M967.347165 159.3361c24.785615 0 45.322268 20.536653 45.322268 45.322268s-18.412172 43.905947-41.781466 45.322268H56.652835c-25.493776 0-45.322268-20.536653-45.322268-45.322268s18.412172-43.905947 41.781466-45.322268H967.347165zM693.997234 0c25.493776 0 45.322268 20.536653 45.322268 45.322268s-18.412172 43.905947-41.781466 45.322269H330.002766c-25.493776 0-45.322268-20.536653-45.322268-45.322269s18.412172-43.197787 41.781466-45.322268H693.997234z"
			p-id = "39884"
		></path>
	</svg>
}
const DrawerIcon = () => {
	return <>
		
		<svg
			t = "1739990338459"
			className = "icon"
			viewBox = "0 0 1024 1024"
			version = "1.1"
			xmlns = "http://www.w3.org/2000/svg"
			p-id = "251109"
			width = "22"
			height = "22"
		>
			<path
				d = "M192 162.133333a29.866667 29.866667 0 0 0-29.866667 29.866667v640a29.866667 29.866667 0 0 0 29.866667 29.866667h640a29.866667 29.866667 0 0 0 29.866667-29.866667v-640a29.866667 29.866667 0 0 0-29.866667-29.866667h-640z m-98.133333 29.866667a98.133333 98.133333 0 0 1 98.133333-98.133333h640a98.133333 98.133333 0 0 1 98.133333 98.133333v640a98.133333 98.133333 0 0 1-98.133333 98.133333h-640a98.133333 98.133333 0 0 1-98.133333-98.133333v-640z"
				fill = "#555555"
				p-id = "251110"
			></path>
			<path
				d = "M341.333333 93.866667a34.133333 34.133333 0 0 1 34.133334 34.133333v768a34.133333 34.133333 0 0 1-68.266667 0V128a34.133333 34.133333 0 0 1 34.133333-34.133333z"
				fill = "#555555"
				p-id = "251111"
			></path>
			<path
				d = "M243.2 896a34.133333 34.133333 0 0 1 34.133333-34.133333h128a34.133333 34.133333 0 1 1 0 68.266666h-128a34.133333 34.133333 0 0 1-34.133333-34.133333zM243.2 128a34.133333 34.133333 0 0 1 34.133333-34.133333h128a34.133333 34.133333 0 1 1 0 68.266666h-128a34.133333 34.133333 0 0 1-34.133333-34.133333z"
				fill = "#555555"
				p-id = "251112"
			></path>
		</svg>
	</>;
};
const EditingIcon = () => {
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
		t = "1739988955426"
		className = "icon"
		viewBox = "0 0 1024 1024"
		version = "1.1"
		xmlns = "http://www.w3.org/2000/svg"
		p-id = "229968"
		width = "26"
		height = "26"
	>
		<path
			d = "M819.2 189.44a30.72 30.72 0 0 1 1.152 61.41952L819.2 250.88H143.36a30.72 30.72 0 0 1-1.152-61.41952L143.36 189.44h675.84zM819.2 435.2a30.72 30.72 0 0 1 1.152 61.41952L819.2 496.64H143.3856a30.72 30.72 0 0 1-1.152-61.41952l1.152-0.02048H819.2zM542.72 680.96a30.72 30.72 0 0 1 1.152 61.41952L542.72 742.4H143.3856a30.72 30.72 0 0 1-1.152-61.41952l1.152-0.02048H542.72zM880.64 680.98048a30.72 30.72 0 0 1 1.152 61.41952l-1.152 0.02048h-184.32a30.72 30.72 0 0 1-1.152-61.4144l1.152-0.0256h184.32z"
			fill = "#555555"
			p-id = "229969"
		></path>
		<path
			d = "M788.48 588.82048a30.72 30.72 0 0 1 30.69952 29.568l0.02048 1.152v184.32a30.72 30.72 0 0 1-61.41952 1.152l-0.02048-1.152v-184.32a30.72 30.72 0 0 1 30.72-30.72z"
			fill = "#555555"
			p-id = "229970"
		></path>
	</svg>
}

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




class SearchIcon extends Component {
	render () {
		return <svg
			t = "1743503560733"
			className = "icon"
			viewBox = "0 0 1024 1024"
			version = "1.1"
			xmlns = "http://www.w3.org/2000/svg"
			p-id = "40996"
			width = "16"
			height = "16"
		>
			<path
				d = "M974.2536 1021.92a48 48 0 0 1-33.92-13.92L730.5736 797.44a48 48 0 0 1 68-67.68L1008.1736 940a48 48 0 0 1-34.08 81.92z"
				fill = "#515151"
				p-id = "40997"
			></path>
			<path
				d = "M465.6136 96A369.6 369.6 0 1 1 96.1736 465.44 369.92 369.92 0 0 1 465.6136 96m0-96a465.6 465.6 0 1 0 465.6 465.44A465.6 465.6 0 0 0 465.6136 0z"
				fill = "#515151"
				p-id = "40998"
			></path>
		</svg>
	}
}



const SidebarTagIcon=()=> {
	return <svg
		t = "1743509492052"
		className = "icon"
		viewBox = "0 0 1024 1024"
		version = "1.1"
		xmlns = "http://www.w3.org/2000/svg"
		p-id = "20116"
		width = "16"
		height = "16"
	>
		<path
			d = "M819.740462 1007.663443l-305.918811-180.317543-309.331585 180.597279a114.244004 114.244004 0 0 1-55.947113 15.665191 91.753264 91.753264 0 0 1-46.380156-12.364312A106.299514 106.299514 0 0 1 52.425814 915.238813v-783.259575A129.685407 129.685407 0 0 1 179.257918 0.055947h666.721739a121.908758 121.908758 0 0 1 87.053708 37.036989 136.063378 136.063378 0 0 1 38.715401 96.340927v782.028739a107.306562 107.306562 0 0 1-50.352401 96.452822 91.753264 91.753264 0 0 1-45.596897 12.084576 111.055018 111.055018 0 0 1-56.059006-16.336557z m43.023329-72.731246a25.903513 25.903513 0 0 0 12.97973 4.531716 7.273125 7.273125 0 0 0 3.636563-0.78326 27.973556 27.973556 0 0 0 8.056384-23.385893V132.650604a50.911872 50.911872 0 0 0-14.434355-36.253729 38.267825 38.267825 0 0 0-27.022456-12.084576H179.257918a45.317161 45.317161 0 0 0-42.519806 47.610992v783.259575c0 12.811889 3.748457 20.756379 7.664755 22.994263a20.476643 20.476643 0 0 0 17.959023-3.524668l351.683549-205.046167zM289.361835 323.989728a41.792493 41.792493 0 0 1 0-83.529038H734.980586a41.792493 41.792493 0 0 1 0 83.529038z"
			fill = "#bfbfbf"
			p-id = "20117"
		></path>
	</svg>
}

const SidebarNotebookIcon=()=> {
	return <svg
		t = "1743511883425"
		className = "icon"
		viewBox = "0 0 1024 1024"
		version = "1.1"
		xmlns = "http://www.w3.org/2000/svg"
		p-id = "33414"
		width = "16"
		height = "16"
	>
		<path
			d = "M754.72592555 2.27555555a194.18074112 194.18074112 0 0 1 194.18074112 194.18074112v631.08740666a194.18074112 194.18074112 0 0 1-194.18074112 194.18074112H245.0014811a194.18074112 194.18074112 0 0 1-194.18073998-194.18074112V196.45629667a194.18074112 194.18074112 0 0 1 194.18073998-194.18074112h509.72444445z m0 84.95407446H245.0014811a109.22666667 109.22666667 0 0 0-109.10530332 104.08087666L135.77481443 196.45629667v631.08740666a109.22666667 109.22666667 0 0 0 104.0808778 109.10530446L245.0014811 936.77036999h509.72444445a109.22666667 109.22666667 0 0 0 109.10530446-104.08087666L863.95259221 827.54370333V196.45629667a109.22666667 109.22666667 0 0 0-104.08087666-109.10530446L754.72592555 87.22963001z"
			fill = "#000000"
			p-id = "33415"
		></path>
		<path
			d = "M948.90666667 366.36444445v291.2711111H706.18074112a145.63555555 145.63555555 0 1 1 0-291.2711111h242.72592555z m-84.95407446 206.31703665v-121.3629622H706.18074112a60.6814811 60.6814811 0 0 0-60.5601189 56.70077553L645.49925888 512a60.6814811 60.6814811 0 0 0 56.70077667 60.5601189L706.18074112 572.6814811h157.77185109z"
			fill = "#000000"
			p-id = "33416"
		></path>
	</svg>
}

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
