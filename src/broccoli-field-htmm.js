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
		return;
	}

	/**
	 * エディタUIで編集した内容を保存
	 * htmm のストアから mapData を取り出し、.mm XML を resMgr に保存する。
	 */
	this.saveEditorContent = function( elm, data, mod, callback ){
		if( typeof(data) !== typeof({}) ){
			data = {};
		}
		if( typeof(data.resKey) !== typeof('') ){
			data.resKey = '';
		}

		var htmm = require('@tomk79/htmm');
		var useHtmmStore = htmm.useHtmmStore;
		var generateMindMapXML = htmm.generateMindMapXML;

		var mapData = useHtmmStore.getState().mapData;
		if( !mapData ){
			callback(data);
			return;
		}

		var xmlString = generateMindMapXML(mapData);
		// UTF-8 を考慮した base64 エンコード（マルチバイト文字対応）
		var base64 = btoa(unescape(encodeURIComponent(xmlString)));

		function updateRes(){
			_resMgr.getResource(data.resKey, function(resInfo){
				if( resInfo === false ){
					resInfo = {};
				}
				resInfo.base64 = base64;
				resInfo.ext = 'mm';
				resInfo.type = 'application/x-freemind';
				_resMgr.updateResource(data.resKey, resInfo, function(){
					callback(data);
				});
			});
		}

		if( !data.resKey ){
			_resMgr.addResource(function(newResKey){
				data.resKey = newResKey;
				updateRes();
			});
		}else{
			updateRes();
		}
		return;
	}
};
