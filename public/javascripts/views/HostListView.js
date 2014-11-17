/*global define*/

define([
  'marionette',
  'underscore',
  'backbone',
  './HostItemView'
], function (Marionette, _, Backbone, HostItemView) {
  'use strict';

  $.fn.serializeObject = function () {
    var o = {};
    var a = this.serializeArray();
    $.each(a, function () {
      if (o[this.name] !== undefined) {
        if (!o[this.name].push) {
          o[this.name] = [o[this.name]];
        }
        o[this.name].push(this.value || '');
      } else {
        o[this.name] = this.value || '';
      }
    });
    return o;
  };

  var SearchModel = Backbone.Model.extend({});

  /**
   * @class HostListView
   */
  var HostListView = Marionette.CompositeView.extend({
    template: _.template([
      '<div class="panel panel-default"><form class="b-host-list-filter form-inline panel-body role=form">',

      '<div class="form-group">',
      '<label class="sr-only" for="filterName">Host name</label>',
      '<input type=name name=name class="form-control" id=filterName placeholder="Host name">',
      '</div> ',

      '<div class="form-group">',
      '<label class="sr-only" for="filterIP">IP address</label>',
      '<input type="text" name=ip class="form-control" id="filterIP" placeholder="IP address">',
      '</div> ',

      '<div class="form-group">',
      '<label class="sr-only" for="filterGroup">Group</label>',
      '<select name=group class="form-control" id="filterGroup">',
      '</select>',
      '</div> ',

      '<div class="form-group">',
      '<label class="sr-only" for="filterPhysical">Physical</label>',
      '<select name=physical class="form-control" id="filterPhysical">',
      '<option value="null">Any type</option>',
      '<option value="true">Physical</option>',
      '<option value="false">Virtual</option>',
      '</select>',
      '</div>',

      '</form></div>',
      '<div class=b-host-list-items></div>'
    ].join('')),

    ui: {
      searchForm: '.b-host-list-filter'
    },

    events: {
      'keyup @ui.searchForm input': 'filter',
      'change @ui.searchForm select': 'filter',
      'change @ui.searchForm input': 'filter'
    },


    filter: function () {
      this.collection.invoke('set', 'filter', this.ui.searchForm.serializeObject());
    },

    childView: HostItemView,
    childViewContainer: '.b-host-list-items',

    initialize: function () {

    },

    onRender: function(){
      app.collections.groups.on('change', this.updateGroups, this);
      this.updateGroups();
    },

    updateGroups: function () {
      var $select = this.$el.find('#filterGroup');
      $select.empty();
      $select[0].options.length = 0;

      var options = $select[0].options;
      options[options.length] = new Option('Any group', null);

      app.collections.groups.each(function (group) {
        options[options.length] = new Option(group.get('name'), group.get('groupid'));
      });
    }
  });

  return HostListView;
});