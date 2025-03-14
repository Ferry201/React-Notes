import React , { Component , useState } from 'react';
import { Reaxlass , reaxper } from 'reaxes-react';
import { reaxel_sider } from '@src/Home/sider.reaxel';
import { Modal , Dropdown , Space , Tooltip , Popover , Menu , Button , message } from 'antd';
import { ExclamationCircleFilled } from '@ant-design/icons';
import RenderContent from '@src/Home/renderContent';
import './note.css';
import dayjs from "dayjs";
import { EmojiArray } from "@src/Home/addNoteBook_Model";
import { translations } from "@src/Home/translations";

@reaxper
class NoteManagePanel extends Reaxlass {
	constructor (props) {
		super(props);
		this.inputRenameRef = React.createRef();
		
		this.state = {
			isSearch : false ,
			isHover : false ,
			isModalVisible : false ,
			noteFeaturesMenu : this.generateNoteFeaturesMenu() ,
			isRenaming : false ,
			title : this.props.currentNotebook.title ,
			isClicked : false ,
		};
		
	}
	
	
	componentDidUpdate (prevProps) {
		if ( prevProps.currentNotebook.id !== this.props.currentNotebook.id || prevProps.sorts !== this.props.sorts || prevProps.notebooks !== this.props.notebooks || prevProps.settingItems !== this.props.settingItems ) {
			this.setState({
				isRenaming : false,
				noteFeaturesMenu : this.generateNoteFeaturesMenu() ,
				title : this.props.currentNotebook.title ,
			});
		}
	}
	
	generateNoteFeaturesMenu = () => {
		const otherSorts = this.props.sorts.filter(sort => sort.id !== this.props.currentNotebook.belongSortID);
		const { settingItems } = this.props;
		
		return [
			{
				label : <div>{translations[settingItems.language]?.rename}</div> ,
				key : 'rename' ,
			} ,
			{
				label : <div>{translations[settingItems.language]?.changeCover}</div> ,
				key : 'change-cover' ,
				disabled : this.props.settingItems.notebookMode === 'cover-notebook' ? false : true ,
			} ,
			// {
			// 	label : <div>置顶笔记本</div> ,
			// 	key : 'pinned-notebook' ,
			// } ,
			{
				label : <div>{translations[settingItems.language]?.moveToOtherCategory}</div> ,
				key : 'move-other-sort' ,
				children : otherSorts.map(sort =>
					({
						label : <div>{ sort.title }</div> ,
						key : sort.id ,
					}) ,
				) ,
				disabled : otherSorts.length === 0 ? true : false ,
			} ,
			// {
			// 	label : <div>导出PDF</div> ,
			// 	key : 'export-pdf' ,
			// } ,
			{
				key : 'notebook-detail' ,
				label : <div>{translations[settingItems.language]?.details}</div> ,
				children : [
					{
						key : 'notebook-create-time' ,
						label : <span>{translations[settingItems.language]?.createdTime}:{ dayjs(this.props.currentNotebook.createdTime).format('YYYY-MM-DD HH:mm') }</span> ,
					} ,
				] ,
			} ,
			//todo 复制笔记本
			// {
			// 	label : <div>分享</div> ,
			// 	key : 'share-notebook' ,
			// } ,
			{
				label : <div className = "dropdown-delete-notebook-button">{translations[settingItems.language]?.deleteNotebook}</div> ,
				key : 'delete-notebook' ,
			} ,
		];
	};
	
	
	handleMouseEnter = () => {
		if ( !this.state.isClicked ) {
			this.setState({ isHover : true });
		}
	};
	
