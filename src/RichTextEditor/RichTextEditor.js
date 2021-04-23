import React , { useState , useRef , useEffect , Component } from 'react';
import { Editor , EditorState , ContentState , convertFromRaw , convertToRaw , RichUtils , AtomicBlockUtils , Modifier } from 'draft-js';
import 'draft-js/dist/Draft.css';
import GetContentButton from '@src/Home/GetContentButton';
import { FaPaintBrush , FaBold , FaItalic , FaUnderline , FaStrikethrough , FaAlignLeft , FaAlignCenter , FaAlignRight , FaAlignJustify , FaListOl , FaListUl , FaImage } from 'react-icons/fa';
import './richTextEditor.css';
import { Popover , Tooltip } from 'antd';

//todo:选中分区

//及时保存
const fontSizeStyleMap = {
	'FONT_SIZE_10' : { fontSize : '10px' } ,
	'FONT_SIZE_12' : { fontSize : '12px' } ,
	'FONT_SIZE_14' : { fontSize : '14px' } ,
	'FONT_SIZE_16' : { fontSize : '16px' } ,
	'FONT_SIZE_18' : { fontSize : '18px' } ,
	'FONT_SIZE_24' : { fontSize : '24px' } ,
	'FONT_SIZE_32' : { fontSize : '32px' } ,
};
const selectColorContent = (
	<div>
		<p>Content</p>
		<p>Content</p>
	</div>
);
const colorStyleMap = {
	RED : { backgroundColor : '#f04d4d' } ,
	GREEN : { backgroundColor : '#78e568' } ,
	BLUE : { backgroundColor : '#68c7e7' } ,
	PINK : { backgroundColor : '#f7dbdb' } ,
	PURPLE : { backgroundColor : '#dac9f8' } ,
	ORANGE : { backgroundColor : '#f4a255' } ,
	TEAL : { backgroundColor : '#91eded' } ,
	GRAY : { backgroundColor : '#edeeec' } ,
};

