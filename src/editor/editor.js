module.exports = function(broccoli, main, mod, data, elm){
	var _this = this;
	var editorData = JSON.parse( JSON.stringify(data) );
	var LangBank = require('langbank');
	var languageCsv = require('../../data/language.csv');

	this.init = function( callback ){

		this.lb = new LangBank(
			languageCsv,
			function(){
				_this.lb.setLang( broccoli.lb.getLang() );
				callback();
			}
		);

	}
}
