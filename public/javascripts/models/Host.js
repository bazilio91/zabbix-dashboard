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
      guest: true,
      parentHostId: null,
      parentHost: null,
      physicalHost: false
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

      app.vent.on('tick', this.onItemsChange, this);
    },

    onTriggersChange: function () {
      this.triggers.set(this.get('triggers'));
    },

    onItemsChange: function () {
      this.items.set(this.get('items'));
//      if (_.pluck(this.get('parentTemplates'), 'templateid').indexOf("10172") !== -1) {
//        this.set('physicalHost', true);
//      }

      // muhahahahahahHAAHAHAHAHA!!!!!!11111
      if (_.pluck(this.get('parentTemplates'), 'templateid').indexOf("10172") !== -1) {
        console.log(_.findWhere(this.get('parentTemplates'), {templateid: '10172'}));
        console.log('host', this.get('name'));
        this.set('guest', false)
      } else {
        var selement = _.findWhere(app.map.selements, {elementid: this.get('hostid')});
        if (selement) {
          var link = _.findWhere(app.map.links, {selementid1: selement.selementid}),
            attribute = "2";
          if (!link) {
            link = _.findWhere(app.map.links, {selementid2: selement.selementid});
            attribute = "1";
          }

          if (link) {
            var hostSelement = _.findWhere(app.map.selements, {selementid: link['selementid' + attribute]});
            var host = app.collections.hosts.findWhere({hostid: hostSelement.elementid});
            if (host) {
              this.set('parentHost', host);
              this.set('parentHostId', host.get('hostid'))
            }
          }
        }
      }
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

        if (filter.physical && filter.physical !== 'null') {
          console.log(this.get('physicalHost'), this.get('name'));
          if (this.get('physicalHost') !== Boolean(filter.physical)) {
            return false;
          }
        }
      }

      return true;
    }
  });

  return Host;
});