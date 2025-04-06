import React , { useState , useRef , useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import forestNoteSiteIcon from'./img-collection/forestNote-site-leaf-icon.png'
import forestNoteSiteNotebookIcon from'./img-collection/forestNote-site-book-img.png'
import './note.css';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, } from 'swiper/modules';


import todolistImg from './img-collection/site-swiper-slide-todolist-img.png'
import journalImg from './img-collection/site-swiper-slide-journal-img.png'
import thoughtImg from './img-collection/site-swiper-slide-thought-img.png'
import classNoteImg from './img-collection/site-swiper-slide-classNote-img.png'
import readingNoteImg from './img-collection/site-swiper-slide-readingNote-img.png'
import meetingNoteImg from './img-collection/site-swiper-slide-meetingNote-img.png'
import memoImg from './img-collection/site-swiper-slide-memo-img.png'

// 引入 Swiper 样式
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const ImageSwiper = () => {
	
	const swipleSlideContent=[,
		{
			title:'Thoughts',
			src:thoughtImg
		},
		{
			title:'Journal',
			src:journalImg
		},
		{
			title:'Task List',
			src:todolistImg
		},
		{
			title:'Reading Notes',
			src:readingNoteImg
		},
		{
			title:'Class Notes',
			src:classNoteImg
		},
		{
			title:'Meeting Notes',
			src:meetingNoteImg
		},
		{
			title:'Memo',
			src:memoImg
		},
	]
	
	return (
		<div style={{ padding: '20px', maxWidth: '1200px', margin: '60px auto' }}>
			<Swiper
				modules={[Navigation, Pagination]}
				slidesPerView={5}
				slidesPerGroup={1}
				loop={true}
				navigation
				// pagination={{ clickable: true }}
				// lazy={true}
				spaceBetween={20}
				
				style={{ padding: '20px', backgroundColor: 'transparent', borderRadius: '10px' }}
			>
				{swipleSlideContent.map((content, index) => (
					<SwiperSlide key={index} className='forestNote-swiperSlide-card'>
						<p className='feature-card-title'>{content.title}</p>
						<img
							src={content.src}
							className="swiper-lazy"
							alt={`Slide ${index + 1}`}
							style={{
								width: '100%',
								height: '222px',
								objectFit: 'cover',
								borderRadius: '8px',
							}}
						/>
						<div className="swiper-lazy-preloader"></div>
					</SwiperSlide>
				))}
			</Swiper>
		</div>
	);
};


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
			{/*<div className = "slogan">Your Mind, A Growing Forest</div>*/ }
			<div className = "slogan">Take Notes,
				<br />
			                          Build Your Own Thought Forest
			</div>
			{/*<div className = "slogan">A Quiet Place for Your Thoughts to Settle</div>*/ }
			{/*<div className = "slogan">A Living Notebook, A Thriving Mind</div>*/ }
			
			
			{/*<div className = "slogan-explanation">Plant Your Thoughts, Watch Them Grow</div>*/ }
			<div className = "slogan-explanation">Write, plan, and stay organized with powerful note-taking and to-do lists.</div>
			
			
			
			<div className = "home-section-footer-start-button">
				<div
					onClick = { handleGetStarted }
					className = "get-started-button"
				>Start for Free
				</div>
			</div>
			
			<ImageSwiper/>
		</section>
		
		
		
		<section id = "features" className='section'> Features Content</section>
		<section id = "help" className='section'> Q&A</section>
		<section id = "about" className='section'> About</section>
		<section id = "contact" className='section'> Contact Us Content</section>
		
		
	</div>
}

export { ForestNoteWebsitePage }
