import React , { Component } from 'react';
import { Reaxlass , reaxper } from 'reaxes-react';
import { reaxel_sider } from '@src/Home/sider.reaxel';
import { Dropdown , Space } from 'antd';
import RenderContent from '@src/Home/renderContent';
import AddNoteBookModal from './addNoteBook_Model';
import './note.css';
import dayjs from "dayjs";

@reaxper
class NoteManagePanel extends Reaxlass {
	constructor (props) {
		super(props);
		this.inputRef = React.createRef();
		
		this.state = {
			isSearch : false ,
			isHover : false ,//DefaultExpandIcon hover时改变显示的svg
			isModalVisible : false ,
			noteFeaturesMenu : this.generateNoteFeaturesMenu() ,
			isRenaming : false ,
			title : this.props.currentNotebook.title ,
		};
	}
	
	componentDidMount () {
		this.inputRef.current?.focus();
	}
	
	componentDidUpdate (prevProps) {
		if ( prevProps.currentNotebook.id !== this.props.currentNotebook.id ||prevProps.currentNotebook.title !== this.props.currentNotebook.title) {
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
				label : <div><AddNoteBookModal showTitleInput = { false }>换封面</AddNoteBookModal></div> ,
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
				label : <div className = "delete-notebook-button">删除笔记本</div> ,
				key : 'delete-notebook' ,
			} ,
		];
	};
	
	
	handleSearchNote = () => {
	};
	
	handleMouseEnter = () => {
		this.setState({ isHover : true });
	};
	handleMouseLeave = () => {
		this.setState({ isHover : false });
	};
	// 重命名笔记本
	renameNotebookTitle=(e)=>{
		const newTitle=e.target.value;
		this.props.updateNotebookTitle(newTitle)
	}
	handleBlur = (e) => {
		this.setState({ isRenaming : false },()=>{this.renameNotebookTitle(e)});
	};
	handleKeyDown = (e) => {
		if ( e.key === 'Enter' ) {
			this.setState({ isRenaming : false },()=>{this.renameNotebookTitle(e)});
		}
	};
	handleChangeTitle = (e) => {
		this.setState({ title : e.target.value });
	};
	
	render () {
		const {
			onChangeNote ,
			onDeleteNote ,
			OnSwitchMode ,
			showMode ,
			onToggleSidebar ,
			currentNotebook ,
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
		return <div className = { `note-container${ resizing ? ' resizing' : '' }` }>
			{/*顶部工具栏*/ }
			<div className = "main-section-header">
				{/*笔记本名称 & dropdown*/ }
				<div className = "note-title-bar">
					<div
						onMouseEnter = { () => this.handleMouseEnter() }
						onMouseLeave = { () => this.handleMouseLeave() }
					>
						{ !siderCollapsed ? (<LeftExpandIcon
							onclick = { () => {
								this.setState({ isHover : false } , () => {
									toggleSiderCollapse();
									console.log(isHover);
								});
							} }
						/>) : (isHover ? (<RightExpandIcon
							onclick = { () => {
								toggleSiderCollapse();
							} }
						/>) : (<DefaultExpandIcon />)) }
					</div>
					{/*当前笔记本*/ }
					{ isRenaming ?
					  (<input
						  type = "text"
						  value = { this.state.title }
						  onChange = { this.handleChangeTitle }
						  onBlur = { this.handleBlur }
						  onKeyDown = { this.handleKeyDown }
					  />) :
					  (<h2>{ this.state.title }</h2>) }
					
					{/*笔记本下拉操作菜单*/ }
					<Dropdown
						placement = "bottomLeft"
						menu = { {
							items : this.state.noteFeaturesMenu ,
							onClick : ({ key }) => {
								if ( key === 'rename' ) {
									this.setState({ isRenaming : true });
								}
							} ,
						} }
						trigger = { ['click' , 'hover'] }
					>
						<a onClick = { (e) => e.preventDefault() }>
							<DownOutLinedIcon />
						</a>
					</Dropdown>
				</div>
				
				{/*搜索 & 更多选项*/ }
				<div className = "top-tool-bar">
					<div className = "search-bar">
						<input
							ref = { this.inputRef }
							type = "text"
							className = "search-input"
							placeholder = "输入关键词..."
						/>
						<button className = "search-btn">
							<SearchNotes onSearch = { this.handleSearchNote } />
						</button>
					</div>
					<MoreNoteOptions
						onSwitchNoteMode = { OnSwitchMode }
						showMode = { showMode }
					/></div>
			</div>
			
			
			{/*Note List*/ }
			<RenderContent
				changeNote = { onChangeNote }
				deleteNote = { onDeleteNote }
				ShowMode = { showMode }
				currentNotebook = { currentNotebook }
			/>
		
		
		</div>;
	}
};

