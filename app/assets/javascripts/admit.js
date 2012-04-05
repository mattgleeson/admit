/* global $, _, Backbone */
(function() {
    // make underscore templates compatible with erb by changing to mustache curlies
    _.templateSettings = {
        interpolate : /\{\{(.+?)\}\}/g
    };

    window.Visit = Backbone.Model.extend({
        defaults: function() {
            return {
                patient: '',
                doctor: '',
                startsAt: 0,
                arrived: false
            };
        }
    });

    window.VisitList = Backbone.Collection.extend({
        model: Visit,
        url: '/visits/',
        // TODO startsAt with doc name as tie breaker
        comparator: function(visit) {
            return visit.get('startsAt');
        }
    });

    window.VisitView = Backbone.View.extend({
        tagName: 'tr',
        template: _.template($('#visit-template').html()),

        initialize: function() {
            this.model.bind('change', this.render, this);
            this.searchString = this.model.get('patient').toLowerCase();
        },
        isSearchMatch: function(q) {
            return this.searchString.indexOf(q) > -1;
        },
        hide: function() {
            $(this.el).hide();
        },
        show: function() {
            $(this.el).show();
        },
        render: function() {
            $(this.el).html(this.template(this.model.toJSON()));
            return this;
        }
    });


    window.AdmitApp = Backbone.View.extend({
        visits: new VisitList(),
        visitViews: [],
        search: $('#patient-search'),

        events: {
            "keyup #patient-search": "runSearch",
            "submit #patient-search": "runSearch",
            "change #patient-search": "runSearch"
        },

        initialize: function(options) {
            var self = this;
            this.setElement($('#admitapp'));

            this.visits.on('add', function(visit) {
                var view = new VisitView({model: visit});
                $("#visit-list").append(view.render().el);
                self.visitViews.push(view);
            });

            // set up bogus data
            //this.visits.fetch();
            this.visits.add([
                {patient: "Alice Smith", startsAt: 1030},
                {patient: "Bob Barker", startsAt: 800},
                {patient: "Charlie Rose", startsAt: 930}
            ]);
        },

        runSearch: function() {
            var q = this.search.val().toLowerCase();
            _.each(this.visitViews, function(vv) {
                if (vv.isSearchMatch(q)) {
                    vv.show();
                } else {
                    vv.hide();
                }
            });
        },

        render: function() {
            // update sidebar/header            
            return this;
        }
    });
    
}());
