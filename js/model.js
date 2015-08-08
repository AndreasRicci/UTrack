'use strict';

var ACTIVITY_DATA_ADDED_EVENT = 'ACTIVITY_DATA_ADDED_EVENT';
var ACTIVITY_DATA_REMOVED_EVENT = 'ACTIVITY_DATA_REMOVED_EVENT';

var GRAPH_SELECTED_EVENT = 'GRAPH_SELECTED_EVENT';

var ACTIVITY_TYPES = [
    "Studying",
    "Eating",
    "Coding",
    "Exercising",
    "Gaming"
];

var PAGE_NAMES = {
    home: "home_page",
    input: "input_page",
    analysis: "analysis_page",
    remove_data: "remove_data_page"
};

var GRAPH_NAMES = {
    table_summary: "table_summary",
    bar_graph: "bar_graph"
};

/**
 * An object which tracks page related data
 * @constructor
 */
var PageModel = function () {
    // What page are we currently looking at?
    this.currentlySelectedPageName = null;

    // All available page names
    this.availablePageNames = [];

    // Callback functions with the signature as described below
    this.listeners = [];
};

// _ is the Underscore library
// This extends the JavaScript prototype with additional methods
// This is a common idiom for defining JavaScript classes
_.extend(PageModel.prototype, {

    /**
     * Add a listener to the listeners we track
     * @param listener The listener is a callback function with the following signature:
     * (eventData) where eventData indicates the name of the new page.
     */
    addListener: function (listener) {
        this.listeners.push(listener);
    },

    /**
     * Should remove the given listener.
     * @param listener
     */
    removeListener: function (listener) {
        this.listeners = _.without(this.listeners, listener);
    },

    /**
     * Should return the name of the currently selected page.
     */
    getNameOfCurrentlySelectedPage: function () {
        return this.currentlySelectedPageName;
    },

    /**
     * Returns a list of pages (strings) that can be selected by the user
     */
    getAvailablePageNames: function () {
        return this.availablePageNames;
    },

    /**
     * Adds to the list of available page names
     */
    addAvailablePageName: function (pageName) {
        this.availablePageNames.push(pageName)
    },

    /**
     * Changes the currently selected page to the page name given. Should
     * broadcast an event to all listeners that the page changed.
     * @param pageName
     */
    selectPage: function (pageName) {
        if (this.currentlySelectedPageName == pageName) {
            return;
        }

        // Change the page
        this.currentlySelectedPageName = pageName;

        // Notify listeners that the page has changed
        _.each(
            this.listeners,
            function (listener) {
                listener(pageName);
            }
        );
    }
});

/**
 * Represents a single activity data point.
 * @param activityType The type of activity. A string
 * @param healthMetricsDict A dictionary of different health metrics. The key is the
 * health data type (e.g., energy level, stress level, etc.), while the value is
 * the value the user gave to that activity.
 * @param activityDurationInMinutes A number
 * @constructor
 */
var ActivityData = function (activityType, healthMetricsDict, activityDurationInMinutes) {
    ActivityData.numInstancesCreated = (ActivityData.numInstancesCreated || 0) + 1;

    this.uniqueId = ActivityData.numInstancesCreated;
    this.activityType = activityType;
    this.activityDataDict = healthMetricsDict;
    this.activityDurationInMinutes = activityDurationInMinutes;
};

/**
 * An object which tracks all of the data
 * @constructor
 */
var ActivityStoreModel = function () {
    // All activity data points
    this.activityDataPoints = [];

    // Callback functions with the signature as described below
    this.listeners = [];
};

