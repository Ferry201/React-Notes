import { ResizableBox } from 'react-resizable';
import 'react-resizable/css/styles.css';
import React , { Component , useState } from 'react';
import AddNoteBookModal from './addNoteBook_Model';
import { UserOutlined } from '@ant-design/icons';
import { Avatar , Space , Divider } from 'antd';
import './note.css';
import { DownOutlined , UpOutlined } from '@ant-design/icons';
import { v4 as uuidv4 } from 'uuid';
import coverDefault from './img-collection/cover-default.png';


@reaxper
export class NoteSidebar extends Component {
	constructor (props) {
		super(props);
		
	}
	
	state = {
		siderbarWidth : 200 ,
		noteBookArray : [] ,
		expandSubMenu : true ,
		selectedNotebookId : null ,
	};
	
	componentDidMount () {
		const storedNoteBooks = localStorage.getItem('notebook-array');
		
		if ( storedNoteBooks === null ) {
			
			// 将默认笔记本存入 localStorage
			localStorage.setItem('notebook-array' , JSON.stringify([this.props.defaultNotebook]));
			
			// 更新组件状态
			this.setState({ noteBookArray : [this.props.defaultNotebook] });
		} else {
			// 如果有数据，从 localStorage 中加载
			this.setState({ noteBookArray : JSON.parse(storedNoteBooks) });
		}
	}
	
	//传给Modal的
	addNoteBook = (newNoteBook) => {
		this.setState((prevState) => {
			const updatedNotebooks = [
				newNoteBook ,
				...prevState.noteBookArray ,
			];
			return { noteBookArray : updatedNotebooks };
		} , () => {
			localStorage.setItem('notebook-array' , JSON.stringify(this.state.noteBookArray));
			this.props.handleToggleNoteBook(newNoteBook);//添加后立刻显示新添加笔记本页面
		});
	};
	
	handleSetWidth = (width) => {
		this.setState({ siderbarWidth : width });
	};
	handleFoldSubMenu = () => {
		this.setState({ expandSubMenu : !this.state.expandSubMenu });
	};
	handleImageError = (e) => {
		if ( e.target.src !== coverDefault ) {  // 仅当图片的 src 不是默认封面时才替换
			e.target.src = coverDefault; // 设置默认封面
			alert('图片加载失败，使用默认封面');
		}
	};
	handleClickNotebook = (notebook) => {
		this.setState({ selectedNotebookId : notebook.id } , () => {
			this.props.handleToggleNoteBook(notebook);
		});
	};
	
	render () {
		const {
			siderCollapsed ,
			resizing ,
			toggleResizing ,
		} = reaxel_sider();
		const {
			noteBookArray ,
			expandSubMenu ,
		} = this.state;
		
		
		
		
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
				minConstraints = { [200 , 0] } // 设置最小宽度
				maxConstraints = { [380 , 0] } // 设置最大宽度
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
				className = { `resizable-box ${ siderCollapsed ? 'collpased' : '' } ${ resizing ? 'resizing' : '' }` }
				handle = { <div className = "resize-handle-container">
					<div className = "custom-resize-handle" />
				</div> }
			>
				
				<div className = "sidebar-container">
					<div className = "sidebar-content-panel">
						{/*用户信息*/ }
						<Avatar
							style = { { backgroundColor : '#dcdcdc' } }
							icon = { <UserOutlined /> }
						/>
						<span>user name</span>
						<Divider style = { { borderColor : '#e4e4e4' } } />
						{/*sidebar主要功能菜单列表*/ }
						<div className = "sidebar-menu-list">
							
							<div className = "sub-menu">
								<div
									className = "sub-menu-title"
									onClick = { this.handleFoldSubMenu }
								>
									<div
										className = "all-notebook-header"
									>
										<NoteBookIcon />
										<div className = "title-add">
											<span>笔记本</span>
											<div
												onClick = { (e) => e.stopPropagation() }
											>
												<AddNoteBookModal addNotebook = { this.addNoteBook }><AddNewBookIcon /></AddNoteBookModal>
											
											</div>
										</div>
									</div>
									{ expandSubMenu ? <UpOutlined style = { { color : 'rgb(179 179 179)' } } /> : <DownOutlined style = { { color : 'rgb(179 179 179)' } } /> }
								
								</div>
								<div className = { expandSubMenu ? 'sub-menu-content' : 'sub-menu-content-disappear' }>
									{ noteBookArray.map((book , index) => {
										const isSelected = this.state.selectedNotebookId === book.id;
										return <div
											key = { index }
											className = "notebook-option"
										>
											<img
												src = { book.cover }
												alt = { book.title }
												className = {`notebook-cover ${isSelected ? 'selected' : ''}`}
												onError = { this.handleImageError }
												onClick = { () => {
													this.handleClickNotebook(book);
												} }
											/>
											<span className = "notebook-title">{ book.title }</span>
										</div>;
									}) }
								</div>
							</div>
							
							<div className = "menu-item">
								<MarkNoteIcon />
								<span>收藏夹</span>
							</div>
							<div className = "menu-item">
								<RecycleBinIcon />
								<span>回收站</span>
							</div>
							<div className = "menu-item">
								<SettingIcon />
								<span>设置</span>
							</div>
							<div className = "menu-item">
								<FeedbackIcon />
								<span>反馈</span>
							</div>
						
						</div>
					</div>
				
				</div>
			</ResizableBox>
		</div>;
	}
}

