(function(){

    const SCRIPT_CLASS = 'gtm-datalayer-watcher';

    function setup(){

        self.port.on('load', onLoad);
        self.port.on('unload', onUnload);

        onLoad();

    }

    function onLoad(){

        loadScript();
        unsafeCall('start');

    }

    function onUnload(){

        unsafeCall('stop');

    }

    function unsafeCall(method){

        // I would prefer not to use unsafeWindow!
        unsafeWindow && unsafeWindow.dataLayerWatcher && typeof unsafeWindow.dataLayerWatcher[method] === 'function' && unsafeWindow.dataLayerWatcher[method]();

    }

    function isScriptLoaded(){

        var els = [].slice.call(document.getElementsByTagName('script'));

        for (var i = 0, i_ = els.length; i < i_; i++){
            if (els[i].className === SCRIPT_CLASS){
                return true;
            }
        }

        return false;

    }

    function loadScript(){

        if (!isScriptLoaded()){
            var code = "\
    (function(){\
\
        var ConsoleRestorer = function(){\
\
        this.console = null;\
        this.iframe = document.createElement('iframe');\
        this.iframe.style.display = 'none';\
\
    };\
    ConsoleRestorer.prototype.load = function(){\
\
        if (this.console === null){\
\
            document.body.appendChild(this.iframe);\
\
            this.console = window.console;\
            window.console = this.iframe.contentWindow.console;\
\
        }\
\
    };\
    ConsoleRestorer.prototype.unload = function(){\
\
        if (this.console !== null){\
\
            window.console = this.console;\
            document.body.removeChild(this.iframe);\
\
            this.console = null;\
\
        }\
\
    };\
\
    var ArrayWatcher = function(array){\
\
        if (!array instanceof Array){\
            throw new Error('Object to watch must be an Array type.');\
        }\
\
        this.array = array;\
        this.watching = false;\
        this.callbacks = [];\
\
    };\
    ArrayWatcher.prototype.addCallback = function(callback){\
\
        if (this.callbacks.indexOf(callback) === -1){\
            this.callbacks.push(callback);\
        }\
\
        if (!this.watching){\
            this.watching = true;\
            this.array.watch('length', this._onChange.bind(this));\
        }\
\
    };\
    ArrayWatcher.prototype.removeCallback = function(callback){\
\
        var index = this.callbacks.indexOf(callback);\
\
        if (index > -1){\
            this.callbacks.slice(index, 1);\
        }\
\
        if (this.callbacks.length === 0){\
            if (this.watching){\
                this.watching = false;\
                this.array.unwatch('length');\
            }\
        }\
\
    };\
    ArrayWatcher.prototype._onChange = function(property, oldValue, newValue){\
\
        if (this.callbacks.length > 0){\
            for (var i = 0, i_ = this.callbacks.length; i < i_; i++){\
                this.callbacks[i].apply(this, arguments);\
            }\
        }\
\
        return newValue;\
\
    };\
\
    var GtmDataLayerWatcher = function(){\
\
        this.dataLayer = window.dataLayer || [];\
        this.restorer = new ConsoleRestorer();\
        this.watcher = new ArrayWatcher(this.dataLayer);\
        this.gtmId = null;\
        this.count = 0;\
\
    };\
    GtmDataLayerWatcher.prototype.start = function(){\
\
        this.restorer.load();\
        this.watcher.addCallback(this._onChange.bind(this));\
\
        this._onChange();\
\
    };\
    GtmDataLayerWatcher.prototype.stop = function(){\
\
        this.restorer.unload();\
        this.watcher.removeCallback(this._onChange.bind(this));\
\
    };\
    GtmDataLayerWatcher.prototype.getGtmId = function(){\
\
        var gtm = window.google_tag_manager;\
\
        if (typeof gtm === 'object'){\
            for (var prop in gtm){\
                if (gtm.hasOwnProperty(prop) && prop.indexOf('GTM-') === 0){\
                    return prop;\
                }\
            }\
        }\
\
        return null;\
\
    };\
    GtmDataLayerWatcher.prototype._onChange = function(){\
\
        this._checkGtmId();\
\
        if (this.count !== this.dataLayer.length){\
            for (var i = this.count, i_ = this.dataLayer.length; i < i_; i++){\
                var layer = this.dataLayer[i];\
                var s = 'dataLayer[' + i + '] ';\
                if (typeof layer.event !== 'undefined'){\
                    s += '(' + layer.event + ') ';\
                }\
                console.log(s + '-> ', layer);\
            }\
            this.count = this.dataLayer.length;\
        }\
\
    };\
    GtmDataLayerWatcher.prototype._checkGtmId = function(){\
\
        var id = this.gtmId;\
        this.gtmId = this.getGtmId();\
\
        if (id !== this.gtmId){\
            console.log('Found GTM ID -> ' + this.gtmId);\
        }\
\
    };\
\
    window.dataLayerWatcher = new GtmDataLayerWatcher();\
\
    })();";

            var el = document.createElement('script');
            el.className = SCRIPT_CLASS;
            el.textContent = code;
            document.head.appendChild(el);
        }

    }

    setup();

})();