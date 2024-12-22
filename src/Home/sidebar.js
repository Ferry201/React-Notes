import { ResizableBox } from 'react-resizable';
import 'react-resizable/css/styles.css';
import React , { Component , useState } from 'react';
import { UserOutlined } from '@ant-design/icons';
import { Avatar , Space , Divider , message } from 'antd';
import './note.css';
import { DownOutlined , UpOutlined } from '@ant-design/icons';
import { v4 as uuidv4 } from 'uuid';
import dayjs from "dayjs";
import coverDefault from './img-collection/cover-default.png';

import { Collapse } from 'antd';

const text = `
  A dog is a type of domesticated animal.
  Known for its loyalty and faithfulness,
  it can be found as a welcome guest in many households across the world.
`;


@reaxper
export class NoteSidebar extends Component {
	constructor (props) {
		super(props);
		
	}
	
	state = {
		siderbarWidth : 378 ,
		isCollapse : true,
	};
	
	componentDidMount () {
		
	}
	
	handleSetWidth = (width) => {
		this.setState({ siderbarWidth : width });
	};
	
	handleImageError = (e) => {
		if ( e.target.src !== coverDefault ) {  // 仅当图片的 src 不是默认封面时才替换
			e.target.src = coverDefault; // 设置默认封面
			message.error('图片加载失败，使用默认封面');
		}
	};
	
	getNotebookItems () {
		return [
			{
				classNames : {header:this.state.isCollapse?'active-collapse':''},
				key : 'notebookItems' ,
				label : (<div className = "all-notebook-header">
					<NoteBookIcon />
					<div className = "title-add">
						<span>笔记本</span>
						<span>({ this.props.noteBookArray.length })</span>
						<div
							onClick = { (e) => e.stopPropagation() } // 阻止冒泡
							className = "add-notebook-icon-box"
						>
							<AddNewBookIcon
								onclick = { () => {
									this.props.openModal('addNotebook');
								} }
							/>
						</div>
					</div>
				</div>) ,
				children : (<div className = "sub-menu-content">
					{ this.props.noteBookArray.map((book , index) => {
						const isSelected = this.props.selectedNotebookId === book.id;
						return (<div
							key = { index }
							className = "notebook-option"
						>
							<img
								src = { book.cover }
								alt = { book.title }
								className = { `notebook-cover ${ isSelected ? 'selected' : '' }` }
								onError = { this.handleImageError }
								onClick = { () => {
									this.props.handleToggleNoteBook(book);
								} }
							/>
							<span className = "notebook-title">{ book.title }</span>
						</div>);
					}) }
				</div>) ,
			} ,
		];
	}
	
	render () {
		const {
			siderCollapsed ,
			resizing ,
			toggleResizing ,
		} = reaxel_sider();
		
		const notebookItems = this.getNotebookItems();
		const feedback_setting_Items = [
			{
				key : 'settingItem' ,
				label : <div className = "menu-item">
					<SettingIcon />
					<span>设置</span>
				</div> ,
				children : <p>快捷键</p> ,
			} , {
				showArrow : false ,
				key : 'feedbackItem' ,
				label : <div className = "menu-item">
					<FeedbackIcon />
					<span>反馈</span>
				</div> ,
				children : <div className = "feedback-content">
					亲爱的用户 :
					<br />
					如果您在使用笔记本软件的过程中有任何建议或发现了任何问题与 bug，欢迎随时反馈给我们。
					<br />
					请发送邮件至：liqunzhang3@gmail.com
					我们会认真查看并不断优化，为您提供更好的体验。</div> ,
			} ,
		];
		
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
				minConstraints = { [290 , 0] } // 设置最小宽度
				maxConstraints = { [480 , 0] } // 设置最大宽度
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
					{/*sidebar主要功能菜单列表*/ }
					<div className = "sidebar-content-panel">
						{/*用户信息*/ }
						<Avatar
							style = { { backgroundColor : '#cecece' } }
							icon = { <UserOutlined /> }
						/>
						<span>user name</span>
						<Divider style = { { borderColor : '#e4e4e4' } } />
						
						<div className = "menu-item">
							<SearchIcon />
							<span>搜索</span>
						</div>
						
						{/*笔记本列表*/ }
						<Collapse
							items = { notebookItems }
							defaultActiveKey = { ['notebookItems'] }
							ghost
							expandIconPosition = { 'end' }
							accordion = { true }
							onChange = { (key) => {
								this.setState({ isCollapse : !this.state.isCollapse });
							} }
						/>
						
						<div className = "sidebar-menu-list">
							<div className = "menu-item">
								<MarkNoteIcon />
								<span>收藏夹</span>
							</div>
							<div className = "menu-item">
								<RecycleBinIcon />
								<span>回收站</span>
							</div>
							
							
							<Collapse
								items = { feedback_setting_Items }
								ghost
								expandIconPosition = { 'end' }
								accordion = { true }
							/>
						</div>
					</div>
				
				</div>
			</ResizableBox>
		</div>;
	}
}

