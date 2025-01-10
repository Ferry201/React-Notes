import React , { useState , useRef , useEffect , Component } from 'react';
import { Editor , EditorState , ContentState , convertFromRaw , convertToRaw , RichUtils , AtomicBlockUtils , Modifier , SelectionState } from 'draft-js';
import 'draft-js/dist/Draft.css';
import GetContentButton from '@src/Home/GetContentButton';
import { FaPaintBrush , FaBold , FaItalic , FaUnderline , FaStrikethrough , FaAlignLeft , FaAlignCenter , FaAlignRight , FaAlignJustify , FaListOl , FaListUl , FaImage } from 'react-icons/fa';
import './richTextEditor.css';
import { Popover , Tooltip , Modal , Dropdown } from 'antd';
import dayjs from "dayjs";
import { GithubPicker } from 'react-color';
import { CirclePicker } from 'react-color';


//todo:选中分区,及时保存

const textAlignStyleMap = {
	'TEXT_ALIGN_LEFT' : { textAlign : 'left' } ,
	'TEXT_ALIGN_CENTER' : { textAlign : 'center' } ,
	'TEXT_ALIGN_RIGHT' : { textAlign : 'right' } ,
	'TEXT_ALIGN_JUSTIFY' : { textAlign : 'justify' } , // 两端对齐
};

const fontSizeStyleMap = {
	'FONT_SIZE_10' : { fontSize : '10px' } ,
	'FONT_SIZE_12' : { fontSize : '12px' } ,
	'FONT_SIZE_14' : { fontSize : '14px' } ,
	'FONT_SIZE_16' : { fontSize : '16px' } ,
	'FONT_SIZE_18' : { fontSize : '18px' } ,
	'FONT_SIZE_20' : { fontSize : '20px' } ,
	'FONT_SIZE_22' : { fontSize : '22px' } ,
	'FONT_SIZE_24' : { fontSize : '24px' } ,
	'FONT_SIZE_32' : { fontSize : '32px' } ,
};

const backgroundColorStyleMap = {
	BG_RED : { backgroundColor : '#ff3939' } ,
	BG_Crimson : { backgroundColor : '#e599a9' } ,
	BG_PINK : { backgroundColor : '#f5c9d2' } ,
	BG_ORANGE : { backgroundColor : '#ed7050' } ,
	BG_LIGHT_ORANGE : { backgroundColor : '#ffcca7' } ,
	BG_YELLOW : { backgroundColor : '#f4e755' } ,
	BG_LIGHT_YELLOW : { backgroundColor : '#f1ff95' } ,
	BG_GREEN : { backgroundColor : '#519232' } ,
	BG_LIGHT_GREEN : { backgroundColor : '#7bf84d' } ,
	BG_CYAN : { backgroundColor : '#38ceab' } ,
	BG_LIGHT_CYAN : { backgroundColor : '#8df7e9' } ,
	BG_BLUE : { backgroundColor : '#40a9ff' } ,
	BG_LIGHT_BLUE : { backgroundColor : '#86b8e8' } ,
	BG_PURPLE : { backgroundColor : '#7e58e8' } ,
	BG_AMARANTH : { backgroundColor : '#dd79c1' } ,
	BG_LIGHT_PURPLE : { backgroundColor : '#ceb7fd' } ,
	BG_GRAY : { backgroundColor : '#c7c7c7' } ,
	BG_LIGHT_GRAY : { backgroundColor : '#e3e3e3' } ,
};
const fontColorStyleMap = {
	FONT_RED : { color : '#f04d4d' } ,
	FONT_ORANGE : { color : '#f4a255' } ,
	FONT_GREEN : { color : '#4fec3a' } ,
	FONT_PINK : { color : '#339b33' } ,
	FONT_BLUE : { color : '#68c7e7' } ,
	FONT_PURPLE : { color : '#ab7cf7' } ,
};

