import React , { useState , useRef , useEffect } from 'react';
import { Modal , Input , message , Tooltip } from 'antd';
import './note.css';
import { v4 as uuidv4 } from 'uuid';
import dayjs from "dayjs";

import coverDefault from './img-collection/cover-default.png';
import coverOne from './img-collection/cover-1.png';
import coverTwo from './img-collection/cover-2.png';
import coverThree from './img-collection/cover-3.png';
import coverFour from './img-collection/cover-4.png';
import coverFive from './img-collection/cover-5.jpg';
import coverSix from './img-collection/cover-6.jpg';
import coverSeven from './img-collection/cover-7.png';
import coverEight from './img-collection/cover-8.png';
import coverNine from './img-collection/cover-9.jpg';
import coverTen from './img-collection/cover-10.png';
import coverEleven from './img-collection/cover-11.png';
import coverTwelve from './img-collection/cover-12.png';
import coverThirteen from './img-collection/cover-13.png';
import coverFourteen from './img-collection/cover-14.png';
import coverFifteen from './img-collection/cover-15.png';
import coverSixteen from './img-collection/cover-16.png';
import coverSeventeen from './img-collection/cover-17.png';
import coverEighteen from './img-collection/cover-18.png';
import coverNineteen from './img-collection/cover-19.png';
import coverTwenty from './img-collection/cover-20.png';
import coverTwentyOne from './img-collection/cover-21.png';
import coverTwentyTwo from './img-collection/cover-22.png';
import coverTwentyThree from './img-collection/cover-23.png';
import { translations } from "@src/Home/translations";


