import React , { useState , useRef , useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './note.css';

const ForestNoteWebsitePage=()=>{
	const navigate = useNavigate(); 
	
	const handleGetStarted = () => {
		navigate('/ForestNote'); // 点击按钮时跳转
	};
	return <div className = 'forestNote-app-site-page'>
		
		<header className = "topbar">
			<div className="site-name">ForestNote</div>
			<nav>
					
					<span className='nav-item'>
						<a href = "#home">Home</a>
					</span>
					<span className='nav-item'>
						<a href = "#features">Features</a>
					</span>
					<span className='nav-item'>
						<a href = "#pricing">Pricing</a>
					</span>
					<span className='nav-item'>
						<a href = "#contact">Contact Us</a>
					</span>
			</nav>
		</header>
		
		<section id = "home" className='section'>🏡 Home Content
		<div onClick={handleGetStarted}>start</div>
		</section>
		<section id = "features" className='section'>🚀 Features Content</section>
		<section id = "pricing" className='section'>💰 Pricing Content</section>
		<section id = "contact" className='section'>📩 Contact Us Content</section>
		
		
	</div>
}

export { ForestNoteWebsitePage }
