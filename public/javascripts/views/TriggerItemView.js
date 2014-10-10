/*global define*/

define(['marionette', 'underscore'], function (Marionette, _) {
  'use strict';

  /**
   * @class TriggerItemView
   */
  var TriggerItemView = Marionette.ItemView.extend({
    className: function () {
      return 'b-trigger-item priority-' + this.model.get('priority');
    },
    template: _.template('<%= description %>')
  });
  return TriggerItemView;
});