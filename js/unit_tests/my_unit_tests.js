'use strict';

var expect = chai.expect;
describe('Second unit test', function () {

    it('Listener unit test 2 for GraphModel', function () {
        var graphModel = new GraphModel();
        var firstListener = sinon.spy();

        graphModel.addListener(firstListener);
        graphModel.selectGraph(GRAPH_NAMES.bar_graph);

        expect(firstListener.called, 'GraphModel listener should be called').to.be.ok;
        expect(firstListener.calledWith('GRAPH_SELECTED_EVENT', sinon.match.any, GRAPH_NAMES.bar_graph));

        var secondListener = sinon.spy();
        graphModel.addListener(secondListener);
        graphModel.selectGraph(GRAPH_NAMES.table_summary);
        expect(firstListener.callCount, 'GraphModel first listener should have been called twice').to.equal(2);
        expect(secondListener.callCount, 'GraphModel second listener should have been called once').to.equal(1);
    });

});

describe('Third unit test', function () {

    it('Listener unit test 3 (plus name check) for GraphModel', function () {
        var graphModel = new GraphModel();
        var firstListener = sinon.spy();

        graphModel.addListener(firstListener);
        graphModel.selectGraph(GRAPH_NAMES.bar_graph);

        expect(firstListener.called, 'GraphModel listener should be called').to.be.ok;
        expect(firstListener.calledWith('GRAPH_SELECTED_EVENT', sinon.match.any, GRAPH_NAMES.bar_graph));

        graphModel.removeListener(firstListener);

        graphModel.selectGraph(GRAPH_NAMES.table_summary);

        expect(firstListener.callCount, 'GraphModel first listener should have been called once (since it was removed)').to.equal(1);
        expect(graphModel.getNameOfCurrentlySelectedGraph(), "Graph name").to.equal(GRAPH_NAMES.table_summary);
        graphModel.selectGraph(GRAPH_NAMES.bar_graph);
        expect(graphModel.getNameOfCurrentlySelectedGraph(), "Graph name").to.equal(GRAPH_NAMES.bar_graph);

        expect(graphModel.getAvailableGraphNames().length, "Num available graphs > 0").to.not.equal(0);
    });

});

describe('Fourth unit test', function () {

    it('Listener unit test 1 (plus array checks) for ActivityStoreModel', function () {
        var activityStoreModel = new ActivityStoreModel();
        var firstListener = sinon.spy();
        var d1 = new ActivityData("ABC", {energyLevel: 1, stressLevel: 2, happinessLevel: 3}, 30);
        var d2 = new ActivityData("ABC", {energyLevel: 1, stressLevel: 2, happinessLevel: 3}, 30);

        expect(activityStoreModel.getActivityDataPoints().length, "Num available data points 0").to.equal(0);

        activityStoreModel.addActivityDataPoint(d1);

        expect(activityStoreModel.getActivityDataPoints().length, "Num available data points 1").to.equal(1);

        expect(firstListener.callCount, 'First listener should not have been called yet').to.equal(0);

        activityStoreModel.addListener(firstListener);

        activityStoreModel.addActivityDataPoint(d2);

        expect(activityStoreModel.getActivityDataPoints().length, "Num available data points 2").to.equal(2);

        expect(firstListener.callCount, 'First listener should have been called').to.equal(1);

        activityStoreModel.removeActivityDataPoint(d2);

        expect(activityStoreModel.getActivityDataPoints().length, "Num available data points 1").to.equal(1);

        activityStoreModel.removeActivityDataPoint(d1);

        expect(activityStoreModel.getActivityDataPoints().length, "Num available data points 0").to.equal(0);

    });

});

describe('Fifth unit test', function () {

    it('Listener unit test 2 for ActivityStoreModel', function () {
        var activityStoreModel = new ActivityStoreModel();
        var firstListener = sinon.spy();
        activityStoreModel.addListener(firstListener);

        var d1 = new ActivityData("ABC", {energyLevel: 1, stressLevel: 2, happinessLevel: 3}, 30);
        var d2 = new ActivityData("ABC", {energyLevel: 1, stressLevel: 2, happinessLevel: 3}, 30);

        activityStoreModel.addActivityDataPoint(d1);

        expect(firstListener.callCount, 'First listener called: 1').to.equal(1);

        activityStoreModel.addActivityDataPoint(d2);

        expect(firstListener.callCount, 'First listener called: 2').to.equal(2);

        activityStoreModel.removeActivityDataPoint(d1);

        expect(firstListener.callCount, 'First listener called: 3').to.equal(3);

        activityStoreModel.removeActivityDataPoint(d2);

        expect(firstListener.callCount, 'First listener called: 4').to.equal(4);
    });

});

