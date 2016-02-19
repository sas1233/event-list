'use strict';

angular.module('eventListApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('events', {
        url: '/events?start&end',
        templateUrl: 'app/events/events.html',
        controller: 'EventsCtrl'
      });
  });