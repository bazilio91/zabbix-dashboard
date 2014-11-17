/*global define*/

define([
  'marionette',
  'underscore',
  './TriggerListView',
  './ItemListView'
], function (Marionette, _, TriggerListView, ItemListView) {
  'use strict';
  /**
   * @class HostItemView
   */
  var HostItemView = Marionette.LayoutView.extend({
    modelEvents: {
      'change filter': 'filter',
      'change parentHost': 'onParentHostChange'
    },

    views: {
      triggers: null,
      items: null
    },

    templateHelpers: {
      getInterfaces: function () {
        var string = _.pluck(this.interfaces, "ip").join(", ");

        if (this.filter && this.filter.ip.length) {
          string = string.replace(this.filter.ip, '<span class="text-warning">' + this.filter.ip + '</span>');
        }

        return string;
      }
    },

    template: _.template([
      '<div class="panel-heading">',
      ' <a href="/host/<%= hostid %>"><%= name %></a> ',
      ' <span class="pull-right badge hidden b-physical-host">physical</span> ',
      ' <span class="pull-right badge b-parent-host"></span> ',
      ' <span class="pull-right text-muted"><%= _.pluck(groups, "name").join(", ") %></span> ',
      '</div>',
      '<div class="panel-body">',
      '<div class="b-host-item-interfaces"><%= getInterfaces() %></div>',
      '<div class="b-host-item-items clearfix"></div>',
      '<%= (priority > 0 ? "<hr>" : "")%>',
      '<div class="b-trigger-list"></div>',
      '</div>'
    ].join('')),

    className: function () {
      var className = 'b-host-item panel ';

      if (this.model.get('priority') > 3) {
        className += 'panel-danger';
      } else if (this.model.get('priority') > 1) {
        className += 'panel-warning';
      } else if (this.model.get('priority') > 0) {
        className += 'panel-info';
      } else {
        className += 'panel-default';
      }

      return className;
    },
    regions: {
      triggers: '.b-trigger-list',
      items: '.b-host-item-items'
    },

    filter: function () {
      if (this.model.shouldBeShown()) {
        this.$el.show();
      } else {
        this.$el.hide();
      }
    },

    initialize: function () {
      this.templateHelpers.getPriorityString = _.bind(function () {
        return this.model.PRIORITY_STRINGS[this.model.get('priority')];
      }, this);
    },

    onRender: function () {
      this.views.triggers = new TriggerListView({collection: this.model.triggers});
      this.triggers.show(this.views.triggers);

      this.views.items = new ItemListView({collection: this.model.items});
      this.items.show(this.views.items);
      this.onParentHostChange();
    },

    onParentHostChange: function () {
      if (this.model.get('parentHost')) {
        this.$el.find('.b-parent-host').text(this.model.get('parentHost').get('name'))
      }

      if (this.model.get('physicalHost') === true) {
        this.$el.find('.b-physical-host').removeClass('hidden');
      }
    }
  });

  return HostItemView;
});