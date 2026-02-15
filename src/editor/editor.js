module.exports = function(broccoli, main, mod, data, elm){
	var _this = this;
	var editorData = JSON.parse( JSON.stringify(data) );
	var LangBank = require('langbank');
	var languageCsv = require('../../data/language.csv');

	this.init = ( callback ) => {
		return new Promise((resolve, reject) => {
			this.lb = new LangBank(
				languageCsv,
				function(){
					_this.lb.setLang( broccoli.lb.getLang() );
					resolve();
				}
			);
		}).then(() => {
			return new Promise((resolve, reject) => {
				main.callGpi(
					{
						'api': 'getFileInfo',
						'data': {
							'resKey': editorData.resKey,
						}
					},
					function(fileInfo){
						// TODO: `fileInfo.base64` をデコードして、mindmap.mm を取得する。
						console.log('fileInfo', fileInfo);
						resolve();
						return;
					}
				);
			});
		}).then(() => {
			return new Promise((resolve, reject) => {
				// TODO: 取得した `mindmap.mm` で、dom要素 `mod` 上にhtmmエディタを初期化する。
				resolve();
			});
		}).catch((e) => {
			console.error(e);
		}).finally(() => {
			callback();
		});
	}
}
