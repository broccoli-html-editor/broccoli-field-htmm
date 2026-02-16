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
	 * 公開時（$mode != 'canvas'）に resKey がある場合、data-res-url を付与し、
	 * 制作ページの module.js が Mindmap を再生できるようにする。
	 */
	public function bind( $fieldData, $mode, $mod ){
		if(!$fieldData){
			$fieldData = array();
		}
		$rtn = '';

		if( isset($fieldData['src']) && $fieldData['src'] ){
			$rtn .= $fieldData['src'];
		}

		if( $mode == 'canvas' ){
			if( !strlen($rtn) ){
				$rtn .= '<div>'.$this->broccoli->lb()->get('ui_message.double_click_to_edit').'</div>';
			}
		} else {
			// 公開モード: resMgr で公開パスを取得し、再生用 data 属性を出力
			$resKey = isset($fieldData['resKey']) ? trim($fieldData['resKey']) : '';
			if( $resKey !== '' ){
				$resMgr = $this->broccoli->resourceMgr();
				$resUrl = $resMgr->getResourcePublicPath( $resKey );
				$rtn .= '<span data-res-url="' . htmlspecialchars($resUrl, ENT_QUOTES, 'UTF-8') . '" style="display:none" aria-hidden="true"></span>';
			}
		}
		return $rtn;
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
