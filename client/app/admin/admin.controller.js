'use strict';

angular.module('eventListApp')
  .controller('AdminCtrl', function ($scope, $http, Auth, User) {

    // Use the User $resource to fetch all users
    $scope.users = User.query();
    $scope.userEdited = null;
    
    $scope.delete = function (user) {
      User.remove({id: user._id});
      angular.forEach($scope.users, function (u, i) {
        if (u === user) {
          $scope.users.splice(i, 1);
        }
      });
    };



    $scope.change = function (user) {
      console.log(user);
    };

    $scope.switchStatus = function (user) {
      $scope.save(user);
    };


    $scope.edit = function (user) {
      user.$edit = true;
      $scope.userEdited = user;
    };

    $scope.cancel = function (user) {
      user.$edit = false;
      user = User.get({id: user._id});
    };

    $scope.save = function (user) {
      if (!user._id) {

      }

      if (user.$save !== undefined) {
        user.$save(function (item) {
          user = item;
          user.$edit = false;
        });
      } else {
        User.save(user, function (newEvent) {
          $scope.users.push(newEvent);
          newEvent.$edit = false;
          $scope.eventEdited = newEvent;
        });
      }


      user.$edit = false;
    };
  });
