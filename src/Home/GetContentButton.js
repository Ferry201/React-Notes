import React , { Children , forwardRef } from 'react';
import { convertToRaw } from 'draft-js';
import dayjs from "dayjs";
import { message } from 'antd';

const GetContentButton = forwardRef((props , ref) => {
	const {
		children ,
		editorState ,
		onSave ,
		...refProps
	} = props;
	
	const storeContent = () => {
		const contentState = editorState.getCurrentContent();
		const rawContentState = convertToRaw(contentState);
		let allEmpty = true;
		for ( let i = 0 ; i < rawContentState.blocks.length ; i ++ ) {
			if ( rawContentState.blocks[i].text.trim() !== '' ) {
				allEmpty = false;
				break;
			}
		}
		if ( allEmpty === true ) {
			message.error('不能输入空笔记');
			return;
		}
		// console.log('Content stored' , rawContentState);
		const saveTime = dayjs().valueOf();
		
		onSave(rawContentState , saveTime);
	};
	
	return <button
		{ ...refProps }
		onClick = { storeContent }
		ref = { ref }
	>{ children }</button>;
});

export default GetContentButton;



