import './App.css';
import React , { Component , useEffect } from 'react';
import { TestLottie } from './Lottie-Component';
// import { BrowserRouter as Router , Routes , Route } from 'react-router-dom';
import { HashRouter as Router , Routes , Route , useNavigate } from 'react-router-dom';
import NotesApp from '@src/Home/note';
import { ForestNoteWebsitePage } from './Home/ForestNoteWebsitePage';


export const App = () => {
	if( location.pathname === '/lottie' ) {
		return <TestLottie />;
	}
	if( location.pathname === '/notes' ) {
		console.log('notes');
	}
	return <>
		<Router>
			<div>
				<Routes>
					<Route
						path = "/"
						element = { <ForestNoteWebsitePage /> }
					/>
					<Route
						path = "/ForestNote"
						element = { <NotesApp /> }
					/>
				
				</Routes>
			</div>
		
		</Router>
	</>;
};