const AddNewBookIcon = () => {
	return <svg
		t = "1732428997742"
		className = "icon"
		viewBox = "0 0 1024 1024"
		version = "1.1"
		xmlns = "http://www.w3.org/2000/svg"
		p-id = "152069"
		width = "16"
		height = "16"
	>
		<path
			d = "M896 544H128c-19.2 0-32-12.8-32-32s12.8-32 32-32h768c19.2 0 32 12.8 32 32s-12.8 32-32 32z"
			fill = "#333333"
			p-id = "152070"
		></path>
		<path
			d = "M512 928c-19.2 0-32-12.8-32-32V128c0-19.2 12.8-32 32-32s32 12.8 32 32v768c0 19.2-12.8 32-32 32z"
			fill = "#333333"
			p-id = "152071"
		></path>
	</svg>;
};

class NoteBookIcon extends Component {
	render () {
		return <svg
			t = "1732351694565"
			className = "NoteBookIcon"
			viewBox = "0 0 1024 1024"
			version = "1.1"
			xmlns = "http://www.w3.org/2000/svg"
			p-id = "5564"
			width = "32"
			height = "32"
		>
			<path
				d = "M204.8 122.5H278v805.9h-73.2c-20.1 0-36.6-15.1-36.6-33.6V156.1c0-18.5 16.4-33.6 36.6-33.6zM278 122.5H846.4c22.3 0 40.6 15.1 40.6 33.6v738.8c0 18.5-18.3 33.6-40.6 33.6H278v-806z"
				fill = "#3173E7"
				p-id = "5565"
			></path>
			<path
				d = "M278 95.6H846.4c22.3 0 40.6 15.1 40.6 33.6V868c0 18.5-18.3 33.6-40.6 33.6H278v-806z"
				fill = "#e0f1fa"
				p-id = "5566"
				data-spm-anchor-id = "a313x.search_index.0.i7.1f493a81V9LBvn"
				className = ""
			></path>
			<path
				d = "M213 95.6h89.1v805.9H213c-24.5 0-44.6-15.1-44.6-33.6V129.2c0-18.5 20-33.6 44.6-33.6z"
				fill = "#5EADEF"
				p-id = "5567"
			></path>
			<path
				d = "M193.8 867.9V129.2c0-18.5 21.9-33.6 48.6-33.6h-25.7c-26.8 0-48.6 15.1-48.6 33.6V868c0 18.5 21.9 33.6 48.6 33.6h25.7c-26.7-0.1-48.6-15.2-48.6-33.7z"
				fill = "#4C96EC"
				p-id = "5568"
			></path>
			<path
				d = "M524.7 498c0.6-0.2 0.2-0.1-0.2-0.2l0.2 0.2z"
				fill = "#202020"
				p-id = "5569"
			></path>
			<path
				d = "M226.3 173.9m-26.6 0a26.6 26.6 0 1 0 53.2 0 26.6 26.6 0 1 0-53.2 0Z"
				fill = "#E7F5FD"
				p-id = "5570"
			></path>
			<path
				d = "M226.3 251.3m-26.6 0a26.6 26.6 0 1 0 53.2 0 26.6 26.6 0 1 0-53.2 0Z"
				fill = "#E7F5FD"
				p-id = "5571"
			></path>
			<path
				d = "M226.3 328.7m-26.6 0a26.6 26.6 0 1 0 53.2 0 26.6 26.6 0 1 0-53.2 0Z"
				fill = "#E7F5FD"
				p-id = "5572"
			></path>
			<path
				d = "M226.3 406.1m-26.6 0a26.6 26.6 0 1 0 53.2 0 26.6 26.6 0 1 0-53.2 0Z"
				fill = "#E7F5FD"
				p-id = "5573"
			></path>
			<path
				d = "M226.3 483.5m-26.6 0a26.6 26.6 0 1 0 53.2 0 26.6 26.6 0 1 0-53.2 0Z"
				fill = "#E7F5FD"
				p-id = "5574"
			></path>
			<path
				d = "M226.3 560.9m-26.6 0a26.6 26.6 0 1 0 53.2 0 26.6 26.6 0 1 0-53.2 0Z"
				fill = "#E7F5FD"
				p-id = "5575"
			></path>
			<path
				d = "M226.3 638.3m-26.6 0a26.6 26.6 0 1 0 53.2 0 26.6 26.6 0 1 0-53.2 0Z"
				fill = "#E7F5FD"
				p-id = "5576"
			></path>
			<path
				d = "M226.3 715.7m-26.6 0a26.6 26.6 0 1 0 53.2 0 26.6 26.6 0 1 0-53.2 0Z"
				fill = "#E7F5FD"
				p-id = "5577"
			></path>
			<path
				d = "M226.3 793.1m-26.6 0a26.6 26.6 0 1 0 53.2 0 26.6 26.6 0 1 0-53.2 0Z"
				fill = "#E7F5FD"
				p-id = "5578"
			></path>
			<path
				d = "M154.6 163c-9.7 0-17.6 5.7-17.6 12.8 0 7.1 7.9 12.8 17.6 12.8h56.9c9.7 0 17.6-5.7 17.6-12.8 0-7.1-7.9-12.8-17.6-12.8h-56.9zM154.6 240.4c-9.7 0-17.6 5.7-17.6 12.8 0 7.1 7.9 12.8 17.6 12.8h56.9c9.7 0 17.6-5.7 17.6-12.8 0-7.1-7.9-12.8-17.6-12.8h-56.9zM154.6 317.8c-9.7 0-17.6 5.7-17.6 12.8 0 7.1 7.9 12.8 17.6 12.8h56.9c9.7 0 17.6-5.7 17.6-12.8 0-7.1-7.9-12.8-17.6-12.8h-56.9zM154.6 395.2c-9.7 0-17.6 5.7-17.6 12.8 0 7.1 7.9 12.8 17.6 12.8h56.9c9.7 0 17.6-5.7 17.6-12.8 0-7.1-7.9-12.8-17.6-12.8h-56.9zM154.6 472.6c-9.7 0-17.6 5.7-17.6 12.8 0 7.1 7.9 12.8 17.6 12.8h56.9c9.7 0 17.6-5.7 17.6-12.8 0-7.1-7.9-12.8-17.6-12.8h-56.9zM154.6 550c-9.7 0-17.6 5.7-17.6 12.8 0 7.1 7.9 12.8 17.6 12.8h56.9c9.7 0 17.6-5.7 17.6-12.8 0-7.1-7.9-12.8-17.6-12.8h-56.9zM154.6 627.4c-9.7 0-17.6 5.7-17.6 12.8 0 7.1 7.9 12.8 17.6 12.8h56.9c9.7 0 17.6-5.7 17.6-12.8 0-7.1-7.9-12.8-17.6-12.8h-56.9zM154.6 704.8c-9.7 0-17.6 5.7-17.6 12.8s7.9 12.8 17.6 12.8h56.9c9.7 0 17.6-5.7 17.6-12.8s-7.9-12.8-17.6-12.8h-56.9zM154.6 782.2c-9.7 0-17.6 5.7-17.6 12.8 0 7.1 7.9 12.8 17.6 12.8h56.9c9.7 0 17.6-5.7 17.6-12.8 0-7.1-7.9-12.8-17.6-12.8h-56.9z"
				fill = "#FCCA4C"
				p-id = "5579"
			></path>
			<path
				d = "M631.533 95.538v805.9h-21.8v-805.9z"
				fill = "#e0f1fa"
				p-id = "5580"
				data-spm-anchor-id = "a313x.search_index.0.i1.1f493a81V9LBvn"
				className = ""
			></path>
			<path
				d = "M728.8 204.5v-9.8l30.1-16.9c7-3.9 14.6-7.7 21.8-10.7l-0.1-0.3c-8.2 0.5-16.5 0.7-27.8 0.7h-24.1v-9h64.4V169l-29.8 16.8c-7.1 4-14.5 7.7-21.3 10.4l0.1 0.3c8.8-0.8 17-1 27.3-1h23.7v9h-64.3zM761.6 269.1c-22.4 0-33.7-12-33.7-27.7 0-16.4 13.3-26.9 32.7-26.9 20.3 0 33.6 11.3 33.6 27.8-0.1 17.1-14.1 26.8-32.6 26.8z m-0.8-44.3c-13 0-25 5.9-25 17 0 11.3 11.7 17.1 25.4 17.1 12.3 0 24.9-5.4 24.9-16.9 0-11.9-12.7-17.2-25.3-17.2zM784.8 317.4V300h-56v-9.8h56v-17.3h8.3v44.5h-8.3zM728.8 359.8v-35.1h64.4v33.7H785v-23.9h-18.6V357h-8.1v-22.6h-21.4v25.3h-8.1zM763.3 397.1c-1.7 6.7-7.1 12.9-16.1 12.9-6.8 0-10.8-3.2-13-5.6-4.1-4.3-6.1-11.4-6.1-22 0-5.7 0.4-10 0.8-12.8h63.4c0.8 3.6 1.3 9.3 1.3 15.1 0 19.6-9.6 23-16.1 23-6.1 0-11.5-3.9-14.1-10.6h-0.1zM736 379.4c-0.3 1.4-0.3 3.4-0.3 5.9 0 7.8 3.3 14.6 11.8 14.6s11.6-7.3 11.6-14.8v-5.6H736z m30.3 5.9c0 7.7 4.3 12.6 10.3 12.6 7.7 0 9.7-6.2 9.7-12.3 0-3.2-0.3-5.1-0.5-6.3h-19.4v6zM761.6 471.5c-22.4 0-33.7-12-33.7-27.7 0-16.4 13.3-26.9 32.7-26.9 20.3 0 33.6 11.3 33.6 27.8-0.1 17.1-14.1 26.8-32.6 26.8z m-0.8-44.3c-13 0-25 5.9-25 17 0 11.3 11.7 17.1 25.4 17.1 12.3 0 24.9-5.4 24.9-16.9 0-11.9-12.7-17.2-25.3-17.2zM761.6 532.7c-22.4 0-33.7-12-33.7-27.7 0-16.4 13.3-26.9 32.7-26.9 20.3 0 33.6 11.3 33.6 27.8-0.1 17-14.1 26.8-32.6 26.8z m-0.8-44.3c-13 0-25 5.9-25 17 0 11.3 11.7 17.1 25.4 17.1 12.3 0 24.9-5.4 24.9-16.9 0-11.9-12.7-17.2-25.3-17.2zM728.8 587v-11.4l30.4-17.8-6.7-5.4h-23.6v-9.7h64.4v9.7h-30.2v0.3c2.5 1.5 4.9 3.1 7.2 4.6l23.1 16.6v11.9L766 564.7 728.8 587z"
				fill = "#3173E7"
				p-id = "5581"
			></path>
			<path
				d = "M302.1 731.7h584.6v65.5H302.1z"
				fill = "#e0f1fa"
				p-id = "5582"
				data-spm-anchor-id = "a313x.search_index.0.i0.1f493a81V9LBvn"
				className = ""
			></path>
			<path
				d = "M846.1 95.6h-54c22.3 0 40.6 15.1 40.6 33.6V868c0 18.5-18.3 33.6-40.6 33.6h54c22.3 0 40.6-15.1 40.6-33.6V129.2c0-18.5-18.2-33.6-40.6-33.6z"
				fill = "#EFF6F9"
				p-id = "5583"
				data-spm-anchor-id = "a313x.search_index.0.i9.1f493a81V9LBvn"
				className = ""
			></path>
			<path
				d = "M832.7 731.7h53.9v65.5h-53.9z"
				fill = "#ecf7fd"
				p-id = "5584"
				data-spm-anchor-id = "a313x.search_index.0.i8.1f493a81V9LBvn"
				className = ""
			></path>
		</svg>;
	}
}

