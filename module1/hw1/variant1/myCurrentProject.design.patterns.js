/* <------ REVEALING MODULE    ------> */

function ProductScanService(CartService,
                          DialogService,
                          /* ... */
                          NoSaleService) {

  var service = {
      add: add,
      isAvailable: isAvailable
  };

  return service;

  function isAvailable() {
      return !TransactionStore.isFastFind();
  }

  function add(sku, price) {
      if (!sku || NoSaleService.isTransactionStarted()) {
          showError();
      }

      /* ... */
  }

  function showError() {
  	/* ... */
  }
}

/* In revealing module we can create addition methods inside the
 * function and export an object with only public methods.
 * In this case external modules can use only 'add' and 'isAvaliable' methods.
 * But 'showError' is used only by 'add' method and is privat for everything external
 */



/* <------ FACTORY             ------> */

/* <------ SINGLETON           ------> */

/* <------ MULTITON            ------> */

/* <------ FACADE              ------> */

/* <------ DECORATOR           ------> */

/* <------ MEDIATOR            ------> */

/* <------ OBSERVER            ------> */

function Scanner(SCANNER_EVENT,
                 $rootScope) {

		/* ... */

  function raiseEvent(rawValue) {
    $rootScope.$broadcast(SCANNER_EVENT.SCAN, rawValue);
  }

    /* ... */
}

function ScannerInput($timeout, SCANNER_EVENT) {

	/* ... */

  function activate() {
    scope.$on(SCANNER_EVENT.SCAN, onScan);
  }

	/* ... */

}

function ProductSearchFilterController($scope,
                                       SCANNER_EVENT) {
	/* ... */

  function initialize() {
    $scope.$on(SCANNER_EVENT.SCAN, function(event, value) {
      ProductSearchFilterFormService.clear();
      vm.input.upc = value;
    });
  }

  /* ... */
}

/* In this case Scaner can broadcast scan event and several observers which are waiting
 * for notification from him will do some actions after notification.
 */ 

/* <------ PUBLISH / SUBSCRIBE ------> */
