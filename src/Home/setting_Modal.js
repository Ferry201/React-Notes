import React , {
	useState ,
	useRef ,
	useEffect,
} from 'react';
import {
	Modal ,
	Input ,
	message,
	Radio,
	Switch
} from 'antd';
import './note.css';


const style = {
	display: 'flex',
	flexDirection: 'column',
	gap: 12,
	fontSize:20
};
const ThemeRadios = ({themeMode,handleSwitchThemeMode}) => {
	const [value, setValue] = useState(themeMode);
	const onChange = (e) => {
		setValue(e.target.value);
		handleSwitchThemeMode(e.target.value)
	};
	return (
		<Radio.Group
			optionType='button'
			buttonStyle="solid"
			style={style}
			onChange={onChange}
			value={value}
			options={[
				{
					value: 'note-light-mode',
					label: '白天模式',
				},
				{
					value: 'note-dark-mode',
					label: '黑夜模式',
				},
				{
					value: 'auto',
					label: '晚上20:00后自动开启黑夜模式 , 早上八点开启白天模式',
				},
			]}
		/>
	);
};

const SettingModal = ({closeModal,open,themeMode,handleSwitchThemeMode}) => {
	const [activeItem , setActiveItem] = useState('主题');
	
	const settingItems = ['主题' ,'笔记', '语言' , '时区' , '隐私' , '反馈'];
	
	const handleOk = () => {
		
		handleCancel()
	};
	
	const handleCancel = () => {
		closeModal()
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
				footer={null}
				wrapClassName='setting-modal'
				// loading
			>
				<div className = "setting-modal-content">
					<div className = "setting-sidebar">
						{settingItems.map((item , index) => {
							return <div
								className = { `setting-item ${ activeItem === item ? 'active-setting-item' : '' }` }
								key = { `setting-${ index }-${ item }` }
								onClick={()=>{setActiveItem(item)}}
							>{item}</div>;
						}) }
						
					</div>
					
					<div className = "setting-panel">
						{ activeItem === '主题' && <ThemeRadios themeMode={themeMode} handleSwitchThemeMode={handleSwitchThemeMode}/> }
						{ activeItem === '笔记' && <div><p>开启无封面模式</p><Switch defaultChecked = { false } /></div> }
						{ activeItem === '反馈' && <div>
							亲爱的用户 :
							<br />
							如果您在使用笔记本软件的过程中有任何建议或发现了任何问题与 bug，欢迎随时反馈给我们。
							<br />
							我们会认真查看并不断优化，为您提供更好的体验。
							<FeedbackContent/>
						</div> }
						
						
					</div>
				
				</div>
			</Modal>
	</>);
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
		{ copySuccuess ? <div className='feedback-copy-button'>
			<CopySuccessIcon />
			<span>已复制</span>
		</div> : <div onClick = { handleCopyEmail } className='feedback-copy-button'>
			  <CopyEmailIcon />
			  <span>复制邮箱</span>
		  </div> }
	</div>
}
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
