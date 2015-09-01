module.exports = require('webrtc-core').bdsft.Model(Request);

var Utils = require('webrtc-core').utils;
var jQuery = require('jquery');
// Running in NodeJS
if (typeof window === 'undefined') {
  var domino = require('domino');
  jQuery = require('jquery')(domino.createWindow());
  jQuery.ajaxSettings.xhr = function(){
    var XMLHttpRequest = require('xhr2');
    return new XMLHttpRequest();
  };
}

var Q = require('q');

function Request(debug) {

  return function(){
    var self = {};

    var xhr;
    self.abort = function(){
      xhr && xhr.abort();
    };

    self.send = function(options){
      var url = options.url+options.path;
      if(options.params) {
        url = Utils.addUrlParams(url, options.params);
      }
      var type = options.type || 'GET';
      debug.info(type+' : ' + url+ ' : '+JSON.stringify(options.data));
      var deferred = Q.defer();
      jQuery.support.cors = true;
      try{
        xhr = jQuery.ajax({
          type: type,
          url: url,
          data: options.data || {},
          dataType: options.dataType || 'text',
          cache: options.cache || false,
          beforeSend: function (xhr) {
            if(options.basic) {
              xhr.setRequestHeader("Authorization", "Basic "+new Buffer(options.basic.user + ':' + options.basic.password).toString('base64'));
            }
          }
        }).done(function(result){
          debug.log(result);
          deferred.resolve(result);
        }).fail(function(err){
          if(err.statusText !== 'abort') {
            console.error("error : " + JSON.stringify(err));
            deferred.reject(JSON.stringify(err));
          } else {
            deferred.reject();
          }
        });
      } catch(e) {
        debug.error(JSON.stringify(e));
        deferred.reject(e);
      }
      return deferred.promise;
    };

    return self;
  }
}