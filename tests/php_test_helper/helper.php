<?php
class testHelper{

	/**
	 * $broccoli を生成する
	 */
	static public function makeDefaultBroccoli(){
		$broccoli = new \broccoliHtmlEditor\broccoliHtmlEditor();
		$broccoli->init(array(
			'paths_module_template' => array(
				'PlainHTMLElements' => __DIR__.'/../testdata/PlainHTMLElements/',
				'testMod1' => __DIR__.'/../testdata/modules1/'
			),
			'documentRoot' => __DIR__.'/../testdata/htdocs/',
			'pathHtml' => '/test1/test1.html',
			'pathResourceDir' => '/test1/test1_files/resources/',
			'realpathDataDir' => __DIR__.'/../testdata/htdocs/test1/test1_files/guieditor.ignore/' ,
			'customFields' => array(
				'table' => 'broccoliHtmlEditor\broccoliHtmlEditor\main'
			)
		));
		return $broccoli;
	}

}
