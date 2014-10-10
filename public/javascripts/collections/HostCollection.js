/*global define*/

define(['backbone', 'models/Host'], function (Backbone, Host) {
  'use strict';
  /**
   * @class HostCollection
   */
  var HostCollection = Backbone.Collection.extend({
    comparator: function (host) {
      return -host.get('priority');
    },
    model: Host
  });

  return HostCollection;
});