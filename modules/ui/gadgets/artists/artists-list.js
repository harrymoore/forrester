define(function(require, exports, module) {

    require("./artists-list.css");
    var Ratchet = require("ratchet/web");
    var DocList = require("ratchet/dynamic/doclist");
    var OneTeam = require("oneteam");

    return Ratchet.GadgetRegistry.register("do-list", DocList.extend({

        setup: function()
        {
            this.get("/projects/{projectId}/artists", this.index);
        },

        configureDefault: function()
        {
            this.base();

            this.config({
                "observables": {
                    "query": "artists-list_query",
                    "sort": "artists-list_sort",
                    "sortDirection": "artists-list_sortDirection",
                    "searchTerm": "artists-list_searchTerm",
                    "selectedItems": "artists-list_selectedItems"
                }
            });
        },

        entityTypes: function()
        {
            return {
                "plural": "artists",
                "singular": "artist"
            }
        },

        afterSwap: function(el, model, originalContext, callback)
        {
            var self = this;

            this.base(el, model, originalContext, function() {

                callback();
            });
        },

        doGitanaQuery: function(context, model, searchTerm, query, pagination, callback)
        {

            var self = this;
            var branch = self.observable("branch").get();


            if (OneTeam.isEmptyOrNonExistent(query) && searchTerm)
            {
                query = OneTeam.searchQuery(searchTerm, ["title"]);
            }

            if (!query)
            {
                query = {};
            }
            query._type = "my:artist";
            Chain(branch).queryNodes(query,pagination).then(function(){
                callback(this);
            });

        },

        linkUri: function(row, model, context)
        {
            var title = context.tokens["title"];

            return "#/projects/" + title + "/documents/" + row["_doc"];
        },

        iconUri: function(row, model, context)
        {
            return OneTeam.iconUriForNode(row);
        },

        //http://localhost/#/projects/57d5cacf6d700f918543/documents/2a8e2100b27353f23ade


        columnValue: function(row, item, model, context)
        {
            var self = this;
            var project = self.observable("project").get();

            var value = this.base(row, item);

            if (item.key === "titleDescription") {

                if(row.title){
                    var str = row.title;
                }
                else{
                    var str = row._doc;
                }

                //console.log(str);

                //value = str.link( "#/projects/" + "72594b38dbefa7e1ff7d" + "/documents/" + row["_doc"]);
                value = [str.link( "#/projects/" + "72594b38dbefa7e1ff7d" + "/documents/" + row["_doc"]),'</br>',
                    '<strong>','Genres:   ','</strong>', row.genres,'</br>',
                    '<strong>','Spotify Link:   ','</strong>',  str.link(row.externalUrl),'</br>',
                    '<strong>','Popularity:   ','</strong>', row.popularity, '</br>',
                    '</div>'
                ].join('\n')
            }

            return value;
        }



    }));

});