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

import categoryOneImg from './img-collection/site-feature-category-image-one.jpg'
import categoryTwoImg from './img-collection/site-feature-category-image-two.png'
import AddImageImg from './img-collection/site-feature-addImage-img.png'
import richtextImg from './img-collection/site-feature-richtext-img.png'

import studentsImg from './img-collection/tab-content-students-img.png'
import professionalImg from './img-collection/tab-content-professionals-image.png'
import researchersImg from './img-collection/tab-content-researchers-image.png'
import personalJournalImg from './img-collection/tab-content-personalJournal-image.png'
import creativesImg from './img-collection/tab-content-creatives-image.png'

// 引入 Swiper 样式
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';


const targetGroupTabs = [
	{
		name: 'Students',
		content: 'Organize class notes, assignments, and projects effortlessly.track your academic progress with ForestNote.',
		src:studentsImg
	},
	{
		name: 'Professionals',
		content: 'Manage tasks, meeting notes, and project plans. Stay productive and organized .',
		src:professionalImg
	},
	{
		name: 'Personal Journalers',
		content: 'Capture your daily thoughts, memories, and personal growth, helping your thoughts flourish like a forest.',
		src:personalJournalImg
	},
	{
		name: 'Researchers',
		content: 'Keep your research notes, references, and ideas organized.Helps you stay efficient during your research journey.',
		src:researchersImg
	},
	{
		name: 'Creatives',
		content: 'Jot down ideas, sketches, and creative projects on the go. Let ForestNote nurture your creativity and watch your ideas grow.',
		src:creativesImg
	},
];

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
								height: '186px',
								objectFit: 'cover',
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
	
	const[activeTab,setActiveTab]=useState('Students');
	
	const intervalRef = useRef(null); // 用于清除旧定时器
	
	const startInterval = () => {
		intervalRef.current = setInterval(() => {
			setActiveTab(prev => {
				const currentIndex = targetGroupTabs.findIndex(tab => tab.name === prev);
				const nextIndex = (currentIndex + 1) % targetGroupTabs.length;
				return targetGroupTabs[nextIndex].name;
			});
		}, 6000);
	};
	
	useEffect(() => {
		startInterval(); // 初始化开启
		
		return () => clearInterval(intervalRef.current); // 卸载时清除
	}, []);
	
	const handleClickTab = (title) => {
	  setActiveTab(title)
		clearInterval(intervalRef.current); // 清除旧的
		startInterval(); // 重新开始计时
	}
	
	return <div className = 'forestNote-app-site-page'>
		<div style={{height:"50px",width:'100%',position:"absolute",top:"0"}}></div>
		<header className = "topbar">
			<div className='top-nav-container'>
				<div className='brand'>
					<img
						className = "brand-logo"
						src = { forestNoteSiteIcon }
						alt = ""
					/>
					<a className = "brand-name" href = "#home">ForestNote</a>
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
			
			<ImageSwiper />
			
			
			<div className = "home-divide-container">
				<div className = "sub-slogan">
					{/*ForestNote is designed for every note-taker out there!*/}
					{/*Designed just for every note-taker, helping you stay perfectly organized*/}
					ForestNote is perfect for all note-takers.
				
				</div>
				
			</div>
			
			<div className = "target-group-nav">
				<div className = "nav-left-bar">
					{ targetGroupTabs.map((tab , index) => {
						return <div key = { `${ tab }-${ index }-${ Math.random() }` }>
							<div
								className = { `nav-title ${ activeTab === tab.name ? 'active-tab' : '' }` }
								onClick = { () => {
									handleClickTab(tab.name);
								} }
							>
								<span><CollapseTabIcon /></span>
								<span>{ tab.name }</span>
							</div>
							 <div className={`tab-content ${activeTab === tab.name ?'active-tab-content':''}`}>{ tab.content }</div> 
							
						</div>
					}) }
				</div>
				<div className = "nav-right-bar">
						
						<div
							className = "nav-image"
						>
							 <img
								src = { targetGroupTabs.find(tab=>tab.name===activeTab).src }
								alt = ""
							/> 
						</div>
				</div>
			</div>
		</section>
		
		
		<section
			id = "features"
			className = "section features-content"
		>
			{/*分类管理*/ }
			<div className = "feature-content-item category-information">
				<div className = "feature-img-container">
				<img
							src = { categoryOneImg }
							alt = ""
						/>
						<img
							className='img-two'
							src = { categoryTwoImg }
							alt = ""
						/>
				</div>
				<div className='information-text'>
					<p className = "features-content-item-title">
						Organize with Ease
					</p>
					<div className = "feature-content-item-details">
						Create categories to group your notebooks. <br/>Inside each category, manage multiple notebooks effortlessly — perfect for keeping work, study, reading, or personal notes neatly separated.
					</div>
				</div>
			</div>
			{/*支持图片功能*/}
			<div className = "feature-content-item addImage-information">
				<div className = "information-text">
					<p className = "features-content-item-title">
						Add Images, Keep Moments
					</p>
					<div className = "feature-content-item-details">
						A single image can hold a hundred details. <br /> Insert photos to preserve work, travels, or fleeting inspiration with clarity and warmth.Add pictures to capture what's hard to put into words.
					</div>
				</div>
				<div className = "feature-img-container">
					<img
						className='add-image-feature-display'
						src = { AddImageImg }
						alt = ""
					/>
					
				</div>
			</div>
			{/*支持富文本编辑*/ }
			<div className = "feature-content-item richtext-information">
				<div className = "feature-img-container">
					<img
						src = { richtextImg }
						alt = ""
					/>
				
				</div>
				
				<div className='information-text'>
					<p className = "features-content-item-title">
						Write Freely with Rich Text
					</p>
					<div className = "feature-content-item-details">
						Bold, italic, — your words, styled your way. <br />
						Add titles, highlight key ideas, and structure your thoughts with clean, numbered lists. Make every note as clear as your thinking.
					
					</div>
				</div>
			</div>
			{/*20种主题以及,文字模式和封面模式切换,24封面*/ }
			
			{/*隐私安全*/}
			<div className='feature-content-item'>
				<div className='information-text'>
					<p className = "features-content-item-title">
						We Respect Your Privacy
					</p>
					<div className = "feature-content-item-details">
						No tracking. No selling.
						<br />
						At ForestNote, we highly value your privacy. Our only goal is to give you a safe place to write, store, and remember.
					</div>
				</div>
				<div className = "feature-img-container"><PrivacyIcon/></div>
				
			</div>
		</section>
		<section id = "help" className='section'>Help Q&A</section>
		<section id = "about" className='section'> About</section>
		<section id = "contact" className='section'> Contact Us Content</section>
		
		
	</div>
}


