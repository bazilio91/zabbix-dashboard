/*global define*/

define([
  'marionette',
  './TriggerItemView'
], function (Marionette, TriggerItemView) {
  'use strict';
  /**
   * @class TriggerListView
   */
  var TriggerListView = Marionette.CollectionView.extend({
    childView: TriggerItemView
  });

  return TriggerListView;
});