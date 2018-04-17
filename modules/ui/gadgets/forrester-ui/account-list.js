define(function(require, exports, module) {

    require("css!./account-list.css");

    var Ratchet = require("ratchet/web");
    var DocList = require("ratchet/dynamic/doclist");
    var OneTeam = require("oneteam");
    var bundle = Ratchet.Messages.using();

    return Ratchet.GadgetRegistry.register("forrester-ui-account-list", DocList.extend({

        configureDefault: function()
        {
            this.base();

            this.config({
                "observables": {
                    "query": "account-list_query",
                    "sort": "account-list_sort",
                    "sortDirection": "account-list_sortDirection",
                    "searchTerm": "account-list_searchTerm",
                    "selectedItems": "account-list_selectedItems"
                }
            });
        },

        setup: function()
        {
            this.get("/projects/{projectId}/forrester-ui-account-list", this.index);
        },

        entityTypes: function()
        {
            return {
                "plural": "Accounts",
                "singular": "Account"
            };
        },

        doclistDefaultConfig: function()
        {
            var config = this.base();
            config.columns = [];

            return config;
        },

        doGitanaQuery: function(context, model, searchTerm, query, pagination, callback)
        {
            var self = this;

            OneTeam.projectBranch(self, function () {

                var rows = [];

                this.queryNodes({
                    _type: "cxindex:company"
                }, pagination).then(function () {
                    callback(this);
                });
            });
        },

        linkUri: function(row, model, context)
        {
            var self = this;
            var project = self.observable("project").get();

            return "/#/projects/" + project._doc + "/documents/" + row._doc + "/properties";
        },

        iconClass: function(row)
        {
            return "form-icon-32";
        },

        columnValue: function(row, item, model, context)
        {
            var self = this;

            var projectId = self.observable("project").get().getId();
            var clientid = row.clientid;

            var value = this.base(row, item);

            if (item.key === "titleDescription") {

                var linkUri = this.linkUri(row, model, context);

                value =  "<h2 class='list-row-info title'>";
                value += "<a href='" + linkUri + "'>";
                value += OneTeam.filterXss(row.title) + " (" + row.key + ")";
                value += "</a>";
                value += "</h2>";

                // summary
                var summary = "";
                summary += "Definition: " + OneTeam.filterXss(row.definition.title) + " (<a href='#/projects/" + projectId + "/documents/" + definitionId + "'>" + OneTeam.filterXss(row.definition.qname) + "</a>)";
                value += "<p class='list-row-info summary'>" + summary + "</p>";

                if (row.modified_on)
                {
                    var date = new Date(row.modified_on.ms);
                    value += "<p class='list-row-info modified'>Modified " + bundle.relativeDate(date);
                    if (row.modified_by) {
                        value += " by " + OneTeam.filterXss(row.modified_by) + "</p>";
                    }
                }
                else if (row.created_on)
                {
                    var date = new Date(row.created_on.ms);
                    value += "<p class='list-row-info created'>Created " + bundle.relativeDate(date);
                    if (row.created_by) {
                        value += " by " + OneTeam.filterXss(row.created_by) + "</p>";
                    }
                }
            }

            return value;
        }

    }));

});