	handleMouseLeave = () => {
		if ( !this.state.isClicked ) {
			this.setState({ isHover : false });
		}
	};
	// 重命名笔记本
	renameNotebookTitle = (e) => {
		if ( e.target.value ) {
			const newTitle = e.target.value;
			this.props.updateNotebookInfo('title' , newTitle);
		}
	};
	handleBlur = (e) => {
		if(!e.target.value){
			this.setState({
				title : this.props.currentNotebook.title ,
				isRenaming : false ,
			})
		}else{
			this.setState({
				isRenaming : false ,
				title : e.target.value ,
			} , () => {
				this.renameNotebookTitle(e);
			});
		}
	};
	handleKeyDown = (e) => {
		if ( e.key === 'Enter' ) {
			this.handleBlur(e);
		}
	};
	
	
	render () {
		const {
			onChangeNote ,
			onDeleteNote ,
			handleDeleteCheckedNote,
			onToggleSidebar ,
			currentNotebook ,
			notesAmount ,
			updateNotebookInfo ,
			pinNote ,
			completedTodo,
			handlePinCheckedNote,
			favoriteNote ,
			isShowFavorites ,
			noteList ,
			notebooks ,
			openModal ,
			onSave ,
			onCancel ,
			searchKeyword ,
			isShowSearchResults ,
			handleMoveNote ,
			handleMoveCheckedNote,
			isShowRecycleNotes ,
			settingItems ,
			handleSetDeadline,
		} = this.props;
		const {
			isHover ,
			isRenaming ,
		} = this.state;
		const {
			toggleSiderCollapse ,
			siderCollapsed ,
			resizing ,
		} = reaxel_sider();
		let editInFavoritesOrSearchPageOrRecycle = currentNotebook.id === 'favorites-notes-id' || currentNotebook.id === 'searchResults-notes-id' || currentNotebook.id === 'recycle-notes-id';
		
		return <div className = { `note-container${ resizing ? ' resizing' : '' } ${ settingItems.themeMode === 'note-dark-mode' ? 'night-theme' : currentNotebook.currentTheme }` }>
			{/*顶部工具栏*/ }
			<div className = { `main-section-header` }>
				{/*笔记本名称 & dropdown*/ }
				<div className = "note-title-bar">
					{ siderCollapsed && <LeftExpandIcon
						onClick = { () => {
							toggleSiderCollapse();
						} }
						currentLanguage={translations[settingItems?.language]}
					/> }
					
					{/*<div*/ }
					{/*	onMouseEnter = { this.handleMouseEnter }*/ }
					{/*	onMouseLeave = { this.handleMouseLeave }*/ }
					{/*>*/ }
					{/*	{ !siderCollapsed ? (*/ }
					{/*		<LeftExpandIcon*/ }
					{/*			onclick = { () => {*/ }
					{/*				this.setState({*/ }
					{/*					isHover : false ,*/ }
					{/*					isClicked : true ,*/ }
					{/*				} , () => {*/ }
					{/*					//点击后，鼠标事件会被 isClicked 屏蔽，避免触发 isHover: true*/ }
					{/*					toggleSiderCollapse();*/ }
					{/*					// 延迟重置 isClicked，防止鼠标事件干扰*/ }
					{/*					setTimeout(() => {*/ }
					{/*						this.setState({ isClicked : false });*/ }
					{/*					} , 0);*/ }
					{/*				});*/ }
					{/*			} }*/ }
					{/*		/>) : (this.state.isHover ? (*/ }
					{/*		<RightExpandIcon*/ }
					{/*			onclick = { () => {*/ }
					{/*				toggleSiderCollapse();*/ }
					{/*			} }*/ }
					{/*		/>) : (*/ }
					{/*			       <DefaultExpandIcon />*/ }
					{/*		       )) }*/ }
					{/*</div>*/ }
					{/*当前笔记本*/ }
					
					<div className = "emoji-and-title">
						{ settingItems.notebookMode === 'plain-notebook' &&  <>{ !editInFavoritesOrSearchPageOrRecycle ?
						      <Popover
							      trigger = "hover"
							      arrow = { false }
							      content = { <EmojisPanel updateEmoji = { updateNotebookInfo } /> }
							      overlayClassName = { `emoji-popover ${ settingItems.themeMode }` }
							      placement = "bottomLeft"
						      >
							      <span className = "notebook-emoji">{ currentNotebook.emoji }</span>
						      </Popover> : <span className = "notebook-emoji">{ currentNotebook.emoji }</span>
						}</> }
						
						{ isRenaming ? <input
							type = "text"
							defaultValue = { this.state.title }
							onBlur = { this.handleBlur }
							onKeyDown = { this.handleKeyDown }
							ref = { this.inputRenameRef }
							className = "rename-notebook-title-input"
							maxLength = "16"
						/> : <span className = "notebook-title">{
							currentNotebook.id === 'searchResults-notes-id'?translations[settingItems.language]?.searchResults:
							currentNotebook.id === 'recycle-notes-id'?translations[settingItems.language]?.trash:
							this.state.title
						}({ notesAmount })</span> }
					</div>
					
					
					{/*笔记本下拉操作菜单*/ }
					{ !isRenaming && !editInFavoritesOrSearchPageOrRecycle && <Dropdown
						placement = "bottomLeft"
						menu = { {
							items : this.state.noteFeaturesMenu ,
							onClick : ({ key }) => {
								if ( key === 'rename' ) {
									this.setState({ isRenaming : true } , () => {
										this.inputRenameRef.current?.focus();
									});
								}
								if ( key === 'change-cover' ) {
									openModal('changeCover');
								}
								if ( key === 'delete-notebook' ) {
									openModal('deleteConfirm');
								}
								const otherSorts = this.props.sorts.filter(sort => sort.id !== this.props.currentNotebook.belongSortID);
								if ( otherSorts.some(sort => sort.id === key) ) {
									// 找到被点击的 sort.id
									const selectedSort = otherSorts.find(sort => sort.id === key);
									if ( selectedSort ) {
										this.props.updateNotebookInfo('belongSortID' , selectedSort.id);
									}
								}
							} ,
						} }
						trigger = { ['click' , 'hover'] }
						overlayClassName = { `notebook-dropdown-menu ${ settingItems.themeMode }` }
					>
						<a onClick = { (e) => e.preventDefault() }>
							<DownOutLinedIcon />
						</a>
					</Dropdown> }
				</div>
				
				{/* 切换显示模式 选择主题颜色*/ }
				{ !editInFavoritesOrSearchPageOrRecycle && <div className = "top-tool-bar">
					{ currentNotebook.isTodoMode ?
					  <NoteModeIcon
						  onClick = { updateNotebookInfo }
						  currentLanguage = { translations[settingItems.language] }
					  /> :
					  <ToDoIcon
						  onClick = { updateNotebookInfo }
						  currentLanguage = { translations[settingItems.language] }
					  /> }
					
					
					<ModeSelector
						onSwitchNoteMode = { updateNotebookInfo }
						showMode = { currentNotebook.showMode }
						settingItems = { settingItems }
					/>
					
					<ThemeColorSelector
						selectTheme = { updateNotebookInfo }
						theme = { currentNotebook.currentTheme }
						settingItems = { settingItems }
					/>
				</div> }
			</div>
			
			
			{/*Note List*/ }
			<RenderContent
				noteList = { noteList }
				notebooks = { notebooks }
				changeNote = { onChangeNote }
				deleteNote = { onDeleteNote }
				handleDeleteCheckedNote={handleDeleteCheckedNote}
				ShowMode = { currentNotebook.showMode }
				currentNotebook = { currentNotebook }
				pinNote = { pinNote }
				completedTodo={completedTodo}
				handlePinCheckedNote={handlePinCheckedNote}
				handleMoveCheckedNote={handleMoveCheckedNote}
				favoriteNote = { favoriteNote }
				isShowFavorites = { isShowFavorites }
				openModal = { openModal }
				onSave = { onSave }
				onCancel = { onCancel }
				keyword = { searchKeyword }
				isShowSearchResults = { isShowSearchResults }
				handleMoveNote = { handleMoveNote }
				isShowRecycleNotes = { isShowRecycleNotes }
				settingItems = { settingItems }
				handleSetDeadline={handleSetDeadline}
			/>
		</div>;
	}
};

