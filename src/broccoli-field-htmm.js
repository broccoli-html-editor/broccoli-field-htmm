window.BroccoliFieldHtmm = function(broccoli){

	var $ = require('jquery');
	var _resMgr = broccoli.resourceMgr;

	/**
	 * プレビュー用の簡易なHTMLを生成する
	 */
	this.mkPreviewHtml = function( fieldData, mod, callback ){
		// InstanceTreeViewで利用する
		fieldData = fieldData||{};
		var rtn = '';
		if( fieldData.src ){
			rtn += fieldData.src;
		}
		rtn = $('<div>'+rtn+'</div>');

		callback( rtn.get(0).outerHTML );
		return;
	}

	/**
	 * データを正規化する
	 */
	this.normalizeData = function( fieldData, mode ){
		var rtn = fieldData;
		if( typeof(fieldData) !== typeof({}) ){
			rtn = {
				"resKey": "",
				"src": "",
				"header_row": 0,
				"header_col": 0,
				"cell_renderer": "text",
				"renderer": "simplify",
				"editor": "html",
			};
		}
		return rtn;
	}

	/**
	 * エディタUIを生成 (Client Side)
	 */
	this.mkEditor = function( mod, data, elm, callback ){
		if( !data.src ){
			data.src = "";
		}

		var Editor = require('./editor/editor.js');
		var editor = new Editor(broccoli, this, mod, data, elm);
		editor.init( callback );
		return;
	}

	/**
	 * データを複製する
	 */
	this.duplicateData = function( data, callback, resources ){
		data = JSON.parse( JSON.stringify( data ) );
		it79.fnc(
			data,
			[
				function(it1, data){
					_resMgr.addResource( function(newResKey){
						_resMgr.updateResource( newResKey, resources[data.resKey], function(result){
							data.resKey = newResKey;
							it1.next(data);
						} );
					} );
				} ,
				function(it1, data){
					callback(data);
					it1.next(data);
				}
			]
		);
		return;
	}

	/**
	 * データから使用するリソースのリソースIDを抽出する (Client Side)
	 */
	this.extractResourceId = function( data, callback ){
		callback = callback||function(){};
		resourceIdList = [];
		resourceIdList.push(data.resKey);
		callback(resourceIdList);
		return this;
	}

	/**
	 * エディタUIで編集した内容を保存
	 */
	this.saveEditorContent = function( elm, data, mod, callback ){
		var _this = this;
		var $dom = $(elm);
		if( typeof(data) !== typeof({}) ){
			data = {};
		}
		if( typeof(data.resKey) !== typeof('') ){
			data.resKey = '';
		}

		it79.fnc({},
			[
				function(it1){
					data.header_row = $dom.find('input[name="'+mod.name+'__header_row"]').val();
					data.header_col = $dom.find('input[name="'+mod.name+'__header_col"]').val();
					data.editor = $dom.find('input[name="'+mod.name+'__editor"]').val();
					if( !data.editor || data.editor == 'html' ){
						data.cell_renderer = $dom.find('input[name="'+mod.name+'__cell_renderer"]').val();
						data.renderer = $dom.find('input[name="'+mod.name+'__renderer"]').val();
					}else{
						data.cell_renderer = $dom.find('input[name="'+mod.name+'__cell_renderer"]:checked').val();
						data.renderer = $dom.find('input[name="'+mod.name+'__renderer"]:checked').val();
					}
					it1.next();
				} ,
				function(it1){
					if( !data.editor || data.editor == 'html' ){
						data.src = $dom.find('textarea[name="'+mod.name+'__src"]').val();
						it1.next();
						return;
					}
					_this.broccoliFieldHtmm_parseUploadedFileAndGetHtml(data, $dom, function(html){
						data.src = html;
						it1.next();
					});
					return;
				} ,
				function(it1){
					callback(data);
					it1.next();
				}
			]
		);

		return;
	}


	/**
	 * アップロードファイルを解析して生成されたHTMLを取得する
	 */
	this.broccoliFieldHtmm_parseUploadedFileAndGetHtml = function( data, $dom, callback ){
		var _this = this;
		var rtn = '';
		var resInfo,
			realpathSelected;

		it79.fnc({},
			[
				function(it2){
					_resMgr.getResource(data.resKey, function(result){
						if( result === false ){
							_resMgr.addResource(function(newResKey){
								data.resKey = newResKey;
								it2.next();
							});
							return;
						}
						it2.next();
					});
				} ,
				function(it2){
					_resMgr.getResource(data.resKey, function(res){
						resInfo = res;
						it2.next();
					});
					return;
				} ,
				function(it2){
					realpathSelected = $dom.find('input[type=file]').val();

					if( realpathSelected ){
						// NOTE: Excelファイルが選択された場合、
						// 選択されたファイルの情報を resourceMgr に登録する。
						resInfo.ext = $dom.find('div[data-excel-info]').attr('data-extension');
						resInfo.type = $dom.find('div[data-excel-info]').attr('data-mime-type');
						resInfo.size = $dom.find('div[data-excel-info]').attr('data-size');
						resInfo.base64 = $dom.find('div[data-excel-info]').attr('data-base64');

						resInfo.isPrivateMaterial = true;
							// NOTE: リソースファイルの設置は resourceMgr が行っている。
							// isPrivateMaterial が true の場合、公開領域への設置は行われない。

						_resMgr.updateResource( data.resKey, resInfo, function(){
							it2.next();
						} );
						return;
					}else{
						// NOTE: Excelファイルが選択されていない場合、
						// 過去に登録済みの bin.xlsx が変更されている可能性があるので、
						// bin2base64 でJSONを更新しておく。
						_resMgr.resetBase64FromBin( data.resKey, function(){
							it2.next();
						} );
						return;
					}
				} ,
				// function(it2){
				// 	// NOTE:
				// 	// ☓ここで一旦保存しないと、古いデータで変換してしまう。
				// 	// ○ここで一旦保存しちゃうと、addResource() した新しいデータが削除されてしまう。
				// 	_resMgr.save( function(){
				// 		// var res = _resMgr.getResource( data.resKey );
				// 		it2.next();
				// 	} );
				// } ,
				function(it2){
					_this.callGpi(
						{
							'api': 'excel2html',
							'data': data,
						} ,
						function(result){
							rtn = result;
							if( typeof(rtn) !== typeof('') ){
								rtn = '';
							}
							it2.next();
							return;
						}
					);
				} ,
				function(){
					callback( rtn );
				} ,
			]
		);
		return;
	}
};
