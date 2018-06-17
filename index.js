/* SCRIPT BY BERNKASTEL */

/*
==========HOW TO USE============
Chat commands:
lag0 = normal
lag1 = hide other player effects
lag2 = hide other player models
*/

module.exports = function ZFPS(dispatch) {
	let player;
	let cid;
	let model;
	let job;
	
	let lagstate = 0;
	let lastlagstate = 0;
	let hiddenplayers = [];
	let hiddenindex = [];
	let zmr = 0;
	let locx = [];
	let locy = [];
	
	
	dispatch.hook('S_LOGIN', 10, (event) => {
    ({cid, model} = event);
	player = event.name;
    job = (model - 10101) % 100;
    });
	
	//Elite Nostrum Lag Fix - Credits to PinkyPie for discovering this fix
    dispatch.hook('S_PCBANGINVENTORY_DATALIST', 1, event => {
        for(let item of event.inventory)
            if(item.item == 184659) {
                item.cooldown = 0
                return true
            }
    })
	
	//Char and Skill Hidden
	dispatch.hook('C_CHAT', 1, (event) => {
	if(event.message.includes("lag0") || event.message.includes("lag1") || event.message.includes("lag2")){
		lastlagstate = lagstate;
		if(event.message.includes("lag0")){
			lagstate = 0;
			console.log("ZFPS optimization disabled.");
			dispatch.toClient('S_WHISPER', 1, {
					player: cid,
					unk1: 0,
					gm: 0,
					unk2: 0,
					author: "ZFPS",
					recipient: player,
					message: "ZFPS optimization disabled.",
				});	
		}
		if(event.message.includes("lag1")){
			lagstate = 1;
			console.log("ZFPS optimization set to remove other player effects.");
			dispatch.toClient('S_WHISPER', 1, {
					player: cid,
					unk1: 0,
					gm: 0,
					unk2: 0,
					author: "ZFPS",
					recipient: player,
					message: "ZFPS optimization set to remove other player effects.",
				});	
		}
		if(event.message.includes("lag2")){
			lagstate = 2;
			console.log("ZFPS optimization set to remove other players.");
			dispatch.toClient('S_WHISPER', 1, {
					player: cid,
					unk1: 0,
					gm: 0,
					unk2: 0,
					author: "ZFPS",
					recipient: player,
					message: "ZFPS optimization set to remove other players.",
				});	
		}
		if(lagstate != 2 && lastlagstate == 2){
			for(i = 0; i < zmr; i++){
				if(hiddenplayers[hiddenindex[i]] != "block"){
				dispatch.toClient('S_SPAWN_USER', 3, hiddenplayers[hiddenindex[i]]);
				}
			}
		}
		if(lagstate == 2 && lastlagstate != 2){
			for(i = 0; i < zmr; i++){
				if(hiddenplayers[hiddenindex[i]] != "block"){
				dispatch.toClient('S_DESPAWN_USER', 2, {
					target: hiddenplayers[hiddenindex[i]].guid,
					type: 1,
				});
				}
			}
		}
		return false;
	}
	});
	
	dispatch.hook('S_LOAD_TOPO', 1, (event) => {
		hiddenplayers = [];
		hiddenindex = [];
		zmr = 0;
	});
	
	dispatch.hook('S_SPAWN_USER', 10, (event) => {
		if(hiddenplayers[event.guid] != "block"){
			hiddenindex[zmr] = event.guid;
			zmr++;
		}
		hiddenplayers[event.guid] = event;
		locx[event.guid] = event.x;
		locy[event.guid] = event.y;
        if(lagstate == 2){
			return false;
		}
    });
	
	dispatch.hook('S_DESPAWN_USER', 2, (event) => {
			hiddenplayers[event.target] = "block";
			if(lagstate == 2){
			return false;
		}
    });
	
	dispatch.hook('S_USER_LOCATION', 1, (event) => {
			hiddenplayers[event.target].x = event.x2;
			hiddenplayers[event.target].y = event.y2;
			hiddenplayers[event.target].z = event.z2;
			hiddenplayers[event.target].w = event.w;
			locx[event.target] = event.x2;
			locy[event.target] = event.y2;
        if(lagstate == 2){
			return false;
		}
    });
	
	dispatch.hook('S_ACTION_STAGE', 1, (event) => {
		if(lagstate == 1 && (((event.x - locx[event.source]) > 25 || (locx[event.source] - event.x) > 25) || ((event.y - locy[event.source]) > 25 || (locy[event.source] - event.y) > 25)) && (hiddenplayers[event.source] == "block" || hiddenplayers[event.source])){
				dispatch.toClient('S_USER_LOCATION', 1, {
					target: event.source,
					x1: locx[event.source],
					y1: locy[event.source],
					z1: event.z,
					w: event.w,
					unk2: 0,
					speed: 300,
					x2: event.x,
					y2: event.y,
					z2: event.z,
					type: 0,
					unk: 0,
				});
				locx[event.source] = event.x;
				locy[event.source] = event.y;
			}
			if(lagstate > 0 && (hiddenplayers[event.source] == "block" || hiddenplayers[event.source])){
				return false;
			}
    });
	
	dispatch.hook('S_SPAWN_PROJECTILE', 1, (event) => {
			if(lagstate > 0 && (hiddenplayers[event.source] == "block" || hiddenplayers[event.source])){
				return false;
			}
    });
	
	dispatch.hook('S_START_USER_PROJECTILE', 1, (event) => {
			if(lagstate > 0 && (hiddenplayers[event.source] == "block" || hiddenplayers[event.source])){
				return false;
			}
    });
}
