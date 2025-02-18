import React , {
	useState , useRef , useEffect ,
} from 'react';
import {
	Modal , Input , message , Radio , Switch , Divider,
} from 'antd';
import './note.css';


const ThemeRadioStyle = {
	display : 'flex' ,
	flexDirection : 'column' ,
	gap : 12 ,
	fontSize : 20,
};

const ThemeRadios = ({
	settingItems ,
	updateNoteSettingItems,
}) => {
	const [value , setValue] = useState(settingItems.themeMode);
	const [autoSwitch , setAutoSwitch] = useState(JSON.parse(localStorage.getItem('autoSwitch')) || false);
	
	// 自动模式逻辑
	useEffect(() => {
		if ( autoSwitch ) {
			const checkTime = () => {
				const hours = new Date().getHours();
				const newMode = (hours >= 20 || hours < 8) ? "note-dark-mode" : "note-light-mode";
				
				if ( newMode !== value ) {
					setValue(newMode);
					updateNoteSettingItems('themeMode' , newMode);
				}
			};
			
			checkTime();
			const interval = setInterval(checkTime , 60000); // 每分钟检查一次
			return () => clearInterval(interval); // 卸载时清除定时器
		}
	} , [autoSwitch , value , updateNoteSettingItems]);
	
	// 用户手动切换模式（自动切换关闭）
	const onChange = (e) => {
		setValue(e.target.value);
		updateNoteSettingItems('themeMode' , e.target.value);
		
		// 关闭自动模式
		setAutoSwitch(false);
		// localStorage.setItem('autoSwitch', JSON.stringify(false));
	};
	
	// 开启/关闭自动模式
	const onToggleAuto = (checked) => {
		//antd 会在 onChange 事件触发时自动传入checked
		setAutoSwitch(checked);
		// localStorage.setItem('autoSwitch', JSON.stringify(checked));
		
		if ( checked ) {
			// 立即触发自动模式逻辑
			const hours = new Date().getHours();
			const newMode = (hours >= 20 || hours < 8) ? "note-dark-mode" : "note-light-mode";
			setValue(newMode);
			updateNoteSettingItems('themeMode' , newMode);
		}
	};
	
	return (<div>
			{/* 主题模式选择 */ }
			<Radio.Group
				optionType = "button"
				size = "large"
				buttonStyle = "solid"
				style = { ThemeRadioStyle }
				onChange = { onChange }
				value = { value }
				options = { [
					{
						value : "note-light-mode" ,
						label : "白天模式",
					} ,
					{
						value : "note-dark-mode" ,
						label : "黑夜模式",
					},
				] }
			/>
			
			{/* 自动切换开关 */ }
			{/*<div style={{ marginTop: "8px" }}>*/ }
			{/*	<label>自动切换：</label>*/ }
			{/*	<Switch*/ }
			{/*		checked={autoSwitch}*/ }
			{/*		onChange={onToggleAuto}*/ }
			{/*	/>*/ }
			{/*</div>*/ }
		</div>);
};

const ChangeNoteCoverMode = () => {
	
	return <>
	</>;
};


const SettingModal = ({
	closeModal ,
	open ,
	settingItems ,
	updateNoteSettingItems ,
}) => {
	const [activeItem , setActiveItem] = useState('主题');
	
	const settingItemsText = ['主题' , '笔记' , '语言' , '时区' , '隐私' , '反馈'];
	
	const handleOk = () => {
		
		handleCancel();
	};
	
	const handleCancel = () => {
		closeModal();
	};
	
	return (<>
		<Modal
			// title = "设置"
			open = { open }
			// centered
			onOk = { handleOk }
			onCancel = { handleCancel }
			cancelText = "取消"
			okText = "应用"
			closable = { false }
			// width = { 450 }
			destroyOnClose = { true }
			keyboard = { true }
			footer = { null }
			wrapClassName = { `setting-modal ${ settingItems.themeMode }` }
			// loading
		>
			<div className = "setting-modal-content">
				<div className = "setting-sidebar">
					{ settingItemsText.map((item , index) => {
						return <div
							className = { `setting-item ${ activeItem === item ? 'active-setting-item' : '' }` }
							key = { `setting-${ index }-${ item }` }
							onClick = { () => {
								setActiveItem(item);
							} }
						>{ item }</div>;
					}) }
				
				</div>
				
				<div className = "setting-panel">
					{ activeItem === '主题' && <div className = "theme-mode-radios"><ThemeRadios
						settingItems = { settingItems }
						updateNoteSettingItems = { updateNoteSettingItems }
					/>
						{/*<p>晚上20点后自动开启黑夜模式 , 早上8点开启白天模式</p>*/ }
					</div> }
					{ activeItem === '笔记' && <NoteDisplaySetting
						updateNoteSettingItems = { updateNoteSettingItems }
						settingItems = { settingItems }
					/> }
					{ activeItem === '反馈' && <div>
						亲爱的用户 :
						<br />
						如果您在使用笔记本软件的过程中有任何建议或发现了任何问题与 bug，欢迎随时反馈给我们。
						<br />
						我们会认真查看并不断优化，为您提供更好的体验。
						<FeedbackContent />
					</div> }
				
				
				</div>
			
			</div>
		</Modal>
	</>);
};

