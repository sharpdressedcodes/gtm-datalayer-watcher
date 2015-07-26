var tabs = require('sdk/tabs');
var self = require('sdk/self');
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

tabs.on('ready', function(tab){

    if (regex.test(tab.url)){
        worker = tab.attach({
            contentScriptFile: contentScriptFiles
        });
    }

});

exports.main = function(options, callbacks){

    if (worker !== null && loadReasons.indexOf(options.loadReason) > -1){
        worker.port.emit('load');
    }

};

exports.onUnload = function(reason){

    if (worker !== null && unloadReasons.indexOf(reason) > -1){
        worker.port.emit('unload');
    }

};

