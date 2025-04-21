import React, { useState, useRef, useEffect } from 'react';
import './splitter.css';

const SplitterLayout = ({ leftBar, centerBar, rightBar }) => {
	// 存储三个栏的宽度，初始为 20vw, 30vw, 50vw（只存数值）
	const [widths, setWidths] = useState([20, 30, 50]);
	const containerRef = useRef(null);
	const draggingRef = useRef({ isDragging: false, splitterIndex: null, startX: 0 });
	
	// 拖拽开始
	const handleMouseDown = (e, splitterIndex) => {
		e.preventDefault(); // 防止文本选中
		draggingRef.current = {
			isDragging: true,
			splitterIndex,
			startX: e.clientX,
		};
		document.body.style.cursor = 'col-resize';
	};
	
	// 拖拽中
	const handleMouseMove = (e) => {
		if (!draggingRef.current.isDragging) return;
		
		const { splitterIndex, startX } = draggingRef.current;
		const deltaX = e.clientX - startX;
		const containerWidth = containerRef.current.offsetWidth;
		
		setWidths((prev) => {
			const newWidths = [...prev];
			// 将像素差转换为 vw（1vw = 视口宽度的 1%）
			const deltaVw = (deltaX / containerWidth) * 100;
			
			// 计算新宽度
			const newLeftWidth = newWidths[splitterIndex] + deltaVw;
			const newRightWidth = newWidths[splitterIndex + 1] - deltaVw;
			
			// 最小宽度限制（300px 转为 vw 动态计算）
			const minWidthVw = (300 / containerWidth) * 100;
			if (newLeftWidth < minWidthVw || newRightWidth < minWidthVw) {
				return prev; // 不更新，避免非法值
			}
			
			// 更新宽度
			newWidths[splitterIndex] = newLeftWidth;
			newWidths[splitterIndex + 1] = newRightWidth;
			
			return newWidths;
		});
		
		draggingRef.current.startX = e.clientX;
	};
	
	// 拖拽结束
	const handleMouseUp = () => {
		draggingRef.current.isDragging = false;
		draggingRef.current.splitterIndex = null;
		document.body.style.cursor = 'default';
	};
	
	// 绑定全局事件
	useEffect(() => {
		document.addEventListener('mousemove', handleMouseMove);
		document.addEventListener('mouseup', handleMouseUp);
		
		return () => {
			document.removeEventListener('mousemove', handleMouseMove);
			document.removeEventListener('mouseup', handleMouseUp);
		};
	}, []);
	
	return (
		<div className="container" ref={containerRef}>
			<div
				className="panel"
				style={{ flex: `0 0 ${widths[0]}vw` }}
			>
				{leftBar}
			</div>
			<div className="splitter" onMouseDown={(e) => handleMouseDown(e, 0)} />
			<div
				className="panel"
				style={{ flex: `0 0 ${widths[1]}vw` }}
			>
				{centerBar}
			</div>
			<div className="splitter" onMouseDown={(e) => handleMouseDown(e, 1)} />
			<div
				className="panel"
				style={{ flex: `0 0 ${widths[2]}vw` }}
			>
				{rightBar}
			</div>
		</div>
	);
};

export default SplitterLayout;
