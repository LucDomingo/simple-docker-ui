
'use strict';

function alert_success(message) {
  $.gritter.add({
    title: 'Success!',
    text: message,
    image: 'static/img/dockeirb-logo.png',
    time: 3000
  });
}

function alert_error(message) {
  $.gritter.add({
    title: 'Error!',
    text: message,
    image: 'static/img/dockeirb-logo.png',
    time: 3000
  });
}

var dockeirbControllers = angular.module('dockeirbControllers', []);

dockeirbControllers.controller('HomeController',
  function($scope, $rootScope, $routeParams, version, info) {
  $scope.version = version;
  $scope.Version = $scope.version.Version;
});


dockeirbControllers.controller('ContainersController',
  function($scope, $rootScope, $routeParams, $http, $cookies, allContainers, runningContainers) {

  $scope.predicate = '';
  $scope.reverse = false;

  if (typeof $cookies.isAllContainers === "undefined") {
    $cookies.isAllContainers = "true";
  }

  if ($cookies.isAllContainers === "true") {
    $scope.currentFilterString = "All";
    $scope.isAllContainers = true;
    $scope.containers = allContainers;
  } else {
    $scope.currentFilterString = "Running";
    $scope.isAllContainers = false;
    $scope.containers = runningContainers;
  }

  $scope.getAllContainers = function() {
    $http.get($rootScope.canonicalServer + '/containers/json?all=1').success(function(data) {
      $scope.currentFilterString = "All";
      $scope.isAllContainers = true;
      $cookies.isAllContainers = "true";
      $scope.containers = data;
      alert_success("Get all containers");
    });
  };

  $scope.getRunningContainers = function() {
    $http.get($rootScope.canonicalServer + '/containers/json?all=0').success(function(data) {
      $scope.currentFilterString = "Running";
      $scope.isAllContainers = false;
      $cookies.isAllContainers = "no";
      $scope.containers = data;
      alert_success("Get running containers");
    });
  };

  if (typeof String.prototype.startsWith != 'function') {
    // see below for better implementation!
    String.prototype.startsWith = function (str){
      return this.indexOf(str) == 0;
    };
  };

  $scope.checkRunning = function(container) {
    if (container.Status.startsWith("Up")) {
      return true;
    } else {
      return false;
    }
  };

  $scope.printPorts = function(data) {
    var returnString = "";
    for(var i = 0; i < data.length; i++) {
      var object = data[i];
      if (object["IP"]) {
        returnString += object.IP + ":" + object.PublicPort + "->" + object.PrivatePort + "/" + object.Type;
      } else {
        returnString += object.PrivatePort + "/" + object.Type;
      }

      if (i != data.length-1) {
        returnString += ", ";
      }
    }

    return returnString;
  }

  $scope.startContainer = function(id) {
    $http({
      method: 'POST',
      url: $rootScope.canonicalServer + '/containers/' + id + "/start",
      data: '',
      headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    }).success(function(data, status, headers, config) {
      if (status == 200) {
        alert_success("Start container " + id.substring(0,12));
        $http.get($rootScope.canonicalServer + '/containers/json?all=1').success(function(data) {
          $scope.containers = data;
        });
      } else {
        alert_error("Start container " + id.substring(0,12));
      }
    }).error(function(data, status, headers, config) {
      alert_error("Start container " + id.substring(0,12));
    });
  };

  $scope.stopContainer = function(id) {
    $http({
      method: 'POST',
      url: $rootScope.canonicalServer + '/containers/' + id + "/stop",
      data: '',
      headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    }).success(function(data, status, headers, config) {
      if (status == 200) {
        alert_success("Stop container " + id.substring(0,12));
        $http.get($rootScope.canonicalServer + '/containers/json?all=1').success(function(data) {
          $scope.containers = data;
        });
      } else {
        alert_error("Stop container " + id.substring(0,12));
      }
    }).error(function(data, status, headers, config) {
      alert_error("Stop container " + id.substring(0,12));
    });
  };

  $scope.deleteContainer = function(id) {
    $http({
      method: 'DELETE',
      url: $rootScope.canonicalServer + '/containers/' + id,
      data: '',
      headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    }).success(function(data, status, headers, config) {
      if (status == 200) {
        alert_success("Delete container " + id.substring(0,12));
        $http.get($rootScope.canonicalServer + '/containers/json?all=1').success(function(data) {
          $scope.containers = data;
        });
      } else {
        alert_error("Delete container " + id.substring(0,12));
      }
    }).error(function(data, status, headers, config) {
      alert_error("Delete container " + id.substring(0,12));
    });
  };

});


