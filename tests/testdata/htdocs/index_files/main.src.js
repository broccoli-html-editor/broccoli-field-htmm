/**
 * main.js
 */
window.main = new (function(){
	var _this = this;
	var it79 = require('iterate79');
	var socket;
	if(window.biflora){
		socket = this.socket = window.biflora
			.createSocket(
				this,
				io,
				{
					'showSocketTest': function( data, callback, main, socket ){
						callback(data);
						return;
					}
				}
			)
		;
	}
	var serverType = 'biflora';

	// broccoli をインスタンス化
	var broccoli = new Broccoli();
	this.broccoli = window.broccoli = broccoli;

	this.init = function(options, callback){
		callback = callback||function(){};
		options = options||{};
		// this.socketTest();
		// broccoli を初期化
		if(options.serverType){
			serverType = options.serverType;
		}
		broccoli.init(
			{
				'elmCanvas': $('.canvas').get(0),
				'elmModulePalette': $('.palette').get(0),
				'contents_area_selector': '[data-contents]',
				'contents_bowl_name_by': 'data-contents',
				'lang': 'ja',
				'appearance': 'light',
				'customFields': {
					'table': window.BroccoliFieldHtmm
				},
				'gpiBridge': function(api, options, callback){
					// General Purpose Interface Bridge
					console.info('=----= GPI Request =----=', api, options);
					var millitime = (new Date()).getTime();

					if(serverType == 'biflora'){
						socket.send(
							'broccoli',
							{
								'api': 'gpiBridge' ,
								'bridge': {
									'api': api ,
									'options': options
								}
							} ,
							function(rtn){
								console.info('-- GPI result', (new Date()).getTime() - millitime, rtn);
								callback(rtn);
							}
						);
					}else if(serverType == 'php'){
						var res;
						$.ajax({
							"url": "./_api.php",
							"method": "post",
							"data":{
								'api': api ,
								'options': JSON.stringify(options)
							},
							"success": function(data){
								try{
									res = JSON.parse(data);
								}catch(e){
									console.error(e, data);
								}
							},
							"error": function(error){
								console.error(error);
							},
							"complete": function(){
								console.info('-- GPI result', (new Date()).getTime() - millitime, res);
								callback(res);
							}
						});
					}
					return;
				}
			} ,
			function(){
				$(window).resize(function(){
					broccoli.redraw();
				});
				callback();
			}
		);
	}

	/**
	 * WebSocket疎通確認
	 */
	this.socketTest = function(){
		socket.send(
			'socketTest',
			{'message': 'socketTest from frontend.'} ,
			function(data){
				console.log(data);
			}
		);
		return this;
	}

})();