const EmojisPanel = ({updateEmoji}) => {
	
	return (<div>
		<div className = "emoji-popover-panel">
			{ EmojiArray.map((item,index) => {
				return <div
					className = 'emoji-little-box'
					key = { `popover-${item}-${index}` }
					onClick = { () => {
						updateEmoji('emoji' , item);
					} }
				>{item}</div>;
			}) }
		</div>
	</div>);
};

const ThemeColorSelector = ({
	selectTheme ,
	theme ,
	settingItems ,
}) => {
	return <>
		<Popover
			trigger = "hover"
			arrow = { false }
			content = { <ThemeColorPanel
				selectTheme = { selectTheme }
				theme = { theme }
				settingItems = { settingItems }
			/> }
			overlayClassName = { `colors-popover ${ settingItems.themeMode }` }
		>
			<div style={{marginLeft:'20px'}}><ColorPalette /></div>
		</Popover>
	</>;
};
const ThemeColorPanel = ({
	selectTheme ,
	theme ,
	settingItems ,
}) => {
	const allThemeColors = [
		'blue-theme' , 'purple-theme' , 'red-theme' , 'green-theme' , 'gray-theme' , 'orange-theme' , 'pink-theme' , 'yellow-theme' ,
		'gradient-theme-blue-cyan' , 'gradient-theme-green-blue' , 'gradient-theme-blue-yellow' , 'gradient-theme-blue-pink' , 'image-background-wheat' ,
		'image-background-sunset','image-background-blueSky','image-background-windmill' , 'image-background-dragonfly' , 'image-background-tower' , 'image-background-field' , 'image-background-mountain' ,
	];
	return (<div className = { settingItems.themeMode }>
		<div className = "themecolor-popover-title">{translations[settingItems.language]?.noteTheme}</div>
		<div className = "theme-color-panel">
			{ allThemeColors.map((item) => {
				const isCurrentTheme = theme === item;
				return <div
					className = { `color-little-box ${ item } ${isCurrentTheme?'current-theme':''}` }
					key = { item }
					onClick = { () => {
						selectTheme('currentTheme' , item);
					} }
				>
					
				</div>;
			}) }
		</div>
	</div>);
};


