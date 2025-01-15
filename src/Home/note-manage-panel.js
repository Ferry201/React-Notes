import React , { Component } from 'react';
import { Reaxlass , reaxper } from 'reaxes-react';
import { reaxel_sider } from '@src/Home/sider.reaxel';
import { Modal , Dropdown , Space , Tooltip ,Popover} from 'antd';
import { ExclamationCircleFilled } from '@ant-design/icons';
import RenderContent from '@src/Home/renderContent';
import './note.css';
import dayjs from "dayjs";

@reaxper
class NoteManagePanel extends Reaxlass {
	constructor (props) {
		super(props);
		this.inputRenameRef = React.createRef();
		
		this.state = {
			isSearch : false ,
			isHover : false ,//DefaultExpandIcon hover时改变显示的svg
			isModalVisible : false ,
			noteFeaturesMenu : this.generateNoteFeaturesMenu() ,
			isRenaming : false ,
			title : this.props.currentNotebook.title ,
			isClicked : false ,
		};
		
	}
	
	
	
	componentDidUpdate (prevProps) {
		if ( prevProps.currentNotebook.id !== this.props.currentNotebook.id ) {
			this.setState({
				noteFeaturesMenu : this.generateNoteFeaturesMenu() ,
				title : this.props.currentNotebook.title ,
			});
		}
	}
	
	
	generateNoteFeaturesMenu = () => {
		return [
			{
				label : <div>重命名</div> ,
				key : 'rename' ,
			} ,
			{
				label : <div>换封面</div> ,
				key : 'change-cover' ,
			} ,
			{
				label : <div>置顶笔记本</div> ,
				key : 'pinned-notebook' ,
			} ,
			{
				label : <div>导出PDF</div> ,
				key : 'export-pdf' ,
			} ,
			{
				key : 'notebook-detail' ,
				label : <div>详情</div> ,
				children : [
					{
						key : 'notebook-create-time' ,
						label : <span>创建时间:{ dayjs(this.props.currentNotebook.createdTime).format('YYYY-MM-DD HH:mm') }</span> ,
					} ,
				] ,
			} ,
			{
				label : <div>分享</div> ,
				key : 'share-notebook' ,
			} , {
				label : <div className = "dropdown-delete-notebook-button">删除笔记本</div> ,
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
		const newTitle = e.target.value;
		this.props.updateNotebookInfo('title' , newTitle);
	};
	handleBlur = (e) => {
		this.setState({
			isRenaming : false ,
			title : e.target.value ,
		} , () => {
			this.renameNotebookTitle(e);
		});
	};
	handleKeyDown = (e) => {
		if ( e.key === 'Enter' ) {
			this.setState({
				isRenaming : false ,
				title : e.target.value ,
			} , () => {
				this.renameNotebookTitle(e);
			});
		}
	};
	
	
	
	render () {
		const {
			onChangeNote ,
			onDeleteNote ,
			OnSwitchMode ,
			onToggleSidebar ,
			currentNotebook ,
			notesAmount ,
			updateNotebookInfo ,
			pinNote ,
			favoriteNote ,
			isShowFavorites ,
			noteList ,
			openModal,
			onSave,
			onCancel,
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
		
		
		return <div className = { `note-container${ resizing ? ' resizing' : '' } ${ currentNotebook.currentTheme }` }>
			{/*顶部工具栏*/ }
			<div className = { `main-section-header ${ currentNotebook.currentTheme }` }>
				{/*笔记本名称 & dropdown*/ }
				<div className = "note-title-bar">
					<div
						onMouseEnter = { this.handleMouseEnter }
						onMouseLeave = { this.handleMouseLeave }
					>
						{ !siderCollapsed ? (
							<LeftExpandIcon
								onclick = { () => {
									this.setState({
										isHover : false ,
										isClicked : true ,
									} , () => {
										//点击后，鼠标事件会被 isClicked 屏蔽，避免触发 isHover: true
										toggleSiderCollapse();
										// 延迟重置 isClicked，防止鼠标事件干扰
										setTimeout(() => {
											this.setState({ isClicked : false });
										} , 0);
									});
								} }
							/>) : (this.state.isHover ? (
							<RightExpandIcon
								onclick = { () => {
									toggleSiderCollapse();
								} }
							/>) : (
								       <DefaultExpandIcon />
							       )) }
					</div>
					{/*当前笔记本*/ }
					{ isRenaming ?
					  (<input
						  type = "text"
						  defaultValue = { this.state.title }
						  onBlur = { this.handleBlur }
						  onKeyDown = { this.handleKeyDown }
						  ref = { this.inputRenameRef }
						  className = "rename-input"
					  />) :
					  (<h2>{ this.state.title }({ notesAmount })</h2>) }
					
					{/*笔记本下拉操作菜单*/ }
					{ !isRenaming && currentNotebook.id !== 'favorites-notes-id' && <Dropdown
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
									this.props.openModal('changeCover');
								}
								if ( key === 'delete-notebook' ) {
									this.props.openModal('deleteConfirm');
								}
							} ,
						} }
						trigger = { ['click' , 'hover'] }
					>
						<a onClick = { (e) => e.preventDefault() }>
							<DownOutLinedIcon />
						</a>
					</Dropdown> }
				</div>
				
				{/* 切换显示模式 选择主题颜色*/ }
				<div className = "top-tool-bar">
					<ModeSelector
						onSwitchNoteMode = { updateNotebookInfo }
						showMode = { currentNotebook.showMode }
					/>
					
					<ThemeColorSelector
						selectTheme = { updateNotebookInfo }
						theme = { currentNotebook.currentTheme }
					/>
					
