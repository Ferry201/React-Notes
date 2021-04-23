export const reaxel_sider = reaxel(() => {
	
	const {
		store ,
		setState ,
	} = orzMobx({
		siderCollapsed : false ,
		resizing : false,
	});
	
	let ret = {
		toggleSiderCollapse (siderCollapsed = !store.siderCollapsed) {
			setState({ siderCollapsed });
		} ,
		toggleResizing(resizing = !store.resizing){
			setState({ resizing });
		},
		get resizing(){
			return store.resizing;
		},
		get siderCollapsed () {
			return store.siderCollapsed;
		},
	};
	
	return () => {
		return ret;
	};
});


import {reaxel,orzMobx} from 'reaxes-react'