//显示模式选择器
const ModeSelector = ({
	onSwitchNoteMode ,
	showMode ,
	settingItems ,
}) => {
	const modeOptions = [
		{
			key : 'modeOptions' ,
			type : 'group' ,
			label : `${translations[settingItems.language]?.view}` ,
			children : [
				{
					label : <div>{translations[settingItems.language]?.listView}</div> ,
					key : 'list-mode' ,
				} ,
				{
					label : <div>{translations[settingItems.language]?.cardView}</div> ,
					key : 'card-mode' ,
				} ,
				{
					label : <div>{translations[settingItems.language]?.gridView}</div> ,
					key : 'grid-mode' ,
				} ,
			] ,
		} ,
	];
	return (<Dropdown
		destroyPopupOnHide = { true }
		placement = "bottom"
		menu = { {
			items : modeOptions ,
			selectable : true ,
			defaultSelectedKeys : [showMode] ,
			onClick : ({ key }) => {
				onSwitchNoteMode('showMode' , key);
			} ,
		} }
		trigger = { ['hover'] }
		overlayClassName = { `note-display-mode-dropdown ${ settingItems.themeMode }` }
	>
		<a onClick = { (e) => e.preventDefault() }>
			<Space>
				{ showMode === 'list-mode' ? <ListModeIcon /> :
				  showMode === 'card-mode' ? <CardModeIcon /> : <GridModeIcon /> }
				{/*<ListModeIcon/>*/ }
			</Space>
		</a>
	</Dropdown>);
};