const NoteBookModal = ({
	onOk ,
	showTitleInput = undefined ,//控制是否显示标题输入框，使组件适配更多场景。
	plainMode = undefined ,
	closeModal ,
	open ,
	settingItems ,
}) => {
	const [imagePreview , setImagePreview] = useState(null); // 用来存储图片预览的 URL
	const [titlePreview , setTitlePreview] = useState('');
	const [emoji , setEmoji] = useState(null);
	const [expandEmoji , setExpandEmoji] = useState(false);
	const inputTitleRef = useRef(null);
	
	const [currentLanguage , setCurrentLanguage] = useState(translations[settingItems.language]);
	
	useEffect(() => {
		setCurrentLanguage(translations[settingItems.language]);
	} , [settingItems.language]);
	
	const storedNoteBooks = localStorage.getItem('notebook-array');
	
	// 如果 localStorage 中有笔记本数据，解析它，否则使用默认数据
	const notebookArray = storedNoteBooks === null ? [] : JSON.parse(storedNoteBooks);
	
	const handleAfterOpen = () => {
		if ( inputTitleRef.current ) {
			inputTitleRef.current.focus();
		}
	};
	
	
	const handleCancel = () => {
		closeModal();
		setImagePreview(null); // 清空图片预览
		setTitlePreview('');
	};
	
	const handleOk = () => {
		if ( showTitleInput === true && plainMode === true ) {
			if ( titlePreview ) {
				onOk({
					title : titlePreview ,
					cover : coverDefault ,
					emoji : emoji || '📘' ,
				});
				handleCancel();
			}
			if ( titlePreview === '' ) {
				message.warning(currentLanguage.enterTitle);
			}
		}
		
		if ( showTitleInput === true && plainMode === false ) {
			if ( imagePreview && titlePreview ) {
				onOk({
					title : titlePreview ,
					cover : imagePreview ,
					emoji : '📘' ,
				});
				handleCancel();//关闭Modal并重置状态
			}
			if ( titlePreview === '' ) {
				message.warning(currentLanguage.enterTitle);
			}
			if ( imagePreview === null ) {
				message.warning('请选择封面');
			}
		}
		
		
		if ( showTitleInput === false && plainMode === false ) {
			if ( imagePreview ) {
				onOk(imagePreview);
				handleCancel();
			}
			if ( imagePreview === null ) {
				message.warning('请选择封面');
			}
		}
		
	};
	
	// 处理图片文件上传
	const handleFileChange = (e) => {
		const file = e.target.files[0]; // 获取上传的文件
		
		if ( file ) {
			const reader = new FileReader();
			//readAsDataURL 是一个异步方法，它告诉 FileReader 去处理文件数据并将其转换为 Base64 格式的数据 URL
			//readAsDataURL(file) 并不直接返回结果，而是触发文件读取过程，并通过 reader.result 在事件回调中提供读取结果。
			//文件数据读取完成后，FileReader 会触发相关事件（如 onload 或 onloadend），告知主线程数据已准备好。
			reader.readAsDataURL(file); // 将文件转换为 base64 URL
			
			reader.onloadend = () => {
				setImagePreview(reader.result); // 将读取到的图片数据设置为预览图
				
			};
		}
	};
	
	const handleCoverClick = (coverSrc) => {
		setImagePreview(coverSrc); // 点击封面时更新预览图
	};
	const handleInputTitle = (e) => {
		setTitlePreview(e.target.value);//输入标题时更新预览标题
	};
	
	const handleExpandEmojis = () => {
		setExpandEmoji(true);
	};
	
	const handleClickEmoji = (item) => {
		setEmoji(item);
	};
	
	
	return (
		<>
			<Modal
				title = { showTitleInput && currentLanguage.createNewNotebook }
				open = { open }
				// centered
				onOk = { handleOk }
				style={{top:200}}
				onCancel = { handleCancel }
				cancelText = {currentLanguage.cancel}
				okText = {currentLanguage.done}
				closable = { false }
				width = { 450 }
				destroyOnClose = { true }
				keyboard = { true }
				afterOpenChange = { handleAfterOpen }
				wrapClassName = { `addNotebook-modal` }
			>
				<div className = { plainMode ? 'add-NB-modal-content-plain' : "add-NB-modal-content" }>
					<div className = "edit-NB-info">
						{ showTitleInput && (<div>
							
							<p>{currentLanguage.enterNotebookTitle}</p>
							
							<div className = "plain-mode-emoji-input">
								{ plainMode &&
									<Tooltip
										title = "添加emoji"
										placement = "left"
										color='#a6aaad'
									>
										<span
											className = "add-emoji-icon"
											onClick = { handleExpandEmojis }
										>
											{ emoji ? <span>{ emoji }</span> : <AddEmojiIcon /> }
										
										</span>
									</Tooltip>
								}
								<Input
									autoFocus = { true }
									type = "text"
									ref = { inputTitleRef }
									className = "title-input"
									value = { titlePreview }
									onChange = { handleInputTitle }
									placeholder = {currentLanguage.enter}
									allowClear
									maxLength = "16"
								/></div>
						</div>) }
						
						{ plainMode && expandEmoji && (<div>
							<p>{currentLanguage.chooseEmoji}</p>
							{ EmojiArray.map((item , index) => {
								return <span
									key = { `${ item }-${ index }` }
									className = "emoji-item"
									onClick = { () => {
										handleClickEmoji(item);
									} }
								>{ item }</span>;
							}) }
						</div>) }
						
						{ !plainMode && <div>
							<p>{currentLanguage.selectCover}</p>
							<div className = "img-cover-box">
								{/*默认封面图*/ }
								{ books.map((book , index) => {
									return (<img
										key = { index }
										src = { book.cover }
										alt = { `cover-${ index }` }
										width = "50"
										height = "64"
										onClick = { () => handleCoverClick(book.cover) }
									/>);
								}) }
							</div>
							<p>{currentLanguage.UploadCustomCover}</p>
							<label
								htmlFor = "fileInput"
								className = "cover-file-upload"
							>{currentLanguage.clickUpload}
							</label>
							<input
								type = "file"
								id = "fileInput"
								accept = "image/*"
								onChange = { handleFileChange }
								style = { { display : 'none' } }
							/>
						</div> }
					</div>
					{ !plainMode && <div className = "preview-area">
						{ imagePreview ? (
							<div className = "preview-img">
								<img
									src = { imagePreview } // 使用 FileReader 读取的图片数据
									alt = "Preview"
								/>
								<p className = "preview-title">{ titlePreview }</p>
							</div>
						) : (
							  <span style = { { color : 'lightgray' } }>{currentLanguage.noPreviewCover}</span> // 没有选择图片时显示的文本
						  ) }
					</div> }
				</div>
			</Modal>
		</>
	);
};


