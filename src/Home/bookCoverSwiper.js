import React, { useEffect, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import './book-cover-swiper.css';

const BookCoverSwiper = ({ books }) => {
	const swiperRef = useRef(null);
	
	const slides = [];
	for (let i = 0; i < books.length; i += 6) {
		slides.push(books.slice(i, i + 6));
	}
	
	// 手动绑定按钮点击事件
	useEffect(() => {
		const swiperInstance = swiperRef.current.swiper;  // 获取 Swiper 实例
		
		const nextButton = swiperRef.current.querySelector('.swiper-button-next');
		const prevButton = swiperRef.current.querySelector('.swiper-button-prev');
		
		if (nextButton && prevButton && swiperInstance) {
			nextButton.addEventListener('click', () => swiperInstance.slideNext());
			prevButton.addEventListener('click', () => swiperInstance.slidePrev());
		}
		
		// 清理事件
		return () => {
			if (nextButton && prevButton) {
				nextButton.removeEventListener('click', () => swiperInstance.slideNext());
				prevButton.removeEventListener('click', () => swiperInstance.slidePrev());
			}
		};
	}, []);
	
	return (
		<div className="book-swiper">
			<Swiper
				ref={swiperRef}  // 使用 ref 引用 Swiper 实例
				spaceBetween={10}
				slidesPerView={1}
				navigation={false}  // 关闭默认导航，改为手动绑定
				loop={true}
			>
				{slides.map((slideBooks, slideIndex) => (
					<SwiperSlide key={slideIndex}>
						<div className="swiper-slide-content">
							{slideBooks.map((book, index) => (
								<div className="book-item" key={index}>
									<img
										src={book.cover}
										alt={`book${index}`}
										width="100%"
										height="100%"
									/>
								</div>
							))}
						</div>
					</SwiperSlide>
				))}
			</Swiper>
			
			{/* 左右切换按钮 */}
			<div className="swiper-button-prev"></div>
			<div className="swiper-button-next"></div>
		</div>
	);
};

export default BookCoverSwiper;
