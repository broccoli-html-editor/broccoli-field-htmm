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
