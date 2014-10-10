/*global define*/

define(['underscore', 'backbone'], function (_, Backbone) {
  'use strict';

  /**
   * @class History
   */
  var History = Backbone.Model.extend({
    idAttribute: 'historyid'
  });

  return History;
});