describe('Sixth unit test', function () {

    it('Listener unit test 3 for ActivityStoreModel', function () {
        var activityStoreModel = new ActivityStoreModel();
        var firstListener = sinon.spy();

        var activityStoreModel = new ActivityStoreModel();
        var firstListener = sinon.spy();
        activityStoreModel.addListener(firstListener);

        var secondListener = sinon.spy();

        var d1 = new ActivityData("ABC", {energyLevel: 1, stressLevel: 2, happinessLevel: 3}, 30);
        var d2 = new ActivityData("ABC", {energyLevel: 1, stressLevel: 2, happinessLevel: 3}, 30);

        activityStoreModel.addActivityDataPoint(d1);

        expect(firstListener.callCount, 'First listener called: 1').to.equal(1);

        activityStoreModel.addActivityDataPoint(d2);

        expect(firstListener.callCount, 'First listener called: 2').to.equal(2);

        activityStoreModel.addListener(secondListener);

        activityStoreModel.removeActivityDataPoint(d1);

        expect(firstListener.callCount, 'First listener called: 3').to.equal(3);
        expect(secondListener.callCount, 'Second listener called: 1').to.equal(1);

        activityStoreModel.removeListener(firstListener);
        activityStoreModel.removeActivityDataPoint(d2);

        expect(firstListener.callCount, 'First listener called: 3').to.equal(3);
        expect(secondListener.callCount, 'Second listener called: 2').to.equal(2);
    });

});

describe('Seventh unit test', function () {

    it('Removing a non-existant data point', function () {
        var activityStoreModel = new ActivityStoreModel();
        var firstListener = sinon.spy();
        activityStoreModel.addListener(firstListener);

        var d1 = new ActivityData("ABC", {energyLevel: 1, stressLevel: 2, happinessLevel: 3}, 30);
        var d2 = new ActivityData("ABC", {energyLevel: 1, stressLevel: 2, happinessLevel: 3}, 30);

        activityStoreModel.addActivityDataPoint(d1);

        expect(firstListener.callCount, 'First listener called: 1').to.equal(1);

        activityStoreModel.addActivityDataPoint(d2);

        expect(firstListener.callCount, 'First listener called: 2').to.equal(2);

        activityStoreModel.removeActivityDataPoint(d1);

        expect(firstListener.callCount, 'First listener called: 3').to.equal(3);

        activityStoreModel.removeActivityDataPoint(d1);

        expect(firstListener.callCount, 'First listener called: 3').to.equal(3);
    });

});

describe('Eighth unit test', function () {

    it('Multiple models - ActivityStoreModel', function () {
        var activityStoreModel1 = new ActivityStoreModel();
        var firstListener = sinon.spy();
        var activityStoreModel2 = new ActivityStoreModel();
        var secondListener = sinon.spy();

        activityStoreModel1.addListener(firstListener);
        activityStoreModel2.addListener(secondListener);

        var d1 = new ActivityData("ABC", {energyLevel: 1, stressLevel: 2, happinessLevel: 3}, 30);
        activityStoreModel1.addActivityDataPoint(d1);
        activityStoreModel1.removeActivityDataPoint(d1);

        expect(firstListener.callCount, 'First listener called: 2').to.equal(2);
        expect(secondListener.callCount, 'Second listener called: 0').to.equal(0);

        activityStoreModel2.addActivityDataPoint(d1);
        activityStoreModel2.removeActivityDataPoint(d1);

        expect(firstListener.callCount, 'First listener called: 2').to.equal(2);
        expect(secondListener.callCount, 'Second listener called: 2').to.equal(2);
    });

});

describe('Ninth unit test', function () {

    it('Multiple models - GraphModel', function () {
        var graphModel1 = new GraphModel();
        var firstListener = sinon.spy();
        var graphModel2 = new GraphModel();
        var secondListener = sinon.spy();

        graphModel1.addListener(firstListener);
        graphModel2.addListener(secondListener);

        graphModel1.selectGraph(GRAPH_NAMES.bar_graph);

        expect(firstListener.callCount, 'GraphModel first listener should have been called: 1').to.equal(1);
        expect(secondListener.callCount, 'GraphModel second listener should have been called: 0').to.equal(0);

        graphModel2.selectGraph(GRAPH_NAMES.bar_graph);

        expect(firstListener.callCount, 'GraphModel first listener should have been called: 1').to.equal(1);
        expect(secondListener.callCount, 'GraphModel second listener should have been called: 1').to.equal(1);
    });

});

describe('Tenth unit test', function () {

    it('Bad activity data', function () {
        var activityStoreModel = new ActivityStoreModel();
        var firstListener = sinon.spy();
        activityStoreModel.addListener(firstListener);

        var d1 = new ActivityData("ABC", {energyLevel: -1, stressLevel: 2, happinessLevel: 3}, 30);
        var d2 = new ActivityData("ABC", {energyLevel: 1, stressLevel: "abc", happinessLevel: 3}, 30);
        var d3 = new ActivityData("ABC", {energyLevel: 1, stressLevel: 3, happinessLevel: 6}, 30);
        var d4 = new ActivityData("ABC", {energyLevel: 1, stressLevel: 1, happinessLevel: 3}, "not a number");
        var d5 = new ActivityData("ABC", {energyLevel: 1, stressLevel: 5, happinessLevel: 3}, -1);

        activityStoreModel.addActivityDataPoint(d1);
        activityStoreModel.addActivityDataPoint(d2);
        activityStoreModel.addActivityDataPoint(d3);
        activityStoreModel.addActivityDataPoint(d4);
        activityStoreModel.addActivityDataPoint(d5);

        expect(firstListener.callCount, 'First listener called: 0 times (all bad data)').to.equal(0);
    });

});