/*global define*/

define(['backbone', 'models/History'], function (Backbone, History) {
  'use strict';
  /**
   * @class HistoryCollection
   */
  var HistoryCollection = Backbone.Collection.extend({
    model: History
  });

  return HistoryCollection;
});