const NoteDisplaySetting = ({
	settingItems ,
	updateNoteSettingItems ,
}) => {
	const [listGapselected , setListGapSelected] = useState(settingItems.listModeGap);
	const [cardColumnSelected , setCardColumnSelected] = useState(settingItems.cardModeColumn);
	const [gridColumnSelected , setGridColumnSelected] = useState(settingItems.gridModeColumn);
	const [switchCoverMode , setSwitchCoverMode] = useState(settingItems.coverMode);
	
	const listGapRadioChange=(value)=>{
		setListGapSelected(value)
		updateNoteSettingItems('listModeGap',value)
	}
	
	const cardColumnRadioChange=(value)=>{
		setCardColumnSelected(value)
		updateNoteSettingItems('cardModeColumn',value)
	}
	
	const gridColumnRadioChange=(value)=>{
		setGridColumnSelected(value)
		updateNoteSettingItems('gridModeColumn',value)
	}
	const handleSwitchCoverMode=(checked)=>{
		setSwitchCoverMode(checked);
		updateNoteSettingItems('coverMode',checked)
	}
	return <div>
		<div className = "open-no-cover-mode">
			<span>
				{/*{ !settingItems.coverMode ? <span>开启</span> : <span>关闭</span> }*/}
				<span>笔记本无封面模式</span>
			</span>
			<Switch
				defaultChecked = { switchCoverMode }
				className = "open-no-cover-mode-radio"
				onChange={handleSwitchCoverMode}
			/></div>
		{/*<p>笔记布局配置</p>*/ }
		<Divider />
		
		<p>列表模式间距</p>
		<div>
			<ButtonRadio
				options = { [
					{
						label : "紧凑" ,
						value : "condensed",
					} ,
					{
						label : "适中" ,
						value : "comfy",
					} ,
					{
						label : "宽松" ,
						value : "expanded",
					},
				] }
				value = { listGapselected }
				onChange = { listGapRadioChange }
			/>
		</div>
		<Divider />
		
		<p>卡片模式列数</p>
		<div>
			<ButtonRadio
				options = { [
					{
						label : "2列" ,
						value : "cardTwoColumn",
					} ,
					{
						label : "3列" ,
						value : "cardThreeColumn",
					} ,
					{
						label : "4列" ,
						value : "cardFourColumn",
					} ,
					{
						label : "5列" ,
						value : "cardFiveColumn",
					} ,
				] }
				value = { cardColumnSelected }
				onChange = { cardColumnRadioChange }
			/>
		</div>
		<Divider />
		<p>宫格模式列数</p>
		<div>
			<ButtonRadio
				options = { [
					{
						label : "2列" ,
						value : "gridTwoColumn",
					} ,
					{
						label : "3列" ,
						value : "gridThreeColumn",
					} ,
					{
						label : "4列" ,
						value : "gridFourColumn",
					} ,
					{
						label : "5列" ,
						value : "gridFiveColumn",
					} ,
				] }
				value = { gridColumnSelected }
				onChange = { gridColumnRadioChange }
			/>
		</div>
	</div>;
};

const ButtonRadio = ({
	options ,
	value ,
	onChange ,
}) => {
	return (<div className = "display-radio-group">
		{ options.map((option) => (<label
			key = { option.value }
			className = { `display-radio-btn ${ value === option.value ? "selected-display-radio" : "" }` }
			onClick = { () => {
				onChange(option.value);
			} }
		>
			{ option.label }
		</label>)) }
	</div>);
};

