'use strict';

var expect = chai.expect;
describe('Marking Unit Tests', function () {

    describe("GraphModel", function () {

        var graphModel;


        beforeEach(function () {
            graphModel = new GraphModel();
        });


        afterEach(function () {
            graphModel = undefined;
        });

        it('should return a list of non-empty available graph names', function () {
            var graphNames = graphModel.getAvailableGraphNames();

            expect(graphNames[0], 'graphNames[0] should be a string').to.be.a('string');
            expect(graphNames.length, 'graphNames should not be empty').to.be.above(0);
        });


        it('should add and then remove a listener correctly', function () {
            var listener_fn = sinon.spy();
            var addListenerSpy = sinon.spy(graphModel, "addListener");
            var removeListenerSpy = sinon.spy(graphModel, "removeListener");


            // Adds a listener
            graphModel.addListener(listener_fn);

            expect(addListenerSpy.calledWith(listener_fn), 'addListener should have been called with listener_fn').to.be.true;
            expect(addListenerSpy.calledOnce, 'addListener should have been called once').to.be.true;


            // Removes a listener
            graphModel.removeListener(listener_fn);

            expect(removeListenerSpy.calledWith(listener_fn), 'removeListener should have been called with listener_fn').to.be.true;
            expect(removeListenerSpy.calledOnce, 'removeListener should have been called once').to.be.true;
        });

        it('should select a graph which is set to currently selected graph', function () {
            var selectGraphSpy = sinon.spy(graphModel, 'selectGraph');
            var graphNames = graphModel.getAvailableGraphNames();

            var graphToSelect = graphNames[0];
            expect(graphModel.getNameOfCurrentlySelectedGraph() !== graphToSelect || graphNames.length > 1, "Need to be able to choose a graph to test listeners").to.be.true;
            if (graphToSelect === graphModel.getNameOfCurrentlySelectedGraph()) {
                graphToSelect = graphNames[1];
            }
            graphModel.selectGraph(graphToSelect);
            var currentGraphName = graphModel.getNameOfCurrentlySelectedGraph();

            expect(selectGraphSpy.calledOnce,
                'selectGraph should have been called once').to.be.true;
            expect(selectGraphSpy.calledWith(graphToSelect),
                'selectGraph should have been called with graphToSelect').to.be.true;
            expect(currentGraphName,
                'current graph name should be equal to what has been selected').to.eql(graphToSelect);
        });

        it('should notify every listener when the current graph changed', function () {
            var listener_fn_1 = sinon.spy();
            var listener_fn_2 = sinon.spy();
            graphModel.addListener(listener_fn_1);
            graphModel.addListener(listener_fn_2);
            var graphNames = graphModel.getAvailableGraphNames();

            var graphToSelect = graphNames[0];
            expect(graphModel.getNameOfCurrentlySelectedGraph() !== graphToSelect || graphNames.length > 1, "Need to be able to choose a graph to test listeners").to.be.true;
            if (graphToSelect === graphModel.getNameOfCurrentlySelectedGraph()) {
                graphToSelect = graphNames[1];
            }

            graphModel.selectGraph(graphToSelect);

            expect(listener_fn_1.calledWith, GRAPH_SELECTED_EVENT, graphNames[1]);
            expect(listener_fn_2.calledWith, GRAPH_SELECTED_EVENT, graphNames[1]);
        });


        it('should not notify any listener when the current graph did not change', function () {
            var listener_fn = sinon.spy();
            graphModel.addListener(listener_fn);
            var graphNames = graphModel.getAvailableGraphNames();

            var graphToSelect = graphNames[0];
            expect(graphModel.getNameOfCurrentlySelectedGraph() !== graphToSelect || graphNames.length > 1, "Need to be able to choose a graph to test listeners").to.be.true;
            if (graphToSelect === graphModel.getNameOfCurrentlySelectedGraph()) {
                graphToSelect = graphNames[1];
            }

            graphModel.selectGraph(graphToSelect);
            graphModel.selectGraph(graphToSelect);

            expect(listener_fn.callCount).to.be.below(2);
        });

    });
});
