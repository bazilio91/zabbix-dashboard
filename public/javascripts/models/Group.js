/*global define*/

define(['underscore', 'backbone'], function (_, Backbone) {
  'use strict';

  /**
   * @class Group
   */
  var Group = Backbone.Model.extend({
    idAttribute: 'groupid'
  });

  return Group;
});