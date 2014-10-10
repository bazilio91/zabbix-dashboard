/*global requirejs*/

requirejs.config({
  baseUrl: '/javascripts',
  waitSeconds: 20,
  shim: {
    peity: {
      deps: ['jquery']
    },
    backbone: {
      //These script dependencies should be loaded before loading
      //backbone.js
      deps: ['underscore'],
      //Once loaded, use the global 'Backbone' as the
      //module value.
      exports: 'Backbone'
    },
    underscore: {
      exports: '_'
    }
  },

  bundles: {
    'mixins': []
  },

  paths: {
    'underscore': '/components/underscore/underscore',
    'jquery': '/components/jquery/dist/jquery',
    'backbone': '/components/backbone/backbone',
    'marionette': '/components/marionette/lib/core/backbone.marionette',
    'backbone.wreqr': '/components/backbone.wreqr/lib/backbone.wreqr',
    'backbone.babysitter': '/components/backbone.babysitter/lib/backbone.babysitter',
    'moment': '/components/moment/moment',
    'peity': '/components/peity/jquery.peity'
  }
});

var socket = io('http://' + window.location.host);
require([
  'underscore',
  'backbone',
  'marionette',
  'models/Host',
  'collections/HostCollection',
  'collections/GroupCollection',
  'collections/ItemCollection',
  'views/HostListView',
  'views/HostDetailsView',
], function (_, Backbone, Marionette, Host, HostCollection, GroupCollection, ItemCollection, HostListView, HostDetailsView) {
  'use strict';
  var app = window.app = new Marionette.Application();
  app.collections = {};

  socket.emit('map', {}, function (data) {
    app.map = data[0];
  });

  app.addRegions({
    main: "#main"
  });

  app.addInitializer(function () {
    this.collections.hosts = new HostCollection();
    this.collections.groups = new GroupCollection();

    socket.on('data', function (data) {
      if (data.type === 'hosts') {
        app.collections.hosts.set(data.data);
        app.vent.trigger('tick');
      }

      if (data.type === 'groups') {
        app.collections.groups.set(data.data);
      }
    });
  });


  app.addInitializer(function () {
    var MyController = Marionette.Controller.extend({
      doIndex: function () {
        app.hostListView = new HostListView({collection: app.collections.hosts});
        app.main.show(app.hostListView);
      },

      doHost: function (hostId) {
        console.log('host', hostId);
        socket.emit('host', {hostids: [hostId]}, function (data) {
          console.log(data);
          app.hostView = new HostDetailsView(new Host(data[0]));
          app.main.show(app.hostView);
        });
      }

    });

    var MyRouter = new Marionette.AppRouter({
      controller: new MyController,
      appRoutes: {
        "": "doIndex",
        "host/:id": "doHost"
      }
    });

    $(document).delegate("a", "click", function (evt) {
      // Get the anchor href and protcol
      var href = $(this).attr("href");
      var protocol = this.protocol + "//";

      // Ensure the protocol is not part of URL, meaning its relative.
      // Stop the event bubbling to ensure the link will not cause a page refresh.
      if (href.slice(protocol.length) !== protocol) {
        evt.preventDefault();

        // Note by using Backbone.history.navigate, router events will not be
        // triggered.  If this is a problem, change this to navigate on your
        // router.
        Backbone.history.navigate(href, true);
      }
    });

    Backbone.history.start();
  });

  app.start();
});
