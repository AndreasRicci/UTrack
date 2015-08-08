'use strict';

var SHOW_CLASS = "show"; // Class used to show an element
var HIDE_CLASS = "hidden"; // Class used to hide an element

/**
 * Activity type seletboc.
 * @param id Id of the selectbox element
 * @constructor
 */
var ActivityTypeSelectbox = function (id) {
    var selectbox = document.getElementById(id);
    _.each(
        ACTIVITY_TYPES,
        function (activityType) {
            addSelectboxOption(selectbox, activityType, activityType);
        }
    );
};

/**
 * Last data entry text
 * @param id Id of the element to place the text in
 * @param activityStoreModel The activity model (see model.js)
 * @constructor
 */
var LastDataEntryAt = function (id, activityStoreModel) {
    var lastDataEntryAt = document.getElementById(id);
    activityStoreModel.addListener(function (eventType, eventTime, eventData) {
        if (eventType === ACTIVITY_DATA_ADDED_EVENT) {
            var date = new Date(eventTime);
            lastDataEntryAt.innerHTML = date.toLocaleString();
        }
    });
};

/**
 * Page.
 * @param name Used for internal referencing
 * @param pageId Id of the element where the page content is stored
 * @param pageModel The page model (see model.js)
 * @constructor
 */
var Page = function (name, pageId, pageModel) {
    this.name = name;
    this.container = document.getElementById(pageId);

    var that = this;

    this.handlePageSelectEvent = function (eventData) {
        if (eventData === that.name) {
            addClass(that.container, SHOW_CLASS);
        } else {
            removeClass(that.container, SHOW_CLASS);
        }
    };

    // Wire up a default page change event handler
    pageModel.addListener(this.handlePageSelectEvent);

    // Let the page model know we are available
    pageModel.addAvailablePageName(this.name);
};

/**
 * Nav bar link.
 * @param pageName Name of page it links to
 * @param linkId Id of the element where the link is held
 * @param pageModel The page model (see model.js)
 * @constructor
 */
var NavBarLink = function (pageName, linkId, pageModel) {
    this.pageName = pageName;
    this.link = document.getElementById(linkId);

    var that = this;

    this.handlePageSelectEvent = function (eventData) {
        if (eventData === that.pageName) {
            addClass(that.link.parentNode, "active");
        } else {
            removeClass(that.link.parentNode, "active");
        }
    };

    // React to the link being clicked
    this.link.addEventListener("click", function (event) {
        event.preventDefault(); // Prevent the URL from changing

        pageModel.selectPage(that.pageName);

        that.link.blur(); // Remove focus
    });

    // Wire up a default page change event handler
    pageModel.addListener(this.handlePageSelectEvent);
};

/**
 * Graph tab.
 * @param graphName Name of graph it links to show
 * @param tabId Id of the element where the tab is held
 * @param graphModel The graph model (see model.js)
 * @constructor
 */
var GraphTab = function (graphName, tabId, graphModel) {
    this.graphName = graphName;
    this.tab = document.getElementById(tabId);

    var that = this;

    this.handleGraphSelectEvent = function (eventType, eventTime, eventData) {
        switch (eventType) {
            case GRAPH_SELECTED_EVENT:
                if (eventData === that.graphName) {
                    addClass(that.tab.parentNode, "active");
                } else {
                    removeClass(that.tab.parentNode, "active");
                }

                break;
            default:
                console.log("ERROR: Got event type '" + eventType + "' but expected one of: '" + GRAPH_SELECTED_EVENT + "'");
        }
    };

    // React to the tab being clicked
    this.tab.addEventListener("click", function (event) {
        event.preventDefault(); // Prevent the URL from changing

        graphModel.selectGraph(that.graphName);

        that.tab.blur(); // Remove focus
    });

    // Wire up a default graph change event handler
    graphModel.addListener(this.handleGraphSelectEvent);
};

/**
 * Data list
 * @param containerId Id of the element where the list is held
 * @param activityStoreModel The activity model (see model.js)
 * @constructor
 */
