import React , { useState , useRef , useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import forestNoteSiteIcon from'./img-collection/forestNote-site-leaf-icon.png'
import './note.css';

const ForestNoteWebsitePage=()=>{
	const navigate = useNavigate(); 
	
	const handleGetStarted = () => {
		navigate('/ForestNote'); // 点击按钮时跳转
	};
	
	return <div className = 'forestNote-app-site-page'>
		
		<header className = "topbar">
			<div className='top-nav-container'>
				<div className='brand'>
					<img
						className = "brand-logo"
						src = { forestNoteSiteIcon }
						alt = ""
					/>
					<div className = "brand-name">ForestNote</div>
				</div>
				<nav>
					
					<span className = "nav-item">
						<a href = "#home">Home</a>
					</span>
					<span className = "nav-item">
						<a href = "#features">Features</a>
					</span>
					<span className = "nav-item">
						<a href = "#help">Help</a>
					</span>
					<span className = "nav-item">
						<a href = "#about">About</a>
					</span>
					<span className = "nav-item">
						<a href = "#contact">Contact Us</a>
					</span>
				</nav>
			</div>
		</header>
		
		<section
			id = "home"
			className = "section"
		>
			{/*<div className = "slogan">Your Mind, A Growing Forest</div>*/}
			<div className = "slogan">Take Notes,
			                          <br />
			                          Build Your Own Thought Forest</div>
			{/*<div className = "slogan">A Quiet Place for Your Thoughts to Settle</div>*/}
			{/*<div className = "slogan">A Living Notebook, A Thriving Mind</div>*/}
			
			
			{/*<div className = "slogan-explanation">Plant Your Thoughts, Watch Them Grow</div>*/}
			<div className = "slogan-explanation">Write, plan, and stay organized with powerful note-taking and to-do lists.</div>
			
			<div className='home-section-footer-start-button'>
				<div
					onClick = { handleGetStarted }
					className = "get-started-button"
				>Start for Free
				</div>
			</div>
		</section>
		
		{/*<section id = "features" className='section'> Features Content</section>*/}
		{/*<section id = "help" className='section'> Q&A</section>*/}
		{/*<section id = "about" className='section'> About</section>*/}
		{/*<section id = "contact" className='section'> Contact Us Content</section>*/}
		
		
	</div>
}

export { ForestNoteWebsitePage }
