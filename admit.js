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
        comparator: function(visit1, visit2) {
            return (visit1.get('startsAt') - visit2.get('startsAt')) ||
                (visit1.get('doctor') > visit2.get('doctor') ? 1 : -1);
        }
    });

    window.VisitView = Backbone.View.extend({
        tagName: 'tr',
        template: _.template($('#visit-template').html()),
        events: {
            "click .btn": "launchVerify"
        },

        initialize: function(options) {
            this.delay = options.delay;
            this.model.bind('change', this.render, this);
            this.delay.bind('change', this.renderDelayChange, this);
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
        launchVerify: function() {
            new VerifyView({model: this.model});
        },
        renderDelayChange: function() {
            this.render();
            var exp = this.$('.expected');
            _.times(3, function() {
                exp.fadeOut('slow');
                exp.fadeIn('slow');
            });
        },
        render: function() {
            var combined = _.extend({}, this.model.toJSON(), this.delay.toJSON());
            $(this.el).html(this.template(combined));
            return this;
        }
    });

    window.VerifyView = Backbone.View.extend({
        template: _.template($('#verify-modal-template').html()),
        events: {
            "click .btn-primary": "setArrived"
        },
        initialize: function(options) {
            this.setElement($('#verify-modal'));
            this.render();
        },
        setArrived: function() {
            this.model.set('arrived', true);
            this.$('.modal').modal('hide');
        },
        render: function() {
            this.$el.html(this.template(this.model.toJSON()));
            this.$('.modal').modal({backdrop: true, show: true});
            return this;
        }
    });


    window.DoctorDelay = Backbone.Model.extend({
        defaults: function() {
            return {
                doctor: '',
                minsLate: 0,
            };
        }
    });

    window.DoctorDelayList = Backbone.Collection.extend({
        model: DoctorDelay,
        comparator: function(d) {
            return d.get('doctor');
        }
    });

    window.DoctorDelayView = Backbone.View.extend({
        template: _.template($('#doctor-delay-template').html()),
        tagName: 'li',
        events: {
            "mouseenter": "showControls",
            "mouseleave": "hideControls",
            "click .icon-minus": "decrement",
            "click .icon-plus": "increment"
        },
        initialize: function() {
            this.model.bind('change', this.render, this);
        },
        showControls: function() {
            this.$('i').show();
        },
        hideControls: function() {
            this.$('i').hide();
        },
        decrement: function() {
            this.model.set('minsLate', _.max([0, this.model.get('minsLate') - 1]));
        },
        increment: function() {
            this.model.set('minsLate', this.model.get('minsLate') + 1);
        },
        render: function() {
            this.$el.html(this.template(this.model.toJSON()));
            this.hideControls();
            return this;
        }
    });

    window.AdmitApp = Backbone.View.extend({
        visits: new VisitList(),
        visitViews: [],
        search: $('#patient-search'),
        delays: new DoctorDelayList(),

        events: {
            "keyup #patient-search": "runSearch",
            "submit #patient-search": "runSearch",
            "change #patient-search": "runSearch"
        },

        initialize: function(options) {
            var self = this;
            this.setElement($('#admitapp'));

            this.delays.on('add', function(delay) {
                var view = new DoctorDelayView({model: delay});
                $("#doctor-delay-list").append(view.render().el);
            });
            this.visits.on('add', function(visit) {
                var delay = self.delays.find(function(d){return d.get('doctor') === visit.get('doctor')});
                var view = new VisitView({model: visit,
                                          delay: delay});
                $("#visit-list").append(view.render().el);
                self.visitViews.push(view);
            });

            this.loadData();
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

        // set up bogus data
        loadData: function() {
            _.each(DOCTOR_NAMES, function(doc, i) {
                this.delays.add({doctor: doc, minsLate: 2*i+1});
            }, this);
            var t = 800;
            while (PATIENT_NAMES.length > 0) {
                for (var i=0; i<DOCTOR_NAMES.length; i++) {
                    var doc = DOCTOR_NAMES[i];
                    var patient = PATIENT_NAMES.shift();
                    this.visits.add({patient: patient, doctor: doc, startsAt: t});
                    if (PATIENT_NAMES.length < 1)
                        return;
                }
                t += 100;
                if (t == 1200)
                    t += 100; // lunch
            }
        },

        render: function() {
            // update sidebar/header            
            return this;
        }
    });

    var DOCTOR_NAMES = [
        "Bill Bixby",
        "Patrick Stewart",
        "Michael Keaton"
    ];
    var PATIENT_NAMES = [
        "Bruce Wayne",
        "Steve Rogers",
        "Selena Kyle",
        "Matt Murdock",
        "Bruce Banner",
        "Susan (Storm) Richards",
        "Anthony Stark",
        "Peter Parker",
        "Clark Kent",
        "Arthur Curry Orin",
        "Dinah Drake",
        "Barry Allen",
        "Oliver Queen",
        "Hal Jordan",
        "Frank Castle",
        "Lt. Cassius Bannister",
        "Jefferson Pierce",
        "Sgt. Willie Walker",
        "Eric Needham",
        "Charlie Bullock",
        "Tyson Gilford",
        "Robert DuBois"
    ];
    
}());
