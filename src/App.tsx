import './App.css';
import React , { Component } from 'react';
import { TestLottie } from './Lottie-Component';
import { BrowserRouter as Router , Routes , Route } from 'react-router-dom';
import NotesApp from '@src/Home/note';
import { ForestNoteWebsitePage } from './Home/ForestNoteWebsitePage';


export const App = () => {
	if( location.pathname === '/lottie' ) {
		return <TestLottie />;
	}
	
	// return <NotesApp />;
	return <>
	<Router>
		<div>
			<Routes>
				<Route path='/'  element={<ForestNoteWebsitePage/>} ></Route>
				<Route path='/ForestNote' element={<NotesApp/>}></Route>
				
			</Routes>
		</div>
		
	</Router>
	</>
};

