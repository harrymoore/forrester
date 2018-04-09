define(function(require, exports, module) {

    var UI = require("ui");
    
    var moduleId = UI.extractModuleID(module.uri);
    
    // register the theme
    UI.registerTheme({
        "key": "forrester-theme",
        "title": "Forrester",
        "module": "_modules/" + moduleId + "/theme.js"
    });

});