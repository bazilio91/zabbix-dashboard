/*global define*/

define(['backbone', 'models/Group'], function (Backbone, Group) {
  'use strict';
  /**
   * @class GroupCollection
   */
  var GroupCollection = Backbone.Collection.extend({
    model: Group
  });

  return GroupCollection;
});