const CheckedBackgroundTheme=()=> {
	return <svg
		t = "1740179206294"
		className = "icon"
		viewBox = "0 0 1300 1024"
		version = "1.1"
		xmlns = "http://www.w3.org/2000/svg"
		p-id = "282694"
		width = "16"
		height = "16"
	>
		<path
			d = "M1230.490183 89.988301h-101.410965a46.247857 46.247857 0 0 0-36.403936 17.644765L494.332018 865.522151 207.465288 502.039995a46.433592 46.433592 0 0 0-36.403936-17.644765H69.650388a11.608398 11.608398 0 0 0-9.100984 18.666304l397.471546 503.525869c18.573437 23.495397 54.234435 23.495397 72.900739 0l708.669478-898.025665a11.515531 11.515531 0 0 0-9.100984-18.573437z"
			fill = "#707070"
			fillOpacity = ".65"
			p-id = "282695"
		></path>
	</svg>;
}
const NoteModeIcon=({onClick,currentLanguage})=> {
	return <Tooltip
		title = {currentLanguage?.switchToNoteModeText}
		placement = "bottom"
		arrow = { false }
		color = '#a6aaad'>
		<div
			className = "notelist-header-icon todo-icon-box "
			onClick = { () => {
				onClick('isTodoMode' , false);
			} }
		>
			<svg
				t = "1741492777576"
				className = "icon"
				viewBox = "0 0 1024 1024"
				version = "1.1"
				xmlns = "http://www.w3.org/2000/svg"
				p-id = "45167"
				width = "20"
				height = "20"
			>
				<path
					d = "M862.336 0C951.616 0 1024 62.528 1024 139.648v744.704C1024 961.472 951.616 1024 862.336 1024H161.664C72.384 1024 0 961.472 0 884.352V139.648C0 62.528 72.384 0 161.664 0h700.672z m0 69.76H161.664c-42.816 0-78.144 28.864-80.64 65.792l-0.192 4.096v744.704c0 36.992 33.344 67.52 76.16 69.76l4.672 0.064h700.672c42.816 0 78.144-28.8 80.64-65.728l0.192-4.096V139.648c0-36.992-33.344-67.52-76.16-69.76l-4.672-0.064zM579.392 535.36c22.272 0 40.384 15.616 40.384 34.88 0 19.264-18.112 34.944-40.384 34.944H229.056c-22.336 0-40.448-15.68-40.448-34.944 0-19.264 18.112-34.88 40.448-34.88h350.336z m215.552-256c22.336 0 40.448 15.616 40.448 34.88 0 19.264-18.112 34.944-40.448 34.944H229.12c-22.336 0-40.448-15.68-40.448-34.944 0-19.264 18.112-34.88 40.448-34.88h565.888z"
					fill = "#000000"
					p-id = "45168"
				></path>
			</svg>
		</div>
	</Tooltip>
}
const CardModeIcon = () => {
	return <>
		<div
			className = { `notelist-header-icon card-mode-icon-box` }
		
		>
			<svg
				t = "1734629911980"
				className = "icon"
				viewBox = "0 0 1024 1024"
				version = "1.1"
				xmlns = "http://www.w3.org/2000/svg"
				p-id = "117271"
				width = "20"
				height = "20"
			>
				<path
					d = "M25.6 640A102.4 102.4 0 0 1 128 537.6h256A102.4 102.4 0 0 1 486.4 640v256A102.4 102.4 0 0 1 384 998.4H128A102.4 102.4 0 0 1 25.6 896v-256zM128 614.4a25.6 25.6 0 0 0-25.6 25.6v256c0 14.08 11.52 25.6 25.6 25.6h256a25.6 25.6 0 0 0 25.6-25.6v-256a25.6 25.6 0 0 0-25.6-25.6H128zM537.6 640A102.4 102.4 0 0 1 640 537.6h256a102.4 102.4 0 0 1 102.4 102.4v256a102.4 102.4 0 0 1-102.4 102.4h-256A102.4 102.4 0 0 1 537.6 896v-256z m102.4-25.6a25.6 25.6 0 0 0-25.6 25.6v256c0 14.08 11.52 25.6 25.6 25.6h256a25.6 25.6 0 0 0 25.6-25.6v-256a25.6 25.6 0 0 0-25.6-25.6h-256zM25.6 128A102.4 102.4 0 0 1 128 25.6h256A102.4 102.4 0 0 1 486.4 128v256A102.4 102.4 0 0 1 384 486.4H128A102.4 102.4 0 0 1 25.6 384V128zM128 102.4a25.6 25.6 0 0 0-25.6 25.6v256c0 14.08 11.52 25.6 25.6 25.6h256a25.6 25.6 0 0 0 25.6-25.6V128a25.6 25.6 0 0 0-25.6-25.6H128zM537.6 128A102.4 102.4 0 0 1 640 25.6h256A102.4 102.4 0 0 1 998.4 128v256A102.4 102.4 0 0 1 896 486.4h-256A102.4 102.4 0 0 1 537.6 384V128z m102.4-25.6a25.6 25.6 0 0 0-25.6 25.6v256c0 14.08 11.52 25.6 25.6 25.6h256a25.6 25.6 0 0 0 25.6-25.6V128a25.6 25.6 0 0 0-25.6-25.6h-256z"
					fill = "#000000"
					p-id = "117272"
				></path>
			</svg>
		</div>
	</>;
};
const ListModeIcon = () => {
	return <>
		<div
			className = { `notelist-header-icon list-mode-icon-box` }
		>
			<svg
				xmlns = "http://www.w3.org/2000/svg"
				viewBox = "0 0 1024 1024"
				width = "20"
				height = "20"
			>
				<rect
					x = "50"
					y = "70"
					width = "924"
					height = "220"
					stroke = "#000000"
					fill = "none"
					strokeWidth = "75"
					rx = "18"
					ry = "18"
				/>
				<rect
					x = "50"
					y = "410"
					width = "924"
					height = "220"
					stroke = "#000000"
					fill = "none"
					strokeWidth = "75"
					rx = "20"
					ry = "20"
				/>
				<rect
					x = "50"
					y = "740"
					width = "924"
					height = "220"
					stroke = "#000000"
					fill = "none"
					strokeWidth = "75"
					rx = "20"
					ry = "20"
				/>
			</svg>
		</div>
	</>;
};
const GridModeIcon = () => {
	return <>
		<div
			className = "notelist-header-icon"
		>
			<svg
				t = "1734630128020"
				className = "icon"
				viewBox = "0 0 1024 1024"
				version = "1.1"
				xmlns = "http://www.w3.org/2000/svg"
				p-id = "119720"
				width = "20"
				height = "20"
			>
				<path
					d = "M424.228571 36.571429H87.771429C58.514286 36.571429 36.571429 58.514286 36.571429 87.771429v336.457142c0 29.257143 21.942857 51.2 51.2 51.2h336.457142c29.257143 0 51.2-21.942857 51.2-51.2V87.771429c0-29.257143-21.942857-51.2-51.2-51.2z m-21.942857 73.142857v292.571428h-292.571428v-292.571428h292.571428z m21.942857 438.857143H87.771429c-29.257143 0-51.2 21.942857-51.2 51.2v336.457142c0 29.257143 21.942857 51.2 51.2 51.2h336.457142c29.257143 0 51.2-21.942857 51.2-51.2V599.771429c0-29.257143-21.942857-51.2-51.2-51.2z m-21.942857 73.142857v292.571428h-292.571428v-292.571428h292.571428z m533.942857 73.142857H599.771429c-29.257143 0-51.2 21.942857-51.2 51.2v190.171428c0 29.257143 21.942857 51.2 51.2 51.2h336.457142c29.257143 0 51.2-21.942857 51.2-51.2v-190.171428c0-29.257143-21.942857-51.2-51.2-51.2z m-21.942857 73.142857v146.285714h-292.571428v-146.285714h292.571428z m21.942857-731.428571H599.771429c-29.257143 0-51.2 21.942857-51.2 51.2v482.742857c0 29.257143 21.942857 51.2 51.2 51.2h336.457142c29.257143 0 51.2-21.942857 51.2-51.2V87.771429c0-29.257143-21.942857-51.2-51.2-51.2z m-21.942857 73.142857v438.857143h-292.571428v-438.857143h292.571428z"
					p-id = "119721"
					fill = "#000000"
				></path>
			</svg>
		</div>
	</>;
};