const ColorPicker = ({ onSelectColor }) => {
	const [color , setColor] = useState('#ffffff');
	
	const handleChangeComplete = (color) => {
		setColor(color.hex); // 找到对应的键
		const colorKey = Object.keys(fontColorStyleMap).find(key => fontColorStyleMap[key].color === color.hex);
		if ( typeof onSelectColor === 'function' ) {
			onSelectColor(colorKey);
		}
	};
	const colors = Object.values(fontColorStyleMap).map(style => style.color);
	return (<div>
		<CirclePicker
			color = { color }
			onChangeComplete = { handleChangeComplete }
			colors = { colors }
		/>
	</div>);
};
const BackgroundColorPicker = ({ onSelectColor }) => {
	const [color , setColor] = useState('#ffffff');
	
	const handleChangeComplete = (color) => {
		setColor(color.hex); // 找到对应的键
		const colorKey = Object.keys(backgroundColorStyleMap).find(key => backgroundColorStyleMap[key].backgroundColor === color.hex);
		onSelectColor(colorKey);
	};
	const colors = Object.values(backgroundColorStyleMap).map(style => style.backgroundColor);
	return (<div>
		<CirclePicker
			color = { color }
			onChangeComplete = { handleChangeComplete }
			colors = { colors }
		/>
	</div>);
};

const AddNewNoteModal = ({
	open ,
	onCloseModal ,
	onCancel ,
	onSave ,
	initialTitle,
	initialContent ,
}) => {
	
	
	const handleCancel = () => {
		onCloseModal();
	};
	
	const handleOk = () => {
		
	};
	return <div>
		<Modal
			open = { open }
			onOk = { handleOk }
			style = { { top : 80 } }
			onCancel = { onCloseModal }
			cancelText = "取消"
			okText = "创建"
			width = { 800 }
			height = { 300 }
			destroyOnClose = { true }
			keyboard = { true }
			wrapClassName = "edit-note-modal"
			closable = { false }
			// footer={null}
		>
			<RichTextEditor
				onSave = { onSave }
				initialTitle={initialTitle}
				initialContent = { initialContent }
				onCancel = { onCancel }
				showAllOptions = { true }
			/>
		</Modal>
	</div>;
};