const AddNewBookIcon = ({ onclick }) => {
	return <svg
		onClick = { (e) => {
			e.stopPropagation();
			onclick();
		} }
		t = "1732428997742"
		className = "title-add"
		viewBox = "0 0 1024 1024"
		version = "1.1"
		xmlns = "http://www.w3.org/2000/svg"
		p-id = "152069"
		width = "20"
		height = "20"
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
			t = "1734471615966"
			style = { { marginLeft : '20px' } }
			className = "icon"
			viewBox = "0 0 1024 1024"
			version = "1.1"
			xmlns = "http://www.w3.org/2000/svg"
			p-id = "97531"
			width = "20"
			height = "20"
		>
			<path
				d = "M923.038476 8.094476V770.438095H256.219429c-42.008381 0-76.312381 31.646476-78.628572 70.509715l-0.146286 4.193523v35.05981c0 39.375238 32.889905 72.411429 74.288762 74.630095l4.486096 0.121905h666.819047v60.952381H256.219429c-74.873905 0-136.777143-57.953524-139.605334-130.486857l-0.097524-5.217524V178.858667c0-92.330667 76.190476-167.619048 170.179048-170.666667l5.924571-0.097524h630.418286z m-60.952381 60.952381H292.62019c-61.756952 0-112.274286 47.006476-115.053714 104.838095l-0.097524 4.973715-0.024381 554.349714 1.389715-0.902095a141.653333 141.653333 0 0 1 72.045714-22.723048l5.339429-0.097524 605.866666-0.024381V69.046857z"
				fill = "#000"
				p-id = "97532"
			></path>
			<path
				d = "M306.005333 41.691429v694.954666h-60.952381V41.691429zM923.745524 834.267429v60.952381H240.298667v-60.952381z"
				fill = "#000"
				p-id = "97533"
			></path>
		</svg>;
	}
}

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

class SettingIcon extends Component {
	render () {
		return <svg
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

const FeedbackIcon = () => {
	return <svg
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
			t = "1734471677660"
			className = "icon"
			viewBox = "0 0 1024 1024"
			version = "1.1"
			xmlns = "http://www.w3.org/2000/svg"
			p-id = "101141"
			width = "20"
			height = "20"
		>
			<path
				d = "M451.784 902.94a451.156 451.156 0 0 1-319.57-132.34 451.156 451.156 0 1 1 638.387-638.386A451.156 451.156 0 0 1 451.784 902.94z m0-827.12a375.964 375.964 0 0 0-265.43 642.898 375.964 375.964 0 1 0 532.364-532.365A375.964 375.964 0 0 0 451.784 75.82z"
				fill = "#000"
				p-id = "101142"
			></path>
			<path
				d = "M281.848 660.067a37.596 37.596 0 0 1-26.317-11.279 278.965 278.965 0 0 1 0-393.258 37.596 37.596 0 0 1 53.387 53.387 203.02 203.02 0 0 0 0 287.236 37.596 37.596 0 0 1-26.318 63.914zM986.404 1024a37.596 37.596 0 0 1-26.317-11.279l-241.37-241.369a37.596 37.596 0 1 1 53.388-53.386l241.368 241.368a37.596 37.596 0 0 1-26.317 63.914z"
				fill = "#000"
				p-id = "101143"
			></path>
		</svg>;
	}
}

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

import { reaxel_sider } from './sider.reaxel';
import { reaxper } from 'reaxes-react';
