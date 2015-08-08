'use strict';

// Returns a regular expression which will match against 1 or more occurrences of a class name
function classMatchingRegex(className) {
    return new RegExp("\\b" + className + "\\b");
}

// Returns true iff the specified element has the specified class name
function hasClass(element, className) {
    return classMatchingRegex(className).test(element.className);
}

// Adds the specified class to the specified element, if the element does not already have the class
function addClass(element, className) {
    if (hasClass(element, className)) return; // Element already has the class - so do not add it
    element.className = element.className === "" ? className : element.className + " " + className;
}

// Removes the specified class from the specified element
function removeClass(element, className) {
    if (!hasClass(element, className)) return; // Element already does not have this class - so nothing to remove
    element.className = element.className.replace(classMatchingRegex(className), "").trim();
}

// Adds an option to a dropdown selectbox
function addSelectboxOption(selectbox, optionText, optionValue) {
    // Create the new option element
    var newOption = document.createElement("option");
    newOption.text = optionText;
    newOption.value = optionValue;

    // Add the new option to the selectbox
    selectbox.options.add(newOption);
}

// Returns the value of a radio box group, or null if no box is selected
function radioGroupValue(name) {
    var selectedRadioButton = document.querySelector('input[name="' + name + '"]:checked');

    if (selectedRadioButton == null) {
        return null; // No button is selected, so cannot return a value
    }

    return selectedRadioButton.value;
}

// Pulled from Joel Coehoorm at http://stackoverflow.com/questions/18082/validate-decimal-numbers-in-javascript-isnumeric
function isNumeric(input) {
    return (input - 0) == input && ('' + input).replace(/^\s+|\s+$/g, "").length > 0;
}

// Pulled from pranag at http://stackoverflow.com/questions/14636536/how-to-check-if-a-variable-is-an-integer-in-javascript
function isInt(input) {
    return input === parseInt(input, 10);
}

// Pulled from http://red-team-design.com/removing-an-element-with-plain-javascript-remove-method/
function removeElementById(id) {
    var element = document.getElementById(id);
    element.parentNode.removeChild(element);
}

var canvasUtils = {
    drawLine: function (canvasContext, fromX, fromY, toX, toY) {
        canvasContext.beginPath();
        canvasContext.moveTo(fromX, fromY);
        canvasContext.lineTo(toX, toY);
        canvasContext.closePath();
        canvasContext.stroke();
    },
    drawRectangle: function (canvasContext, topLeftX, topLeftY, width, height) {
        canvasContext.fillRect(topLeftX, topLeftY, width, height);
    }
};
