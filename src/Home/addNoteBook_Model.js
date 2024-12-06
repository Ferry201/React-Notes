import React , { useState , useRef , useEffect } from 'react';
import { Modal , Input } from 'antd';
import './note.css';
import { v4 as uuidv4 } from 'uuid';
import dayjs from "dayjs";

import coverDefault from './img-collection/cover-default.png';
import coverOne from './img-collection/cover-1.png';
import coverTwo from './img-collection/cover-2.png';
import coverThree from './img-collection/cover-3.png';
import coverFour from './img-collection/cover-4.png';
import coverFive from './img-collection/cover-5.png';
import coverSix from './img-collection/cover-6.png';
import coverSeven from './img-collection/cover-7.png';
import coverEight from './img-collection/cover-8.png';
import coverNine from './img-collection/cover-9.png';
import coverTen from './img-collection/cover-10.png';
import coverEleven from './img-collection/cover-11.png';
import coverTwelve from './img-collection/cover-12.png';
import coverThirteen from './img-collection/cover-13.png';
import coverFourteen from './img-collection/cover-14.png';
import coverFifteen from './img-collection/cover-15.png';

const books = [
	{ cover : coverDefault } ,
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
];


const NoteBookModal = ({
	onOk ,
	showTitleInput = undefined ,//控制是否显示标题输入框，使组件适配更多场景。
	closeModal ,
	open ,
}) => {
	// const [isModalOpen , setIsModalOpen] = useState(false);
	const [imagePreview , setImagePreview] = useState(null); // 用来存储图片预览的 URL
	const [titlePreview , setTitlePreview] = useState('');
	const inputTitleRef = useRef(null);
	
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
		if ( showTitleInput === true ) {
			if ( imagePreview && titlePreview ) {
				onOk({
					title : titlePreview ,
					cover : imagePreview ,
				});
				handleCancel();//关闭Modal并重置状态
			}
			if ( titlePreview === '' ) {
				alert('输入标题');
			}
			if ( imagePreview === null ) {
				alert('选择封面');
			}
		} else {
			if ( imagePreview ) {
				onOk({
					cover : imagePreview ,
				});
				handleCancel();
			}
			if ( imagePreview === null ) {
				alert('选择封面');
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
	
	return (
		<>
			<Modal
				title = { showTitleInput && "新建笔记本" }
				open = { open }
				onOk = { handleOk }
				onCancel = { handleCancel }
				cancelText = "取消"
				okText = "完成"
				closable = { false }
				width = { 450 }
				destroyOnClose = { true }
				keyboard = { true }
				afterOpenChange = { handleAfterOpen }
			>
				<div className = "add-NB-modal-content">
					<div className = "edit-NB-info">
						{ showTitleInput && (<div>
							
							<p>输入标题</p>
							
							<Input
								autoFocus={true}
								type = "text"
								ref = { inputTitleRef }
								className = "title-input"
								value = { titlePreview }
								onChange = { handleInputTitle }
								placeholder = "输入标题..."
								allowClear
							/>
						</div>) }
						
						<p>选择封面</p>
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
						<p>或上传自定义封面</p>
						<label
							htmlFor = "fileInput"
							className = "cover-file-upload"
						>点击上传
						</label>
						<input
							type = "file"
							id = "fileInput"
							accept = "image/*"
							onChange = { handleFileChange }
							style = { { display : 'none' } }
						/>
					</div>
					<div className = "preview-area">
						{ imagePreview ? (
							<div className = "preview-img">
								<img
									src = { imagePreview } // 使用 FileReader 读取的图片数据
									alt = "Preview"
								/>
								<p className = "preview-title">{ titlePreview }</p>
							</div>
						) : (
							  <span style = { { color : 'lightgray' } }>没有预览图片</span> // 没有选择图片时显示的文本
						  ) }
					</div>
				</div>
			</Modal>
		</>
	);
};

export { NoteBookModal };