dockeirbControllers.controller('ContainerController', ['$scope', '$rootScope', '$routeParams', '$http',
  function($scope, $rootScope, $routeParams, $http) {

  $http.get($rootScope.canonicalServer + '/containers/' + $routeParams.id + '/json').success(function(data) {
    $scope.container = data;
  });

  $http.get($rootScope.canonicalServer + '/containers/' + $routeParams.id + '/top').success(function(data) {
    $scope.top = data;
  });

  $http.get($rootScope.canonicalServer + '/containers/' + $routeParams.id + '/stats').success(function(data) {
    $scope.stats = data;
  });

  $scope.refresh = function() {
    location.reload();
  };

  $scope.startContainer = function(id) {
    $http({
      method: 'POST',
      url: $rootScope.canonicalServer + '/containers/' + id + "/start",
      data: '',
      headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    }).success(function(data, status, headers, config) {
      if (status == 200) {
        alert_success("Start container " + id.substring(0,12));
        $http.get($rootScope.canonicalServer + '/containers/' + $routeParams.id + '/json').success(function(data) {
          $scope.container = data;
        });

        $http.get($rootScope.canonicalServer + '/containers/' + $routeParams.id + '/top').success(function(data) {
          $scope.top = data;
        });
      } else {
        alert_error("Start container " + id.substring(0,12));
      }
    }).error(function(data, status, headers, config) {
      alert_error("Start container " + id.substring(0,12));
    });
  };

  $scope.stopContainer = function(id) {
    $http({
      method: 'POST',
      url: $rootScope.canonicalServer + '/containers/' + id + "/stop",
      data: '',
      headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    }).success(function(data, status, headers, config) {
      if (status == 200) {
        alert_success("Stop container " + id.substring(0,12));
        $http.get($rootScope.canonicalServer + '/containers/' + $routeParams.id + '/json').success(function(data) {
          $scope.container = data;
        });

        $http.get($rootScope.canonicalServer + '/containers/' + $routeParams.id + '/top').success(function(data) {
          $scope.top = data;
        });
      } else {
        alert_error("Stop container " + id.substring(0,12));
      }
    }).error(function(data, status, headers, config) {
      alert_error("Stop container " + id.substring(0,12));
    });
  };

  $scope.deleteContainer = function(id) {
    $http({
      method: 'DELETE',
      url: $rootScope.canonicalServer + '/containers/' + id,
      data: '',
      headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    }).success(function(data, status, headers, config) {
      if (status == 200) {
        alert_success("Delete container " + id.substring(0,12));
        $http.get($rootScope.canonicalServer + '/containers/' + $routeParams.id + '/json').success(function(data) {
          $scope.container = data;
        });

        $http.get($rootScope.canonicalServer + '/containers/' + $routeParams.id + '/top').success(function(data) {
          $scope.top = data;
        });
      } else {
        alert_error("Delete container " + id.substring(0,12));
      }
    }).error(function(data, status, headers, config) {
      alert_error("Delete container " + id.substring(0,12));
    });
  };

}]);


dockeirbControllers.controller('ImagesController',
  function($scope, $rootScope, $routeParams, $http, images) {

  $scope.predicate = '';
  $scope.reverse = false;

  for (var i=0; i < images.length; i++) {
    images[i].Id = images[i].Id.substring(7)
  }

  $scope.images = images;

  $scope.deleteImage = function(id) {
    $http({
      method: 'DELETE',
      url: $rootScope.canonicalServer + '/images/' + id,
      data: '',
      headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    }).success(function(data, status, headers, config) {
      if (status == 200) {
        alert_success("Delete image " + id.substring(0,12));
        $http.get($rootScope.canonicalServer + '/images/json').success(function(images) {

          for (var i=0; i < images.length; i++) {
            images[i].Id = images[i].Id.substring(7)
          }

          $scope.images = images;
        });
      } else {
        alert_error("Delete image " + id.substring(0,12));
      }
    }).error(function(data, status, headers, config) {
      alert_error("Delete image " + id.substring(0,12));
    });
  };
});


dockeirbControllers.controller('ImageController',
  function($scope, $rootScope, $routeParams, image) {

  /* Remove image id prefix from "sha256:7b550cc136fa992081e4ee02f8afbd17087ad9921ccedf0409ff7807c990643d" to "7b550cc136fa992081e4ee02f8afbd17087ad9921ccedf0409ff7807c990643d" */
  image.Id = image.Id.substring(7)

  $scope.image = image;
});

/* Contaienrs controller requests beego API server to get configuration */
dockeirbControllers.controller('ConfigurationController',
  function($scope, $rootScope, $routeParams, $http, version, info) {

  $scope.version = version;
  $scope.info = info;

});
