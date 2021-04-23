import { ResizableBox } from 'react-resizable';
import 'react-resizable/css/styles.css';
import React , { Component } from 'react';
import { Empty } from 'antd';
import './note.css';

@reaxper
export class NoteSidebar extends Component {
	state = {
		siderbarWidth : 200 ,
		noteBookArray :  null,
		
	};
	handleSetWidth = (width) => {
		this.setState({ siderbarWidth : width });
	};
	componentDidMount() {
		const noteBookArray = JSON.parse(localStorage.getItem('notebook-array'));
		if (noteBookArray !== null) {
			this.setState({ noteBookArray });
		}
		console.log(noteBookArray);  
	}
	
	
	render () {
		const {
			siderCollapsed ,
			resizing ,
			toggleResizing ,
		} = reaxel_sider();
		const { noteBookArray } = this.state;
		return <div
			style = { {
				height : '100%' , // width : siderCollapsed ? '0px' : 'unset' ,
				display : 'inline-block' , // position:"relative",
				transform : `translateX(-${ (siderCollapsed ? this.state.siderbarWidth + 100 : 0) }px)` ,
				transition : resizing ? 'unset' : 'all ease .2s 0s' ,
			} }
		>
			<ResizableBox
				width = { siderCollapsed ? 0 : this.state.siderbarWidth }
				axis = "x" // 只允许水平拖动
				minConstraints = { [150 , 0] } // 设置最小宽度
				maxConstraints = { [330 , 0] } // 设置最大宽度
				resizeHandles = { ['e'] } // 使用右边缘 east
				onResizeStart = { (e , data) => {
					toggleResizing(true);
					console.log(e , data);
				} }
				onResizeStop = { (e , data) => {
					toggleResizing(false);
					this.handleSetWidth(data.size.width);
				} }
				style = { {
					background : 'white' ,
					overflow : 'auto' ,
					position : 'relative' ,
					height : '97%' ,
				} }
				className = { `resizable-box ${ siderCollapsed ? 'collpased' : '' } ${ resizing ? 'resizing' : '' }` }
				handle = { <div className = "resize-handle-container">
					<div className = "custom-resize-handle" />
				</div> }
			>
				
				<div className = "sidebar-container">
					<h2>所有笔记本</h2>
					<div className = "sidebar-container">
						{ noteBookArray === null ?
						  <div className = "empty-container">
							  <Empty
								  image = { Empty.PRESENTED_IMAGE_SIMPLE }
								  description = { <p>还没有笔记本 , 快去
									  <span className='create-notebook-text'>创建</span>
								                     吧!</p> }
							  /></div> :
						  <div className = "sidebar-book-container">
							  { noteBookArray.map((notebook , index) => {
								  return <div
									  className = "sidebar-notebook-item"
									  key = { index }
								  >
									  <img
										  src = { notebook.cover }
										  alt = { `cover-${ index }` }
										  width = "70"
										  height = "90"
										  className = "notebook-cover"
									  />
									  <span className = "notebook-title">{ notebook.title }</span>
									  </div>;
							  }) }</div> }</div>
				
				</div>
			</ResizableBox>
		</div>;
	}
}

import { reaxel_sider } from './sider.reaxel';
import { reaxper } from 'reaxes-react';
