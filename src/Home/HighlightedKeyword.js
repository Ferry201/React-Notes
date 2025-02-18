import React from "react";


const HighlightedKeyword = ({text, keyword, maxLength = 50 }) => {
	const textIndex = text.toLowerCase().indexOf(keyword.toLowerCase());
	
	if (textIndex === -1) {
		// 如果没有找到关键词，直接返回原始文本
		return <span>{text}</span>;
	}
	
	const start = Math.max(0, textIndex - Math.floor((maxLength - keyword.length) / 6));
	
	const before = start > 0 ? '…' : ''; // 如果截取文本前有内容，显示省略号
	
	const visibleText = text.slice(start);
	const parts = visibleText.split(new RegExp(`(${keyword})`, 'gi'));
	return (
		<>
			{before}
			{parts.map((part, index) =>
				part.toLowerCase() === keyword.toLowerCase() ? (
					<span
						key={`${part}-${index}`}
						style={{ background: 'yellow' }}
					>
						{part}
					</span>
				) : (
					<span key={`${part}-${index}`}>{part}</span>
				)
			)}
		</>
	);
};
