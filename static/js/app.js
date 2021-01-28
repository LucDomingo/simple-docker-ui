
'use strict';

Array.prototype.remove = function() {
    var what, a = arguments, L = a.length, ax;
    while (L && this.length) {
        what = a[--L];
        while ((ax = this.indexOf(what)) !== -1) {
            this.splice(ax, 1);
        }
    }
    return this;
};

function unique(list) {
  var result = [];
  $.each(list, function(i, e) {
    if ($.inArray(e, result) == -1) result.push(e);
  });
  return result;
}

function canonicalizeServer(server) {
  if (server == "Local") {
    return "/dockerapi";
  } else {
    return server
  }

}

var dockeirb = angular.module('dockeirb', [
  'ngRoute',
  'dockeirbControllers',
  'ngCookies',
  'pascalprecht.translate'
]);

dockeirb.config(['$locationProvider', '$routeProvider',
  function($locationProvider, $routeProvider) {
    $locationProvider.html5Mode(true);

    $routeProvider.
      when('/', {
        templateUrl: '/static/html/home.html',
        controller: 'HomeController',
        resolve: {
          version: function($rootScope, $http) {
            return $http.get($rootScope.canonicalServer + '/version').then(function(response) {
              return response.data;
            });
          },
          info: function($rootScope, $http) {
            return $http.get($rootScope.canonicalServer + '/info').then(function(response) {
              return response.data;
            });
          }
        }
      }).
      when('/containers', {
        templateUrl: '/static/html/containers.html',
        controller: 'ContainersController',
        resolve: {
          allContainers: function($rootScope, $http) {
            return $http.get($rootScope.canonicalServer + '/containers/json?all=1').then(function(response) {
              return response.data;
            });
          },
          runningContainers: function($rootScope, $http) {
            return $http.get($rootScope.canonicalServer + '/containers/json?all=0').then(function(response) {
              return response.data;
            });
          }
        }
      }).
      when('/containers/:id', {
        templateUrl: '/static/html/container.html',
        controller: 'ContainerController'
      }).
      when('/images', {
        templateUrl: '/static/html/images.html',
        controller: 'ImagesController',
        resolve: {
          images: function($rootScope, $http) {
            return $http.get($rootScope.canonicalServer + '/images/json').then(function(response) {
              return response.data;
            });
          }
        }
      }).
      when('/images/:id', {
        templateUrl: '/static/html/image.html',
        controller: 'ImageController',
        resolve: {
          image: function($rootScope, $route, $http) {
            return $http.get($rootScope.canonicalServer + '/images/' + $route.current.params.id + '/json').then(function(response) {
              return response.data;
            });
          }
        }
      }).
      when('/images/:user/:repo', {
        templateUrl: '/static/html/image.html',
        controller: 'ImageController',
        resolve: {
          image: function($rootScope, $route, $http) {
            return $http.get($rootScope.canonicalServer + '/images/' + $route.current.params.user + "/" + $route.current.params.repo + '/json').then(function(response) {
              return response.data;
            });
          }
        }
      }).
      when('/configuration', {
        templateUrl: '/static/html/configuration.html',
        controller: 'ConfigurationController',
        resolve: {
          version: function($rootScope, $http) {
            return $http.get($rootScope.canonicalServer + '/version').then(function(response) {
              return response.data
            });
          },
          info: function($rootScope, $http) {
            return $http.get($rootScope.canonicalServer + '/info').then(function(response) {
              return response.data;
            });
          }
        }
      }).
      when('/stats', {
        templateUrl: '/static/html/stats',
        controller: 'StatsController',
        resolve: {
          images: function($rootScope, $http) {
            return $http.get($rootScope.canonicalServer + '/stats').then(function(response) {
              return response.data;
            });
          }
        }
      });
  }]
);

