<?php
namespace broccoliHtmlEditor\broccoliFieldHtmm;

class excel2html{

	public function excel2html($path_xlsx, $options){
		$bin = file_get_contents($path_xlsx);
		if( !strlen($bin) ){
			// print '<!-- ERROR: $path_xlsx contains NO contents. -->';
			return false;
		}

		$excel2html = new \tomk79\excel2html\main($path_xlsx);
		$val = $excel2html->get_html($options);
		return $val;
	}

}