<?php
/**
 * test for pickles2/lib-px2-contents-editor
 */
class mainTest extends PHPUnit\Framework\TestCase{
	private $fs;

	public function setup() : void{
		mb_internal_encoding('UTF-8');
		require_once(__DIR__.'/php_test_helper/helper.php');
	}


	/**
	 * 普通にインスタンス化して実行してみるテスト
	 */
	public function testStandard(){
		$broccoli = testHelper::makeDefaultBroccoli();
		$this->assertTrue( is_object($broccoli) );
	}

	/**
	 * ビルドする: テストデータをfinalizeモードでビルドする
	 */
	public function testBuildFinalizeMode(){
		$broccoli = testHelper::makeDefaultBroccoli();

		$data = file_get_contents(__DIR__.'/testdata/htdocs/test1/test1_files/guieditor.ignore/data.json');
		$data = json_decode($data);
		$html = $broccoli->buildBowl(
			$data->bowl->main ,
			array(
				'mode' => 'finalize'
			)
		);
		file_put_contents(__DIR__.'/testdata/htdocs/test1/test1.html', $html);

		$this->assertTrue( is_string($html) );

	}

	/**
	 * ビルドする: テストデータをcanvasモードでビルドする
	 */
	public function testBuildCanvasMode(){
		$broccoli = testHelper::makeDefaultBroccoli();

		$data = file_get_contents(__DIR__.'/testdata/htdocs/test1/test1_files/guieditor.ignore/data.json');
		$data = json_decode($data);
		$html = $broccoli->buildBowl(
			$data->bowl->main ,
			array(
				'mode' => 'canvas'
			)
		);

		file_put_contents(__DIR__.'/testdata/htdocs/test1/test1.canvas.html', $html);
		var_dump($html);

		$this->assertTrue( is_string($html) );

	}

}
