var resolve = require('path').resolve;


function fs_file(filename, callback){
    var fs = require('fs');
    var fn = resolve(filename);
    //console.log('fs_file=' + fn);
    var hdl = function(exists){
      if (exists) {
          fs.readFile(fn, 'utf8', function(err, data) {
              if (err){console.log(err);};
              console.log('readfile = ' + fn);
              callback(data);
          });
      } else {
        console.log('readfile fail !!! = ' + fn);
      }
    }
    hdl.bind(callback);
    fs.exists(filename, hdl);
  }
exports.fs_file = fs_file;

function fs_file_sync(filename){
  var fs = require('fs');
  var fn = resolve(filename);
  console.log('fs_file=' + fn);
  if (fs.existsSync(filename)) {
      console.log('readfile = ' + fn);
      return fs.readFileSync(fn, 'utf8');
  } else {
      console.log('readfile fail !!! = ' + fn);
      return false;
  }
}
exports.fs_file_sync = fs_file_sync;
exports.g_content = fs_file_sync;

function fs_file_exist(filename){
  var fs = require('fs');
  var fn = resolve(filename);
  //console.log('fs_file_check=' + fn);
  if (fs.existsSync(fn)) {
      //console.log('fs_file_check ok = ' + fn);
      return true;
  } else {
      console.log('fs_file_check fail !!! = ' + fn);
      return false;
  }
}
exports.fs_file_exist = fs_file_exist;

function g_replace(datainput, find, replace){
  find = find.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  datainput = datainput.replace(new RegExp(find, "gi"), replace);
  return datainput;
}
exports.g_replace = g_replace;

function g_URL_replace(datainput, find = '', replace = ''){
  console.log('g_URL_replace:' + find + ' to ' + replace);
  return g_replace(datainput, find, replace);
}
exports.g_URL_replace = g_URL_replace;