const PrivacyIcon=()=> {
	return <svg
		t = "1743942688533"
		className = "icon"
		viewBox = "0 0 1024 1024"
		version = "1.1"
		xmlns = "http://www.w3.org/2000/svg"
		p-id = "32844"
		width = "280"
		height = "280"
	>
		<path
			d = "M160 0h704c88.32 0 160 71.68 160 160v704c0 88.32-71.68 160-160 160H160c-88.32 0-160-71.68-160-160V160c0-88.32 71.68-160 160-160z"
			fill = "#00CC66"
			p-id = "32845"
		></path>
		<path
			d = "M654.784 205.024A364.32 364.32 0 0 0 512 176c-49.44 0-97.44 9.856-142.816 29.024L224 266.496v185.28c0 46.08 7.904 91.456 23.52 134.656v0.48a429.248 429.248 0 0 0 66.464 120l0.256 0.256 0.256 0.224a424.928 424.928 0 0 0 101.76 94.784A366.4 366.4 0 0 0 512 848a362.752 362.752 0 0 0 95.264-45.6 434.112 434.112 0 0 0 101.76-94.784l0.256-0.256 0.256-0.256a439.488 439.488 0 0 0 66.944-120.48v-0.224c15.84-43.424 23.744-88.8 23.744-134.88V266.496l-145.44-61.44z m22.08 235.712l-185.28 175.904-116.384-100.544a23.968 23.968 0 1 1 31.424-36.256l83.52 72.256 153.6-145.92a23.904 23.904 0 0 1 33.856 0.96 23.424 23.424 0 0 1-0.736 33.6z"
			fill = "#FFFFFF"
			p-id = "32846"
		></path>
	</svg>
}

const CollapseTabIcon=()=> {
	return <svg
		t = "1744019847375"
		className = "icon"
		viewBox = "0 0 1024 1024"
		version = "1.1"
		xmlns = "http://www.w3.org/2000/svg"
		p-id = "95931"
		width = "24"
		height = "24"
	>
		<path
			d = "M746.56 475.904l-396.992-396.992c-19.904-19.904-52.224-19.904-72.192 0-19.904 19.904-19.904 52.224 0 72.192L638.336 512 277.44 872.896c-19.904 19.904-19.904 52.224 0 72.19200001 19.904 19.904 52.224 19.904 72.192-1e-8l396.992-396.99200001C766.528 528.128 766.528 495.872 746.56 475.904z"
			p-id = "95932"
		></path>
	</svg>
}
export { ForestNoteWebsitePage }