var DataList = function (containerId, activityStoreModel) {
    this.container = document.getElementById(containerId);

    this.tableBody = this.container.querySelector("tbody");
    this.entryTemplate = this.container.querySelector("#data_list_entry_template");

    var that = this;

    this.handleDataChangeEvent = function (eventType, eventTime, eventData) {
        switch (eventType) {
            case ACTIVITY_DATA_ADDED_EVENT:
                // Create new entry from the template
                var newEntry = document.importNode(that.entryTemplate.content, true);
                newEntry.querySelector("tr").setAttribute("id", "dataListEntryForDataPoint" + eventData.uniqueId);

                var entryCells = newEntry.querySelectorAll("td");
                entryCells[0].textContent = eventData.activityType;
                entryCells[1].textContent = eventData.activityDataDict.energyLevel;
                entryCells[2].textContent = eventData.activityDataDict.stressLevel;
                entryCells[3].textContent = eventData.activityDataDict.happinessLevel;
                entryCells[4].textContent = eventData.activityDurationInMinutes;
                entryCells[5].textContent = (new Date(eventTime)).toLocaleString();

                // Wire up the delete button
                var deleteButton = newEntry.querySelector(".btn-danger");
                deleteButton.addEventListener("click", function () {
                    activityStoreModel.removeActivityDataPoint(eventData);

                    deleteButton.blur(); // Remove focus
                });

                // Add new entry to beginning of table
                that.tableBody.insertBefore(newEntry, that.tableBody.firstChild);

                break;
            case ACTIVITY_DATA_REMOVED_EVENT:
                removeElementById("dataListEntryForDataPoint" + eventData.uniqueId);
                break;
            default:
                console.log("ERROR: Got event type '" + eventType + "' but expected one of: '" + ACTIVITY_DATA_ADDED_EVENT + "', '" + ACTIVITY_DATA_REMOVED_EVENT + "'");
        }
    };

    // Wire up a default page change event handler
    activityStoreModel.addListener(this.handleDataChangeEvent);
};

/**
 * Table summary.
 * @param attachToElement The DOM element to append the graph to.
 * @param activityStoreModel The activity model (see model.js)
 * @param graphModel The graph model (see model.js)
 * @constructor
 */
var TableSummary = function (attachToElement, activityStoreModel, graphModel) {
    this.name = GRAPH_NAMES.table_summary;
    this.entryTracker = {};
    this.timeTracker = {};

    var that = this;

    // Add the skeleton DOM elements from the template
    attachToElement.appendChild(document.importNode((document.getElementById(this.name + "_template")).content, true));
    this.container = document.getElementById(this.name + "_container");
    this.tableBody = this.container.querySelector("tbody");
    this.entryTemplate = this.container.querySelector("#table_summary_entry_template");

    // Redraw the graph (presumably, this is only called when data is modified)
    var redrawFor = function (activityType) {
        var redrawEntry = that.container.querySelector("#tableSummaryEntryFor" + activityType);
        var entryCells = redrawEntry.querySelectorAll("td");
        entryCells[1].textContent = that.entryTracker[activityType];
        entryCells[2].textContent = that.timeTracker[activityType];
        entryCells[3].textContent = Math.round(that.timeTracker[activityType] / Math.max(that.entryTracker[activityType], 1) * 100) / 100;
    };

    // Initialize trackers and table body
    _.each(
        ACTIVITY_TYPES,
        function (activityType) {
            var activityName = activityType;
            var activityType = activityType.replace(/ /g, "");

            that.entryTracker[activityType] = 0;
            that.timeTracker[activityType] = 0;

            // Create new entry from the template
            var newEntry = document.importNode(that.entryTemplate.content, true);
            newEntry.querySelector("tr").setAttribute("id", "tableSummaryEntryFor" + activityType);

            var entryCells = newEntry.querySelectorAll("td");
            entryCells[0].textContent = activityName;

            // Add new entry to end of table
            that.tableBody.appendChild(newEntry);

            redrawFor(activityType);
        }
    );

    this.handleDataChangeEvent = function (eventType, eventTime, eventData) {
        switch (eventType) {
            case ACTIVITY_DATA_ADDED_EVENT:
                var activityType = eventData.activityType.replace(/ /g, "");
                that.entryTracker[activityType]++;
                that.timeTracker[activityType] += eventData.activityDurationInMinutes;

                redrawFor(activityType);

                break;
            case ACTIVITY_DATA_REMOVED_EVENT:
                var activityType = eventData.activityType.replace(/ /g, "");
                that.entryTracker[activityType]--;
                that.timeTracker[activityType] -= eventData.activityDurationInMinutes;

                redrawFor(activityType);

                break;
            default:
                console.log("ERROR: Got event type '" + eventType + "' but expected one of: '" + ACTIVITY_DATA_ADDED_EVENT + "', '" + ACTIVITY_DATA_REMOVED_EVENT + "'");
        }
    };

    this.handleGraphSelectEvent = function (eventType, eventTime, eventData) {
        switch (eventType) {
            case GRAPH_SELECTED_EVENT:
                if (eventData === that.name) {
                    addClass(that.container, SHOW_CLASS);
                } else {
                    removeClass(that.container, SHOW_CLASS);
                }

                break;
            default:
                console.log("ERROR: Got event type '" + eventType + "' but expected one of: '" + GRAPH_SELECTED_EVENT + "'");
        }
    };

    // Wire up a default data change event listener
    activityStoreModel.addListener(this.handleDataChangeEvent);

    // Wire up a default graph change event handler
    graphModel.addListener(this.handleGraphSelectEvent);
};