				</div>
			</div>
			
			
			{/*Note List*/ }
			<RenderContent
				noteList = { noteList }
				changeNote = { onChangeNote }
				deleteNote = { onDeleteNote }
				ShowMode = { currentNotebook.showMode }
				currentNotebook = { currentNotebook }
				pinNote = { pinNote }
				favoriteNote = { favoriteNote }
				isShowFavorites = { isShowFavorites }
				openModal = { openModal }
				onSave = { onSave }
				onCancel = { onCancel }
			/>
		</div>;
	}
};
const ThemeColorSelector = ({selectTheme,theme}) => {
	return <>
		<Popover
			content = { <ThemeColorPanel
				selectTheme = { selectTheme }
				theme = { theme }
			/> }
		>
			<div><ColorPalette /></div>
		</Popover>
	</>;
};
const ThemeColorPanel=({selectTheme,theme})=>{
	const allThemeColors = [
		'blue-theme' , 'purple-theme' , 'red-theme' , 'green-theme' , 'gray-theme' , 'orange-theme' , 'pink-theme' , 'gradient-theme-blue-yellow' ,
		'gradient-theme-blue-purple' , 'gradient-theme-green-blue' , 'image-background-wheat' , 'image-background-windmill' ,
		'image-background-beach' , 'image-background-tower' , 'image-background-pinksky' , 'image-background-mountain',
	];
	return (<div>
		<div>主题选择</div>
		<div className = "theme-color-panel">
			{allThemeColors.map((item)=> {
				return <div
					className = {`color-little-box ${item}`}
					key = { item }
					onClick={()=>{selectTheme('currentTheme' , item);}}
				></div>;
			}) }
		</div>
	</div>)
}

const selectBackgroundColorContent = (
	<div>
		<div>主题选择</div>
		<ThemeColorPanel />
	</div>
);
//显示模式选择器
const ModeSelector = ({
	onSwitchNoteMode ,
	showMode ,
}) => {
	const modeOptions = [
		{
			key : 'modeOptions' ,
			type : 'group' ,
			label : '笔记显示模式' ,
			children : [
				{
					label : <div>列表模式</div> ,
					key : 'list-mode' ,
				} ,
				{
					label : <div>卡片模式</div> ,
					key : 'card-mode' ,
				} ,
				{
					label : <div>宫格模式</div> ,
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
		trigger = { ['click'] }
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

//主题颜色选择器
const ThemeSelector = ({
	selectTheme ,
	theme ,
}) => {
	const themeOptions = [
		{
			key : 'themeOptions' ,
			type : 'group' ,
			label : '主题色系' ,
			children : [
				
				{
					label : <div>蓝色</div> ,
					key : 'blue-theme' ,
				} ,
				{
					label : <div>紫色</div> ,
					key : 'purple-theme' ,
				} ,
				{
					label : <div>红色</div> ,
					key : 'red-theme' ,
				} ,
				{
					label : <div>绿色</div> ,
					key : 'green-theme' ,
				} ,
				{
					label : <div>灰色</div> ,
					key : 'gray-theme' ,
				} ,
				{
					label : <div>橙色</div> ,
					key : 'orange-theme' ,
				} ,
				{
					label : <div>粉色</div> ,
					key : 'pink-theme' ,
				} ,
				{
					key : 'gradient-color-list' ,
					label : <div>渐变背景</div> ,
					children : [
						{
							label : <div>渐变1</div> ,
							key : 'gradient-theme-blue-yellow' ,
						} ,
						{
							label : <div>渐变2</div> ,
							key : 'gradient-theme-blue-purple' ,
						} ,
						{
							label : <div>渐变4</div> ,
							key : 'gradient-theme-green-blue' ,
						} ,
					] ,
				} ,
				{
					key : 'image-list' ,
					label : <div>图片背景</div> ,
					children : [
						{
							label : <div>wheat</div> ,
							key : 'image-background-wheat' ,
						} ,
						{
							label : <div>图片3</div> ,
							key : 'image-background-windmill' ,
						} ,
						{
							label : <div>图片4</div> ,
							key : 'image-background-mountain' ,
						} ,
						{
							label : <div>图片5</div> ,
							key : 'image-background-beach' ,
						} ,
						{
							label : <div>图片6</div> ,
							key : 'image-background-tower' ,
						} ,
						{
							label : <div>图片7</div> ,
							key : 'image-background-pinksky' ,
						} ,
					
					] ,
				} ,
			
			
			] ,
		} ,
	
	
	];
	return (<Dropdown
		destroyPopupOnHide = { true }
		placement = "bottom"
		menu = { {
			items : themeOptions ,
			selectable : true ,
			defaultSelectedKeys : [theme] ,
			onClick : ({ key }) => {
				selectTheme('currentTheme' , key);
			} ,
		} }
		trigger = { ['click'] }
	>
		<a onClick = { (e) => e.preventDefault() }>
			<Space>
				<ColorPalette />
			</Space>
		</a>
	</Dropdown>);
};

const CardModeIcon = () => {
	return <div>
		<Tooltip
			title = "点击选择显示模式"
			placement = "bottom"
			zIndex = "1"
		>
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
		</Tooltip>
	</div>;
};
const ListModeIcon = () => {
	return <div>
		<Tooltip
			title = "点击选择显示模式"
			placement = "bottom"
			zIndex = "1"
		>
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
		</Tooltip>
	</div>;
};
const GridModeIcon = () => {
	return <div>
		<Tooltip
			placement = "bottom"
			title = "点击选择显示模式"
			zIndex = "1"
		>
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
		</Tooltip>
	</div>;
};


class ColorPalette extends Component {
	render () {
		return <div>
			<Tooltip
				placement = "bottom"
				title = "点击选择主题"
				zIndex = "1"
			>
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
			</Tooltip>
		</div>;
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









export { NoteManagePanel };