class MarkNoteIcon extends Component {
	render () {
		return <svg
			t = "1732362721786"
			className = "MarkNoteIcon"
			viewBox = "0 0 1024 1024"
			version = "1.1"
			xmlns = "http://www.w3.org/2000/svg"
			p-id = "37844"
			width = "32"
			height = "32"
		>
			<path
				d = "M452.629 807.455l-206.403 108.27c-22.497 11.802-50.302 3.13-62.104-19.367a46 46 0 0 1-4.6-29.161l39.37-229.03a46 46 0 0 0-13.263-40.769L38.933 435.272c-18.212-17.713-18.617-46.836-0.904-65.048a46 46 0 0 1 26.376-13.452l230.548-33.426a46 46 0 0 0 34.632-25.13l103.18-208.6c11.264-22.772 38.855-32.1 61.627-20.837a46 46 0 0 1 20.837 20.837l103.18 208.6a46 46 0 0 0 34.632 25.13l230.548 33.426c25.143 3.645 42.57 26.982 38.924 52.124a46 46 0 0 1-13.452 26.376L742.365 597.398a46 46 0 0 0-13.263 40.769l39.37 229.03c4.303 25.038-12.505 48.824-37.543 53.128a46 46 0 0 1-29.161-4.6l-206.403-108.27a46 46 0 0 0-42.736 0z"
				fill = "#f4ea2a"
				p-id = "37845"
			></path>
		</svg>;
	}
}

