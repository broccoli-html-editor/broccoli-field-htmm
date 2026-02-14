module.exports = function(broccoli, main, mod, data, elm){
    var _this = this;
    var EditorHtml = require('./html/html.js');
    var EditorXlsx = require('./xlsx/xlsx.js');
    var editorData = JSON.parse( JSON.stringify(data) );
	var LangBank = require('langbank');
	var languageCsv = require('../../data/language.csv');

    this.init = function( callback ){

		this.lb = new LangBank(
            languageCsv,
            function(){
                _this.lb.setLang( broccoli.lb.getLang() );

                if( editorData.editor == 'xlsx' ){
                    var editorXlsx = new EditorXlsx( broccoli, main, _this, mod, editorData, elm );
                    editorXlsx.init( function(){
                        callback();
                    } );
                }else{
                    var editorHtml = new EditorHtml( broccoli, main, _this, mod, editorData, elm );
                    editorHtml.init( function(){
                        callback();
                    } );
                }
            }
        );

    }
}
