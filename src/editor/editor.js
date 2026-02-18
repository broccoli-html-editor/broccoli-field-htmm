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
				// 親に高さがないと子の height:100% が効かないため、elm に高さを確保する
				elm.style.position = 'relative';
				elm.style.height = '400px';
				elm.style.minHeight = '120px';
				var applyMaxHeight = function() {
					elm.style.maxHeight = (window.innerHeight * 0.8) + 'px';
				};
				applyMaxHeight();
				window.addEventListener('resize', applyMaxHeight);

				var editorContainer = document.createElement('div');
				editorContainer.className = 'broccoli-field-htmm-editor-container';

				var toolbar = document.createElement('div');
				toolbar.className = 'broccoli-field-htmm-toolbar';
				var fullscreenBtn = document.createElement('button');
				fullscreenBtn.type = 'button';
				fullscreenBtn.textContent = _this.lb.get('ui_label.fullscreen');
				toolbar.appendChild(fullscreenBtn);
				editorContainer.appendChild(toolbar);

				var wrapper = document.createElement('div');
				wrapper.className = 'broccoli-field-htmm';
				editorContainer.appendChild(wrapper);
				elm.appendChild(editorContainer);

				function isFullscreen() {
					var el = document.fullscreenElement || document.webkitFullscreenElement;
					return el === editorContainer;
				}
				function updateFullscreenButtonLabel() {
					fullscreenBtn.textContent = isFullscreen()
						? _this.lb.get('ui_label.exit_fullscreen')
						: _this.lb.get('ui_label.fullscreen');
				}
				function onFullscreenChange() {
					updateFullscreenButtonLabel();
					if (!isFullscreen()) {
						window.dispatchEvent(new Event('resize'));
					}
				}
				document.addEventListener('fullscreenchange', onFullscreenChange);
				document.addEventListener('webkitfullscreenchange', onFullscreenChange);

				fullscreenBtn.addEventListener('click', function() {
					if (isFullscreen()) {
						var exitFn = document.exitFullscreen || document.webkitExitFullscreen;
						if (exitFn) exitFn.call(document);
					} else {
						var requestFn = editorContainer.requestFullscreen || editorContainer.webkitRequestFullscreen;
						if (requestFn) requestFn.call(editorContainer);
					}
				});

				var root = ReactDOM.createRoot(wrapper);
				var appearance = (broccoli.config && broccoli.config.appearance) || (broccoli.options && broccoli.options.appearance) || 'auto';
				var lang = (broccoli.lb && typeof broccoli.lb.getLang === 'function' ? broccoli.lb.getLang() : null) || (broccoli.config && broccoli.config.lang) || (broccoli.options && broccoli.options.lang) || 'en';
				var props = { ref: mapRef, width: '100%', height: '100%', appearance: appearance, lang: lang };
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
