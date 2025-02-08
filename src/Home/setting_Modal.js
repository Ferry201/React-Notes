import React , {
	useState ,
	useRef ,
	useEffect,
} from 'react';
import {
	Modal ,
	Input ,
	message,
	Radio
} from 'antd';
import './note.css';


const style = {
	display: 'flex',
	flexDirection: 'column',
	gap: 12,
	fontSize:20
};
const ThemeRadios = () => {
	const [value, setValue] = useState(1);
	const onChange = (e) => {
		setValue(e.target.value);
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
					value: 1,
					label: '浅色模式',
				},
				{
					value: 2,
					label: '深色模式',
				},
			]}
		/>
	);
};

const SettingModal = ({closeModal,open}) => {
	const [activeItem , setActiveItem] = useState('主题');
	
	const settingItems = ['主题' , '语言' , '时区' , '隐私' , '反馈'];
	
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
				width = { 450 }
				destroyOnClose = { true }
				keyboard = { true }
				footer={null}
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
						{ activeItem === '主题' && <ThemeRadios /> }
						{ activeItem === '反馈' && <div>
							亲爱的用户 :
							<br />
							如果您在使用笔记本软件的过程中有任何建议或发现了任何问题与 bug，欢迎随时反馈给我们。
							<br />
							请发送邮件至：liqunzhang3@gmail.com
							我们会认真查看并不断优化，为您提供更好的体验。
						</div> }
						
						
					</div>
				
				</div>
			</Modal>
	</>);
};


const FeedbackPopoverContent = () => {
	const [copySuccuess , setCopySuccess] = useState(false);
	const email = 'ferry.bunny@outlook.com';
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
		<p>ferry.bunny@outlook.com</p>
		{ copySuccuess ? <div>
			<CopySuccessIcon />
			<span>已复制</span>
		</div> : <div onClick = { handleCopyEmail }>
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
export { SettingModal };