const RichTextEditor = ({
	onSave ,
	initialTitle,
	initialContent ,
	onCancel ,
	showAllOptions = undefined ,
	openModal ,
	cancelExpandNoteEditSection,
}) => {
	const editorRef = useRef(null);
	const [noteTitle , setNoteTitle] = useState('');
	useEffect(() => {
		editorRef.current.focus();
	} , []);
	const [editorState , setEditorState] = useState(initialContent ? EditorState.createWithContent(convertFromRaw(initialContent)) : EditorState.createEmpty());
	useEffect(() => {
		if ( initialContent ) {
			setEditorState(EditorState.moveFocusToEnd(EditorState.createWithContent(convertFromRaw(initialContent))));
		}
		if(initialTitle){
			setNoteTitle(initialTitle)
		}
	} , [initialTitle,initialContent]);
	const [textAlignment , setTextAlignment] = useState('left');//对齐
	const saveContent = () => {
		const rawContentState = convertToRaw(editorState.getCurrentContent());
		onSave(rawContentState);
	};
	
	const handleKeyCommand = (command) => {
		const newState = RichUtils.handleKeyCommand(editorState , command);
		if ( newState ) {
			setEditorState(newState);
			return 'handled';
		}
		return 'not-handled';
	};
	
	
	const onBoldClick = () => {
		setEditorState(RichUtils.toggleInlineStyle(editorState , 'BOLD'));
	};
	
	const onItalicClick = () => {
		setEditorState(RichUtils.toggleInlineStyle(editorState , 'ITALIC'));
	};
	
	const onUnderlineClick = () => {
		setEditorState(RichUtils.toggleInlineStyle(editorState , 'UNDERLINE'));
	};
	
	const onStrikethroughClick = () => {
		setEditorState(RichUtils.toggleInlineStyle(editorState , 'STRIKETHROUGH'));
	};
	
	const onAlignLeft = () => {
		setTextAlignment('left');  // Update alignment state to 'left'
	};
	
	const onAlignCenter = () => {
		setTextAlignment('center');  // Update alignment state to 'center'
	};
	
	const onAlignRight = () => {
		setTextAlignment('right');  // Update alignment state to 'right'
	};
	
	
	const onAddImage = () => {
		const url = prompt('Enter the image URL');
		if ( url ) {
			const contentState = editorState.getCurrentContent();
			const contentStateWithEntity = contentState.createEntity(
				'IMAGE' , 'IMMUTABLE' , { src : url } ,
			);
			const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
			const newEditorState = AtomicBlockUtils.insertAtomicBlock(
				editorState , entityKey , ' ' ,
			);
			setEditorState(newEditorState);
		}
	};
	
	const onOrderedList = () => {
		setEditorState(RichUtils.toggleBlockType(editorState , 'ordered-list-item'));
	};
	
	const onUnorderedList = () => {
		setEditorState(RichUtils.toggleBlockType(editorState , 'unordered-list-item'));
	};
	
	const onFontSizeChange = (event) => {
		const fontSize = event.target.value;
		setEditorState(RichUtils.toggleInlineStyle(editorState , `FONT_SIZE_${ fontSize }`));
	};
	const onBackgroundColorChange = (color) => {
		const newEditorState = RichUtils.toggleInlineStyle(editorState , color);
		setEditorState(newEditorState);
	};
	const onFontColorChange = (color) => {
		const newEditorState = RichUtils.toggleInlineStyle(editorState , color);
		setEditorState(newEditorState);
	};
	
	const selectBackgroundColorContent = (
		<div>
			<div className = "color-popover-title">字体背景颜色选择</div>
			<BackgroundColorPicker onSelectColor = { onBackgroundColorChange } />
		</div>
	);
	const selectColorContent = (
		<div>
			<div className = "color-popover-title">字体颜色选择</div>
			<ColorPicker onSelectColor = { onFontColorChange } />
		</div>
	);
	
	
	return (
		<div
			style = { {
				height : '100%' ,
				width : '100%' ,
				boxSizing : 'border-box' ,
			} }
		>
			{ showAllOptions && <div>
				<div className = "modal-top-bar">
					<div className = "modal-top-left-bar"><Tooltip
						title = "返回并保存"
					>
						<GetContentButton
							noteTitle={noteTitle}
							editorState = { editorState }
							onSave = { onSave }
						>
							<ReturnIcon />
						</GetContentButton>
					</Tooltip></div>
					
					<div className = "modal-top-right-bar">
						<Tooltip title = "保存"><GetContentButton
							noteTitle={noteTitle}
							editorState = { editorState }
							onSave = { onSave }
						> <SaveIcon /></GetContentButton></Tooltip>
						<Tooltip title = "退出且不保存修改">
							<div
								className = "cancel-edit-icon"
								onClick = { onCancel }
							><CancelEditIcon />
							</div>
						</Tooltip>
					</div>
				</div>
				
				<div className = "rich-text-options">
					
					<Tooltip title = "加粗">
						<button onClick = { onBoldClick }><FaBold /></button>
					</Tooltip>
					<Tooltip title = "斜体">
						<button onClick = { onItalicClick }><FaItalic /></button>
					</Tooltip>
					<Tooltip title = "下划线">
						<button onClick = { onUnderlineClick }><FaUnderline /></button>
					</Tooltip>
					<Tooltip title = "删除线">
						<button onClick = { onStrikethroughClick }><FaStrikethrough /></button>
					</Tooltip>
					<Tooltip title = "文本靠左">
						<button onClick = { onAlignLeft }><FaAlignLeft /></button>
					</Tooltip>
					<Tooltip title = "文本居中">
						<button onClick = { onAlignCenter }><FaAlignCenter /></button>
					</Tooltip>
					<Tooltip title = "文本靠右">
						<button onClick = { onAlignRight }><FaAlignRight /></button>
					</Tooltip>
					<Tooltip title = "添加图片">
						<button onClick = { onAddImage }><FaImage /></button>
					</Tooltip>
					<Tooltip title = "有序列表">
						<button onClick = { onOrderedList }><FaListOl /></button>
					</Tooltip>
					<Tooltip title = "无序列表">
						<button onClick = { onUnorderedList }><FaListUl /></button>
					</Tooltip>
					<Tooltip title = "字号">
						<button><FontSizeIcon /></button>
					</Tooltip>
					<Tooltip></Tooltip>
					
					
					<select
						onChange = { onFontSizeChange }
						defaultValue = "10"
					>
						<option value = "12">12</option>
						<option value = "14">14</option>
						<option value = "16">16</option>
						<option value = "18">18</option>
						<option value = "20">20</option>
						<option value = "22">22</option>
						<option value = "24">24</option>
						<option value = "32">32</option>
					</select>
					{/* 字体颜色选择器 */ }
					<Popover
						content = { selectColorContent }
					>
						<button>
							<FontColorIcon />
						</button>
					</Popover>
					{/* 背景颜色选择器 */ }
					<Popover
						content = { selectBackgroundColorContent }
					>
						<button>
							<FontBackgroundIcon />
						</button>
					</Popover>
				
				
				</div>
			</div> }
			{/*笔记标题输入区*/ }
			<div>
				<input
					type = "text"
					className = "note-item-title-input"
					placeholder = "标题"
					value={noteTitle}
					onChange = { (e) => {
						setNoteTitle(e.target.value);
					} }
				/>
			</div>
			
			<div
				style = { {
					fontSize : "16px" ,
					borderBottomLeftRadius : '6px' ,
					borderBottomRightRadius : '6px' ,
					background : 'white' ,
					maxHeight : showAllOptions ? 'calc(100% - 110px)' : '100%' ,
					padding : '10px' ,
					overflowY : 'scroll' ,
					width : '100%' ,
					boxSizing : 'border-box' ,
				} }
				className = "editor-container"
			>
				<Editor
					ref = { editorRef }
					editorState = { editorState }
					customStyleMap = { { ...fontSizeStyleMap , ...backgroundColorStyleMap , ...fontColorStyleMap } }
					handleKeyCommand = { handleKeyCommand }
					onChange = { setEditorState }
					placeholder = "输入笔记..."
					className = "rich-text-input"
					textAlignment = { textAlignment }
				/>
			</div>
			{/*操作区: 富文本, 撤销, 复原, 添加按钮*/ }
			{ !showAllOptions && <div className = "edit-note-options">
				<div className = "edit-note-icons">
					<RichTextIcon
						onClick = { () => {
							openModal('addNewNote');
						} }
					/>
					<UndoIcon />
					<RedoIcon />
				</div>
				
				<GetContentButton
					noteTitle={noteTitle}
					editorState = { editorState }
					onSave = { onSave }
				>
					<AddNewNotebtn
						onClick = { cancelExpandNoteEditSection }
						className = { `add-new-button` }
					/>
				</GetContentButton>
			
			</div> }
		
		
		</div>
	);
};

