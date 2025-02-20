import React , {
	useState ,
	useRef ,
	useEffect ,
} from 'react';
import {
	Modal ,
	Input ,
	message ,
} from 'antd';
import './note.css';
import { v4 as uuidv4 } from 'uuid';


const InputNewSortModal = ({
	closeModal ,
	open ,
	onOk ,
	themeMode,
}) => {
	const [sortTitle , setSortTitle] = useState("");
	const handleOk = () => {
		if(sortTitle===""){
			message.warning('请输入分类名')
		}
		if(sortTitle!==""){
			onOk({
				title : sortTitle ,
				id : uuidv4(),
				isCollapse:false
			});
			handleCancel();
		}
		
	};
	const handleCancel = () => {
		closeModal();
	};
	const handleInputTitle = (e) => {
		setSortTitle(e.target.value);
	};
	return (<>
		<Modal
			open = { open }
			// centered
			onOk = { handleOk }
			onCancel = { handleCancel }
			cancelText = "取消"
			okText = "新建"
			closable = { false }
			width = { 250 }
			destroyOnClose = { true }
			keyboard = { true }
			wrapClassName={`${themeMode} input-sort-modal`}
			// footer={null}
		>
			<div>
				<p>输入新分类标题 :</p>
				<input
					type = "text"
					placeholder = "输入..."
					className = "input-new-sort"
					value = { sortTitle }
					onChange = { handleInputTitle }
					maxLength={12}
				/>
			
			</div>
		</Modal>
	</>);
};


export { InputNewSortModal };
