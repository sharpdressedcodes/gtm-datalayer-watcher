var tabs = require('sdk/tabs');
var self = require('sdk/self');
var pageMod = require('sdk/page-mod');
var worker = null;
const regex = /http(s)?:\/\/*/;
const contentScriptFiles = [self.data.url('gtm-datalayer-watcher.js')];
const loadReasons = [
    'install',
    'enable'
];
const unloadReasons = [
    'uninstall',
    'disable'
];

pageMod.PageMod({
    include: regex,
    contentScriptFile: contentScriptFiles,
    onAttach: function(w){
        worker = w;
    }
});

tabs.on('ready', function(tab){

    if (regex.test(tab.url)){
        var worker = tab.attach({
            contentScriptFile: contentScriptFiles
        });
    }

});

exports.main = function(options, callbacks){

    if (worker !== null && loadReasons.indexOf(options.loadReasons) > -1){
        worker.port.emit('load');
    }

};

exports.onUnload = function(reason){

    if (worker !== null && unloadReasons.indexOf(reason) > -1){
        worker.port.emit('unload');
    }

};

