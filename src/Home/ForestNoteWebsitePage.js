import React , { useState , useRef , useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './note.css';

const ForestNoteWebsitePage=()=>{
	const navigate = useNavigate(); 
	
	const handleGetStarted = () => {
		navigate('/ForestNote'); // 点击按钮时跳转
	};
	return <div className='forestNote-app-site-page'>
		
		<div className="header-nav">
			<div className="site-name">ForestNote</div>
		</div>
		
		<div className="main-section"></div>
		
		<div onClick={handleGetStarted}>started</div>
	</div>
}

export {ForestNoteWebsitePage}
