/**
 * node-php-bin clone
 *
 * 2020-05-19
 * PHPをアプリに内蔵させようとして作ったのが node-php-bin だったが、
 * 全部の依存関係を静的コンパイルできなかったため断念した。
 * このため、APIのみ複製して格納し、利用することにした。
 */
module.exports = new (function(){
	var childProcess = require('child_process');
	var fs = require('fs');
	var _platform = process.platform;

	this.get = function(options){
		var phpBin, phpVersion, phpIni, phpExtensionDir, phpPresetCmdOptions;
		function phpAgent(options){
			options = options || {};
			phpPresetCmdOptions = [];
			phpExtensionDir = null;

            phpBin = 'php';
            phpIni = null;

			if(typeof(options.bin) == typeof('')){
				phpBin = options.bin;
			}
			if(options.ini === null){
				phpPresetCmdOptions = [];// windows向けの -d オプションを削除する
				phpExtensionDir = null;// ExtensionDir も削除
				phpIni = null;// php.ini のパスも削除
			}else if(typeof(options.ini) == typeof('')){
				phpPresetCmdOptions = [];// windows向けの -d オプションを削除する
				phpExtensionDir = null;// ExtensionDir も削除
				phpIni = options.ini;
			}

			if( phpIni !== null ){
				phpPresetCmdOptions = phpPresetCmdOptions.concat([
					'-c', phpIni
				]);
			}
		}

		/**
		 * PHP のパスを取得
		 */
		phpAgent.prototype.getPath = function(){
			if(phpBin == 'php'){return phpBin;}
			return fs.realpathSync(phpBin);
		}

		/**
		 * php.ini のパスを取得
		 */
		phpAgent.prototype.getIniPath = function(){
			if(phpIni == null){return null;}
			return fs.realpathSync(phpIni);
		}

		/**
		 * phpExtensionDir を取得
		 */
		phpAgent.prototype.getExtensionDir = function(){
			if(phpExtensionDir == null){return null;}
			return fs.realpathSync(phpExtensionDir);
		}

		/**
		 * PHPのバージョン番号を得る
		 */
		phpAgent.prototype.getPhpVersion = function(cb){
			cb = cb || function(){};
			var child = this.spawn(
				['-v'],
				{}
			);
			var data = '';
			child.stdout.on('data', function(row){
				data += row.toString();
			});
			child.stderr.on('data', function(error){
				data += error.toString();
			});
			child.on('exit', function(code){
				var rtn = data;
				data.match(new RegExp('^PHP\\s+([0-9]+\\.[0-9]+\\.[0-9])'));
				rtn = RegExp.$1;
				// console.log(rtn);
				cb(rtn);
			});
			return child;
		}

		/**
		 * PHPコマンドを実行する
		 */
		phpAgent.prototype.script = function(cliParams, options, cb){
			cb = arguments[arguments.length-1];
			var scriptOptions = {};
			var cbSuccess = function(){};
			var cbError = function(){};
			if( typeof(cb) === typeof({}) ){
				scriptOptions = cb;
				cb = scriptOptions.complete || function(){};
				cbSuccess = scriptOptions.success || function(){};
				cbError = scriptOptions.error || function(){};
				// console.log(cb);
				// console.log(scriptOptions);
			}
			if( typeof(cb) !== typeof(function(){}) ){
				cb = function(){};
			}
			options = options || {};
			if(arguments.length < 2){
				options = {};
			}
			if( typeof(options) !== typeof({}) ){
				options = {};
			}

			var child = this.spawn(
				cliParams,
				options
			);
			var data = '';
			var error = '';
			child.stdout.on('data', function( row ){
				cbSuccess(row.toString());
				data += row.toString();
			});
			child.stderr.on('data', function( err ){
				cbError(err.toString());
				data += err.toString();
				error += err.toString();
			});
			child.on('exit', function(code){
				cb( data, error, code );
			});
			return child;
		}

		/**
		 * PHPコマンドを実行する(spawn)
		 */
		phpAgent.prototype.spawn = function(cliParams, options){
			cliParams = cliParams || [];
			options = options || {};
			var child = childProcess.spawn(
				phpBin,
				phpPresetCmdOptions.concat(cliParams),
				options
			);
			return child;
		}

		return new phpAgent(options);
	}

})();