const RichTextEditor = ({
	onSave ,
	initialContent ,
	onCancel ,
}) => {
	const editorRef = useRef(null);
	useEffect(() => {
		editorRef.current.focus();
	} , []);
	const [editorState , setEditorState] = useState(initialContent ? EditorState.createWithContent(convertFromRaw(initialContent)) : EditorState.createEmpty());
	useEffect(() => {
		if ( initialContent ) {
			setEditorState(EditorState.moveFocusToEnd(EditorState.createWithContent(convertFromRaw(initialContent))));
		}
	} , [initialContent]);
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
	
	const onColorChange = (color) => {
		setEditorState(RichUtils.toggleInlineStyle(editorState , color));
	};
	
	return (
		<div
			style = { {
				height : '100%' ,
				width : '100%' ,
			} }
		>
			<div className = "rich-text-options">
				<Tooltip
					title = "返回并保存"
				>
					<GetContentButton
						editorState = { editorState }
						onSave = { onSave }
					>
						<ReturnIcon />
					</GetContentButton>
				</Tooltip>
				<Tooltip title = "加粗">
					<button onClick = { onBoldClick }><FaBold /></button>
				</Tooltip>
				<Tooltip title='斜体'>
					<button onClick = { onItalicClick }><FaItalic /></button>
				</Tooltip>
				<Tooltip title='下划线'>
					<button onClick = { onUnderlineClick }><FaUnderline /></button>
				</Tooltip>
				<Tooltip title='删除线'>
					<button onClick = { onStrikethroughClick }><FaStrikethrough /></button>
				</Tooltip>
				<Tooltip title='文本靠左'>
					<button onClick = { onAlignLeft }><FaAlignLeft /></button>
				</Tooltip>
				<Tooltip title='文本居中'>
					<button onClick = { onAlignCenter }><FaAlignCenter /></button>
				</Tooltip>
				<Tooltip title='文本靠右'>
					<button onClick = { onAlignRight }><FaAlignRight /></button>
				</Tooltip>
				<Tooltip title='添加图片'>
					<button onClick = { onAddImage }><FaImage /></button>
				</Tooltip>
				<Tooltip title='有序列表'>
					<button onClick = { onOrderedList }><FaListOl /></button>
				</Tooltip>
				<Tooltip title='无序列表'>
					<button onClick = { onUnorderedList }><FaListUl /></button>
				</Tooltip>
				<Tooltip title='字号'>
					<button><FontSizeIcon /></button>
				</Tooltip>
				<Tooltip></Tooltip>
				
				
				<select
					onChange = { onFontSizeChange }
					defaultValue = "10"
				>
					<option value = "10">10</option>
					<option value = "12">12</option>
					<option value = "14">14</option>
					<option value = "16">16</option>
					<option value = "18">18</option>
					<option value = "24">24</option>
					<option value = "32">32</option>
				</select>
				<button>
					<FontColorIcon />
				</button>
				<Popover
					content = { selectColorContent }
					title = "Title"
				>
					<button><FontBackgroundIcon /></button>
				</Popover>
				<select
					onChange = { (e) => onColorChange(e.target.value) }
					defaultValue = ""
				>
					<option value = "">Select Color</option>
					<option value = "RED">Red</option>
					<option value = "GREEN">Green</option>
					<option value = "BLUE">Blue</option>
					<option value = "PINK">Pink</option>
					<option value = "PURPLE">Purple</option>
					<option value = "ORANGE">Orange</option>
					<option value = "TEAL">Teal</option>
					<option value = "GRAY">Gray</option>
				</select>
				<Tooltip title='保存'><GetContentButton
					editorState = { editorState }
					onSave = { onSave }
				> <SaveIcon /></GetContentButton></Tooltip>
				<Tooltip title='退出且不保存修改'>
					<button
						onClick = { onCancel }
					><CancelEditIcon />
					</button>
				</Tooltip>
			</div>
			<div
				style = { {
					marginTop : '10px' ,
					border : '1px solid black' ,
					background : 'white' ,
					borderRadius : '4px' ,
					height : '100%' ,
					maxHeight : 'calc(100% - 40px)' ,
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
					customStyleMap = { { ...fontSizeStyleMap , ...colorStyleMap } }
					handleKeyCommand = { handleKeyCommand }
					onChange = { setEditorState }
					placeholder = "输入笔记..."
					textAlignment = { textAlignment }
				/>
			
			</div>
		
		</div>
	);
};
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
		t = "1732054047634"
		className = "icon"
		viewBox = "0 0 1024 1024"
		version = "1.1"
		xmlns = "http://www.w3.org/2000/svg"
		p-id = "30521"
		width = "16"
		height = "16"
	>
		<path
			d = "M1013.763272 901.117134H10.236925c-5.630255 0-10.236827 4.606572-10.236827 10.247063v102.398976c0 5.630255 4.606572 10.236827 10.236827 10.236827H1013.763272c5.630255 0 10.236827-4.606572 10.236826-10.236827V911.35396c0-5.630255-4.606572-10.236827-10.236826-10.236826zM181.376192 798.707921h108.796993c5.374334 0 10.247063-3.460047 11.905429-8.701303l68.740291-212.485809h280.570943l68.09537 212.485809c1.658366 5.118413 6.398017 8.701303 11.905429 8.701303h114.038248c1.412682 0 2.815127-0.255921 4.104968-0.634684 6.520859-2.303286 9.980906-9.346223 7.67762-15.877318L590.849255 8.445382c-1.791445-4.995571-6.531095-8.445382-11.77235-8.445382H448.127419c-5.374334 0-10.103748 3.326969-11.772351 8.445382L169.603841 782.195919c-0.511841 1.279603-0.634683 2.692285-0.634683 4.094731-0.133079 6.787016 5.497176 12.417271 12.407034 12.417271z m327.54774-660.602894h5.251492l107.261469 337.661725H400.515938l108.407994-337.661725z m0 0"
			fill = "#2C2C2C"
			p-id = "30522"
		></path>
	</svg>;
};
const FontBackgroundIcon = () => {
	return <svg
		t = "1732054918948"
		className = "icon"
		viewBox = "0 0 1024 1024"
		version = "1.1"
		xmlns = "http://www.w3.org/2000/svg"
		p-id = "46995"
		width = "24"
		height = "24"
	>
		<path
			d = "M325.76 531.072l-30.208-30.208 77.76-127.04-41.28-41.344 203.392-204.352 328.704 328.704-203.456 204.288-40.896-40.832L492.8 698.048l-32.96-32.96-37.44 38.912-0.768-0.832H160l131.456-136.64 0.128 0.064 34.176-35.52z m73.536-199.68l262.912 262.848 134.72-136.32-262.976-262.912-134.784 136.32 0.128 0.128z m186.624 254.976L407.232 407.68l-51.84 84.672 145.856 145.92 84.672-51.84z m244.032-95.68l-33.024-32.704 33.024 32.64z"
			fill = "#222222"
			p-id = "46996"
		></path>
		<path
			d = "M920 832H136a8 8 0 0 0-8 8v80c0 4.416 3.584 8 8 8h784a8 8 0 0 0 8-8v-80a8 8 0 0 0-8-8z"
			fill = "#f4ea2a"
			p-id = "46997"
			data-spm-anchor-id = "a313x.search_index.0.i72.60a13a81mlwiRV"
			className = "selected"
		></path>
	</svg>;
};
const CancelEditIcon = () => {
	return <svg
		t = "1732055345513"
		className = "icon"
		viewBox = "0 0 1024 1024"
		version = "1.1"
		xmlns = "http://www.w3.org/2000/svg"
		p-id = "51687"
		width = "16"
		height = "16"
	>
		<path
			d = "M710.776471 650.541176L572.235294 512l156.611765-156.611765c12.047059-12.047059 12.047059-24.094118-6.02353-42.164706-18.070588-18.070588-36.141176-18.070588-42.164705-6.023529L518.023529 457.788235 367.435294 307.2s-24.094118-30.117647-48.188235-6.023529c-30.117647 30.117647-18.070588 42.164706-6.02353 54.211764l156.611765 156.611765-162.635294 162.635294c-12.047059 12.047059-30.117647 24.094118-6.023529 54.211765 30.117647 30.117647 54.211765 0 60.235294-6.02353l162.635294-162.635294 144.564706 144.564706c6.023529 6.023529 30.117647 36.141176 60.235294 6.02353 18.070588-30.117647-18.070588-60.235294-18.070588-60.235295z"
			fill = "#D0021B"
			p-id = "51688"
		></path>
		<path
			d = "M512 0C228.894118 0 0 228.894118 0 512S228.894118 1024 512 1024 1024 795.105882 1024 512 795.105882 0 512 0z m0 951.717647c-246.964706 0-445.741176-198.776471-445.741176-445.741176C66.258824 259.011765 265.035294 60.235294 512 60.235294s445.741176 198.776471 445.741176 445.741177c0 252.988235-198.776471 445.741176-445.741176 445.741176z"
			fill = "#D0021B"
			p-id = "51689"
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
export default RichTextEditor;


