/*global define*/

define([
  'underscore',
  'backbone',
  'collections/TriggerCollection',
  'collections/ItemCollection'
], function (_, Backbone, TriggerCollection, ItemCollection) {
  'use strict';

  /**
   * @class Host
   */
  var Host = Backbone.Model.extend({
    idAttribute: 'hostid',
    triggers: null,
    items: null,

    defaults: {
      priority: -1,
      guest: true
    },

    events: {
      'change:triggers': 'onTriggersChange',
      'change:items': 'onItemsChange',
      'change': 'onChange'
    },

    PRIORITY_STRINGS: {
      0: 'Not classified',
      1: 'Information',
      2: 'Warning',
      3: 'Average',
      4: 'High',
      5: 'Disaster'
    },

    initialize: function () {
      this.triggers = new TriggerCollection(this.get('triggers') || []);
      this.triggers.on('change remove add', this.updateStatus, this);
      this.updateStatus();

      this.items = new ItemCollection(this.get('items') || []);

      if (this.get('parentTemplates').templateid === "10172") {
        this.set('guest', false)
      } else {
        var selement = _.findWhere(app.map.selements, {elementid: this.get('hostid')});
//        console.log(selement, this.get('hostid'));
      }

      app.vent.on('tick', this.onItemsChange, this);
    },

    onTriggersChange: function () {
      this.triggers.set(this.get('triggers'));
    },

    onItemsChange: function () {
      console.log('items change');
      this.items.set(this.get('items'));
    },

    onChange: function () {
      console.log('host change');
    },

    updateStatus: function () {
      this.set('priority', Math.max.apply(this, _.map(this.triggers.pluck('priority'), Number)));
    },

    shouldBeShown: function () {
      var filter = this.get('filter');
      if (filter) {
        if (filter.name.length && this.get('name').indexOf(filter.name) == -1) {
          return false
        }

        if (filter.ip.length) {
          var interfaces = _.filter(this.get('interfaces'), function (item) {
            return item.ip.indexOf(filter.ip) !== -1;
          });

          if (interfaces.length === 0) {
            return false;
          }
        }

        if (filter.group && filter.group !== 'null') {
          if (!_.findWhere(this.get('groups'), {groupid: String(filter.group)})) {
            return false;
          }
        }
      }

      return true;
    }
  });

  return Host;
});