define(function(require, exports, module) {

    require("css!./account-list.css");

    var Ratchet = require("ratchet/web");
    var DocList = require("ratchet/dynamic/doclist");
    var OneTeam = require("oneteam");
    var bundle = Ratchet.Messages.using();

    return Ratchet.GadgetRegistry.register("account-list", DocList.extend({

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
            this.get("/projects/{projectId}/account-list", this.index);
        },

        entityTypes: function()
        {
            return {
                "plural": "forms",
                "singular": "form"
            }
        },

        doclistDefaultConfig: function()
        {
            var config = this.base();
            config.columns = [];

            return config;
        },

        doRemoteQuery: function(context, model, searchTerm, query, pagination, callback)
        {
            var self = this;

            OneTeam.projectContentTypes(self, function(typeDescriptors, typeConfigs) {

                // organize type descriptors by id
                var typeDescriptorsById = [];
                for (var i = 0; i < typeDescriptors.length; i++)
                {
                    typeDescriptorsById[typeDescriptors[i].id] = typeDescriptors[i];
                }

                if (!query) {
                    query = {};
                }
                query["_type"] = "n:form";

                OneTeam.projectBranch(self, function () {

                    var forms = {};
                    var formIds = [];

                    this.queryNodes(query, pagination).each(function () {
                        forms[this._doc] = {
                            "_doc": this._doc,
                            "id": this._doc,
                            "title": this.title,
                            "type": "form",
                            "created_on": this.getSystemMetadata().created_on,
                            "created_by": this.getSystemMetadata().created_by,
                            "modified_on": this.getSystemMetadata().modified_on,
                            "modified_by": this.getSystemMetadata().modified_by
                        };
                        formIds.push(this._doc);
                    }).then(function () {

                        var totalRows = this.totalRows();
                        var size = this.size();
                        var offset = this.offset();

                        OneTeam.projectBranch(self, function () {

                            var rows = [];

                            // look up all associations pointing to these forms
                            this.queryNodes({
                                "_type": "a:has_form",
                                "target": {
                                    "$in": formIds
                                }
                            }).each(function () {
                                forms[this.target].key = this["form-key"];
                                forms[this.target].definition = typeDescriptorsById[this.source];
                                rows.push(forms[this.target]);
                            }).then(function () {

                                callback({
                                    "rows": rows,
                                    "totalRows": totalRows,
                                    "size": size,
                                    "offset": offset
                                });
                            });
                        });
                    });
                });
            });
        },

        linkUri: function(row, model, context)
        {
            var self = this;
            var project = self.observable("project").get();

            var definitionQName = row.definition.qname;
            var formKey = row["key"];

            return "/#/projects/" + project._doc + "/definitions/" + definitionQName + "/forms/" + formKey;
        },

        iconClass: function(row)
        {
            return "form-icon-64";
        },

        columnValue: function(row, item, model, context)
        {
            var self = this;

            var projectId = self.observable("project").get().getId();
            var definitionId = row.definition.id;

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