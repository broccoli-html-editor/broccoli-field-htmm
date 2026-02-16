<?php
namespace broccoliHtmlEditor\broccoliFieldHtmm;

class main extends \broccoliHtmlEditor\fieldBase{

	private $broccoli;

	public function __construct($broccoli){
		$this->broccoli = $broccoli;
		parent::__construct($broccoli);
	}

	/**
	 * データをバインドする
	 * resKey がある場合、公開URL（$resUrl）のみを返す。
	 * テンプレート側で .htmm-mindmap の data-src にバインドし、
	 * 公開ページの module.js が Mindmap を再生する。
	 */
	public function bind( $fieldData, $mode, $mod ){
		if(!$fieldData){
			$fieldData = array();
		}

		$resKey = isset($fieldData['resKey']) ? trim($fieldData['resKey']) : '';
		if( $resKey !== '' ){
			$resMgr = $this->broccoli->resourceMgr();
			return $resMgr->getResourcePublicPath( $resKey );
		}
		return '';
	}

	/**
	 * GPI (Server Side)
	 */
	public function gpi($options){
		$_resMgr = $this->broccoli->resourceMgr();

		switch($options['api']){
			case 'getFileInfo':
				$resInfo = $_resMgr->getResource( $options['data']['resKey'] );
				return $resInfo;
				break;

			default:
				return array('result' => false, 'message' => 'ERROR: Unknown API');
				break;
		}

		return false;
	}

}
