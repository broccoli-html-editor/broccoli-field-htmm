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

		// v0.3.0: `output` は `src` に改名されました。
		// 古いバージョンへの互換性維持のため、 `output` がある場合も想定します。
		if( isset($fieldData['src']) && $fieldData['src'] ){
			$rtn .= $fieldData['src'];
		}elseif( isset($fieldData['output']) && $fieldData['output'] ){
			$rtn .= $fieldData['output'];
		}

		if( $mode == 'canvas' ){
			if( !strlen($rtn) ){
				$rtn .= '<tr><td>'.$this->broccoli->lb()->get('ui_message.double_click_to_edit').'</td></tr>';
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
			case 'openOuternalEditor':
				$appMode = $this->broccoli->getAppMode();
				if( $appMode != 'desktop' ){
					$message = 'appModeが不正です。';
					return array('result' => false, 'message' => $message);
				}
				$path_xlsx = $_resMgr->getResourceOriginalRealpath( $options['data']['resKey'] );

				if( realpath('/') == '/' ){
					exec('open '.escapeshellarg($path_xlsx).'');
				}elseif( preg_match( '/^[A-Z]\:\\\\/', realpath('/') ) ){
					exec('explorer '.escapeshellarg($path_xlsx).'');
				}

				return array('result' => true);
				break;

			case 'getFileInfo':
				$resInfo = $_resMgr->getResource( $options['data']['resKey'] );
				return $resInfo;
				break;

			case 'excel2html':
				$resKey = null;
				if( isset($options['data']['resKey']) ){
					$resKey = $options['data']['resKey'];
				}elseif( isset($options['data']['base64']) ){
					$resKey = $_resMgr->addResource();
					$tmpResInfo = $_resMgr->getResource( $resKey );
					$tmpResInfo->ext = $options['data']['extension'];
					$tmpResInfo->base64 = $options['data']['base64'];
					$_resMgr->updateResource( $resKey, $tmpResInfo );
				}
				if( !$resKey ){
					return array('result' => false);
					break;
				}

				$path_xlsx = $_resMgr->getResourceOriginalRealpath( $resKey );
				$params = array(
					'header_row' => $options['data']['header_row'] ,
					'header_col' => $options['data']['header_col'] ,
					'renderer' => (isset($options['data']['renderer']) ? $options['data']['renderer'] : "simplify") ,
					'cell_renderer' => (isset($options['data']['cell_renderer']) ? $options['data']['cell_renderer'] : "text") ,
					'render_cell_width' => true ,
					'strip_table_tag' => true
				);

				$excel2html = new excel2html();
				$html = $excel2html->excel2html($path_xlsx, $params);

				return $html;
				break;

			default:
				return array('result' => false, 'message' => 'ERROR: Unknown API');
				break;
		}

		return false;
	}

}
