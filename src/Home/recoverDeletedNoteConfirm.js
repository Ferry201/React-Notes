import { Modal } from "antd";
import { translations } from "@src/Home/translations";
import React , { useState , useRef , useEffect , Component } from 'react';
import { ExclamationCircleFilled } from "@ant-design/icons";



const RecoverDeletedNoteConfirm = ({
	open ,
	onCancel ,
	noteListData ,
	currentID ,
	noteBookData ,
	settingItems,
	allSorts,
	recoverDeletedNote,
	moveAndRecoverDeletedNote,
}) => {
	
	let currentNote = noteListData.find(note => note.id === currentID);
	let belongNotebook = noteBookData.find(book => book.id === currentNote.notebookID);
	const handleCancel = () => {
		onCancel()
	};
	
	let allNotebooks=[...noteBookData];
	let filteredNotebooksID = [
		'favorites-notes-id' ,
		'searchResults-notes-id' ,
		'recycle-notes-id' ,
	];
	allNotebooks=allNotebooks.filter(book=>!filteredNotebooksID.includes(book.id));
	
	const [defaultNotebook , setDefaultNotebook] = useState(allNotebooks[0]);
	const clickSelectRef = useRef(null);
	const [displayDropdown , setDisplayDropdown] = useState(true);
	const dropdownContentRef = useRef(null);
	
	// useEffect(() => {
	// 	const handleClickOutside = (event) => {
	// 		// 如果点击不在按钮或 div 内，则隐藏 div
	// 		if (
	// 			dropdownContentRef.current && !dropdownContentRef.current.contains(event.target) &&
	// 			clickSelectRef.current && !clickSelectRef.current.contains(event.target)
	// 		) {
	// 			setDisplayDropdown(false);
	// 		}
	// 	};
	// 	// 添加全局点击事件监听
	// 	document.addEventListener("mousedown" , handleClickOutside);
	// 	// 清理事件监听（组件卸载时）
	// 	return () => {
	// 		document.removeEventListener("mousedown" , handleClickOutside);
	// 	};
	// } , []);
	
	const handleClickSelectButton = () => {
		setDisplayDropdown(prev => !prev); // 直接取反，确保状态切换
	};
	let currentRecoverNote = noteListData.find(note => note.id === currentID);
	const handleSelectBook=(book)=>{
		setDefaultNotebook(book);
		setDisplayDropdown(false)
	}
	
	const handleOk = () => {
		if(belongNotebook){
			recoverDeletedNote()
			onCancel()
		}else{
			moveAndRecoverDeletedNote(defaultNotebook)
			onCancel()
		}
	};
	
	return <div>
		
		<Modal
			title={<span className='confirm-title'><ExclamationCircleFilled /> {translations[settingItems.language].noEditInCycle}</span>}
			open = { open }
			onOk = { handleOk }
			style = { { top : 40 } }
			onCancel = { handleCancel }
			cancelText = { translations[settingItems.language].cancel}
			okText = { translations[settingItems.language].done}
			width = { 420 }
			height = { 300 }
			destroyOnClose = { true }
			keyboard = { true }
			wrapClassName={`recover-deletedNote-confirm-modal`}
			// wrapClassName = { `edit-note-modal ${ settingItems.themeMode === 'note-dark-mode' ? 'night-theme' : currentNotebook.currentTheme }` }
			closable = { false }
			maskClosable = { true }
		>
			<div className='modal-content'>
				<p>{ translations[settingItems.language].recoverConfirm }</p>
				
				{ !belongNotebook && <div className = "recover-bin-remark">
					<span className = 'prev-notebook'>{ currentNote.notebook }</span>
					{ translations[settingItems.language].recoverBinRemark }
					
					<div className = "notebook-selector">
						<div
							className = { `default-book-select ${ displayDropdown ? 'active' : '' }` }
							onClick = { handleClickSelectButton }
							ref = { clickSelectRef }
						>
							<span>{ defaultNotebook.title }</span>
							<DropDownIcon />
						</div>
						{ displayDropdown &&
							<div
								className = "notebook-selector-content"
								ref = { dropdownContentRef }
							>
								<div className = "inner-content">{ allSorts.map((sort) => {
									let booksInsort = allNotebooks.filter(book => book.belongSortID === sort.id);
									return <div key = { `setting-defaultBook-sort-${ sort.id }` }>
										
										{ booksInsort.length !== 0 && <div>
											<div className = "sort-title">{ sort.title }</div>
											<div>
												{ booksInsort.map(book => {
													return <div
														key = { `setting-defaultBook-${ book.id }` }
														className = { `notebook-title ${ defaultNotebook === book ? 'current-default' : '' }` }
														onClick = { () => {
															handleSelectBook(book);
														} }
													>
														{ book.title }
													</div>;
												}) }
											</div>
										</div> }
									</div>
								}) }</div>
							</div> }
					</div>
				</div>
				}
			</div>
		</Modal>
	
	</div>;
};


const DropDownIcon = () => {
	return <svg
		t = "1740763462331"
		className = "icon"
		viewBox = "0 0 1024 1024"
		version = "1.1"
		xmlns = "http://www.w3.org/2000/svg"
		p-id = "318414"
		width = "16"
		height = "16"
	>
		<path
			d = "M562.5 771c-14.3 14.3-33.7 27.5-52 23.5-18.4 3.1-35.7-11.2-50-23.5L18.8 327.3c-22.4-22.4-22.4-59.2 0-81.6s59.2-22.4 81.6 0L511.5 668l412.1-422.3c22.4-22.4 59.2-22.4 81.6 0s22.4 59.2 0 81.6L562.5 771z"
			p-id = "318415"
			fill = "#bfbfbf"
		></path>
	</svg>;
};
export {RecoverDeletedNoteConfirm}