class SearchNotes extends Component {
	
	render () {
		return <svg
			onClick = { () => {
				this.props.onSearch();
			} }
			className = "search-notes"
			style = { {
				width : ' 1em' ,
				height : '1em' ,
				verticalAlign : 'middle' ,
				fill : 'currentColor' ,
				overflow : 'hidden' ,
			} }
			viewBox = "0 0 1024 1024"
			version = "1.1"
			xmlns = "http://www.w3.org/2000/svg"
			p-id = "9664"
		>
			<path
				d = "M974.00547 967.39343L694.834457 643.915973c130.349584-141.025575 136.925532-361.142986 8.539348-509.913886A382.790921 382.790921 0 0 0 413.339123 1.270436a382.863104 382.863104 0 0 0-250.052051 93.044974C85.848245 161.143212 39.073114 254.130438 31.573213 356.140646s25.170506 200.844325 92.005527 278.268715a382.805357 382.805357 0 0 0 290.056337 132.753306 382.776484 382.776484 0 0 0 215.605921-66.676216l279.192669 323.499112 65.571803-56.592133zM189.150543 577.824447c-51.712505-59.919808-76.998506-136.391372-71.194925-215.331623s41.99656-150.885887 101.923587-202.605611a296.242493 296.242493 0 0 1 193.459918-72.003384 296.242493 296.242493 0 0 1 224.462879 102.710391c106.752686 123.708671 92.987227 311.198985-30.699789 417.944452a296.293021 296.293021 0 0 1-417.95167-30.714225z"
				fill = "#231815"
				p-id = "9665"
			></path>
		</svg>;
	}
}

const MoreNoteOptions = ({
	onSwitchNoteMode ,
	showMode ,
}) => {
	const moreNoteOptions = [
		{
			label : <div>{ showMode ? '宫格模式' : '列表模式' }</div> ,
			key : 'switch-mode' ,
		} , {
			label : <div>主题背景</div> ,
			key : '1' ,
		} , {
			label : <div>11</div> ,
			key : '2' ,
		} ,
	];
	return (<Dropdown
		placement = "bottomLeft"
		menu = { {
			items : moreNoteOptions ,
			onClick : ({ key }) => {
				if ( key === 'switch-mode' ) {
					onSwitchNoteMode();
				}
				
			} ,
		} }
		trigger = { ['click' , 'hover'] }
	>
		<a onClick = { (e) => e.preventDefault() }>
			<Space>
				<MoreOptionsIcon />
			</Space>
		</a>
	</Dropdown>);
};

class MoreOptionsIcon extends Component {
	render () {
		return <svg
			className = "icon"
			style = { {
				width : '20px' ,
				height : ' 20px' ,
				verticalAlign : 'middle' ,
				fill : 'currentColor' ,
				overflow : 'hidden' ,
			} }
			viewBox = "0 0 1024 1024"
			version = "1.1"
			xmlns = "http://www.w3.org/2000/svg"
			p-id = "11550"
		>
			<path
				d = "M512 256a85.333333 85.333333 0 1 1 0-170.666667 85.333333 85.333333 0 0 1 0 170.666667z m0 341.333333a85.333333 85.333333 0 1 1 0-170.666666 85.333333 85.333333 0 0 1 0 170.666666z m0 341.333334a85.333333 85.333333 0 1 1 0-170.666667 85.333333 85.333333 0 0 1 0 170.666667z"
				fill = "#2E2F30"
				p-id = "11551"
			></path>
		</svg>;
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