class RecycleBinIcon extends Component {
	render () {
		return <svg
			t = "1732428900619"
			className = "icon"
			viewBox = "0 0 1024 1024"
			version = "1.1"
			xmlns = "http://www.w3.org/2000/svg"
			p-id = "150980"
			width = "32"
			height = "32"
		>
			<path
				d = "M253.952 783.872c0 75.776 45.568 137.728 117.248 137.728H645.12c76.8 0 140.8-67.584 140.8-137.728V258.56c0-6.656-4.096-1.536-10.752-1.536H322.048l-68.096 1.536v525.312zM583.68 363.52h40.96v382.464h-40.96V363.52z m-168.448 0h40.96v382.464h-40.96V363.52z"
				fill = "#F5BE39"
				p-id = "150981"
			></path>
			<path
				d = "M826.88 132.608c-3.072-18.432-22.016-31.232-43.52-28.16l-250.88 39.424c0-1.024 0-2.56-0.512-3.584l-2.56-14.848c-2.56-14.848-15.872-24.576-30.72-22.528-7.168 1.024-13.312 5.12-17.408 10.752-4.096 5.632-6.144 12.8-4.608 19.968l2.56 14.848c0 1.024 0.512 2.56 1.024 3.584l-250.88 39.424c-9.216 1.024-17.92 6.144-24.576 13.312-6.656 7.68-9.216 17.408-7.68 26.624 2.56 16.384 17.92 28.672 36.864 28.672 2.048 0 4.608 0 6.656-0.512l11.264-1.536s2.048 0 2.048 0.512l68.096-1.536 472.576-78.848c20.48-3.584 35.328-26.624 32.256-45.568z"
				fill = "#FFE088"
				p-id = "150982"
			></path>
		</svg>;
	}
}

