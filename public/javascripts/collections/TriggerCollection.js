/*global define*/

define(['backbone', 'models/Trigger'], function (Backbone, Trigger) {
  'use strict';
  /**
   * @class TriggerCollection
   */
  var TriggerCollection = Backbone.Collection.extend({
    model: Trigger
  });

  return TriggerCollection;
});