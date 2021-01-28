
'use strict';

/* Use JQuery.gritter to popup success message */
function alert_success(message) {
  $.gritter.add({
    title: 'Success!',
    text: message,
    image: 'static/img/dockeirb-logo.png',
    time: 3000
  });
}

/* Use JQuery.gritter to popup error message */
function alert_error(message) {
  $.gritter.add({
    title: 'Error!',
    text: message,
    image: 'static/img/dockeirb-logo.png',
    time: 3000
  });
}

/* All angular application controllers */
var dockeirbControllers = angular.module('dockeirbControllers', []);

/* This controller to get comment from beego api */
dockeirbControllers.controller('HomeController',
  function($scope, $rootScope, $routeParams, version, info) {

  $scope.version = version;
  $scope.Os = $scope.version.Os;
  $scope.KernelVersion = $scope.version.KernelVersion;
  $scope.GoVersion = $scope.version.GoVersion;
  $scope.Version = $scope.version.Version;

  $scope.info = info;
  $scope.Containers = $scope.info.Containers;
  $scope.Images = $scope.info.Images;
});

/* Contaienrs controller requests beego API server to get/start/stop/delete containers */
dockeirbControllers.controller('ContainersController',
  function($scope, $rootScope, $routeParams, $http, $cookies, allContainers, runningContainers) {

  $scope.predicate = '';
  $scope.reverse = false;

  /* For the first time, display all containers by default */
  if (typeof $cookies.isAllContainers === "undefined") {
    $cookies.isAllContainers = "true"; // Only string data in cookies
  }

  /* Check cookies and get all or running container objects */
  if ($cookies.isAllContainers === "true") {
    $scope.currentFilterString = "All";
    $scope.isAllContainers = true;
    $scope.containers = allContainers;
  } else {
    $scope.currentFilterString = "Running";
    $scope.isAllContainers = false;
    $scope.containers = runningContainers;
  }

  /* Get all containers objects */
  $scope.getAllContainers = function() {
    $http.get($rootScope.canonicalServer + '/containers/json?all=1').success(function(data) {
      $scope.currentFilterString = "All";
      $scope.isAllContainers = true;
      $cookies.isAllContainers = "true";
      $scope.containers = data;
      alert_success("Get all containers");
    });
  };

  /* Get running containers objects */
  $scope.getRunningContainers = function() {
    $http.get($rootScope.canonicalServer + '/containers/json?all=0').success(function(data) {
      $scope.currentFilterString = "Running";
      $scope.isAllContainers = false;
      $cookies.isAllContainers = "no";
      $scope.containers = data;
      alert_success("Get running containers");
    });
  };

  /* Enable to check startsWith, refer to http://stackoverflow.com/questions/646628/how-to-check-if-a-string-startswith-another-string */
  if (typeof String.prototype.startsWith != 'function') {
    // see below for better implementation!
    String.prototype.startsWith = function (str){
      return this.indexOf(str) == 0;
    };
  };

  /* Determine if the container is running */
  $scope.checkRunning = function(container) {
    if (container.Status.startsWith("Up")) {
      return true;
    } else {
      return false;
    }
  };

  /* Print ports in better way */
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

  /* Request beego API server to start container */
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

  /* Request beego API server to stop container */
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

  /* Request beego API server to delete container */
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

/*
 * Contaienr controller requests beego API server to get/start/stop/delete container
 * Todo: Remove the duplicated code from ContainersController
 */
dockeirbControllers.controller('ContainerController', ['$scope', '$rootScope', '$routeParams', '$http',
  function($scope, $rootScope, $routeParams, $http) {

  /* Refer to https://docs.docker.com/reference/api/docker_remote_api_v1.14/#inspect-a-container
    {
      "Id": "4fa6e0f0c6786287e131c3852c58a2e01cc697a68231826813597e4994f1d6e2",
      "Created": "2013-05-07T14:51:42.041847+02:00",
      "Name": "/realms-wiki", // I add it
      "Path": "date",
      "Args": [],
      "Config": {
        "Hostname": "4fa6e0f0c678",
        "User": "",
        "Memory": 0,
        "MemorySwap": 0,
        "AttachStdin": false,
        "AttachStdout": true,
        "AttachStderr": true,
        "PortSpecs": null,
        "Tty": false,
        "OpenStdin": false,
        "StdinOnce": false,
        "Env": null,
        "Cmd": [
          "date"
        ],
        "Dns": null,
        "Image": "base",
        "Volumes": {},
        "VolumesFrom": "",
        "WorkingDir":""
      },
      "State": {
        "Running": false,
        "Pid": 0,
        "ExitCode": 0,
        "StartedAt": "2013-05-07T14:51:42.087658+02:01360",
        "Ghost": false
      },
      "Image": "b750fe79269d2ec9a3c593ef05b4332b1d1a02a62b4accb2c21d589ff2f5f2dc",
      "NetworkSettings": {
        "IpAddress": "",
        "IpPrefixLen": 0,
        "Gateway": "",
        "Bridge": "",
        "PortMapping": null
      },
      "SysInitPath": "/home/kitty/go/src/github.com/docker/docker/bin/docker",
      "ResolvConfPath": "/etc/resolv.conf",
      "Volumes": {},
      "HostConfig": {
        "Binds": null,
        "ContainerIDFile": "",
        "LxcConf": [],
        "Privileged": false,
        "PortBindings": {
          "80/tcp": [
            {
              "HostIp": "0.0.0.0",
              "HostPort": "49153"
            }
          ]
        },
        "Links": ["/name:alias"],
        "PublishAllPorts": false,
      }
    }
  */

  /*
    {
      "Titles":[
        "UID", // edit
        "PID",
        "C",
        "STIME"
        "TTY",
        "TIME",
        "CMD" // edit
      ],
      "Processes":[
         ["root","24550","24549","0","17:25","?","00:00:00","runsv cron"], // edit
         ["root","24492","24485","0","17:25","?","00:00:00","/usr/bin/python3 -u /sbin/my_init"] // edit
      ]
    }
  */

  /* Docker stats response data
  {
   read: "2015-06-26T20:46:48.370740376+08:00",
   network: {
     rx_bytes: 648,
     rx_packets: 8,
     rx_errors: 0,
     rx_dropped: 0,
     tx_bytes: 648,
     tx_packets: 8,
     tx_errors: 0,
     tx_dropped: 0
   },
   cpu_stats: {
     cpu_usage: {
       total_usage: 22209029,
       percpu_usage: [
         12950040,
         3858257,
         1717359,
         3683373
       ],
       usage_in_kernelmode: 0,
       usage_in_usermode: 10000000
     },
     system_cpu_usage: 1066183930000000,
     throttling_data: {
       periods: 0,
       throttled_periods: 0,
       throttled_time: 0
     }
   },
   memory_stats: {
     usage: 1855488,
     max_usage: 2297856,
     stats: {
       active_anon: 1585152,
       active_file: 24576,
       cache: 278528,
       hierarchical_memory_limit: 9223372036854772000,
       inactive_anon: 4096,
       inactive_file: 241664,
       mapped_file: 0,
       pgfault: 888,
       pgmajfault: 6,
       pgpgin: 687,
       pgpgout: 234,
       rss: 1576960,
       rss_huge: 0,
       total_active_anon: 1585152,
       total_active_file: 24576,
       total_cache: 278528,
       total_inactive_anon: 4096,
       total_inactive_file: 241664,
       total_mapped_file: 0,
       total_pgfault: 888,
       total_pgmajfault: 6,
       total_pgpgin: 687,
       total_pgpgout: 234,
       total_rss: 1576960,
       total_rss_huge: 0,
       total_unevictable: 0,
       total_writeback: 0,
       unevictable: 0,
       writeback: 0
     },
     failcnt: 0,
     limit: 8330768384
   },
   blkio_stats: {
     io_service_bytes_recursive: [
       {
         major: 8,
         minor: 0,
         op: "Read",
         value: 282624
       },
       {
         major: 8,
         minor: 0,
         op: "Write",
         value: 0
       },
       {
         major: 8,
         minor: 0,
         op: "Sync",
         value: 0
       },
       {
         major: 8,
         minor: 0,
         op: "Async",
         value: 282624
       },
       {
         major: 8,
         minor: 0,
         op: "Total",
         value: 282624
       }
     ],
     io_serviced_recursive: [
       {
         major: 8,
         minor: 0,
         op: "Read",
         value: 25
       },
       {
         major: 8,
         minor: 0,
         op: "Write",
         value: 0
       },
       {
         major: 8,
         minor: 0,
         op: "Sync",
         value: 0
       },
       {
         major: 8,
         minor: 0,
         op: "Async",
         value: 25
       },
       {
         major: 8,
         minor: 0,
         op: "Total",
         value: 25
       }
     ],
     io_queue_recursive: [ ],
     io_service_time_recursive: [ ],
     io_wait_time_recursive: [ ],
     io_merged_recursive: [ ],
     io_time_recursive: [ ],
     sectors_recursive: [ ]
   }
  }
  */

  /* Get the container object */
  $http.get($rootScope.canonicalServer + '/containers/' + $routeParams.id + '/json').success(function(data) {
    $scope.container = data;
  });

  /* Get the container top status */
  $http.get($rootScope.canonicalServer + '/containers/' + $routeParams.id + '/top').success(function(data) {
    $scope.top = data;
  });

  /* Get the container stats */
  $http.get($rootScope.canonicalServer + '/containers/' + $routeParams.id + '/stats').success(function(data) {
    $scope.stats = data;
  });

  /* Refresh the page */
  $scope.refresh = function() {
    location.reload();
  };

  /* Request beego API server to start container */
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

  /* Request beego API server to stop container */
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

  /* Request beego API server to delete container */
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
