var assert = require('assert');
var path = require('path');
var fs = require('fs');
var Broccoli = require('broccoli-html-editor');

function makeDefaultBroccoli(callback){
	var broccoli = new Broccoli();
	broccoli.init(
		{
			'paths_module_template':{
				'PlainHTMLElements': '../PlainHTMLElements/',
				'testMod1': '../modules1/'
			},
			'documentRoot': path.resolve(__dirname, 'testdata/htdocs/')+'/',
			'pathHtml': '/test1/test1.html',
			'pathResourceDir': '/test1/test1_files/resources/',
			'realpathDataDir': path.resolve(__dirname, 'testdata/htdocs/test1/test1_files/guieditor.ignore/')+'/' ,
			'customFields': {
				'table': require('./../libs/main.js')
			}
		},
		function(){
			callback(broccoli);
		}
	);
	return;
}

describe('インスタンス初期化', function() {

	it("インスタンス初期化", function(done) {
		this.timeout(60*1000);

		makeDefaultBroccoli( function(broccoli){
			assert.equal(typeof(broccoli.paths_module_template), typeof({}));
			assert.equal(broccoli.paths_module_template.testMod1, path.resolve(__dirname,'testdata/modules1/')+'/');

			done();
		} );
	});

});

describe('ビルドする', function() {

	it("テストデータをfinalizeモードでビルドする", function(done) {
		this.timeout(15*1000);
		makeDefaultBroccoli( function(broccoli){
			var data = require(__dirname+'/testdata/htdocs/test1/test1_files/guieditor.ignore/data.json');
			broccoli.buildBowl(
				data.bowl.main ,
				{
					'mode': 'finalize'
				} ,
				function( html, err ){
					fs.writeFileSync(path.resolve(__dirname, './testdata/htdocs/test1/test1.html'), html);
					done();
				}
			);
		} );
	});

	it("テストデータをcanvasモードでビルドする", function(done) {
		this.timeout(15*1000);
		makeDefaultBroccoli( function(broccoli){
			var data = require(__dirname+'/testdata/htdocs/test1/test1_files/guieditor.ignore/data.json');
			broccoli.buildBowl(
				data.bowl.main ,
				{
					'mode': 'canvas'
				} ,
				function( html, err ){
					fs.writeFileSync(path.resolve(__dirname, './testdata/htdocs/test1/test1.canvas.html'), html);
					done();
				}
			);
		} );
	});

});
