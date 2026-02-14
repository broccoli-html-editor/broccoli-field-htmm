module.exports = function(broccoli, main, editor, mod, data, elm){
	var templateImportXlsx = require('./importXlsx.twig');
	var it79 = require('iterate79');
	var _resMgr = broccoli.resourceMgr;

	this.init = function( callback ){
		var _this = this;
		if( typeof(data) !== typeof({}) ){ data = {}; }
		if( typeof(data.resKey) !== typeof('') ){
			data.resKey = '';
		}
		var appMode = broccoli.getAppMode();

		// モーダルを開く
		var $modalImportXlsx = $( templateImportXlsx({
			modName: mod.name,
			appMode: appMode,
			resKey: data.resKey,
			data: data,
		}) );

        var $excel = $modalImportXlsx.find('div[data-excel-info]');

		var importXlsxModal = px2style.modal({
			"title": editor.lb.get('ui_label.import_from_excel'),
			"body": $modalImportXlsx,
			"buttons": [
				$('<button type="button" class="px2-btn px2-btn--primary">')
					.text( editor.lb.get('ui_label.import_from_excel') )
					.on('click', function(){
						var data = {};
						var htmlSrc = '';
						it79.fnc({},
							[
								function(it1){
									data.header_row = $modalImportXlsx.find('input[name="'+mod.name+'__import-xlsx-modal__header_row"]').val();
									data.header_col = $modalImportXlsx.find('input[name="'+mod.name+'__import-xlsx-modal__header_col"]').val();
									data.cell_renderer = $modalImportXlsx.find('input[name="'+mod.name+'__import-xlsx-modal__cell_renderer"]:checked').val();
									data.renderer = $modalImportXlsx.find('input[name="'+mod.name+'__import-xlsx-modal__renderer"]:checked').val();
									data.base64 = $excel.attr('data-base64');
									data.extension = $excel.attr('data-extension');
									data.mime_type = $excel.attr('data-mime-type');
									it1.next();
								},
								function(it1){
									_this.broccoliFieldHtmm_parseUploadedFileAndGetHtml(data, $modalImportXlsx, function(html){
										if( typeof(html) !== typeof('') ){
											alert('Error');
											return;
										}

										htmlSrc = html;
										it1.next();
									});
									return;
								},
								function(it1){
									importXlsxModal.close();
									callback( htmlSrc );
									it1.next();
								},
							]
						);
					}),
			],
			"buttonsSecondary": [
				$('<button type="button" class="px2-btn">')
					.text( editor.lb.get('ui_label.cancel') )
					.on('click', function(){
						importXlsxModal.close();
					}),
			],
		});

		// ファイル選択
		$modalImportXlsx.find('input[name='+mod.name+'__import-xlsx-modal__file]')
			.on('change', function(e){
				var fileInfo = e.target.files[0];
				broccoli.px2style.loading();

				function readSelectedLocalFile(fileInfo, callback){
					var reader = new FileReader();
					reader.onload = function(evt) {
						callback( evt.target.result );
					}
					reader.readAsDataURL(fileInfo);
				}

				var realpathSelected = $(this).val();
				if( realpathSelected ){
					readSelectedLocalFile(fileInfo, function(dataUri){
						$excel
							.html('選択しました')
							.attr({
								"src": dataUri ,
								"data-size": fileInfo.size ,
								"data-extension": getExtension( fileInfo.name ),
								"data-mime-type": fileInfo.type ,
								"data-base64": (function(dataUri){
									dataUri = dataUri.replace(new RegExp('^data\\:[^\\;]*\\;base64\\,'), '');
									return dataUri;
								})(dataUri),
							})
						;
						broccoli.px2style.closeLoading();
					});
					return;
				}
				broccoli.px2style.closeLoading();
				return;
			})
		;

	}


	/**
	 * アップロードファイルを解析して生成されたHTMLを取得する
	 */
	this.broccoliFieldHtmm_parseUploadedFileAndGetHtml = function( data, $dom, callback ){
		var rtn = '';

		it79.fnc({},
			[
				function(it2){
					main.callGpi(
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

	/**
	 * パスから拡張子を取り出して返す
	 */
	function getExtension(path){
		var ext = path.replace( new RegExp('^.*?\.([a-zA-Z0-9\_\-]+)$'), '$1' );
		ext = ext.toLowerCase();
		return ext;
	}

}