dockeirb.filter( 'filesize', function () {
  var units = [
    'bytes',
    'KB',
    'MB',
    'GB',
    'TB',
    'PB'
  ];

  return function( bytes, precision ) {
    if ( isNaN( parseFloat( bytes )) || ! isFinite( bytes ) ) {
      return '?';
    }

    var unit = 0;
    while ( bytes >= 1024 ) {
      bytes /= 1024;
      unit ++;
    }
    return bytes.toFixed( + precision ) + ' ' + units[ unit ];
  };
});

dockeirb.filter( 'array_to_string', function () {
  return function( strings ) {
    if ( !Array.isArray(strings) ) {
      return '';
    }

    var result = "";
    for (var i=0; i<strings.length; i++) {
      result += strings[i];
      if (i != strings.length-1) {
        result += ", ";
      }
    }
    return result;
  };
});

dockeirb.filter( 'boolean_to_string', function () {
  return function( bool ) {
    if (bool) {
      return "true";
    } else {
      return "false";
    }
  };
});


dockeirb.controller('IndexController', function ($scope, $rootScope, $translate, $route, $http, $cookieStore) {

  $scope.theme =  "slate"
  $scope.currentServer = "Local";
  $scope.servers = ["Local"];
  $rootScope.canonicalServer = canonicalizeServer($scope.currentServer);

});

