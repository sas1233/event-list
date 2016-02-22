'use strict';

angular.module('eventListApp')
  .controller('AdminCtrl', function ($scope, $http, Auth, User, $mdDialog, $mdMedia) {

    // Use the User $resource to fetch all users
    $scope.setUpUsers = function () {
      $scope.users = User.query();
      User.query(function (result) {
        $scope.usersMap = _.keyBy(result, '_id');
      });
    }
    $scope.setUpUsers();
    $scope.userEdited = null;

    $scope.getCurrentUser = Auth.getCurrentUser;


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

    $scope.addNew = function () {
      $scope.userEdited = {role: 'user'};
      $scope.showDialog();
    };

    $scope.edit = function (user, ev) {

      $scope.userEdited = user;
      $scope.showDialog(ev);
    };


    $scope.cancel = function (user) {

      if (user&& user.$save !== undefined) {
        user = User.get({id: user._id});
      }

    };

    $scope.save = function (user) {
      if (user.$save !== undefined) {
        user.$save(function (item) {
          user = item;
        });
      } else {
        Auth.createUser(user, function (user) {
          $scope.users.push(user);
        });
      }

      $scope.setUpUsers();
    };


    $scope.showDialog = function (ev) {
      $mdDialog.show({
        controller: DialogController,
        templateUrl: '/app/admin/create.tmpl.html',
        parent: angular.element(document.body),
        targetEvent: ev,
        clickOutsideToClose: true,
        fullscreen: false,
        locals: {
          userEdited: $scope.userEdited
        }
      }).then(function (user) {
        $scope.save(user);
      }, function (user) {
        $scope.cancel(user);
      });

    };

    function DialogController($scope, $mdDialog, userEdited, User, Auth) {
      $scope.user = userEdited;

      $scope.getCurrentUser = Auth.getCurrentUser;

      $scope.setUpUsers = function () {
        $scope.users = User.query();
        User.query(function (result) {
          $scope.usersMap = _.keyBy(result, '_id');
        });
      }
      $scope.setUpUsers();

      $scope.translofrmChip = function (chip) {
        if (angular.isObject(chip)) {
          return chip._id;
        }
        return chip;
      }
      $scope.searchUser = function (text, role) {
        if (role == undefined) {
          role = 'user'
        }
        return User.query({'name': '' + text + '', 'role': role});

      };

      $scope.hide = function () {
         $mdDialog.cancel($scope.eventEdited);
      };
      $scope.cancel = function () {
        $mdDialog.cancel($scope.user);
      };
      $scope.saveDialog = function () {
        $mdDialog.hide($scope.user);
      };
    }


  });
