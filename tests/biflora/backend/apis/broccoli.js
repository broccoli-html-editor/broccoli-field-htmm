/**
 * API: broccoli
 */
module.exports = function( data, callback, main, socket ){
	delete(require.cache[require('path').resolve(__filename)]);
	var path = require('path');
	var it79 = require('iterate79');

	data = data||{};
	callback = callback||function(){};

	var Broccoli = require('broccoli-html-editor');
	var broccoli = new Broccoli();

	it79.fnc(data, [
		function(it1, data){
			broccoli.init(
				{
					'paths_module_template': {
						'PlainHTMLElements': '../PlainHTMLElements/',
						'testMod1': '../modules1/'
					} ,
					'documentRoot': path.resolve(__dirname, '../../../testdata/htdocs/')+'/',
					'pathHtml': '/editpage/index.html',
					'pathResourceDir': '/editpage/index_files/resources/',
					'realpathDataDir': path.resolve(__dirname, '../../../testdata/htdocs/editpage/index_files/guieditor.ignore/')+'/',
					'customFields': {
						'table': require('./../../../../libs/main.js')
					} ,
					'bindTemplate': function(htmls, callback){
						var fin = '';
						fin += '<!DOCTYPE html>'+"\n";
						fin += '<html>'+"\n";
						fin += '    <head>'+"\n";
						fin += '        <meta charset="utf-8" />'+"\n";
						fin += '        <title>sample page</title>'+"\n";
						fin += '        <style media="screen">'+"\n";
						fin += '            img{max-width:100%;}'+"\n";
						fin += '            table{border:1px solid #666;}'+"\n";
						fin += '            table th{border:1px solid #666;}'+"\n";
						fin += '            table td{border:1px solid #666;}'+"\n";
						fin += '        </style>'+"\n";
						fin += '    </head>'+"\n";
						fin += '    <body>'+"\n";
						fin += '        <h1>sample page</h1>'+"\n";
						fin += '        <h2>main</h2>'+"\n";
						fin += '        <div class="contents" data-contents="main">'+"\n";
						fin += htmls['main']+"\n";
						fin += '        </div><!-- /main -->'+"\n";
						fin += '        <h2>secondly</h2>'+"\n";
						fin += '        <div class="contents" data-contents="secondly">'+"\n";
						fin += htmls['secondly']+"\n";
						fin += '        </div><!-- /secondly -->'+"\n";
						fin += '    </body>'+"\n";
						fin += '</html>'+"\n";
						fin += '<script data-broccoli-receive-message="yes">'+"\n";
						fin += 'window.addEventListener(\'message\',(function() {'+"\n";
						fin += 'return function f(event) {'+"\n";
						fin += 'if(event.origin!=\'http://127.0.0.1:8088\'){return;}// <- check your own server\'s origin.'+"\n";
						fin += 'var s=document.createElement(\'script\');'+"\n";
						fin += 'document.querySelector(\'body\').appendChild(s);s.src=event.data.scriptUrl;'+"\n";
						fin += 'window.removeEventListener(\'message\', f, false);'+"\n";
						fin += '}'+"\n";
						fin += '})(),false);'+"\n";
						fin += '</script>'+"\n";

						callback(fin);
						return;
					}

				},
				function(){
					it1.next(data);
				}
			);
		} ,
		function(it1, data){
			if(data.api == 'gpiBridge'){
				broccoli.gpi(
					data.bridge.api,
					data.bridge.options,
					function(rtn){
						it1.next(rtn);
					}
				);
				return ;

			}else if(data.api == 'buildBowl'){
				var json = require( path.resolve(__dirname, '../../../testdata/htdocs/editpage/index_files/guieditor.ignore/data.json') );
				broccoli.buildBowl(
					json.bowl.main ,
					{
						'mode': 'canvas'
					} ,
					function(html){
						// console.log(html);
						it1.next(html);
					}
				);
				return ;

			}

			setTimeout(function(){
				data.messageByBackend = 'Callbacked by backend API "broccoli".';
				it1.next(data);
			}, 0);
			return;

		} ,
		function(it1, data){
			callback(data);
			it1.next(data);
		}
	]);


	return;
}