// _ is the Underscore library
// This extends the JavaScript prototype with additional methods
// This is a common idiom for defining JavaScript classes
_.extend(ActivityStoreModel.prototype, {

    /**
     * Add a listener to the listeners we track
     * @param listener The listener is a callback function with the following signature:
     * (eventType, eventTime, activityData) where eventType is a string indicating
     * the event type (one of ACTIVITY_DATA_ADDED_EVENT or ACTIVITY_DATA_REMOVED_EVENT), and
     * activityData the ActivityData added or removed.
     */
    addListener: function (listener) {
        this.listeners.push(listener);
    },

    /**
     * Should remove the given listener.
     * @param listener
     */
    removeListener: function (listener) {
        this.listeners = _.without(this.listeners, listener);
    },

    /**
     * Should add the given data point, and alert listeners that a new data point has
     * been added.
     * @param activityDataPoint
     */
    addActivityDataPoint: function (activityDataPoint) {
        // Validate the data point
        var health = activityDataPoint.activityDataDict;
        var time = activityDataPoint.activityDurationInMinutes;
        if (!isInt(health.energyLevel) || health.energyLevel < 1 || health.energyLevel > 5
            || !isInt(health.stressLevel) || health.stressLevel < 1 || health.stressLevel > 5
            || !isInt(health.happinessLevel) || health.happinessLevel < 1 || health.happinessLevel > 5
            || !isNumeric(time) || time < 0) {
            return; // Error with data point
        }

        // Add the data point
        this.activityDataPoints.push(activityDataPoint);

        // Notify listeners that the data point was added
        var currentTime = (new Date()).getTime();
        _.each(
            this.listeners,
            function (listener) {
                listener(ACTIVITY_DATA_ADDED_EVENT, currentTime, activityDataPoint);
            }
        );
    },

    /**
     * Should remove the given data point (if it exists), and alert listeners that
     * it was removed. It should not alert listeners if that data point did not
     * exist in the data store
     * @param activityDataPoint
     */
    removeActivityDataPoint: function (activityDataPoint) {
        var prevLength = this.activityDataPoints.length;

        // Remove the data point
        this.activityDataPoints = _.without(this.activityDataPoints, activityDataPoint);

        if (this.activityDataPoints.length == prevLength) return; // Nothing removed

        // Notify listeners that the data point was removed
        var currentTime = (new Date()).getTime();
        _.each(
            this.listeners,
            function (listener) {
                listener(ACTIVITY_DATA_REMOVED_EVENT, currentTime, activityDataPoint);
            }
        );
    },

    /**
     * Should return an array of all activity data points
     */
    getActivityDataPoints: function () {
        return this.activityDataPoints;
    }
});

/**
 * The GraphModel tracks what the currently selected graph is.
 * You should structure your architecture so that when the user chooses
 * a new graph, the event handling code for choosing that graph merely
 * sets the new graph here, in the GraphModel. The graph handling code
 * should then update to show the selected graph, along with any components
 * necessary to configure that graph.
 * @constructor
 */
var GraphModel = function () {
    this.currentlySelectedGraphName = GRAPH_NAMES.table_summary;

    // All available graph names
    this.availableGraphNames = [GRAPH_NAMES.table_summary, GRAPH_NAMES.bar_graph];

    // Callback functions with the signature as described below
    this.listeners = [];
};

_.extend(GraphModel.prototype, {

    /**
     * Add a listener to the listeners we track
     * @param listener The listener is a callback function with the following signature:
     * (eventType, eventTime, eventData) where eventType is a string indicating
     * the event type (specifically, GRAPH_SELECTED_EVENT),
     * and eventData indicates the name of the new graph.
     */
    addListener: function (listener) {
        this.listeners.push(listener);
    },

    /**
     * Should remove the given listener.
     * @param listener
     */
    removeListener: function (listener) {
        this.listeners = _.without(this.listeners, listener);
    },

    /**
     * Returns a list of graphs (strings) that can be selected by the user
     */
    getAvailableGraphNames: function () {
        return this.availableGraphNames;
    },

    /**
     * Should return the name of the currently selected graph. There should
     * *always* be one graph that is currently available.
     */
    getNameOfCurrentlySelectedGraph: function () {
        return this.currentlySelectedGraphName;
    },

    /**
     * Changes the currently selected graph to the graph name given. Should
     * broadcast an event to all listeners that the graph changed.
     * @param graphName
     */
    selectGraph: function (graphName) {
        if (graphName === this.currentlySelectedGraphName) return; // Graph is already chosen

        if (!_.contains(this.availableGraphNames, graphName)) return; // Graph is not available

        // Select the graph
        this.currentlySelectedGraphName = graphName;

        // Notify listeners that the graph was selected
        var currentTime = (new Date()).getTime();
        _.each(
            this.listeners,
            function (listener) {
                listener(GRAPH_SELECTED_EVENT, currentTime, graphName);
            }
        );
    }

});

/**
 * Will generate a number of random data points and add them to the model provided.
 * If numDataPointsToGenerate is not provided, will generate and add 100 data points.
 * @param activityModel The model to add data to
 * @param numDataPointsToGenerate The number of points to generate.
 *
 * Example:
 *
 * generateFakeData(new ActivityStoreModel(), 10);
 */
function generateFakeData(activityModel, numDataPointsToGenerate) {
    numDataPointsToGenerate = (!_.isNumber(numDataPointsToGenerate) || numDataPointsToGenerate < 0) ? 100 : numDataPointsToGenerate;
    _.times(
        numDataPointsToGenerate,
        function () {
            var activityDataPoint = new ActivityData(
                ACTIVITY_TYPES[_.random(ACTIVITY_TYPES.length - 1)],
                {
                    energyLevel: _.random(1, 5),
                    stressLevel: _.random(1, 5),
                    happinessLevel: _.random(1, 5)
                },
                _.random(60)
            );
            activityModel.addActivityDataPoint(activityDataPoint);
        }
    );
}