const FeedbackContent = () => {
	const [copySuccuess , setCopySuccess] = useState(false);
	const email = 'liqunzhang3@gmail.com';
	const handleCopyEmail = () => {
		navigator.clipboard.writeText(email).then(() => {
			setCopySuccess(true);
			setTimeout(() => {
				setCopySuccess(false);
			} , 3000);
		}).catch(err => {
			console.error('复制失败');
			setCopySuccess(false);
		});
	};
	return <div>
		<p>反馈请发送到以下邮箱:</p>
		<p>liqunzhang3@gmail.com</p>
		{ copySuccuess ?
		  <div className = "feedback-copy-button">
			  <CopySuccessIcon />
			  <span>已复制</span>
		  </div> :
		  <div
			  onClick = { handleCopyEmail }
			  className = "feedback-copy-button"
		  >
			  <CopyEmailIcon />
			  <span>复制邮箱</span>
		  </div> }
	</div>;
};
const FeedbackIcon = () => {
	return <svg
		style = { { marginLeft : '16px' } }
		t = "1734469824786"
		className = "icon"
		viewBox = "0 0 1024 1024"
		version = "1.1"
		xmlns = "http://www.w3.org/2000/svg"
		p-id = "62600"
		width = "20"
		height = "20"
	>
		<path
			d = "M874 80.5H150.7c-47.4 0-86 38.6-86 86v550c0 1.2 0.1 2.5 0.2 3.7l-0.2 192.2c0 14.5 8.7 27.7 22.2 33.3 4.5 1.9 9.2 2.8 13.8 2.8 9.3 0 18.5-3.6 25.4-10.5l136.2-135.4H874c47.4 0 86-38.6 86-86v-550c0-47.5-38.6-86.1-86-86.1z m14 636c0 7.7-6.3 14-14 14H249.5c-9.8-0.5-19.8 2.9-27.4 10.4l-85.4 84.8 0.1-109.2c0-1.3-0.1-2.5-0.2-3.7V166.5c0-7.7 6.3-14 14-14H874c7.7 0 14 6.3 14 14v550z"
			p-id = "62601"
			fill = "#000"
		></path>
		<path
			d = "M750.3 297h-476c-19.9 0-36 16.1-36 36s16.1 36 36 36h475.9c19.9 0 36-16.1 36-36s-16.1-36-35.9-36zM505.5 513.4H274.3c-19.9 0-36 16.1-36 36s16.1 36 36 36h231.2c19.9 0 36-16.1 36-36s-16.1-36-36-36z"
			p-id = "62602"
			fill = "#000"
		></path>
	</svg>;
};
const CopyEmailIcon = () => {
	return <svg
		t = "1738544435152"
		className = "icon"
		viewBox = "0 0 1024 1024"
		version = "1.1"
		xmlns = "http://www.w3.org/2000/svg"
		p-id = "48072"
		width = "16"
		height = "16"
	>
		<path
			d = "M337.28 138.688a27.968 27.968 0 0 0-27.968 27.968v78.72h377.344c50.816 0 92.032 41.152 92.032 91.968v377.344h78.656a28.032 28.032 0 0 0 27.968-28.032V166.656a28.032 28.032 0 0 0-27.968-27.968H337.28z m441.408 640v78.656c0 50.816-41.216 91.968-92.032 91.968H166.656a92.032 92.032 0 0 1-91.968-91.968V337.28c0-50.816 41.152-92.032 91.968-92.032h78.72V166.656c0-50.816 41.152-91.968 91.968-91.968h520c50.816 0 91.968 41.152 91.968 91.968v520c0 50.816-41.152 92.032-91.968 92.032h-78.72zM166.656 309.312a27.968 27.968 0 0 0-27.968 28.032v520c0 15.424 12.544 27.968 27.968 27.968h520a28.032 28.032 0 0 0 28.032-27.968V337.28a28.032 28.032 0 0 0-28.032-28.032H166.656z"
			p-id = "48073"
		></path>
	</svg>;
};

const CopySuccessIcon = () => {
	return <svg
		t = "1738545518759"
		className = "icon"
		viewBox = "0 0 1024 1024"
		version = "1.1"
		xmlns = "http://www.w3.org/2000/svg"
		p-id = "49135"
		width = "14"
		height = "14"
	>
		<path
			d = "M398.46 911.06a62.53 62.53 0 0 1-43.27-17.38L22.12 574.7a62.55 62.55 0 0 1 86.53-90.35L393 756.69l515.8-626.81a62.55 62.55 0 1 1 96.6 79.5L446.76 888.26a62.56 62.56 0 0 1-44.6 22.74c-1.24 0.08-2.47 0.11-3.71 0.11z m0 0"
			fill = "#797979"
			p-id = "49136"
		></path>
	</svg>;
};


export { SettingModal };
