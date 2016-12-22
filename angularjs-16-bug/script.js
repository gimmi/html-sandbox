'use strict';

angular.module('app', ['ngRoute'])
    .config(routeConfig);

function routeConfig($routeProvider) {
    $routeProvider
        .when('/home', { template: '<p>Home</p>' })
        .when('/roles', { template: '<p>Roles</p>' })
        .otherwise('/home');
}