class SettingIcon extends Component {
	render () {
		return <svg
			t = "1732366355789"
			className = "icon"
			viewBox = "0 0 1024 1024"
			version = "1.1"
			xmlns = "http://www.w3.org/2000/svg"
			p-id = "100467"
			width = "32"
			height = "32"
		>
			<path
				d = "M512 512m-186.3 0a186.3 186.3 0 1 0 372.6 0 186.3 186.3 0 1 0-372.6 0Z"
				fill = "#f4a2b1"
				p-id = "100468"
				data-spm-anchor-id = "a313x.search_index.0.i106.1f493a81V9LBvn"
				className = "selected"
			></path>
			<path
				d = "M561.7 948.7h-102c-13.9 0-25.6-10.5-27.1-24.3l-7.2-65.9c-34.7-8.7-67.5-22.4-98-40.9l-50 39.9c-10.9 8.7-26.5 7.8-36.3-2L169 783.6c-9.9-9.9-10.7-25.6-2-36.4l39.9-49.7c-19.1-31.2-33.1-64.8-41.8-100.3L99.6 590c-13.8-1.5-24.3-13.2-24.3-27.1V461.2c0-13.9 10.5-25.6 24.3-27.1l65.2-7.2c8.7-35.8 22.8-64.7 42.1-96.1l-40.3-45c-8.7-10.9-7.9-26.6 2-36.4l77.2-87.1c9.8-9.8 25.5-10.7 36.3-2l50.5 40.3c30.5-18.5 58.2-27.1 92.7-35.7l7.2-65.2c1.5-13.8 13.2-24.3 27.1-24.3h102c13.9 0 25.6 10.5 27.1 24.3l7.1 63.9c36.3 8.5 70.6 22.4 102.4 41.5l49.7-39.7c10.8-8.6 26.4-7.8 36.3 2l72.2 71.9c9.9 9.9 10.7 25.6 2 36.5l-39.3 48.8c19.7 31.9 34.1 66.4 42.9 102.8l62.3 6.8c13.8 1.5 24.3 13.2 24.3 27.1V563c0 13.9-10.5 25.6-24.3 27.1l-62.4 6.8c-8.9 36.3-23.3 70.6-43 102.5l39.6 49.1c8.7 10.9 7.9 26.6-2 36.5l-72.2 71.9c-9.9 9.8-25.6 10.6-36.3 2l-50.2-40.2c-31.7 19-65.8 32.8-101.9 41.2l-7.1 64.6c-1.5 13.8-13.2 24.2-27.1 24.2z m-77.6-54.5h53.1l6.6-60c1.3-12.1 10.5-21.8 22.4-23.9 42.6-7.4 82.3-23.5 118-47.7 9.9-6.7 23-6.2 32.4 1.3L763 801l37.5-37.4-36.6-45.6c-7.6-9.5-8.1-22.8-1.1-32.8 25.1-35.7 41.9-75.6 49.7-118.3 2.2-11.8 11.9-20.9 23.9-22.2l57.7-6.3v-52.8l-57.6-6.3c-12-1.3-21.7-10.4-23.9-22.2-7.8-42.9-24.5-82.9-49.6-118.7-7-9.9-6.5-23.3 1.1-32.8l36.4-45.2L763 223l-46 36.7c-9.3 7.5-22.5 8-32.4 1.2-35.8-24.3-75.6-40.5-118.4-48-12-2.1-21.1-11.8-22.4-23.9l-6.6-59.3h-53.1l-6.7 60.3c-1.3 11.9-10.2 21.5-22 23.8-41.2 7.9-74.5 18.9-109.1 42.6-9.9 6.7-23.1 6.3-32.5-1.2L267.1 218l-42.6 52.6 37.3 41.3c7.6 9.4 8.1 22.7 1.1 32.7-24.6 35.4-40.9 69.8-48.8 112.2-2.2 11.9-11.9 20.9-23.9 22.2l-60.5 6.7v52.8l60.6 6.7c12 1.3 21.6 10.3 23.9 22.1 7.8 42 24.1 81.2 48.5 116.4 6.9 9.9 6.4 23.2-1.2 32.6l-36.9 46 37.5 37.4 46.3-37c9.4-7.5 22.5-8 32.5-1.2 34.7 23.8 73.1 39.9 114.4 47.8 11.8 2.3 20.7 11.9 22 23.8l6.8 61.1z"
				fill = "#221E1F"
				p-id = "100469"
			></path>
			<path
				d = "M512 621c-60.2 0-109.2-48.9-109.2-109s49-109 109.2-109 109.2 48.9 109.2 109-49 109-109.2 109z m0-163.4c-30.1 0-54.6 24.4-54.6 54.4s24.5 54.4 54.6 54.4 54.6-24.4 54.6-54.4-24.5-54.4-54.6-54.4z"
				fill = "#221E1F"
				p-id = "100470"
			></path>
		</svg>;
	}
}

