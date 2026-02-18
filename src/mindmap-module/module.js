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

	/**
	 * 要素からマウント用の情報を取得する。
	 * - base64 あり: { type: 'data', mapData }（base64 優先。data-src と両方あっても data で渡す）
	 * - data-src のみ: { type: 'src', url }（HtmmMap の src で読み込む）
	 * - どちらもなし: null
	 */
	function getMountInfo(elm) {
		var dataEl = getDataEl(elm);
		var resUrl = dataEl.getAttribute('data-src');
		var base64 = dataEl.getAttribute('data-htmm-base64');
		var hasBase64 = base64 && base64.trim() !== '';
		var hasSrc = resUrl && resUrl.trim() !== '';
		if (hasBase64) {
			var mapData = decodeBase64Xml(base64.trim());
			return mapData ? { type: 'data', mapData: mapData } : null;
		}
		if (hasSrc) {
			return { type: 'src', url: resUrl.trim() };
		}
		return null;
	}

	function mountMindmap(container, options) {
		container.style.width = container.style.width || '100%';
		container.style.height = container.style.height || '100%';
		container.style.minHeight = container.style.minHeight || '400px';
		var root = ReactDOM.createRoot(container);
		var dataEl = getDataEl(container);
		var key = 'htmm-' + (dataEl.getAttribute('data-src') || dataEl.getAttribute('data-htmm-base64') || '').slice(0, 80);
		var props = { key: key, width: '100%', height: '100%', readOnly: true };
		if (options.initialMapData) {
			props.initialMapData = options.initialMapData;
		}
		if (options.src) {
			props.src = options.src;
		}
		root.render(React.createElement(HtmmMap, props));
	}

	function initOne(elm) {
		if (initializedContainers.has(elm)) return;
		var info = getMountInfo(elm);
		if (!info) return;
		if (initializedContainers.has(elm)) return;
		if (info.type === 'src') {
			mountMindmap(elm, { src: info.url });
		} else {
			mountMindmap(elm, { initialMapData: info.mapData });
		}
		initializedContainers.add(elm);
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
