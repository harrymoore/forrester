define(function(require, exports, module) {

    require("./albums-list.css");
    var html = require("./albums-list.html");

    var Empty = require("ratchet/dynamic/empty");
    var $ = require("jquery");

    return Ratchet.GadgetRegistry.register("albums-list", Empty.extend({

        TEMPLATE: html,

        setup: function()
        {
            this.get("/projects/{projectId}/albums", this.index);
        },

        prepareModel: function(el, model, callback)
        {
            var self = this;

            var project = self.observable("project").get();
            var branch = self.observable("branch").get();

            this.base(el, model, function() {
                model.albums = [];
                model.albums = [];
                branch.queryNodes({
                    "_type": "my:album"
                }).each(function(){
                    var imageUrl = "/proxy" + this.getUri() + "/attachments/default";

                    this.imageUrl = imageUrl;

                    model.albums.push(this);

                }).then(function(){
                 callback();
                });
            });
        },

        afterSwap: function(el, model, originalContext, callback)
        {
            var self = this;

            this.base(el, model, originalContext, function() {

                callback();
            });
        }


    }));

});