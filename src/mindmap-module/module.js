/**
 * Mindmap 再生用エントリ
 * 公開ページ上の .htmm-mindmap 要素を列挙し、data-src または data-htmm-base64 から
 * .mm データを取得して HtmmMap で描画する。
 * Broccoli の buildModuleResources により common/js/module.js に結合されて配信される。
 */
(function() {
	'use strict';

	var React = require('react');
	var ReactDOM = require('react-dom/client');
	var htmm = require('@tomk79/htmm');
	var parseMindMapXML = htmm.parseMindMapXML;
	var HtmmMap = htmm.HtmmMap;

	function decodeBase64Xml(base64) {
		try {
			var xmlString = decodeURIComponent(escape(atob(base64)));
			return parseMindMapXML(xmlString);
		} catch (e) {
			console.warn('Failed to decode/parse mindmap base64:', e);
			return null;
		}
	}

	function getDataEl(container) {
		// データは .htmm-mindmap の data-src（または data-htmm-base64）にバインドされる
		// 後方互換のため、子要素の [data-src] / [data-htmm-base64] も参照する
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
		container.style.width = container.style.width || '100%';
		container.style.height = container.style.height || '100%';
		container.style.minHeight = container.style.minHeight || '400px';
		var root = ReactDOM.createRoot(container);
		root.render(React.createElement(HtmmMap, { width: '100%', height: '100%', initialMapData: mapData, readOnly: true }));
	}

	function init() {
		var containers = document.querySelectorAll('.htmm-mindmap');
		// 各要素に initialMapData を渡して複数インスタンス対応
		containers.forEach(function(elm) {
			loadMapDataFromElement(elm).then(function(mapData) {
				if (mapData) mountMindmap(elm, mapData);
			});
		});
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', init);
	} else {
		init();
	}
})();
