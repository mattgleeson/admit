/* global $, _, Backbone */
(function() {
    window.Visit = Backbone.Model.extend({
        defaults: function() {
            return {
                patient: '',
                doctor: '',
                arrived: false
            };
        }
    });

    window.AdmitApp = Backbone.View.extend({
        visits: new VisitList(),
    });
    
}());