const RichTextIcon = ({ onClick }) => {
	return <>
		<Tooltip
			title = "富文本编辑模式"
			placement = "bottom"
			zIndex = "1"
		>
			<div
				className = "edit-note-option-item rich-text-option"
				onClick = { onClick }
			>
				<svg
					t = "1736052458233"
					className = "icon"
					viewBox = "0 0 1024 1024"
					version = "1.1"
					xmlns = "http://www.w3.org/2000/svg"
					p-id = "29795"
					width = "18"
					height = "18"
				>
					<path
						d = "M736 149.333a160 160 0 0 1 160 160V736a160 160 0 0 1-160 160H309.333a160 160 0 0 1-160-160V309.333a160 160 0 0 1 160-160z m0 64H309.333a96 96 0 0 0-96 96V736a96 96 0 0 0 96 96H736a96 96 0 0 0 96-96V309.333a96 96 0 0 0-96-96zM736 672a32 32 0 0 1 3.072 63.85L736 736H309.333a32 32 0 0 1-3.072-63.85l3.072-0.15H736z m0-128a32 32 0 0 1 3.072 63.85L736 608H533.93a32 32 0 0 1-3.071-63.85l3.072-0.15H736zM394.667 330.667H480a32 32 0 0 1 3.072 63.85l-3.072 0.15h-53.333v138.666a32 32 0 0 1-63.851 3.072l-0.15-3.072V394.667h-53.333a32 32 0 0 1-3.072-63.851l3.072-0.15h85.334zM736 416a32 32 0 0 1 3.072 63.85L736 480H608.064a32 32 0 0 1-3.072-63.85l3.072-0.15H736z"
						p-id = "29796"
					></path>
				</svg>
			</div>
		</Tooltip></>;
};

