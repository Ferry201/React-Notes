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
import { translations } from "@src/Home/translations";


const InputNewSortModal = ({
	closeModal ,
	open ,
	onOk ,
	settingItems,
}) => {
	const [sortTitle , setSortTitle] = useState("");
	const inputSortRef = useRef(null);
	const [currentLanguage , setCurrentLanguage] = useState(translations[settingItems.language]);
	
	useEffect(() => {
		setCurrentLanguage(translations[settingItems.language]);
	} , [settingItems.language]);
	
	const handleAfterOpen = () => {
		if ( inputSortRef.current ) {
			inputSortRef.current.focus();
		}
	};
	
	const handleOk = () => {
		if ( sortTitle === "" ) {
			message.warning(`${ currentLanguage.PleaseEnterCategoryName }` , 2);
		}
		if ( sortTitle !== "" ) {
			onOk({
				title : sortTitle ,
				id : uuidv4() ,
				isCollapse : false,
			});
			handleCancel();
			// message.success(`已添加${sortTitle}分类`,1)
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
			title = { currentLanguage.PleaseEnterCategoryName }
			open = { open }
			// centered
			style = { { top : 200 } }
			onOk = { handleOk }
			onCancel = { handleCancel }
			cancelText = { currentLanguage.cancel }
			okText = { currentLanguage.done }
			closable = { false }
			width = { 300 }
			destroyOnClose = { true }
			keyboard = { true }
			wrapClassName = { ` input-sort-modal` }
			afterOpenChange = { handleAfterOpen }
			// footer={null}
		>
			<div>
				
				<input
					ref = { inputSortRef }
					type = "text"
					placeholder = { currentLanguage.enter }
					className = "input-new-sort"
					value = { sortTitle }
					onChange = { handleInputTitle }
					maxLength = { 12 }
				/>
			
			</div>
		</Modal>
	</>);
};


export { InputNewSortModal };
