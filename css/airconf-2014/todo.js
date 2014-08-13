/*
    A table of contents, of sorts.


 */
var PART_NAMES = {
 1: "Part 1: Getting Started",
 2: "Part 2: Show a list of items",
 3: "Part 3: Grep items",
 4: "Part 4: Reuse items with WebComponents",
 5: "Part 5: Using the components: binding",
 6: "Part 6: Sorting with filters",
};

var step = 0;

function step_sorter(step) {
  return _.parseInt(step.title.replace("Step ", ''))
}

Step = function(params) {
  this.name = params.step.title;
  this.type = params.step.type;
  this.body = params.step.body;
};


Part = function(params) {
  var part_key = params.part_key;
  var part = parts[part_key]
  this.title = PART_NAMES[part_key];
  this.steps = _.sortBy(parts[part_key], step_sorter);
}

ko.components.register("todo", {
  viewModel: Step,
  template: {element: "todo"}
});

ko.components.register('part', {
  viewModel: Part,
  template: {element: 'part'}
});


// steps is the raw data from our Atom.io snippets/steps.cson (in json format)
var steps = _(snippets)
  .values()
  .reduce(function (acc, v, k) { return _.extend(acc, v) }, {});

_.each(snippets['.source.js'], function (step) {
  step.type = 'js';
});

_.each(snippets['.text.html'], function (step) {
  step.type= 'html';
});

_.each(steps, function(step, title) {
  step.title = title;
});

var parts = _.groupBy(steps, 'part');
var part_keys = _.keys(parts);

ko.punches.enableAll();
ko.applyBindings({part_keys: part_keys});