const UndoIcon = () => {
	return <>
		
		<Tooltip
			title = "撤销"
			placement = "bottom"
			zIndex = "1"
		>
			<div className = "edit-note-option-item undo-option">
				<svg
					t = "1736053234010"
					className = "icon"
					viewBox = "0 0 1024 1024"
					version = "1.1"
					xmlns = "http://www.w3.org/2000/svg"
					p-id = "36096"
					width = "16"
					height = "16"
				>
					<path
						d = "M672.704 864.704 256.704 864.704C239.024 864.704 224.704 850.368 224.704 832.704 224.704 815.024 239.024 800.704 256.704 800.704L672.704 800.704C778.736 800.704 864.704 714.736 864.704 608.704 864.704 502.656 778.736 416.704 672.704 416.704L202.16 416.704 341.792 556.144C353.776 568.112 353.776 587.52 341.792 599.488 329.792 611.472 310.336 611.472 298.352 599.488L104 405.424C92.016 393.456 92.016 374.032 104 362.064L298.352 167.984C310.336 156.016 329.792 156.016 341.792 167.984 353.776 179.968 353.776 199.376 341.792 211.344L200.24 352.704 672.704 352.704C814.08 352.704 928.704 467.312 928.704 608.704 928.704 750.08 814.08 864.704 672.704 864.704Z"
						p-id = "36097"
					></path>
				</svg>
			</div>
		</Tooltip>
	</>;
};
const RedoIcon = () => {
	return <>
		<Tooltip
			title = "复原"
			placement = "bottom"
			zIndex = "1"
		>
			<div className = "edit-note-option-item redo-option">
				<svg
					t = "1736054033789"
					className = "icon"
					viewBox = "0 0 1024 1024"
					version = "1.1"
					xmlns = "http://www.w3.org/2000/svg"
					p-id = "38179"
					width = "16"
					height = "16"
				>
					<path
						d = "M725.333333 859.733333H362.666667c-141.376 0-256-114.624-256-256s114.624-256 256-256h458.666666a32 32 0 0 1 0 64H362.666667a192 192 0 0 0 0 384h362.666666a32 32 0 0 1 0 64z"
						p-id = "38180"
					></path>
					<path
						d = "M689.066667 589.013333a32.64 32.64 0 0 1-22.613334-9.386666 32.213333 32.213333 0 0 1 0-45.226667l154.666667-154.666667-154.666667-154.453333a32.213333 32.213333 0 0 1 0-45.226667 31.786667 31.786667 0 0 1 45.226667 0l177.28 177.066667c5.973333 6.016 9.322667 14.144 9.386667 22.613333a32 32 0 0 1-9.386667 22.613334l-177.28 177.28a31.786667 31.786667 0 0 1-22.613333 9.386666z"
						p-id = "38181"
					></path>
				</svg>
			</div>
		</Tooltip>
	</>;
};

class AddNewNotebtn extends Component {
	constructor () {
		super();
	}
	
	render () {
		const {
			onClick ,
		} = this.props;
		return <div>
			<Tooltip
				title = "添加笔记"
				placement = "bottom"
				zIndex = "1"
			>
				<div
					className = "add-new-button"
					onClick = { onClick }
				>
					<svg
						t = "1736084509838"
						className = "icon"
						viewBox = "0 0 1024 1024"
						version = "1.1"
						xmlns = "http://www.w3.org/2000/svg"
						p-id = "128954"
						width = "16"
						height = "16"
					>
						<path
							d = "M482 481.3V130.1c0-17.6 14.3-31.9 31.9-31.9 17.6 0 31.9 14.3 31.9 31.9v351.2H897c17.6 0 31.9 14.3 31.9 31.9 0 17.6-14.3 31.9-31.9 31.9H545.8v351.2c0 17.6-14.3 31.9-31.9 31.9-17.6 0-31.9-14.3-31.9-31.9V545.1H130.8c-17.6 0-31.9-14.3-31.9-31.9 0-17.6 14.3-31.9 31.9-31.9H482z"
							p-id = "128955"
							fill = "#515151"
						></path>
					</svg>
				</div>
			</Tooltip>
		</div>;
		
	}
}

