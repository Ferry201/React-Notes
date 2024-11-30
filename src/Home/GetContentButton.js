import React , { Children , forwardRef } from 'react';
import { convertToRaw } from 'draft-js';
import dayjs from "dayjs";
const GetContentButton = forwardRef((props,ref) => {
	const {children,editorState,onSave,...refProps} = props;
	
	const storeContent = () => {
		const contentState = editorState.getCurrentContent();
		const rawContentState = convertToRaw(contentState);
		
		if ( rawContentState.blocks[0].text.trim() === '' ) {
			alert('不能输入空笔记哦');
			return
		}
		// console.log('Content stored' , rawContentState);
		const saveTime = dayjs().valueOf();
		
		onSave(rawContentState,saveTime);
	};
	
	return <button
		{...refProps}
		onClick={storeContent}
		ref = { ref }
	>{ children }</button>;
});

export default GetContentButton;




