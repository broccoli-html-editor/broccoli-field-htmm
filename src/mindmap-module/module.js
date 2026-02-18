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
	var initializedContainers = new WeakSet();

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
		var dataEl = getDataEl(container);
		var key = 'htmm-' + (dataEl.getAttribute('data-src') || dataEl.getAttribute('data-htmm-base64') || '').slice(0, 80);
		root.render(React.createElement(HtmmMap, { key: key, width: '100%', height: '100%', initialMapData: mapData, readOnly: true }));
	}

	function initOne(elm) {
		if (initializedContainers.has(elm)) return;
		loadMapDataFromElement(elm).then(function(mapData) {
			if (!mapData) return;
			if (initializedContainers.has(elm)) return;
			mountMindmap(elm, mapData);
			initializedContainers.add(elm);
		});
	}

	function init() {
		var containers = document.querySelectorAll('.htmm-mindmap');
		containers.forEach(initOne);
		if (document.body) {
			var observer = new MutationObserver(function(mutations) {
				mutations.forEach(function(mutation) {
					Array.prototype.forEach.call(mutation.addedNodes || [], function(node) {
						if (node.nodeType !== 1) return;
						var list = node.querySelectorAll ? node.querySelectorAll('.htmm-mindmap') : [];
						for (var i = 0; i < list.length; i++) initOne(list[i]);
					});
				});
			});
			// 初回マウントと HtmmMap の useEffect 完了後に観察を開始する
			requestAnimationFrame(function() {
				observer.observe(document.body, { childList: true, subtree: true });
			});
		}
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', init);
	} else {
		init();
	}
})();