/**
 * Bar Graph.
 * @param attachToElement The DOM element to append the graph to.
 * @param activityStoreModel The activity model (see model.js)
 * @param graphModel The graph model (see model.js)
 * @constructor
 */
var BarGraph = function (attachToElement, activityStoreModel, graphModel) {
    this.name = GRAPH_NAMES.bar_graph;
    this.redraw = null;

    // Add the skeleton DOM elements from the template
    attachToElement.appendChild(document.importNode((document.getElementById(this.name + "_template")).content, true));
    this.container = document.getElementById(this.name + "_container");

    var that = this;

    // Data to use when displaying this graph
    var dataFor = {};
    _.each(
        ACTIVITY_TYPES,
        function (activityType) {
            var activityName = activityType;
            var activityType = activityType.replace(/ /g, "");

            dataFor[activityType] = {
                name: activityName, // Name for display purposes
                entries: 0, // Total number of entries of this type
                energyTotal: 0, // Total energy level for this activity type
                stressTotal: 0, // Total stress level for this activity type
                happinessTotal: 0, // Total happiness level for this activity type
                show: true // Show this data?
            };
        }
    );

    // Graph options
    this.checkboxTemplate = this.container.querySelector("#bar_graph_checkbox_template");
    this.checkboxContainer = this.container.querySelector("#bar_graph_checkbox_container");
    _.each(
        ACTIVITY_TYPES,
        function (activityType) {
            var activityName = activityType;
            var activityType = activityType.replace(/ /g, "");

            // Create new entry from the template
            var newCheckbox = document.importNode(that.checkboxTemplate.content, true);
            var cb = newCheckbox.querySelector(".checkbox-inline");
            cb.setAttribute("id", "barGraphCheckboxFor" + activityType);
            var cbLabel = newCheckbox.querySelector("label");
            cbLabel.appendChild(document.createTextNode(activityName));

            // Wire up event listener
            cb.addEventListener("click", function () {
                dataFor[activityType].show = cb.checked;
                that.redraw();
            });

            // Add new entry to end of table
            that.checkboxContainer.appendChild(newCheckbox);
        }
    );

    // Get the canvas and its context
    var canvas = this.container.querySelector("#bar_graph");
    var context = canvas.getContext("2d");
    var canvasHeight = canvas.height;
    var canvasWidth = canvas.width;
    var top = 40; // Buffer room for better display
    var height = canvasHeight - top * 2; // Buffer room for better display

    // Prepare some settings for the graph
    var gapBetweenBars = 5; // Between two bars in the same section
    var gapBetweenBarSections = 40; // For example, between two categories
    var barWidth = 20; // Width of each bar
    var yAxisLabelWidth = 50;

    // Create fill colours for bars. Used tool: http://victorblog.com/html5-canvas-gradient-creator/
    var energyBarFill = context.createLinearGradient(150.000, 300.000, 150.000, 0.000);
    energyBarFill.addColorStop(0.000, 'rgba(216, 104, 0, 1.000)');
    energyBarFill.addColorStop(1.000, 'rgba(255, 179, 109, 1.000)');
    var stressBarFill = context.createLinearGradient(150.000, 300.000, 150.000, 0.000);
    stressBarFill.addColorStop(0.000, 'rgba(201, 201, 0, 1.000)');
    stressBarFill.addColorStop(1.000, 'rgba(247, 247, 86, 1.000)');
    var happinessBarFill = context.createLinearGradient(150.000, 300.000, 150.000, 0.000);
    happinessBarFill.addColorStop(0.000, 'rgba(0, 147, 0, 1.000)');
    happinessBarFill.addColorStop(1.000, 'rgba(119, 255, 119, 1.000)');

    // Redraw the graph (presumably, this is only called when data is modified)
    this.redraw = function () {
        // Clear all
        context.clearRect(0, 0, canvasWidth, canvasHeight);

        // Draw background
        context.fillStyle = "#F7F7F7";
        context.strokeStyle = "#DADADA";
        canvasUtils.drawRectangle(context, 0, 0, canvasWidth, canvasHeight);

        // Draw y-axis
        var scaleSteps = 5; // Health metrics go from 1 to 5
        var scaleStepSize = height / scaleSteps;
        var yAxisLabel = scaleSteps;
        for (var y = top; y <= canvasHeight; y += scaleStepSize) {
            canvasUtils.drawLine(context, 30, y, canvasWidth, y);

            // Text labeling of scale
            context.fillStyle = "black";
            context.font = "14px Arial";
            context.fillText(yAxisLabel, 10, y + 5);
            yAxisLabel--;
        }

        // Draw legend
        var legendDrawX = canvasWidth / 3.5;
        var legendKeyY = top - 15;

        // Draw energy legend entry
        var legendValueTop = top - 27;
        var legendValueSize = 15;
        context.fillStyle = energyBarFill;
        canvasUtils.drawRectangle(context, legendDrawX, legendValueTop, legendValueSize, legendValueSize);
        legendDrawX += legendValueSize * 1.5;
        context.fillStyle = "black";
        context.font = "12px Arial";
        context.fillText("Average energy", legendDrawX, legendKeyY);
        legendDrawX += 110;

        // Draw stress legend entry
        context.fillStyle = stressBarFill;
        canvasUtils.drawRectangle(context, legendDrawX, legendValueTop, legendValueSize, legendValueSize);
        legendDrawX += legendValueSize * 1.5;
        context.fillStyle = "black";
        context.fillText("Average stress", legendDrawX, legendKeyY);
        legendDrawX += 110;

        // Draw happiness legend entry
        context.fillStyle = happinessBarFill;
        canvasUtils.drawRectangle(context, legendDrawX, legendValueTop, legendValueSize, legendValueSize);
        legendDrawX += legendValueSize * 1.5;
        context.fillStyle = "black";
        context.fillText("Average happiness", legendDrawX, legendKeyY);

        // Draw the graph, section by section
        var currentBarX = yAxisLabelWidth + gapBetweenBarSections / 4;
        for (var i = 0; i < ACTIVITY_TYPES.length; i++) {
            // Gather relevant data
            var activityType = ACTIVITY_TYPES[i].replace(/ /g, "");
            var dataForType = dataFor[activityType];

            if (!dataForType.show) continue; // Don't show this type

            // Interpret data for display
            var displayName = dataForType.name;
            var averageEnergy = Math.round(dataForType.energyTotal / Math.max(dataForType.entries, 1) * 10) / 10;
            var averageStress = Math.round(dataForType.stressTotal / Math.max(dataForType.entries, 1) * 10) / 10;
            var averageHappiness = Math.round(dataForType.happinessTotal / Math.max(dataForType.entries, 1) * 10) / 10;

            // Display name
            context.fillStyle = "black";
            context.font = "14px Arial";
            context.fillText(displayName, currentBarX, top + height + 20);

            // Display energy
            context.fillStyle = energyBarFill;
            canvasUtils.drawRectangle(context, currentBarX, top + height, barWidth, -(averageEnergy / scaleSteps) * height);
            currentBarX += barWidth + gapBetweenBars;

            // Display stress
            context.fillStyle = stressBarFill;
            canvasUtils.drawRectangle(context, currentBarX, top + height, barWidth, -(averageStress / scaleSteps) * height);
            currentBarX += barWidth + gapBetweenBars;

            // Display happiness
            context.fillStyle = happinessBarFill;
            canvasUtils.drawRectangle(context, currentBarX, top + height, barWidth, -(averageHappiness / scaleSteps) * height);
            currentBarX += barWidth + gapBetweenBarSections;
        }
    };

    this.handleDataChangeEvent = function (eventType, eventTime, eventData) {
        switch (eventType) {
            case ACTIVITY_DATA_ADDED_EVENT:
                var activityType = eventData.activityType.replace(/ /g, "");

                var healthData = eventData.activityDataDict;
                dataFor[activityType].entries++;
                dataFor[activityType].energyTotal += healthData.energyLevel;
                dataFor[activityType].stressTotal += healthData.stressLevel;
                dataFor[activityType].happinessTotal += healthData.happinessLevel;

                that.redraw();

                break;
            case ACTIVITY_DATA_REMOVED_EVENT:
                var activityType = eventData.activityType.replace(/ /g, "");

                var healthData = eventData.activityDataDict;
                dataFor[activityType].entries--;
                dataFor[activityType].energyTotal -= healthData.energyLevel;
                dataFor[activityType].stressTotal -= healthData.stressLevel;
                dataFor[activityType].happinessTotal -= healthData.happinessLevel;

                that.redraw();

                break;
            default:
                console.log("ERROR: Got event type '" + eventType + "' but expected one of: '" + ACTIVITY_DATA_ADDED_EVENT + "', '" + ACTIVITY_DATA_REMOVED_EVENT + "'");
        }
    };

    this.handleGraphSelectEvent = function (eventType, eventTime, eventData) {
        switch (eventType) {
            case GRAPH_SELECTED_EVENT:
                if (eventData === that.name) {
                    addClass(that.container, SHOW_CLASS);
                } else {
                    removeClass(that.container, SHOW_CLASS);
                }

                break;
            default:
                console.log("ERROR: Got event type '" + eventType + "' but expected one of: '" + GRAPH_SELECTED_EVENT + "'");
        }
    };

    // Wire up a default data change event listener
    activityStoreModel.addListener(this.handleDataChangeEvent);

    // Wire up a default graph change event handler
    graphModel.addListener(this.handleGraphSelectEvent);

    // Draw initial graph
    this.redraw();
};
