export const TestLottie = reaxper( () => {
	const ref: LottieRef = useRef();
	
	const [ scheme , setScheme ] = useState<'simple' | 'complex' | 'revert'>( 'revert' );
	const { mount , onComplete , toggleTo , unmount , lottie_Store , lottie_SetState , animationData , lottieProps } = {
		'complex' : reaxel_Lottie_Complex ,
		'simple' : reaxel_Lottie_Simple ,
		'revert' : reaxel_Lottie_Revert ,
	}[scheme]();
	
	useEffect( () => {
		ref.current.setSpeed( 3 );
		mount( ref.current );
	} , [ scheme ] );
	
	return (
		<div>
			<Lottie
				loop = { false }
				autoplay = { false }
				animationData = { animationData }
				style = { { cursor : "pointer" , height : 60 } }
				
				lottieRef = { ref }
				onClick = { () => {
					toggleTo( lottie_Store.currentScheme === 'light' ? 'dark' : 'light' );
				} }
				onComplete = { () => {
					onComplete();
				} }
			/>
			<h2>当前主题:{ scheme } , 显示模式:{ lottie_Store.currentScheme }</h2>
			<Radio.Group
				onChange = { ( e ) => {
					setScheme( e.target.value );
				} }
				value = { scheme }
				disabled = { lottie_Store.playing }
			>
				<Radio
					value = "complex"
				>complex</Radio>
				<Radio
					value = "simple"
				>simple</Radio>
				<Radio
					value = "revert"
				>revert</Radio>
			</Radio.Group>
		</div>
	);
} );

const reaxel_Lottie_Complex = Refaxel_Lottie( {
	schemes : [ { name : "dark" as const , segments : [ 30 , 210 ] } , { name : "light" as const , segments : [ 280 , 430 ] } ] ,
	defaultScheme : 'light' ,
	animationData : complex ,
} as Options<Theme> );
const reaxel_Lottie_Simple = Refaxel_Lottie( {
	schemes : [ { name : "dark" as const , segments : [ 19 , 80 ] } , { name : "light" as const , segments : [ 100 , 173 ] } ] ,
	defaultScheme : 'dark' ,
	animationData : simple ,
	lottieProps : {} ,
} as Options<Theme> );

const reaxel_Lottie_Revert = Refaxel_Lottie( {
	schemes : [ { name : "dark" as const , segments : [ 40 , 100 ] } , { name : "light" as const , segments : [ 100 , 40 ] , direction : -1 } ] ,
	defaultScheme : 'dark' ,
	animationData : revert ,
	lottieProps : {} ,
} as Options<Theme> );
type Theme = "dark" | "light";
import { useEffect , useRef , useState } from 'react';
import { Radio } from 'antd';
import { Options , Refaxel_Lottie } from '../Refaxel-Lottie';
import Lottie , { LottieRef , LottieOptions } from "lottie-react";
import { reaxper } from 'reaxes-react';
import * as complex from "./dark mode.json";
import * as simple from "./simple animate.json";
import * as revert from "./revert.json";
