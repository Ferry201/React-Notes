import React , {
	useState ,
	useRef ,
	useEffect,
} from 'react';
import {
	Modal ,
	Input ,
	message,
} from 'antd';
import './note.css';

const SettingModal = ({closeModal,open}) => {
	
	const handleOk = () => {
	
		
		handleCancel()
	};
	const handleCancel = () => {
		closeModal()
	};
	return (<>
			<Modal
				title = "设置(开发中)"
				open = { open }
				// centered
				onOk = { handleOk }
				onCancel = { handleCancel }
				cancelText = "取消"
				okText = "完成"
				closable = { false }
				width = { 450 }
				destroyOnClose = { true }
				keyboard = { true }
			>
			<div className="setting-container">
				<div>深色模式</div>
				<div>语言选项</div>
				<div>字号</div>
				<div>隐私和安全</div>
			</div>
			</Modal>
		</>);
};


export { SettingModal };