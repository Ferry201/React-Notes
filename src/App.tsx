import './App.css';
import React , { Component } from 'react';
import { TestLottie } from './Lottie-Component';
import NotesApp from '@src/Home/note';

export const App = () =>{
	if(location.pathname === '/lottie'){
		return <TestLottie />;
	}
	return <NotesApp />;
};

