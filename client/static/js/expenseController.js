// This controller is to handle the expense sheet page, along with the nav bar

// create the controller on the angular "app" module created in the "routes" file
// Dependencies:
// $scope - for data binding
// $location - for path/route manipulation
// XTFactory - factory module for the site
app.controller('expenseController',['$scope', '$location', 'XTFactory', function($scope, $location, XTFactory){
  // initialise the $scope variables
  $scope.userDropdown    = {'display': 'none'}
  $scope.displayForm     = {'display': 'none'}
  $scope.displayButton   = {'display': 'flex'}
  $scope.cashFlowStyle   = {'background-color': 'black'}
  $scope.user            = ''
  $scope.sheetName       = ''
  $scope.errMsg          = ''
  $scope.curMon          = ''
  $scope.curYear         = ''
  $scope.sheetExpenses   = []
  $scope.months          = []
  $scope.years           = []
  $scope.categories      = []
  $scope.subcategories   = []
  $scope.inFlow          = 0
  $scope.outFlow         = 0
  $scope.totCashFlow     = 0
  $scope.class           = {}
  $scope.err             = {
    'date'       : false,
    'category'   : false,
    'subcategory': false,
    'amount'     : false,
    'mode'       : false,
    'cardtype'   : false,
    'notes'      : false
  }
  $scope.expense         = {
    'expense_id' : '',
    'date'       : '',
    'category'   : '',
    'subcategory': '',
    'amount'     : 0,
    'mode'       : '',
    'cardtype'   : '',
    'notes'      : ''
  }

  // Populate the username in the nav bar
  if (!XTFactory.isUserSignedIn()){
    $location.url('/')
  } else {
    $scope.user = XTFactory.getCurrentUser()['user']
  }

  // Populate the sheet details
  var curSheet         = XTFactory.getCurrentSheet(),
      curMon           = new Date().getMonth(),
      curYear          = new Date().getFullYear(),
      curDate          = new Date()

  for (let i = 0; i < 12; i++){ $scope.class[i] = '' }
  $scope.sheetName     = curSheet['sheetName']
  $scope.months        = XTFactory.getMonths()
  $scope.class[curMon] = 'current'
  // use $scope.month to track the current chosen month number. $scope.curMon will have the month as a string
  $scope.month         = curMon
  $scope.curMon        = XTFactory.getCurrentMonth(curMon)
  // Angular auto introduces the empty option when using ng-repeat or ng-option if the initial ng-model value doesn't match any of the options for the selection box. The catch here was that all options in the selection box are strings whereas the initial value of curYear (ng-model) was integer and hence it wasn't matching. converting the curYear value into a string in order to avoid initial 'null' option in the YEARs selection box on the screen.
  $scope.curYear       = ''+curYear

  // Get the existing expenses for the current year/month when the sheet loads. At this time, also get the list of all 'YEARS' available for this sheet, all the categories and the subcategories. These lists will be loaded/reloaded only when page is loaded.
  // - When an expense for a new year is added - e.g., current list has 2017 and 2016 and expense for 2014 is added - or when an expense under new category and/or subcategory is added, the new year/category/subcategory will be appended to the existing list of years/categories/subcategories after successful addition into the DB
  populateExpenses(curYear, curMon, curSheet['sheet_id'], true)

  // reset the input form
  function resetForm(date){
    resetErr()
    $scope.expense = {
      'expense_id' : '',
      'date'       : date,
      'category'   : '',
      'subcategory': '',
      'amount'     : 0,
      'mode'       : '',
      'cardtype'   : '',
      'notes'      : ''
    }
  }

  // reset error msg
  function resetErr(){
    $scope.err     = {
      'date'       : false,
      'category'   : false,
      'subcategory': false,
      'amount'     : false,
      'mode'       : false,
      'cardtype'   : false,
      'notes'      : false
    }
    $scope.errMsg  = ''
  }

  // populateExpenses will load the expenses for given sheet, year and month. 'list' parm will indicate whether list of years has to be obtained or not.
  function populateExpenses(year, month, sheet, list){
    XTFactory.getExpenses(year, month, sheet, list, function(sheetExpenses){
      if ('error' in sheetExpenses){
        console.log(sheetExpenses['error'])
      } else {
        $scope.sheetExpenses    = sheetExpenses['expenses']
        if (list){
          if (!sheetExpenses['years'].length){
            $scope.years        = [{year: year}]
          } else {
            $scope.years        = sheetExpenses['years']
          }
          $scope.categories     = sheetExpenses['categories']
          $scope.subcategories  = sheetExpenses['subcategories']
        }
      }
    })
  }

  // reset the summary table
  function resetSummary(){
    $scope.inFlow        = 0
    $scope.outFlow       = 0
    $scope.totCashFlow   = 0
    $scope.cashFlowStyle = {'background-color': 'black'}
  }

  // Highlight selected month. Selection can happen either by clicking on the month or by adding an expense for a specific month
  function highlightMonth(month){
    for (let i = 0; i < 12; i++){
      $scope.class[i] = ''
    }
    $scope.class[month] = 'current'
    $scope.month        = month
    $scope.curMon       = XTFactory.getCurrentMonth(month)
  }

  // Change the year selection to reflect the year of the just added expense. This also handles adding a new year to the year list if required
  function setCurYear(year){
    if (!$scope.years.reduce((s, v) => {return s += ((v.year == year) ? 1 : 0)}, 0)){
      $scope.years.push({year: year})
      $scope.years.sort((a, b) => {return b.year - a.year})
    }

    $scope.curYear = ''+year
  }

  // Make sure the list of categories and subcategories is maintained up-to-date for this session
  function maintainCatSubCat(cat, subcat){
    if (!$scope.categories.reduce((s, v) => {return s += ((v.category == cat) ? 1 : 0)}, 0)){
      $scope.categories.push({category: cat})
      $scope.categories.sort((a, b) => {return a.category - b.category})
    }

    if (!$scope.subcategories.reduce((s, v) => {return s += ((v.subcategory == subcat) ? 1 : 0)}, 0)){
      $scope.subcategories.push({subcategory: subcat})
      $scope.subcategories.sort((a, b) => {return a.subcategory - b.subcategory})
    }
  }

  // Change the given string to a Capitalized string
  function capitalize(str){
    return `${str.substr(0,1).toUpperCase()}${str.substr(1).toLowerCase()}`
  }

  // validate the expense detail input
  function isValidExpense(){
    let msg = false

    resetErr()

    if (!$scope.expense['date']){
      $scope.err['date']        = true
      msg                       = true
    }
    if (!$scope.expense['category']){
      $scope.err['category']    = true
      msg                       = true
    }
    if (!$scope.expense['subcategory']){
      $scope.err['subcategory'] = true
      msg                       = true
    }
    if (!$scope.expense['amount']){
      $scope.err['amount']      = true
      msg                       = true
    }
    if (!$scope.expense['mode']){
      $scope.err['mode']        = true
      msg                       = true
    }

    if (msg){
      $scope.errMsg             = `Field(s) marked cannot be empty`
      return false
    }

    if (($scope.expense['mode'] == 'Card') && ($scope.expense['cardtype'] == '')){
      $scope.err['cardtype']    = true
      $scope.errMsg             = `Please fill in Card Provider info`
      return false
    }

    if (/[^a-zA-Z0-9]+/.test($scope.expense['category'])){
      $scope.err['category']    = true
      $scope.errMsg             = `Category must be an alphanumeric word`
      return false
    }

    if (/[^a-zA-Z0-9]+/.test($scope.expense['subcategory'])){
      $scope.err['subcategory'] = true
      $scope.errMsg             = `Sub-Category must be an alphanumeric word`
      return false
    }

    if (/[^a-zA-Z0-9\-\.\, ]+/.test($scope.expense['notes'])){
      $scope.err['notes']       = true
      $scope.errMsg             = `Notes must have only alphanumeric, hyphen, dot and comma characters`
      return false
    }

    return true
  }

  // controller methods
  // Home
  $scope.goHome = function(event){
    event.stopImmediatePropagation()
    $location.url('/')
  }

  // Toggle the dropdown from user name
  $scope.toggleDropdown = function(event, close=null){
    // since I am using nested ng-click events, am capturing the click event and stopping propagation so that the nested ng-click events dont get triggered automatically.
    event.stopImmediatePropagation()

    // Toggle the display of the user dropdown
    $scope.userDropdown['display'] = (($scope.userDropdown['display'] == 'none') ? 'flex' : 'none')

    // If the click event is from anywhere else on the page, make sure that the user dropdown is closed.
    if (close){
      $scope.userDropdown['display'] = 'none'
    }
  }

  // my Profile
  $scope.showProfile = function(event){
    event.stopImmediatePropagation()
    $location.url('/profile')
  }

  // Reset password
  $scope.resetPwd = function(event){
    event.stopImmediatePropagation()
    $location.url('/resetPwd')
  }

  // Signout
  $scope.signOut = function(event){
    event.stopImmediatePropagation()
    XTFactory.signOut()
    $location.url('/')
  }

  // show expense entry form
  $scope.showForm = function(){
    $scope.displayForm['display']   = 'flex'
    $scope.displayButton['display'] = 'none'
    resetForm(curDate)
  }

  // close the expense entry form
  $scope.hideForm = function(){
    $scope.displayForm['display']   = 'none'
    $scope.displayButton['display'] = 'flex'
  }

  // reset the form fields
  $scope.resetForm = function(date){
    resetForm(date)
  }

  // Save the entered / modified expense details
  $scope.saveExpense = function(){
    if (isValidExpense()){
      let expense = {
        day         : $scope.expense['date'].getDate(),
        month       : $scope.expense['date'].getMonth(),
        year        : $scope.expense['date'].getFullYear(),
        category    : capitalize($scope.expense['category']),
        subcategory : capitalize($scope.expense['subcategory']),
        amount      : $scope.expense['amount'],
        mode        : $scope.expense['mode'],
        cardtype    : $scope.expense['cardtype'],
        notes       : $scope.expense['notes'],
        sheetId     : curSheet['sheet_id']
      }
      curDate = $scope.expense['date']
      if ($scope.expense['expense_id']){
        expense['expenseId'] = $scope.expense['expense_id']
        XTFactory.updateExpense(expense, function(updatedExpenses){
          if ('error' in updatedExpenses){
            $scope.errMsg = updatedExpenses['error']
          } else {
            highlightMonth(curDate.getMonth())
            setCurYear(curDate.getFullYear())
            maintainCatSubCat(capitalize($scope.expense['category']), capitalize($scope.expense['subcategory']))
            resetForm(curDate)
            resetSummary()
            $scope.sheetExpenses = updatedExpenses['expenses']
          }
        })
      } else {
        XTFactory.saveExpense(expense, function(sheetExpenses){
          if ('error' in sheetExpenses){
            $scope.errMsg = sheetExpenses['error']
          } else {
            highlightMonth(curDate.getMonth())
            setCurYear(curDate.getFullYear())
            maintainCatSubCat(capitalize($scope.expense['category']), capitalize($scope.expense['subcategory']))
            resetForm(curDate)
            resetSummary()
            $scope.sheetExpenses = sheetExpenses['expenses']
          }
        })
      }
    }
  }

  // calculate the sheet summary as the sheet is getting populated
  $scope.sheetSummary = function(amt){
    if (amt > 0){
      $scope.outFlow += amt
    } else {
      $scope.inFlow  += amt
    }

    $scope.totCashFlow = ($scope.inFlow + $scope.outFlow).toFixed(2)

    if ($scope.totCashFlow < 0){
      $scope.totCashFlow = $scope.totCashFlow * -1
      $scope.cashFlowStyle['background-color'] = 'green'
    } else if ($scope.totCashFlow > 0){
      $scope.cashFlowStyle['background-color'] = 'red'
    } else {
      $scope.cashFlowStyle['background-color'] = 'black'
    }
  }

  // Get expense details for the month clicked. This will get called when the month selection is changed.
  $scope.getThisMonth = function(month){
    highlightMonth(month)
    resetSummary()
    populateExpenses($scope.curYear, $scope.month, curSheet['sheet_id'], false)
  }

  // Get expense for the current selected year and current selected month. This will get called when the value in the year drop down is changed. The month will be the same month at the time the dropdown value was changed. e.g., if current view is 2017, Apr and year is changed to 2016, it will show 2016, Apr
  $scope.changeYear = function(){
    resetSummary()
    populateExpenses($scope.curYear, $scope.month, curSheet['sheet_id'], false)
  }

  // convert the month number in sheetExpenses into text
  $scope.monthText = function(monthNumber){
    return XTFactory.getCurrentMonth(monthNumber)
  }

  // Edit a specific expense row
  $scope.editExpense = function(expIdx){
    var date = new Date($scope.sheetExpenses[expIdx]['year'], $scope.sheetExpenses[expIdx]['month'], $scope.sheetExpenses[expIdx]['day'])
    $scope.expense = {
      'expense_id' : $scope.sheetExpenses[expIdx]['expense_id'],
      'date'       : date,
      'category'   : $scope.sheetExpenses[expIdx]['category'],
      'subcategory': $scope.sheetExpenses[expIdx]['subcategory'],
      'amount'     : $scope.sheetExpenses[expIdx]['amount'],
      'mode'       : $scope.sheetExpenses[expIdx]['mode'],
      'cardtype'   : $scope.sheetExpenses[expIdx]['cardtype'],
      'notes'      : $scope.sheetExpenses[expIdx]['notes']
    }

    $scope.displayForm['display']   = 'flex'
    $scope.displayButton['display'] = 'none'
  }

  // Delete a specific expense row
  $scope.deleteExpense = function(expIdx){
    var expense = {
      'sheetId'  : curSheet['sheet_id'],
      'year'     : $scope.sheetExpenses[expIdx]['year'],
      'month'    : $scope.sheetExpenses[expIdx]['month'],
      'expenseId': $scope.sheetExpenses[expIdx]['expense_id']
    }
    XTFactory.deleteExpense(expense, function(updatedExpenses){
      if ('error' in updatedExpenses){
        $scope.errMsg = updatedExpenses['error']
      } else {
        $scope.errMsg = ''
        highlightMonth($scope.sheetExpenses[expIdx]['month'])
        setCurYear($scope.sheetExpenses[expIdx]['year'])
        resetSummary()
        $scope.sheetExpenses = updatedExpenses['expenses']
      }
    })
  }
}])