const ReturnIcon = () => {
	return <svg
		t = "1731789813468"
		className = "icon"
		viewBox = "0 0 1024 1024"
		version = "1.1"
		xmlns = "http://www.w3.org/2000/svg"
		p-id = "7315"
		width = "16"
		height = "16"
	>
		<path
			d = "M764.28847787 408.96539307c51.24041387 30.5463296 114.11019093 112.9447424 140.2667008 212.12910933 26.15978667 99.19092053 21.82239573 188.00858453 21.82239573 188.00858453s-33.86682027-54.6963456-47.59770453-73.87327146c-13.73088427-19.17146453-71.58934187-90.61116587-161.3955072-132.0157184-89.80616533-41.40346027-239.91855787-34.03066027-239.91855787-34.03066027v172.4121088L63.75560533 448.55241387l413.7091072-293.04531627v173.99808s99.38315947 7.4809344 151.3324544 18.23757653c87.49929813 18.12179627 135.49131093 61.22263893 135.49131094 61.22263894z m0 0"
			fill = "#2c2c2c"
			p-id = "7316"
		></path>
	</svg>;
};
const FontColorIcon = () => {
	return <svg
		t = "1736317344428"
		className = "icon"
		viewBox = "0 0 1024 1024"
		version = "1.1"
		xmlns = "http://www.w3.org/2000/svg"
		p-id = "3249"
		width = "16"
		height = "16"
	>
		<path
			d = "M438.613333 1.024L146.033778 768.227556h139.150222l60.643556-179.029334h297.358222l65.479111 179.029334h139.150222L555.235556 1.024H438.613333z m55.921778 163.043556l107.064889 318.008888H382.691556l111.843555-318.065777v0.056889zM85.333333 1024h818.403556v-153.429333H85.333333z"
			fill = "#1296db"
			p-id = "3250"
		></path>
	</svg>;
};
const FontBackgroundIcon = () => {
	return <svg
		t = "1736317429584"
		className = "icon"
		viewBox = "0 0 1024 1024"
		version = "1.1"
		xmlns = "http://www.w3.org/2000/svg"
		p-id = "4454"
		width = "16"
		height = "16"
	>
		<path
			d = "M25.6 0h972.8v1024H25.6V0z m819.2 921.6L562.688 102.4H461.312L179.2 921.6h105.4208l72.2944-224.0512h307.2L739.328 921.6H844.8z m-210.8416-317.6448H386.048l110.4384-341.0432c4.7104-12.6464 9.0624-31.5904 13.056-56.832h2.048c3.328 27.4432 6.9632 46.4384 11.008 56.832l111.4112 340.992z"
			fill = "#1296db"
			p-id = "4455"
		></path>
	</svg>;
};
const CancelEditIcon = () => {
	return <svg
		t = "1736318427766"
		className = "icon"
		viewBox = "0 0 1024 1024"
		version = "1.1"
		xmlns = "http://www.w3.org/2000/svg"
		p-id = "6351"
		width = "18"
		height = "18"
	>
		<path
			d = "M842.947458 778.116917 576.847937 512.013303 842.946434 245.883083c8.67559-8.674567 13.447267-20.208251 13.43908-32.477692-0.008186-12.232602-4.7727-23.715121-13.414521-32.332383-8.655124-8.677637-20.149922-13.450337-32.384571-13.4575-12.286838 0-23.808242 4.771677-32.474622 13.434987L512.019443 447.143876 245.88206 181.050496c-8.66331-8.66331-20.175505-13.434987-32.416294-13.434987-12.239765 0-23.75196 4.770653-32.414247 13.43294-8.66024 8.636704-13.428847 20.12434-13.437034 32.356942-0.008186 12.269441 4.76349 23.803125 13.437034 32.476669l266.135336 266.13022L181.050496 778.11794c-8.664334 8.66331-13.43601 20.173458-13.43601 32.41527 0 12.239765 4.7727 23.752983 13.437034 32.417317 8.662287 8.66331 20.173458 13.43294 32.413224 13.43294 12.240789 0 23.754007-4.770653 32.416294-13.43294l266.134313-266.100544 266.101567 266.100544c8.66331 8.66331 20.185738 13.43294 32.4429 13.43294 12.265348-0.008186 23.74889-4.771677 32.369222-13.412474C860.81643 825.081555 860.821547 795.991006 842.947458 778.116917z"
			fill = "#272636"
			p-id = "6352"
		></path>
	</svg>;
};
const FontSizeIcon = () => {
	return <svg
		t = "1732055514718"
		className = "icon"
		viewBox = "0 0 1024 1024"
		version = "1.1"
		xmlns = "http://www.w3.org/2000/svg"
		p-id = "52742"
		width = "20"
		height = "20"
	>
		<path
			d = "M479.829333 640H202.837333l-85.333333 213.333333H25.6L298.666667 170.666667h85.333333l273.066667 682.666666h-91.904l-85.333334-213.333333z m-34.133333-85.333333L341.333333 293.76 236.970667 554.666667h208.725333zM896 534.826667V512h85.333333v341.333333h-85.333333v-22.826666a170.666667 170.666667 0 1 1 0-295.68zM810.666667 768a85.333333 85.333333 0 1 0 0-170.666667 85.333333 85.333333 0 0 0 0 170.666667z"
			p-id = "52743"
		></path>
	</svg>;
};
const SaveIcon = () => {
	return <svg
		t = "1732055171333"
		className = "icon"
		viewBox = "0 0 1024 1024"
		version = "1.1"
		xmlns = "http://www.w3.org/2000/svg"
		p-id = "49797"
		width = "16"
		height = "16"
	>
		<path
			d = "M563.93554 122.611368a48.609619 48.609619 0 0 0-47.970018 49.313179v30.636852a48.609619 48.609619 0 0 0 47.970018 49.313179c26.47945 0 47.970019-22.130169 47.970019-49.313179v-30.636852a48.609619 48.609619 0 0 0-47.970019-49.313179z"
			fill = "#030000"
			p-id = "49798"
		></path>
		<path
			d = "M991.700187 277.266708c0-2.046721-0.89544-3.837601-1.15128-5.820362a48.929419 48.929419 0 0 0-13.623485-40.998376l-215.737165-215.673204a49.377139 49.377139 0 0 0-36.073454-14.454966c-0.51168 0-0.89544-0.25584-1.34316-0.25584h-38.248095L685.331668 0l-0.44772 0.06396H339.116052L338.924172 0H81.612992l-0.70356 0.12792L80.269831 0a46.498938 46.498938 0 0 0-30.444972 12.024485c-0.9594 0.89544-2.302561 1.343161-3.198001 2.302561-1.08732 1.02336-1.599001 2.494441-2.494441 3.645721a45.859338 45.859338 0 0 0-11.832604 29.997252l0.12792 0.6396-0.12792 0.70356v924.734041l0.12792 0.831481-0.12792 0.57564c0 12.024485 4.924922 22.641849 12.344284 30.956652 0.70356 0.83148 1.15128 1.854841 1.854841 2.622361 1.2792 1.343161 2.942161 1.982761 4.349282 3.134041a47.074578 47.074578 0 0 0 29.421611 11.193005l0.575641-0.12792 0.57564 0.12792h861.157776l0.6396-0.12792 0.511681 0.12792a46.434978 46.434978 0 0 0 29.357651-11.256965c1.343161-1.15128 3.134041-1.790881 4.349282-3.134041 0.76752-0.76752 1.21524-1.790881 1.854841-2.622361a46.818738 46.818738 0 0 0 12.280324-30.956652l-0.12792-0.6396 0.12792-0.767521 0.12792-696.716552zM386.766271 95.940037h250.467458v193.223236H386.766271V95.940037z m352.483698 831.480325H284.813991v-250.851218l62.233105-62.233104h329.905808l62.297065 62.361024v250.723298z m156.510181 0h-60.570144v-267.097064c0-0.6396-0.3198-1.2792-0.38376-1.790881a48.865459 48.865459 0 0 0-14.391006-36.393254l-89.096314-88.904435a49.313179 49.313179 0 0 0-36.009494-14.454965c-0.57564 0-1.08732-0.3198-1.535041-0.3198H330.865209c-0.6396 0-1.21524 0.3198-1.85484 0.38376a49.249219 49.249219 0 0 0-36.457215 14.327045l-89.032354 88.968395a49.888819 49.888819 0 0 0-14.327046 36.585134c0 0.51168-0.3198 1.02336-0.3198 1.599001V927.420362H128.23985v-831.480325h162.586384v239.850094l0.12792 0.70356-0.12792 0.639601c0 11.640725 4.797002 21.938289 11.960524 30.253092 0.83148 1.08732 1.343161 2.430481 2.366521 3.389881 1.02336 1.02336 2.302561 1.471081 3.389882 2.366521a46.690818 46.690818 0 0 0 30.317051 11.960524l0.703561-0.12792 0.57564 0.12792h343.657214l0.76752-0.12792 0.703561 0.12792a46.371018 46.371018 0 0 0 30.317052-11.960524c1.15128-0.89544 2.366521-1.343161 3.389881-2.366521 1.08732-0.9594 1.471081-2.366521 2.366521-3.389881a46.626858 46.626858 0 0 0 12.024484-30.253092l-0.12792-0.639601 0.12792-0.70356V122.419488L895.76015 284.941911V927.420362z"
			fill = "#030000"
			p-id = "49799"
		></path>
	</svg>;
};
export { AddNewNoteModal };
export default RichTextEditor;


