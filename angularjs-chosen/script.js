angular.module('app', []);

angular.module('app').controller('AppCtrl', function ($scope) {
    $scope.availableOptions = [
      { id: "1", descr: 'Alabama' },
      { id: "2", descr: 'Alaska' },
      { id: "3", descr: 'Arizona' },
      { id: "4", descr: 'Arkansas' },
      { id: "5", descr: 'California' },
      { id: "6", descr: 'Colorado' },
      { id: "7", descr: 'Connecticut' },
      { id: "8", descr: 'Delaware' },
      { id: "9", descr: 'Florida' },
      { id: "10", descr: 'Georgia' },
      { id: "11", descr: 'Hawaii' },
      { id: "12", descr: 'Idaho' },
      { id: "13", descr: 'Illinois' },
      { id: "14", descr: 'Indiana' },
      { id: "15", descr: 'Iowa' },
      { id: "16", descr: 'Kansas' },
      { id: "17", descr: 'Kentucky' },
      { id: "18", descr: 'Louisiana' },
      { id: "19", descr: 'Maine' },
      { id: "20", descr: 'Maryland' },
      { id: "21", descr: 'Massachusetts' },
      { id: "22", descr: 'Michigan' },
      { id: "23", descr: 'Minnesota' },
      { id: "24", descr: 'Mississippi' },
      { id: "25", descr: 'Missouri' },
      { id: "26", descr: 'Montana' },
      { id: "27", descr: 'Nebraska' },
      { id: "28", descr: 'Nevada' },
      { id: "29", descr: 'New Hampshire' },
      { id: "30", descr: 'New Jersey' },
      { id: "31", descr: 'New Mexico' },
      { id: "32", descr: 'New York' },
      { id: "33", descr: 'North Carolina' },
      { id: "34", descr: 'North Dakota' },
      { id: "35", descr: 'Ohio' },
      { id: "36", descr: 'Oklahoma' },
      { id: "37", descr: 'Oregon' },
      { id: "38", descr: 'Pennsylvania' },
      { id: "39", descr: 'Rhode Island' },
      { id: "40", descr: 'South Carolina' },
      { id: "41", descr: 'South Dakota' },
      { id: "42", descr: 'Tennessee' },
      { id: "43", descr: 'Texas' },
      { id: "44", descr: 'Utah' },
      { id: "45", descr: 'Vermont' },
      { id: "46", descr: 'Virginia' },
      { id: "47", descr: 'Washington' },
      { id: "48", descr: 'West Virginia' },
      { id: "49", descr: 'Wisconsin' },
      { id: "50", descr: 'Wyoming' }
    ];
    $scope.selectedIds = [ "1", "2" ];
    $scope.selectedId = "1";
    
    $scope.users = ['me', 'you'];
    $scope.user = 'me';
});

angular.module('app').directive('appChosen', function($compile) {
    return {
      restrict: 'E',
      require: 'ngModel',
      template: '<select style="width: 200px" multiple></select>',
      link: function (scope, elem, attrs, ngModelController) {
        var selectEl = elem.find('select');

        selectEl.chosen();

        ngModelController.$render = function () {
          selectEl.val(ngModelController.$viewValue);
          selectEl.trigger('chosen:updated');
        };

        selectEl.on('change', function(evt, params) {
          scope.$apply(function() {
            ngModelController.$setViewValue(selectEl.val());
          });
        });

        scope.$watch(attrs.appOptions, function(options) {
          selectEl.empty();
          angular.forEach(options, function (option) {
            var optionEl = angular.element('<option></option>')
              .attr('value', option.id)
              .text(option.descr);
            selectEl.append(optionEl);
          });
          ngModelController.$render();
        });
      }
    };
});

angular.module('app').directive('appChoseFrom', function () {
    return {
        restrict: 'A',
        require: ['select', 'ngModel'],
        link: function (scope, elem, attrs, ctrls) {
            var selectController = ctrls[0],
              ngModelController = ctrls[1],
              renderFn = ngModelController.$render || angular.noop;
            elem.chosen();
            
            ngModelController.$render = function () {
              renderFn.apply(this, arguments);
              elem.trigger('chosen:updated');
            };

            scope.$watch(attrs.appChoseFrom, function (options) {
                elem.children('option').each(function () {
                  var childEl = angular.element(this);
                  selectController.removeOption(childEl.attr('value'));
                  childEl.remove();
                });
                angular.forEach(options, function (option) {
                    var value = option.id || option,
                      optionEl = angular.element('<option></option>')
                      .attr('value', value)
                      .text(option.descr || option);
                    elem.append(optionEl);
                    selectController.addOption(value);
                });
                ngModelController.$render();
            });
        }
    };
});

angular.module('app').directive('appChosen2', function ($parse) {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, elem, attrs, ngModelController) {
            var renderFn = ngModelController.$render || angular.noop,
              opts = $parse(attrs.appChosen2)(scope);

            elem.chosen(opts);
            
            ngModelController.$render = function () {
              renderFn.apply(this, arguments);
              setTimeout(function () { elem.trigger('chosen:updated'); }, 0);
            };

            scope.$watch(opts.watch, function () { 
              elem.trigger('chosen:updated');
            });
        }
    };
});

angular.module('app').directive('appChosen3', function ($parse) {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, elem, attrs) {
            var opts = $parse(attrs.appChosen3)(scope);
            
            elem.chosen(opts);
            
            scope.$watch(attrs.ngModel, function () {
              setTimeout(function () { elem.trigger('chosen:updated'); }, 0);
            });

            scope.$watch(opts.watch, function () {
              setTimeout(function () { elem.trigger('chosen:updated'); }, 0);
            });
        }
    };
});
