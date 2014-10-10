/*global define*/

define(['backbone', 'models/Item'], function (Backbone, Item) {
  'use strict';
  /**
   * @class ItemCollection
   */
  var ItemCollection = Backbone.Collection.extend({
    model: Item,
    comparator: 'key_'
  });

  return ItemCollection;
});