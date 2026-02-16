/**
 * Mindmap 再生用エントリ
 * 公開ページ上の .htmm-mindmap 要素を列挙し、data-src または data-htmm-base64 から
 * .mm データを取得して FreeMindMap で描画する。
 * Broccoli の buildModuleResources により common/js/module.js に結合されて配信される。
 */
(function() {
	'use strict';

	var React = require('react');
	var ReactDOM = require('react-dom/client');
	var htmm = require('@tomk79/htmm');
	var parseFreeMindXML = htmm.parseFreeMindXML;
	var useFreeMindStore = htmm.useFreeMindStore;
	var FreeMindMap = htmm.FreeMindMap;

	function decodeBase64Xml(base64) {
		try {
			var xmlString = decodeURIComponent(escape(atob(base64)));
			return parseFreeMindXML(xmlString);
		} catch (e) {
			console.warn('Failed to decode/parse mindmap base64:', e);
			return null;
		}
	}

	function getDataEl(container) {
		// データは .htmm-mindmap 自身か、その子の [data-src] / [data-htmm-base64] に付与される
		if (container.getAttribute('data-src') || container.getAttribute('data-htmm-base64')) {
			return container;
		}
		var child = container.querySelector('[data-src], [data-htmm-base64]');
		return child || container;
	}

	function loadMapDataFromElement(elm) {
		var dataEl = getDataEl(elm);
		var resUrl = dataEl.getAttribute('data-src');
		var base64 = dataEl.getAttribute('data-htmm-base64');
		if (base64 && base64.trim() !== '') {
			return Promise.resolve(decodeBase64Xml(base64.trim()));
		}
		if (resUrl && resUrl.trim() !== '') {
			return htmm.loadMindMapURL(resUrl.trim()).catch(function(err) {
				console.warn('Failed to load mindmap from URL:', resUrl, err);
				return null;
			});
		}
		return Promise.resolve(null);
	}

	function mountMindmap(container, mapData) {
		if (!mapData) return;
		var store = useFreeMindStore.getState();
		store.loadMap(mapData);
		container.style.width = container.style.width || '100%';
		container.style.height = container.style.height || '100%';
		container.style.minHeight = container.style.minHeight || '400px';
		var root = ReactDOM.createRoot(container);
		root.render(React.createElement(FreeMindMap, { width: '100%', height: '100%' }));
	}

	function init() {
		var containers = document.querySelectorAll('.htmm-mindmap');
		// 現在の htmm はグローバル単一ストアのため、複数ある場合は先頭1件のみ描画する
		var firstWithData = null;
		var pending = [];
		containers.forEach(function(elm) {
			var p = loadMapDataFromElement(elm).then(function(mapData) {
				if (mapData && !firstWithData) {
					firstWithData = { elm: elm, mapData: mapData };
				}
			});
			pending.push(p);
		});
		Promise.all(pending).then(function() {
			if (firstWithData) {
				mountMindmap(firstWithData.elm, firstWithData.mapData);
			}
		});
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', init);
	} else {
		init();
	}
})();
