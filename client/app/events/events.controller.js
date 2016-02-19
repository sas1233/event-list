'use strict';

angular.module('eventListApp')
        .controller('EventsCtrl', function ($scope, $http, $stateParams, $filter, Auth, User, Event,$mdDialog, $mdMedia) {


          $scope.dateFormat = "YYYY-MM-DD";
          $scope.itemsPerPage = 3;
          $scope.params = $stateParams;
          $scope.eventEdited = {};
          $scope.getCurrentUser = Auth.getCurrentUser;
          $scope.start = moment($stateParams.start).toDate();
          $scope.end = moment($stateParams.end).toDate();
          if (!$stateParams.start) {
            $scope.start = moment().startOf('day').toDate();
            $scope.end = moment().add(1, 'day').toDate();
          }
          $scope.events = Event.query({'start': moment($scope.start).format($scope.dateFormat), 'end': moment($scope.end).format($scope.dateFormat)});


          $scope.users = User.query();

          $scope.delete = function (event) {
            Event.remove({id: event._id}, function () {
              angular.forEach($scope.events, function (ev, i) {
                if (ev === event) {
                  $scope.events.splice(i, 1);
                }
              });
            });
          };


          $scope.dateChange = function (date, key) {

            var startString = moment($scope.start).format($scope.dateFormat);
            $scope.events = Event.query({'start': moment($scope.start).format($scope.dateFormat), 'end': moment($scope.end).format($scope.dateFormat)});
            $scope.params.start = startString;
          };

          $scope.addNew = function () {
            var event = {
              isActive: true,
              endDate: new Date(),
              startDate: new Date(),
              description: 'New desc',
              name: 'New name',
              address: 'New address',
              _user: $scope.getCurrentUser()
            };
            event.$edit = true;
            $scope.edit(event);
          };



          $scope.change = function (event) {
            console.log(event);
          };

          $scope.switchStatus = function (event) {
            $scope.save(event);
          };


          $scope.edit = function (event) {
            event.$edit = true;
            event['startDate'] = new Date(event['startDate']);
            event['endDate'] = new Date(event['endDate']);
            $scope.eventEdited = event;
          };

          $scope.cancel = function (event) {
            event.$edit = false;
            if (event.$save !== undefined) {
              event = Event.get({id: event._id});
            }
          };

          $scope.save = function (event) {
            if (event._user._id) {
              event._user = event._user._id;
            }
            if (event.$save !== undefined) {
              event.$save(function (item) {
                event = item;
                event.$edit = false;
              });
            } else {
              Event.save(event, function (newEvent) {
                $scope.events.push(newEvent);
                newEvent.$edit = false;
                $scope.eventEdited = newEvent;
              });
            }

            if (this.userService) {
              User.get({id: event._user}, function (user) {
                event._user = user;
              });
            }
            event.$edit = false;
          };

  $scope.showAdvanced = function(ev) {
    $mdDialog.show({
      controller: DialogController,
      templateUrl: '/app/events/create.tmpl.html',
      parent: angular.element(document.body),
      targetEvent: ev,
      clickOutsideToClose:true,
      fullscreen: false
    })
    .then(function(answer) {
      $scope.status = 'You said the information was "' + answer + '".';
    }, function() {
      $scope.status = 'You cancelled the dialog.';
    });

  };

function DialogController($scope, $mdDialog) {
  $scope.hide = function() {
    $mdDialog.hide();
  };
  $scope.cancel = function() {
    $mdDialog.cancel();
  };
  $scope.answer = function(answer) {
    $mdDialog.hide(answer);
  };
}

        });