class ColorPalette extends Component {
	render () {
		return <>
			<div className = "notelist-header-icon">
				<svg
					t = "1734813093634"
					className = "icon"
					viewBox = "0 0 1024 1024"
					version = "1.1"
					xmlns = "http://www.w3.org/2000/svg"
					p-id = "233500"
					width = "22"
					height = "22"
				>
					<path
						d = "M465.408 1021.1328c-21.504 0-44.1344-2.048-68.6592-5.12l-6.144-1.024c-174.336-26.624-293.2736-195.8912-298.3936-203.0592C-76.032 555.6736 8.0896 296.192 167.0656 152.6272 324.9664 9.0624 588.4928-52.48 819.2 133.1712c148.736 119.9616 193.8432 286.0544 195.8912 293.2224v2.048c21.504 116.8896 4.096 203.0592-52.2752 258.4576-86.1696 83.0976-228.6592 56.3712-248.2176 52.2752-26.6752-3.072-46.1312 5.12-60.4672 22.528-15.36 19.456-18.432 45.1072-13.312 60.4672 14.336 43.1104 16.384 75.8784 6.144 100.5056-29.7984 64.6656-90.2656 98.4576-181.5552 98.4576z m-65.6384-67.6352l6.144 1.024c99.4816 15.36 160-4.096 184.576-59.4944 0-1.024 5.12-14.336-8.192-55.3472-13.312-36.9664-3.072-85.1456 23.552-117.9136 27.6992-34.8672 68.6592-50.2272 116.8896-45.1072l3.072 1.024c1.024 0 128.1024 27.648 193.792-35.9424 40.0384-38.9632 52.3264-106.6496 34.9184-201.0112-4.096-13.312-48.2304-157.9008-175.3088-259.4304C578.2016 17.3056 347.4944 71.68 208.0256 197.7856 79.872 314.624-14.4896 537.088 143.36 778.1888c1.024 0 108.6976 153.8048 256.3584 175.3088z"
						fill = "#000000"
						p-id = "233501"
						stroke = "#000000"
						strokeWidth = "6"
					></path>
					<path
						d = "M158.8736 538.1632a61.5424 61.5424 0 1 0 123.0336 0 61.5424 61.5424 0 0 0-123.0336 0z m71.7312-184.5248a61.5424 61.5424 0 1 0 123.0848 0 61.5424 61.5424 0 0 0-123.0848 0z m184.5248-102.5536a61.5424 61.5424 0 1 0 123.0848 0 61.5424 61.5424 0 0 0-123.0848 0z m205.1072 51.2512a61.5424 61.5424 0 1 0 123.0848 0 61.5424 61.5424 0 0 0-123.0848 0z m102.5536 164.096a61.5424 61.5424 0 1 0 123.0848-0.0512 61.5424 61.5424 0 0 0-123.0848 0z"
						fill = "#000000"
						p-id = "233502"
						stroke = "#000000"
						strokeWidth = "6"
					></path>
				</svg>
			</div>
		</>;
	}
}


