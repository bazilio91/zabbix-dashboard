/*global define*/

define(['marionette', 'underscore'], function (Marionette, _) {
  'use strict';
  /**
   * @class HostDetailsView
   */
  var HostDetailsView = Marionette.ItemView.extend({
    template: _.template('<%= hostid %>')
  });
  return HostDetailsView;
});