const books = [
	{ cover : coverDefault } ,
	{ cover : coverTwentyOne } ,
	{ cover : coverTwentyTwo } ,
	{ cover : coverOne } ,
	{ cover : coverTwo } ,
	{ cover : coverThree } ,
	{ cover : coverFour } ,
	{ cover : coverFive } ,
	{ cover : coverSix } ,
	{ cover : coverSeven } ,
	{ cover : coverEight } ,
	{ cover : coverNine } ,
	{ cover : coverTen } ,
	{ cover : coverEleven } ,
	{ cover : coverTwelve } ,
	{ cover : coverThirteen } ,
	{ cover : coverFourteen } ,
	{ cover : coverFifteen } ,
	{ cover : coverSixteen } ,
	{ cover : coverSeventeen } ,
	{ cover : coverEighteen } ,
	{ cover : coverNineteen } ,
	{ cover : coverTwenty } ,
	{ cover : coverTwentyThree } ,

];

const EmojiArray = [
	'📚' ,
	'📔' ,
	'📕' ,
	'📗' ,
	'📘' ,
	'📙' ,
	'📒' ,
	'📋' ,
	'📄' ,
	'📜' ,
	'🗓️' ,
	'🍔' ,
	'🥝' ,
	'🍇' ,
	'🥑' ,
	'🍉' ,
	'🍒' ,
	'🥬' ,
	'🍜' ,
	'🍙' ,
	'🍩' ,
	'🥯' ,
	'🍫' ,
	'🍧' ,
	'🍹' ,
	'🦢' ,
	'🦊' ,
	'🐾' ,
	'🦄' ,
	'🪺' ,
	'🦚' ,
	'🪶' ,
	'🦩' ,
	'🦜' ,
	'🕊️' ,
	'🐦‍⬛' ,
	'🐬' ,
	'🦭' ,
	'🦋' ,
	'🐜' ,
	'🐞' ,
	'🦎' ,
	'🦀' ,
	'🐻‍❄️' ,
	'🎄' ,
	'🍁' ,
	'🌷' ,
	'🪴' ,
	'🌻' ,
	'🌵' ,
	'⛄' ,
	'💵' ,
	'💳' ,
	'☎️' ,
	'📷' ,
	'🎵' ,
	'👓' ,
	'👗' ,
	'🏡' ,
	'🏕️' ,
	'⚽' ,
	'❤️' ,
	'💛' ,
	'💚' ,
	'💜' ,
	'🩵' ,
	'🩶' ,
	'💗' ,
	'👄' ,
	'😀' ,
	'😊' ,
	'💀' ,
];

const AddEmojiIcon = () => {
	return <>
		<svg
			t = "1739906594897"
			className = "icon"
			viewBox = "0 0 1024 1024"
			version = "1.1"
			xmlns = "http://www.w3.org/2000/svg"
			p-id = "68654"
			width = "20"
			height = "20"
		>
			<path
				d = "M643.008 430.4a53.824 53.824 0 1 0 0-107.712 53.824 53.824 0 0 0 0 107.712z m-262.08 0a53.824 53.824 0 1 0 0-107.712 53.824 53.824 0 0 0 0 107.712zM723.84 544.64H300.16a16.128 16.128 0 0 0-16.192 16.064v0.128C283.968 674.944 391.04 780.8 512 780.8c118.016 0 228.032-105.28 228.032-219.968v-0.128a16.128 16.128 0 0 0-16.192-16.064z"
				fill = "#666666"
				p-id = "68655"
			></path>
			<path
				d = "M512 64a448 448 0 0 1 443.456 512.064h-64.768A384 384 0 1 0 512 896v63.936A448 448 0 0 1 512 64z"
				fill = "#666666"
				p-id = "68656"
			></path>
			<path
				d = "M863.936 672a32 32 0 0 1 32 32v96h96a32 32 0 1 1 0 64h-96V960a32 32 0 1 1-64 0v-96h-96a32 32 0 0 1 0-64h96V704a32 32 0 0 1 32-32z"
				fill = "#666666"
				p-id = "68657"
			></path>
		</svg>
	</>;
};

export { NoteBookModal , EmojiArray };

