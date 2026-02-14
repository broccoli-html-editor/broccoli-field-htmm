module.exports = function(broccoli, main, editor, mod, data, elm){

	/**
	 * パスから拡張子を取り出して返す
	 */
	function getExtension(path){
		var ext = path.replace( new RegExp('^.*?\.([a-zA-Z0-9\_\-]+)$'), '$1' );
		ext = ext.toLowerCase();
		return ext;
	}

    /**
     * 画面を初期化する
     */
    this.init = function( callback ){
        var _this = this;
        if( typeof(data) !== typeof({}) ){ data = {}; }
        if( typeof(data.resKey) !== typeof('') ){
            data.resKey = '';
        }
        var appMode = broccoli.getAppMode();
        var template = require('./xlsx.twig');
        // var res = _resMgr.getResource( data.resKey );

        var $rtn = $( template({
            modName: mod.name,
            appMode: appMode,
            resKey: data.resKey,
            data: data,
        }) );

        var $excel = $rtn.find('div[data-excel-info]');
        if( data.resKey ){
            if( appMode == 'desktop' ){
                // desktop版
                $excel.find('button')
                    .on('click', function(){
                        var resKey = $(this).attr('data-excel-resKey');
                        main.callGpi(
                            {
                                'api': 'openOuternalEditor',
                                'data': {
                                    'resKey': resKey
                                }
                            } ,
                            function(result){
                                if(!result.result){
                                    alert('失敗しました。'+"\n"+result.message);
                                }
                                return;
                            }
                        );
                    })
                ;
            }else{
                // Web版
                $excel.find('button')
                    .on('click', function(){
                        var resKey = $(this).attr('data-excel-resKey');
                        main.callGpi(
                            {
                                'api': 'getFileInfo',
                                'data': {
                                    'resKey': resKey
                                }
                            } ,
                            function(fileInfp){
                                var anchor = document.createElement("a");
                                anchor.href = 'data:application/octet-stream;base64,'+fileInfp.base64;
                                anchor.download = "bin."+fileInfp.ext;
                                anchor.click();
                                return;
                            }
                        );
                    })
                ;
            }
        }

        // ファイル選択
        $rtn.find('input[name='+mod.name+']')
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
                                })(dataUri)
                            })
                        ;
                        main.broccoliFieldHtmm_parseUploadedFileAndGetHtml(data, $(elm), function(html){
                            data.src = html;
            	            broccoli.px2style.closeLoading();
                        });
                    });
                    return;
                }
	            broccoli.px2style.closeLoading();
                return;
            })
        ;

        // ヘッダー行
        $rtn.find('input[name='+(mod.name)+'__header_row]').val( data.header_row );

        // ヘッダー列
        $rtn.find('input[name='+(mod.name)+'__header_col]').val( data.header_col );

        // 再現方法
        $rtn.find('input[name="'+mod.name+'__renderer"][value="'+data.renderer+'"]').attr({'checked':'checked'});

        // セルの表現方法
        $rtn.find('input[name="'+mod.name+'__cell_renderer"][value="'+data.cell_renderer+'"]').attr({'checked':'checked'});

        // 編集方法
        $rtn.find('input[name="'+mod.name+'__editor"]').val( data.editor );

        // HTML直接編集モードへ移行する
        $rtn.find('.broccoli-field-htmm__change-to-html-mode')
            .on('click', function(){
                if( !confirm('一度HTML編集に切り替えると、Excel(またはCSV)ファイルの読み込みに戻すことはできません。HTML編集モードに切り替えますか？') ){
                    return false;
                }
                data.editor = 'html';
                editor.init(function(){});
            })
        ;

        $(elm).html($rtn);

        setTimeout(function(){
            callback();
        }, 0);

    }

}
