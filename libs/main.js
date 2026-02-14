(function(module){
	var initOptions = {
		'php':{}
	};

	module.exports = function(broccoli){
		// if( process ){
		// 	delete(require.cache[require('path').resolve(__filename)]);
		// }
		// console.log(options);

		var it79 = require('iterate79');
		var _resMgr = broccoli.resourceMgr;
		// var _pj = px.getCurrentProject();

		/**
		 * データをバインドする
		 */
		this.bind = function( fieldData, mode, mod, callback ){
			fieldData = fieldData||{};
			var rtn = '';

			// v0.3.0: `output` は `src` に改名されました。
			// 古いバージョンへの互換性維持のため、 `output` がある場合も想定します。
			if( fieldData.src ){
				rtn += fieldData.src;
			}else if( fieldData.output ){
				rtn += fieldData.output;
			}

			if( mode == 'canvas' ){
				if( !rtn.length ){
					rtn += '<tr><td>'+broccoli.lb().get('ui_message.double_click_to_edit')+'</td></tr>';
				}
			}
			// setTimeout(function(){
				callback(rtn);
			// }, 0);
			return;
		}


		/**
		 * GPI (Server Side)
		 */
		this.gpi = function(options, callback){
			callback = callback || function(){};
			var nodePhpBin = require('./node-php-bin.js').get(initOptions.php);

			switch(options.api){
				case 'openOuternalEditor':
					it79.fnc(
						options.data,
						[
							function(it1, data){
								var appMode = broccoli.getAppMode();
								// console.log(appMode);
								if( appMode != 'desktop' ){
									var message = 'appModeが不正です。';
									// console.log( message );
									callback({'result':false, 'message': message});
									return;
								}
								it1.next(data);
							} ,
							function(it1, data){
								_resMgr.getResourceOriginalRealpath( data.resKey, function(realpath){
									// console.log(realpath);
									data.realpath = realpath;
									it1.next(data);
								} );
							} ,
							function(it1, data){
								var desktopUtils = require('desktop-utils');
								desktopUtils.open( data.realpath );
								it1.next(data);
							} ,
							function(it1, data){
								callback({'result':true});
								it1.next(data);
							}
						]
					);
					break;

				case 'getFileInfo':
					_resMgr.getResource( options.data.resKey, function(resInfo){
						// console.log(resInfo);
						callback(resInfo);
					} );
					break;

				case 'excel2html':
					var resKey;
					var $tmpResInfo;
					it79.fnc(
						options.data,
						[
							function(it1, data){
								if( options.data.resKey ){
									resKey = options.data.resKey;
									it1.next(data);
									return;
								}else if( isset(options.data.base64) ){
									it79.fnc({}, [
										function(it2){
											_resMgr.addResource(function(res){
												resKey = res;
												it2.next();
											});
											return;
										},
										function(it2){
											_resMgr.getResource( resKey, function(res){
												$tmpResInfo = res;
												$tmpResInfo.ext = options.data.extension;
												$tmpResInfo.base64 = options.data.base64;
												it2.next();
											} );
											return;
										},
										function(it2){
											_resMgr.updateResource( resKey, $tmpResInfo, function(){
												it2.next();
											} );
											return;
										},
										function(){
											it1.next(data);
										},
									]);
									return;
								}
								callback({
									"result": false,
								});
								return;
							},
							function(it1, data){
								_resMgr.getResourceOriginalRealpath( resKey, function(realpath){
									// console.log(realpath);
									data.realpath = realpath;
									it1.next(data);
								} );
							} ,
							function(it1, data){

								var eventEndFlg = {};
								var timeout = {};
								var doneFlg = false;
								function receiveCallBack(src, eventName){
									// node-webkit で、なぜか childProc.spawn の、
									// stdout.on('data') より先に on('exit') が呼ばれてしまうことがある。
									// 原因は不明。
									// 下記は、complete と success の両方が呼ばれるまで待つようにする処理。
									eventEndFlg[eventName] = true;
									clearTimeout(timeout);
									if(doneFlg){
										return;//もう行っちゃいました。
									}
									if( eventName == 'complete' && (eventEndFlg['success'] || eventEndFlg['error']) ){
										// complete が呼ばれる前に success または error が呼ばれていた場合
										data.src = src;
										it1.next(data);
										return;
									}
									if( eventEndFlg['complete'] && (eventName == 'success' || eventName == 'error') ){
										// complete が既に呼ばれている状態で、success または error が呼ばれた場合
										data.src = src;
										it1.next(data);
										return;
									}
									timeout = setTimeout(function(){
										doneFlg = true;
										data.src = src;
										it1.next(data);
									}, 3000); // 3秒待っても呼ばれなかったら先へ進む
								}

								nodePhpBin.script(
									[
										__dirname+'/php/excel2html.php',
										'--path', data.realpath ,
										'--header_row', data.header_row,
										'--header_col', data.header_col,
										'--cell_renderer', data.cell_renderer,
										'--renderer', data.renderer
									],
									{
										"success": function(src){
											receiveCallBack(src, 'success');
										} ,
										"error": function(error){
											console.error('"excel2html.php" convert ERROR');
											console.error('see error message below:', error);
											receiveCallBack(error, 'error');
										} ,
										"complete": function(src, error, code){
											if( error || code ){
												console.error('"excel2html.php" convert ERROR (code:'+code+')');
												console.error('see error message below:', src);
												var errorMsg = src;
												src = '';
												src += '<tr><th>"excel2html.php" convert ERROR (code:'+code+')</th></tr>';
												src += '<tr><td>see error message below:</td></tr>';
												src += '<tr><td>'+error+'</td></tr>';
												src += '<tr><td>'+errorMsg+'</td></tr>';
											}
											receiveCallBack(src, 'complete');
										}
									}
								);

							} ,
							function(it1, data){
								callback(data.src);
								it1.next(data);
							}
						]
					);
					break;

				default:
					callback('ERROR: Unknown API');
					break;
			}

			return this;
		}

	}

	/**
	 * オプション付きでロード
	 * @param  {Object} _initOptions オプション
	 * @return {Function}            プラグインAPI
	 */
	module.exports.get = function(_initOptions){
		initOptions = _initOptions || {};
		initOptions.php = initOptions.php || {};
		return module.exports;
	}

})(module);