dockeirb.config(function ($translateProvider) {
  $translateProvider.useCookieStorage();
  $translateProvider.preferredLanguage('fr-fr');


  $translateProvider.translations('fr-fr', {
    dockeirb: 'dockeirb',
    containers: 'Conteneurs',
    images: 'Images',
    configuration: 'Configuration',
    dockerhub: 'DockerHub',
    more: 'Plus',
    zh_cn: '简体中文',
    zh_hant: '繁體中文',
    en_us: 'English',
    fr_fr: 'Français',
    sv_se: 'Svenska',
    de_de: 'German',
    need_help: 'Assistance',
    theme: 'Thème',
    error_to_load_data_from_docker_daemon_please_check_dockeirb_and_configuration: 'Erreur de chargement des données depuis le démon docker. Merci de vérifier la configuration de dockeirb.',
    period: '.',
    the_best_friend_of_docker: 'le meilleur ami de docker',
    im_using: 'J\'utilise',
    with_kernel: 'avec le noyau',
    and_docker: 'et Docker',
    the_docker_daemon_has: 'Le démon docker a',
    running_stopped_containers_and: 'conteneurs démarrés ou arrêtés, ainsi que',
    images_now: 'images stockées',
    docker_is_an_open_platform_for_distributed_application_for_developers_and_sysadmins: 'Docker est une plateforme ouverte pour partager des applications entre développeurs ou administrateurs système',
    and_dockeirb_provides_a_friendly_web_ui_to_monitor_docker: 'dockeirb fournit une interface web pour monitorer docker.',
    github: 'Github',
    go_now: 'Visiter',
    learn_more: 'En savoir plus',
    containers_page_display_all_running_and_stopped_docker_containers: 'La page des conteneurs affiche tous les conteneurs docker démarrés ou arrêtés.',
    images_page_display_all_docker_images_to_start_stop_and_delete: 'La page des images affiche toutes les images docker à démarrer, arrêter ou supprimer.',
    configuration_page_display_all_your_docker_environment_and_settings:'La page de configuration affiche les informations relatives à l\'environment d\'execution de docker.',
    dockeirb_is_open_source_in_Github_welcome_to_contribution_and_issues: 'dockeirb est open source disponible sur Github. Contributions et retours utilisateurs sont les bienvenus.',
    search: 'Recherche',
    filter: 'Filtre',
    all: 'Tous',
    no_docker_container: 'Aucun conteneur docker !',
    id: 'Id',
    names: 'Noms',
    image: 'Image',
    command: 'Commande',
    created: 'Création',
    status: 'Statut',
    ports: 'Ports',
    operation: 'Opération',
    no_docker_image: 'Aucune image docker !',
    repotags: 'Tag',
    virtualsize: 'Espace disque',
    delete: 'Supprimer',
    no_search_result_for: 'Aucun résultat de recherche pour',
    container: 'Conteneur',
    start: 'Démarrer',
    stop: 'Arrêter',
    refresh: 'Rafraîchir',
    no_such_container: 'conteneur non trouvé !',
    attribute: 'Attribut',
    value: 'Valeur',
    name: 'Nom',
    running: 'démarré',
    startedat: 'StartedAt',
    publishallports: 'PublishAllPorts',
    links: 'Links',
    openstdin: 'OpenStdin',
    uid: 'UID',
    pid: 'PID',
    c: 'C',
    stime: 'STIME',
    tty: 'TTY',
    time: 'TIME',
    cmd: 'CMD',
    read: 'Lecture',
    network_rx_bytes: 'Network rx bytes',
    network_rx_packets: 'Network rx packages',
    network_rx_errors: 'Network rx errors',
    network_rx_dropped: 'Network rx dropped',
    network_tx_bytes: 'Network tx bytes',
    network_tx_packets: 'Network tx packets',
    network_tx_errors: 'Network tx errors',
    network_tx_dropped: 'Network tx dropped',
    cpu_total_usage: 'CPU total usage',
    cpu_usage_in_kernelmode: 'CPU usage in kernel mode',
    cpu_usage_in_usermode: 'CPU usage in user mode',
    cpu_system_cpu_usage: 'CPU system usage',
    cpu_throttling_periods: 'CPU throtting periods',
    cpu_throttling_throttled_periods: 'CPU throttled periods',
    cpu_throttling_throttled_time:'CPU throttled time',
    memory_usage: 'Memory usage',
    memory_max_usage: 'Memory max usage',
    memory_active_anon: 'Memory active anon',
    memory_active_file: 'Memory active file',
    memory_cache: 'Memory cache',
    memory_hierarchical_memory_limit: 'Memory hierarchical limit',
    memory_inactive_anon: 'Memory inactive anon',
    memory_inactive_file: 'Memory inactive file',
    memory_mapped_file: 'Memory mapped file',
    memory_pgfault: 'Memory pg fault',
    memory_pgpgin: 'Memory pg pg in',
    memory_pgpgout: 'Memory pg pg out',
    memory_rss: 'Memory rss',
    memory_rss_huge: 'Memory rss huge',
    memory_unevictable: 'Memory unevictable',
    memory_writeback: 'Memory writeback',
    memory_failcnt: 'Memroy failcnt',
    memory_limit: 'Memory limit',
    no_such_image: 'Impossible de trouver cette image !',
    author: 'Auteur',
    architecture: 'Architecture',
    comment: 'Comment',
    dockerversion: 'DockerVersion',
    os: 'Os',
    parent: 'Parent',
    size: 'Size',
    no_data_of_version_or_info: 'Aucune donnée de version ou d\'information',
    goversion: 'GoVersion',
    version: 'Version',
    gitcommit: 'GitCommit',
    apiversion: 'ApiVersion',
    driver: 'Driver',
    executiondriver: 'ExecutionDriver',
    KernelVersion: 'KernelVersion',
    debug: 'Debug',
    nfd: 'NFD',
    ngoroutines: 'NGoroutines',
    neventslistener: 'NEventsListener',
    initpath: 'InitPath',
    initsha1: 'InitSha1',
    indexserveraddress: 'IndexServerAddress',
    memorylimit: 'MemoryLimit',
    swaplimit: 'SwapLimit',
    ipv4forwarding: 'IPv4Forwarding',
    sockets: 'Sockets',
    search_image: 'Recherche d\'Images',
    search_no_docker_image: 'La recherche n\'a retourné aucun résultat',
    description: 'Description',
    star_count: 'Nombre d\'étoiles',
    is_official: 'Officiel',
    is_automated: 'Automatisé'
  });

});
