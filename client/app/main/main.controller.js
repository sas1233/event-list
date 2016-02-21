'use strict';

angular.module('eventListApp')
  .controller('MainCtrl', function ($scope, $http, $stateParams, $state, uiCalendarConfig, $filter, Auth, User, Event) {
    $scope.dateSelected = new Date();
    $scope.dateFormat = "YYYY-MM-DD";
    $scope.getCurrentUser = Auth.getCurrentUser;
    $scope.start = moment().startOf('month');
    $scope.end = moment().endOf("month");
    $scope.startSelected = null;
    $scope.endSelected = null;


    $scope.eventsSelected = [];
    $scope.eventSource = {
      events: [],
      color: '#4393B9',
      textColor: 'white'
    };

    $scope.selected = function (start, end, jsEvent, view) {
      $scope.startSelected = start;
      $scope.endSelected = end;
      $scope.eventsSelected = Event.query({'start': start.format($scope.dateFormat), 'end': end.format($scope.dateFormat)}, function (resp) {
      });
    };

    $scope.loadToSource = function () {
      $scope.events = Event.query({}, function (data, data1) {
        $scope.eventSource.events = _.map($scope.events, function (event) {
          return {title: event.name, start: moment(event.startDate).add(0, 'day').format($scope.dateFormat), end: moment(event.endDate).add(1, 'day').format($scope.dateFormat)};
        });
        uiCalendarConfig.calendars.mainCalendar.fullCalendar('refetchEvents');
        uiCalendarConfig.calendars.mainCalendar.fullCalendar('addEventSource', $scope.eventSource);
      });
    };
    $scope.rangeChange = function (view, element) {

    };

    $scope.loadToSource();

    $scope.toEventList = function () {
      $state.go('events', {'start': $scope.startSelected.format($scope.dateFormat), 'end': $scope.endSelected.format($scope.dateFormat)});
    };

    $scope.uiConfig = {
      calendar: {
        height: 450,
        editable: false,
        selectable: true,
        header: {
          left: 'title',
          center: '',
          right: 'today prev,next'
        },
        eventClick: $scope.alertOnEventClick,
        dayClick: $scope.alertOnDayClick,
        select: $scope.selected,
        viewRender: $scope.rangeChange
      }
    };
  });