class DownOutLinedIcon extends Component {
	render () {
		return <div className = "down-outline-box">
			<svg
				t = "1732375419187"
				className = "icon"
				viewBox = "0 0 1024 1024"
				version = "1.1"
				xmlns = "http://www.w3.org/2000/svg"
				p-id = "120715"
				width = "10"
				height = "10"
			>
				<path
					d = "M579.043 792.408l418.544-418.641c25.83-25.827 33.48-64.34 19.53-98.087-13.95-33.655-46.79-55.52-83.14-55.52L96.8 220.16c-36.352 0-69.205 21.955-83.147 55.52-4.59 11.157-6.842 22.86-6.842 34.47 0 23.395 9.177 46.43 26.365 63.62l418.641 418.639c16.912 16.91 39.772 26.365 63.622 26.365 23.84 0 46.795-9.535 63.62-26.365L579.043 792.409 579.043 792.408z"
					fill = "gray"
					p-id = "120716"
				></path>
			</svg>
		</div>;
	}
}


const ToDoIcon = ({onClick,currentLanguage}) => {
	return <>
		<Tooltip
			title = {currentLanguage?.switchToToDoModeText}
			placement = "bottom"
			arrow = { false }
			color = '#a6aaad'
		>
			<div className='todo-icon-box notelist-header-icon' onClick={()=>{onClick('isTodoMode',true)}}>
				<svg
					t = "1740405666283"
					className = "icon"
					viewBox = "0 0 1024 1024"
					version = "1.1"
					xmlns = "http://www.w3.org/2000/svg"
					p-id = "311337"
					width = "20"
					height = "20"
				>
					<path
						d = "M354.56 663.36L459.2 759.2c11.2 9.6 24.96 14.4 38.72 14.4 15.2 0 30.4-5.92 41.92-17.44l170.88-187.2-0.32-0.16c9.76-12.64 11.52-30.4 3.2-45.12a40.304 40.304 0 0 0-34.72-20.32c-6.88 0-13.76 1.76-20.16 5.44l-4.16 3.68-0.48-0.48-153.12 169.28-89.76-74.72-0.8 0.64-10.08-8.96c-6.24-3.68-12.96-5.44-19.68-5.44-13.6 0-26.88 7.2-34.24 20-9.6 16.96-5.12 37.44 9.12 49.76l-0.96 0.8z"
						fill = "#5E6166"
						p-id = "311338"
					></path>
					<path
						d = "M884.48 0H139.52C62.4 0 0 62.4 0 139.52v744.96C0 961.6 62.4 1024 139.52 1024h744.96c76.96 0 139.52-62.4 139.52-139.52V139.52C1024 62.4 961.44 0 884.48 0zM948 893.12c0 30.24-24.64 54.88-54.88 54.88H130.88C100.64 948 76 923.2 76 893.12V373.76h872v519.36z m0-595.52H76V131.04c0-30.24 24.64-54.88 54.88-54.88h762.08c30.4 0 54.88 24.64 54.88 54.88V297.6z"
						fill = "#5E6166"
						p-id = "311339"
					></path>
				</svg>
			</div>
		</Tooltip></>;
};

class LeftExpandIcon extends Component {
	render () {
		return <>
			<Tooltip
				title = {this.props.currentLanguage?.expandSidebar}
				placement = "bottom"
				arrow = { false }
				color = '#a6aaad'
			>
				<div
					className = "expand-icon"
					onClick = { () => {
						this.props.onClick();
					} }
				>
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
				</div>
			</Tooltip>
		</>;
	}
}


export { NoteManagePanel };
