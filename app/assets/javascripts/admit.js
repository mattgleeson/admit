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
        tagName: 'li',
        template: _.template($('#visit-template').html()),

        initialize: function() {
            this.model.bind('change', this.render, this);
        },

        render: function() {
            $(this.el).html(this.template(this.model.toJSON()));
            return this;
        },
    });


    window.AdmitApp = Backbone.View.extend({
        visits: new VisitList(),

        initialize: function(options) {
            this.setElement($('#admitapp'));

            this.visits.on('add', function(visit) {
                var view = new VisitView({model: visit});
                $("#visit-list").append(view.render().el);
            });

            // set up bogus data
            //this.visits.fetch();
            this.visits.add([
                {patient: "Alice", startsAt: 5},
                {patient: "Bob", startsAt: 1},
                {patient: "Charlie", startsAt: 3}
            ]);
        },

        render: function() {
            // update sidebar/header
            return this;
        }
    });
    
}());