const FeedbackIcon = () => {
	return <svg
		t = "1732365950155"
		className = "icon"
		viewBox = "0 0 1024 1024"
		version = "1.1"
		xmlns = "http://www.w3.org/2000/svg"
		p-id = "88668"
		width = "32"
		height = "32"
	>
		<path
			d = "M512 0c253.528276 0 459.034483 199.13269 459.034483 444.751448 0 108.914759-40.430345 208.648828-107.52 286.013793C716.093793 911.006897 507.109517 1024 507.109517 1024l-2.983724-134.62069C254.234483 885.318621 52.965517 687.845517 52.965517 444.786759 52.965517 199.13269 258.471724 0 512 0z m164.510897 374.360276c7.697655-14.388966 11.581793-31.108414 11.581793-50.228966a120.884966 120.884966 0 0 0-20.321104-67.372138c-13.506207-20.621241-32.679724-36.934621-57.467586-48.957793-24.823172-11.987862-53.442207-18.008276-85.839448-18.008276-34.833655 0-65.359448 7.185655-91.524414 21.556966-26.129655 14.336-46.062345 32.485517-59.674483 54.360276-13.647448 21.892414-20.44469 43.52-20.444689 64.847448 0 10.328276 4.307862 19.915034 12.888275 28.795586a42.372414 42.372414 0 0 0 31.655725 13.312c21.256828 0 35.681103-12.694069 43.290482-38.046896 8.033103-24.275862 17.849379-42.601931 29.537104-55.048828 11.581793-12.499862 29.66069-18.714483 54.272-18.714483 21.009655 0 38.135172 6.17931 51.447172 18.537931 13.294345 12.340966 19.950345 27.489103 19.950345 45.462069 0 9.163034-2.171586 17.708138-6.532414 25.56469a95.514483 95.514483 0 0 1-16.119172 21.415724c-6.355862 6.408828-16.684138 15.854345-30.984828 28.442483-13.594483 11.776-26.571034 24.187586-38.912 37.217103a122.968276 122.968276 0 0 0-23.092965 36.369656c-5.826207 13.78869-8.73931 30.155034-8.739311 48.975448 0 15.077517 3.972414 26.412138 11.899587 34.039172 7.768276 7.556414 18.361379 11.687724 29.307586 11.440552 22.351448 0 35.681103-11.652414 39.953655-35.027862 2.436414-10.981517 4.307862-18.661517 5.526069-23.07531 2.842483-10.24 8.121379-19.703172 15.412965-27.595035 4.537379-5.296552 10.699034-11.369931 18.255449-18.361379 27.489103-24.752552 46.55669-42.266483 57.202758-52.718345a152.593655 152.593655 0 0 0 27.418483-37.181793h0.052966z m-156.16 349.907862a55.790345 55.790345 0 0 0 55.896275-55.684414 55.790345 55.790345 0 0 0-55.896275-55.684414 55.790345 55.790345 0 0 0-55.878621 55.684414 55.790345 55.790345 0 0 0 55.878621 55.684414z"
			fill = "#43BE7B"
			p-id = "88669"
		></path>
	</svg>;
};

import { reaxel_sider } from './sider.reaxel';
import { reaxper } from 'reaxes-react';
import dayjs from "dayjs";
