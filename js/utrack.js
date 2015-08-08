'use strict';

// Main setup
window.addEventListener("load", function () {
    ///////////////////////////////////////////////////////////////////////
    // Deal with basic setup of the application data ("model" type stuff)
    ///////////////////////////////////////////////////////////////////////

    var pageModel = new PageModel();
    var activityStoreModel = new ActivityStoreModel();
    var graphModel = new GraphModel();

    // Add our Pages
    var homePage = new Page(PAGE_NAMES.home, "home_page", pageModel);
    var addDataPage = new Page(PAGE_NAMES.input, "input_page", pageModel);
    var analyzePage = new Page(PAGE_NAMES.analysis, "analysis_page", pageModel);
    var removeDataPage = new Page(PAGE_NAMES.remove_data, "remove_data_page", pageModel);

    ///////////////////////////////////////////////////////////////////////
    // Deal with data input ("controller" type stuff)
    ///////////////////////////////////////////////////////////////////////

    // Add nav bar links
    var homeLink = new NavBarLink(PAGE_NAMES.home, "homeLink", pageModel);
    var addDataLink = new NavBarLink(PAGE_NAMES.input, "addDataLink", pageModel);
    var analyzeDataLink = new NavBarLink(PAGE_NAMES.analysis, "analyzeDataLink", pageModel);
    var removeDataLink = new NavBarLink(PAGE_NAMES.remove_data, "removeDataLink", pageModel);

    // Set up selectbox options for activity type
    var activityTypeSelectbox = new ActivityTypeSelectbox("activityTypeSelectbox");

    // Set up form submission
    var addDataForm = document.getElementById("addDataForm");
    addDataForm.addEventListener("submit", function (event) {
        // Prevent the page from refreshing
        event.preventDefault();

        // Remove focus from submit button (might have been clicked)
        document.getElementById("addDataPointButton").blur();

        // Gather input
        var activityType = document.getElementById("activityTypeSelectbox").value;
        var energyLevel = radioGroupValue("energyLevel");
        var stressLevel = radioGroupValue("stressLevel");
        var happinessLevel = radioGroupValue("happinessLevel");
        var minutesSpent = document.getElementById("timeSpentMinutes").value;

        // Validate input and show errors if appropriate
        var hasError = false; // Flag to stop processing new data point

        if (energyLevel == null) {
            hasError = true;
            addClass(document.getElementById("energyLevelError"), SHOW_CLASS);
        } else {
            removeClass(document.getElementById("energyLevelError"), SHOW_CLASS);
        }

        if (stressLevel == null) {
            hasError = true;
            addClass(document.getElementById("stressLevelError"), SHOW_CLASS);
        } else {
            removeClass(document.getElementById("stressLevelError"), SHOW_CLASS);
        }

        if (happinessLevel == null) {
            hasError = true;
            addClass(document.getElementById("happinessLevelError"), SHOW_CLASS);
        } else {
            removeClass(document.getElementById("happinessLevelError"), SHOW_CLASS);
        }

        if (!isNumeric(minutesSpent) || parseFloat(minutesSpent) < 0) {
            hasError = true;
            addClass(document.getElementById("timeSpentMinutesError"), SHOW_CLASS);
        } else {
            removeClass(document.getElementById("timeSpentMinutesError"), SHOW_CLASS);
        }

        // If we have an error, break out now and do not add the new data point
        if (hasError) {
            // Show error message and hide previous success message, if one existed
            removeClass(document.getElementById("formSuccess"), SHOW_CLASS);
            addClass(document.getElementById("formError"), SHOW_CLASS);

            return false;
        }

        // Add new data point
        var newDataPoint = new ActivityData(activityType, {
            energyLevel: parseInt(energyLevel),
            stressLevel: parseInt(stressLevel),
            happinessLevel: parseInt(happinessLevel)
        }, parseFloat(minutesSpent));
        activityStoreModel.addActivityDataPoint(newDataPoint);

        // Show success message and hide previous error message, if one existed
        removeClass(document.getElementById("formError"), SHOW_CLASS);
        addClass(document.getElementById("formSuccess"), SHOW_CLASS);

        return true;
    });

    // Set up reset button
    var resetButton = document.getElementById("resetButton");
    resetButton.addEventListener("click", function () {
        // Hide error messages since they are no longer applicable
        var errorMessages = document.getElementsByClassName("errorMessage");
        for (var i = 0; i < errorMessages.length; i++) {
            removeClass(errorMessages[i], SHOW_CLASS);
        }

        // Hide form messages since they are no longer applicable
        var formMessages = document.getElementsByClassName("formMessage");
        for (var i = 0; i < formMessages.length; i++) {
            removeClass(formMessages[i], SHOW_CLASS);
        }

        resetButton.blur(); // Remove focus
    });

    // Set up last data entry
    var lastDataEntryAt = new LastDataEntryAt("lastDataEntryAt", activityStoreModel);

    ///////////////////////////////////////////////////////////////////////
    // Deal with data display ("view" type stuff)
    ///////////////////////////////////////////////////////////////////////

    // Create graphs
    var graphsDiv = document.getElementById("graphs");
    var summaryTable = new TableSummary(graphsDiv, activityStoreModel, graphModel);
    var barGraph = new BarGraph(graphsDiv, activityStoreModel, graphModel);

    // Create graph navigation
    var summaryTableTab = new GraphTab(GRAPH_NAMES.table_summary, "tableSummaryTab", graphModel);
    var barGraphTab = new GraphTab(GRAPH_NAMES.bar_graph, "barGraphTab", graphModel);

    // Create list view
    var dataList = new DataList("data_list_container", activityStoreModel);

    // Select default page
    pageModel.selectPage(PAGE_NAMES.home);
});
