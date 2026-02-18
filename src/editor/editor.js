module.exports = function(broccoli, main, mod, data, elm){
	var _this = this;
	var editorData = JSON.parse( JSON.stringify(data) );
	var LangBank = require('langbank');
	var languageCsv = require('../../data/language.csv');
	var React = require('react');
	var ReactDOM = require('react-dom/client');
	var htmm = require('@tomk79/htmm');
	var parseMindMapXML = htmm.parseMindMapXML;
	var HtmmMap = htmm.HtmmMap;

	var mapRef = React.createRef();

	this.getMapData = function() {
		return mapRef.current ? mapRef.current.getMapData() : null;
	};

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
						var mapData = null;
						if (fileInfo && fileInfo.base64 && String(fileInfo.base64).trim() !== '') {
							try {
								// UTF-8 を考慮した base64 デコード（saveEditorContent のエンコードと対になる）
								var xmlString = decodeURIComponent(escape(atob(fileInfo.base64)));
								mapData = parseMindMapXML(xmlString);
							} catch (e) {
								console.warn('Failed to decode/parse mindmap, starting with new map:', e);
							}
						}
						resolve(mapData);
						return;
					}
				);
			});
		}).then((mapData) => {
			return new Promise((resolve, reject) => {
				elm.style.width = '100%';
				elm.style.height = '100%';
				elm.style.minHeight = '400px';
				var root = ReactDOM.createRoot(elm);
				var props = { ref: mapRef, width: '100%', height: '100%' };
				if (mapData) {
					props.initialMapData = mapData;
				}
				root.render(React.createElement(HtmmMap, props));
				resolve();
			});
		}).catch((e) => {
			console.error(e);
		}).finally(() => {
			callback();
		});
	}
}
