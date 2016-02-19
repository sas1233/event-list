'use strict';

angular.module('eventListApp')
  .factory('Event', function ($resource) {

    var parceDates = function (response) {
      console.log(response.data);
      if (_.isArray(response.data)) {
        _.forEach(response.data, function (item) {
          item['startDate'] = new Date(item['startDate']);
          item['endDate'] = new Date(item['endDate']);
        });
      } else {
        response.data['startDate'] = new Date(response.data['startDate']);
        response.data['endDate'] = new Date(response.data['endDate']);
      }
    }

    return $resource('/api/events/:id', {
      id: '@_id'
    }, {
      'create': {method: 'PUT'},
      'query': {
        method: 'GET',
        isArray: true,
        interceptor: {response: parceDates}
      }, 
      'get': {
        method: 'GET',
        isArray: false,
        interceptor: {response: parceDates}
      }
    });
  });
