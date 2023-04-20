/* ************************************ */
/* Define helper functions */
/* ************************************ */
function addID() {
	jsPsych.data.get().addToLast({exp_id: 'span_rdoc'})
}

function evalAttentionChecks() {
	var check_percent = 1
	if (run_attention_checks) {
		var attention_check_trials = jsPsych.data.get().filter({trial_id: 'attention_check'}).trials
		var checks_passed = 0
		for (var i = 0; i < attention_check_trials.length; i++) {
			if (attention_check_trials[i].correct === true) {
				checks_passed += 1
			}
		}
		check_percent = checks_passed / attention_check_trials.length
	}
	jsPsych.data.get().addToLast({"att_check_percent": check_percent})
	return check_percent
}

function assessPerformance() {

	var experiment_data = jsPsych.data.get().filter({exp_stage: 'test', trial_id: 'response'}).trials
	var missed_count = 0
	var trial_count = experiment_data.length
	var rt_array = []
	var correct = 0

  // in most tasks, we check if the distribution of all responses looks ok. 
  // but, in this task, if you type the same thing on every trial, you can't get it right
  // so, it's ok to just filter for accuracy
	for (var i = 0; i < experiment_data.length; i++) {
    correct += experiment_data[i].correct_trial // 0 if incorrect, 1 if correct
    missed_count += experiment_data[i].response == null // adds 1 if null rt, 0 if not
    rt_array.push(experiment_data[i].rt)
	}
  var avg_rt = math.median(rt_array)
	var missed_percent = missed_count/trial_count
	var accuracy = correct / trial_count

  var equations = jsPsych.data.get().filter({exp_stage: 'test', trial_id: 'equation'}).trials
  var equation_count = equations.length
  var equation_correct = 0
  var missed_equations = 0
  for (var i = 0; i < equations.length; i++) {
    equation_correct += equations[i].correct_trial
    missed_equations += equations[i].response == null
  }
  var equation_accuracy = equation_correct / equation_count
  var equation_missed = missed_equations / equation_count

	credit_var = (missed_percent < 0.3 && avg_rt > 200 && equation_missed < 0.3)
	jsPsych.data.get().addToLast({final_credit_var: credit_var,
		final_missed_percent: missed_percent,
		final_avg_rt: avg_rt,
		final_accuracy: accuracy,
    final_equation_accuracy: equation_accuracy,
    final_equation_missed_percent: equation_missed})
}

function appendData() {
	var data = jsPsych.data.get().last(1).values()[0]
  console.log(data)
  if (data.trial_id == 'response') {
    jsPsych.data.get().addToLast({
      response: response, // replace htmlButtonResponse output with the numpad response
      correct_trial: arraysEqual(response, data.correct_response) ? 1 : 0}) 
  } else {
    jsPsych.data.get().addToLast({correct_trial: data.response==data.correct_response ? 1: 0})
  }
}

var arraysEqual = function(arr1, arr2) {
  if (arr1.length !== arr2.length)
    return false;
  for (var i = arr1.length; i--;) {
    if (arr1[i] !== arr2[i])
      return false;
  }
  return true;
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
  }
  return array
}

var randomDraw = function(lst) {
  var index = Math.floor(Math.random() * (lst.length))
  return lst[index]
}

var setStims = function() {
  // ADD IN ADJUSTMENT TO NUM_DIGITS HERE IF YOU WANT IT TO CHANGE TRIAL-BY-TRIAL
  curr_seq = []
  stim_array = []
  // time_array = []
  for (var i = 0; i < num_digits; i++) {
    var stim = randomDraw(possible_stimuli.filter(x => x != last_stim)) // randomDraw(possible_stimuli.filter(function(x) {return Math.abs(x-last_num)>2}))
    last_stim = stim
    curr_seq.push(stim)
    stim_array.push('<div class = centerbox><div class = digit-span-text>' + stim.toString() + '</div></div>')
    // time_array.push(stim_time)
  }
}
operations = ['*', '/', '+', '-']
for (let i = 1; i < 10; i++) {
  for (let j = 0; j < operations.length; j++) {
    var possible = [1,2,3,4,5,6,7,8,9].filter(x => [1,2,3,4,5,6,7,8,9].includes(eval(i.toString() + operations[j] + x.toString())))
  }
}

function equationHelper(first, operation) {
  // finds a second number such that the result is between 0 and 10 and either .0 or .5
  var second = 0
  var possible = [0,1,2,3,4,5,6,7,8,9].filter(x => [0,1,2,3,4,5,6,7,8,9].includes(eval(first.toString() + operation + x.toString())))
  second = randomDraw(possible)
  return [second, eval(first.toString() + operation + second.toString())]
}

var getRandomEquation = function() {
  // equation of the following type: (first * or / second) + or - third = Ans or Ans+-1
  // where Ans is between 0 and 9.5
  var first = randomDraw([0,1,2,3,4,5,6,7,8,9])
  var first_op =  ['*','/'][Math.round(Math.random())]
  var helper1 = equationHelper(first, first_op)
  var second = helper1[0]
  if (helper1[1] == 1) {
    var second_op = '+'
  } else if (helper1[1] == 9) {
    var second_op = '-'
  } else {
    var second_op = ['+','-'][Math.round(Math.random())]
  }
  var helper2 = equationHelper(helper1[1], second_op) 
  var third = helper2[0]
  var ans = helper2[1]
  
  if (Math.round(Math.random())) {
    // make the answer wrong
    equation_answer = 'F'
    if (ans >= 9) {
      ans -= 1
    } else if (ans <= 1) {
      ans += 1
    } else {
      ans += Math.round(Math.random())*2-1 // 1 or -1 randomly
    }
  } else {
    equation_answer = 't' 
  }
  var equation = ['(', first, first_op, second, ')', second_op, third, '=', ans].join(' ')
  return '<div class = centerbox><div class = digit-span-text>' + equation + '</div></div>'
}

var createResponseGrid = function() {
  var output = '<div class = numbox>' 
  for (let i = 0; i < possible_stimuli.length; i++) {
    output += '<button id = button_' + i + ' class = "square num-button" onclick = "recordClick(this)"><div class = content><div class = numbers>' + possible_stimuli[i] + '</div></div></button>'
  }
  output += '<button class = clear_button id = "ClearButton" onclick = "clearResponse()">Clear</button>'//</div>'
  
  output += '<button class = submit_button onClick="clickSubmit()" id = "SubmitButton">Submit Answer</button></div>'
  return output
}

var recordClick = function(elm) {
  response.push($(elm).text())
  // response.push(Number($(elm).text())) // from the number days
}

var clearResponse = function() {
  response = []
}

var clickSubmit = () => {
  document.getElementById("fakeSubmitButton").click();
}

var getInstructFeedback = function() {
	return '<div class = centerbox><p class = center-block-text>' + feedback_instruct_text + '</p></div>'
}
var getFeedback = function() {
  return '<div class = centerbox><div class = center-text>' + feedback_text + '</div></div>'
}
var getNumDigits = function() {
  return num_digits
}
var getNumDigitsStim = function() {
  var equations_tf = block_type == 'operation' ? '<p class = center-text>with equations</p>' : ''
  return '<div class = centerbox><p class = center-text>' + num_digits + ' letters</p><p class = center-text>'  + equations_tf + '</p></div>'
}
var getStimArray = function() {
  return stim_array
}
var getCurrSeq = function() {
  return curr_seq
}
var getCurrBlockType = function() {
  return block_type
}
var getNextStim = function() {
  return stim_array.shift()
}
var getEquationAnswer = function (){
  return equation_answer
}
var getExpStage = function() {
  return exp_stage
}

/* ************************************ */
/* Define experimental variables */
/* ************************************ */
// generic task variables
var run_attention_checks = false
var attention_check_thresh = 0.65
var sumInstructTime = 0 //ms
var instructTimeThresh = 0 ///in seconds

var accuracy_thresh = 0.6
var rt_thresh = 20000
var missed_response_thresh = 0.1
var practice_thresh = 3 // max repetitions


// task specific variables

var equation_choices = ['t','f'] // {key: [',','.'], key_name: ["index finger","middle finger"], key_description: ["comma", "period"]} 
var possible_stimuli = 'BCDEGPTVZ'.split("") // [1,2,3,4,5,6,7,8,9]

var numPracticeTrials = 4 // 2 simple, 2 operation
var numTrialsPerBlock = 14
var numTestBlocks = 4

var stim_time = 800
var gap_time = 200 
var equation_time = 3800

// important variables used throughout
var exp_stage = 'practice'
var block_type = 'simple'
var curr_seq = []
// var time_array = [] // not using this anymore
var last_stim = '' // so that we don't repeat?
var errors = 0
var response = []
var equation_answer = ''
var num_digits = 5

var response_grid = createResponseGrid()

var prompt_text = '<div class = prompt_box>'+
					  '<p class = center-block-text style = "font-size:16px; line-height:80%%;">Memorize all the letters!</p>' +
					  '<p class = center-block-text style = "font-size:16px; line-height:80%%;">Equations: \'T\' for True and \'F\' for False.</li>' +
				  '</div>'
var star_stim = '<div class = centerbox><div class = digit-span-text>*</div></div>'

/* ************************************ */
/* Set up jsPsych blocks */
/* ************************************ */
// Set up attention check node
// var attention_check_block = {
// 	type: 'attention-check-rdoc',
// 	data: {
// 		trial_id: "attention_check"
// 	},
// 	timing_response: 180000,
// 	response_ends_trial: true,
// 	timing_post_trial: 200
// }

// var attention_node = {
// 	timeline: [attention_check_block],
// 	conditional_function: function() {
// 		return run_attention_checks
// 	}
// }

//Set up post task questionnaire
//Set up post task questionnaire
var post_task_block = {
	type: jsPsychSurveyText,
	data: {
		exp_id: "span_rdoc",
		trial_id: "post task questions"
	},
	questions: [
	 {
	   prompt: '<p class = center-block-text style = "font-size: 20px">You have completed this task! Please summarize what you were asked to do in this task.</p>',
	   rows: 15,
	   columns: 60,
	 },
	 {
	   prompt: '<p class = center-block-text style = "font-size: 20px">Do you have any comments about this task?</p>',
	   rows: 15,
	   columns: 60,
	  }
  ]
};

var end_block = {
	type: jsPsychHtmlKeyboardResponse,
	data: {
		trial_id: "end",
    	exp_id: 'span_rdoc'
	},
	trial_duration: 180000,
	stimulus: '<div class = centerbox><p class = center-block-text>Thanks for completing this task!</p>' + 
		'<p class = center-block-text>	If you have been completing tasks continuously for an hour or more, please take a 15-minute break before starting again.</p>' + 
		'<p class = center-block-text>Press <i>enter</i> to continue.</p>' + 
		'</div>',
	choices: ['Enter'],
	post_trial_gap: 0,
	on_finish: function() {
		assessPerformance()
		evalAttentionChecks()
	} 
};


/* define static blocks */
var feedback_instruct_text = '<p class=center-block-text>Welcome! This experiment will take around 10 minutes.</p>' +
  '<p class=center-block-text>To avoid technical issues, please keep the experiment tab (on Chrome or Firefox) active and in full-screen mode for the whole duration of each task.</p>' +
  '<p class=center-block-text> Press <i>enter</i> to begin.</p>'

var feedback_instruct_block = {
	type: jsPsychHtmlKeyboardResponse,
	choices: ['Enter'],
	data: {
		trial_id: "instruction_feedback"
	},
	stimulus: getInstructFeedback,
	post_trial_gap: 0,
	trial_duration: 180000
};
/// This ensures that the subject does not read through the instructions too quickly.  If they do it too quickly, then we will go over the loop again.
var instructions_block = {
	type: jsPsychInstructions,
	pages: [
    '<div class = centerbox>'+
      '<p class = block-text>In this task, you will have to <b>remember a sequence of letters</b> that will appear on the screen one after the other, with a cross (\'+\') appearing between each one.</p>' +
      '<p class = block-text>At the end of each trial, enter all the letters into the presented buttons <b>in the order in which they occurred.</b></p>' + 
      '<p class = block-text>Do your best to memorize the numbers, but please don\'t  write them down or use any tool to help you remember them.</p>' + 
    '</div>',
    '<div class = centerbox>'+
      '<p class = block-text>On some trials, the \'+\' in between each letter will be replaced by a mathematical equation. You will have a few seconds to decide if the equation is true or false.</p>'+
      '<p class = block-text><b>If the equation is true, press the ' + equation_choices[0] + ' key. If the equation is false, press the ' + equation_choices[1] + ' key.</b></p>' +
      '<p class = block-text>You will still need to remember and report the sequence of letters!</p>' +
      '<p class = block-text>We\'ll start with a practice round. During practice, you will receive feedback and a reminder of the rules. These will be taken out for the test, so make sure you understand the instructions before moving on.</p>' +
    '</div>',
	],
	allow_keys: false,
	data: {
		trial_id: "instructions"
	},
	show_clickable_nav: true,
	post_trial_gap: 0
};

var instruction_node = {
	timeline: [feedback_instruct_block, instructions_block],
	/* This function defines stopping criteria */
	loop_function: function(data) {
		for (i = 0; i < data.trials.length; i++) {
			if ((data.trials[i].trial_id == 'instructions') && (data.trials[i].rt != null)) {
				rt = data.trials[i].rt
				sumInstructTime += rt
			}
		}
		if (sumInstructTime <= instructTimeThresh * 1000) {
			feedback_instruct_text =
				'Read through instructions too quickly.  Please take your time and make sure you understand the instructions.  Press <i>enter</i> to continue.'
			return true
		} else if (sumInstructTime > instructTimeThresh * 1000) {
			feedback_instruct_text = 'Done with instructions. Press <i>enter</i> to continue.'
			return false
		}
	}
}

var feedback_text = '<div class = centerbox><p class = center-block-text>Press <i>enter</i> to begin practice.</p></div>'
var feedback_block = {
	type: jsPsychHtmlKeyboardResponse,
	data: {
		trial_id: "feedback"
	},
	choices: ['Enter'],
	stimulus: getFeedback,
	post_trial_gap: 1000,
	trial_duration: 180000,
	response_ends_trial: true,
};

var practice_feedback_block = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: function() {
    var last = jsPsych.data.get().last(1).values()[0]
    if (last.response == null) {
      return '<div class = fb_box><div class = center-text><font size =20>Respond Faster!</font></div></div>'
    } else if (last.correct_trial == 1) {
      return '<div class = fb_box><div class = center-text><font size =20>Correct!</font></div></div>'
    } else {
      return '<div class = fb_box><div class = center-text><font size =20>Incorrect</font></div></div>'
    }
  },
  data: {
    exp_stage: "practice",
    trial_id: "practice_feedback"
  },
  choices: ['NO_KEYS'],
  stimulus_duration: 500,
  trial_duration: 500,
  prompt: prompt_text
}

var start_trial_block = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: getNumDigitsStim,
  data: function () {
    return {
      trial_id: 'start_trial',
      exp_stage: getExpStage(),
    }
  },
  choices: ['NO_KEYS'],
  stimulus_duration: 1000,
  trial_duration: 2000,
  post_trial_gap: 0,
  prompt: function() { return getExpStage() == 'practice' ? prompt_text : ''}
};

var stimulus_block = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: getNextStim,
  stimulus_duration: stim_time,
  trial_duration: stim_time+gap_time,
  post_trial_gap: 0,
  data: function () {
    return {
      trial_id: 'stim',
      exp_stage: getExpStage(),
    }
  },
  choices: ['NO_KEYS'],
  prompt: function() { return getExpStage() == 'practice' ? prompt_text : ''}
}

var equation_block = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: function() {return getCurrBlockType() == 'operation' ? getRandomEquation() : '<div class = centerbox><div class = fixation>+</div></div>'},
  choices: equation_choices,
  stimulus_duration: equation_time, // ?
  trial_duration: equation_time+gap_time, // ?
  response_ends_trial: false,
  data: function () {
    return {
      trial_id: 'equation',
      exp_stage: getExpStage(),
      correct_response: getCurrBlockType() == 'operation' ? equation_answer : null
    }
  },
  post_trial_gap: 0,
  on_finish: appendData,
  prompt: function() { return getExpStage() == 'practice' ? prompt_text : ''}
}

var response_block = {
  type: jsPsychHtmlButtonResponse,
  stimulus: response_grid,
  choices: [''],
  button_html: '<div style="display:none" class numbox><button class = submit_button id = "fakeSubmitButton">%choice%</button></div>', // this will not display but receives click from the response grid
  data: function () {
    return {
      trial_id: 'response',
      exp_stage: getExpStage(),
      correct_response: getCurrSeq(),
      num_digits: getNumDigits()
    }
  },
  trial_duration: 18000,
  stimulus_duration: 18000,
  post_trial_gap: 0,
  prompt: function() { return getExpStage() == 'practice' ? prompt_text : ''},
  on_finish: appendData,
}

var set_stims_block = {
  type: jsPsychCallFunction,
  func: setStims
}

var switch_block_type = {
  type: jsPsychCallFunction,
  func: function() {
    block_type = ['simple', 'operation'].filter((x => x != block_type))[0] // switch block type
  }
}

var practiceTrials = []
for (let i = 0; i < numPracticeTrials; i++) {
  var shuffle_block_types = shuffleArray(['simple', 'operation'])
  practiceTrials.push(set_stims_block, start_trial_block)
  for (let j = 0; j < num_digits; j++) {
    block_type = i >= numPracticeTrials/2 ? shuffle_block_types[0] : shuffle_block_types[1] // randomize order half/half just for practice
    practiceTrials.push(stimulus_block, equation_block, practice_feedback_block)
  }
  practiceTrials.push(response_block, practice_feedback_block)
}

var practiceCount = 0
var practiceNode = {
  timeline: [feedback_block].concat(practiceTrials),
  loop_function: function(data) {

    practiceCount += 1		
    var sum_trial_responses = 0
    var trial_correct = 0
    var total_trials = 0
    var sum_equation_responses = 0
    var equation_correct = 0
    var total_equations = 0
    
    for (var i = 0; i < data.trials.length; i++){
      if (data.trials[i].trial_id == 'response'){
        total_trials+=1
        if (data.trials[i].response != null){
          sum_trial_responses += 1
          trial_correct += data.trials[i].correct_trial ///// MAKE SURE THIS WORKS!
        }
      } else if (data.trials[i].trial_id == 'equation') {
        total_equations += 1
        if (data.trials[i].response != null){
          sum_equation_responses += 1
          equation_correct += data.trials[i].correct_trial ///// MAKE SURE THIS WORKS!
        }
      }
    }
    var trial_accuracy = trial_correct / total_trials
    var equation_accuracy = equation_correct / total_equations
    var missed_responses = (total_trials - sum_trial_responses) / total_trials
    var missed_equations = (total_equations - sum_equation_responses) / total_equations
  
    feedback_text = "<p class = block-text>Please take this time to read your feedback and to take a short break!</p>"
    if (trial_accuracy > accuracy_thresh || practiceCount == practice_thresh){
      feedback_text = '<div class = centerbox><p class = block-text>We will now start the test portion.</p>' +
         '<p class = block-text>Press <i>enter</i> to begin.</p></div>'
      exp_stage = 'test'
      block_type = ['simple', 'operation'][Math.round(Math.random())] // set random block type to start test blocks
      return false
    } else { 
      if (feedback_text < accuracy_thresh) {
        feedback_text += '<p class = block-text>Your accuracy is low. Do your best to remember all the letters and report them in the order they appeared!</p>' 
      }
      if (equation_accuracy < accuracy_thresh) {
        feedback_text += '<p class = block-text>Your accuracy on the equations is low. Do your best to verify if the equation is true or false using the ' + equation_choices[0] + ' and ' + equation_choices[1] + ' keys.</p>'
      }
      if (missed_responses > missed_response_thresh || missed_equations > missed_response_thresh){
        feedback_text += '<p class = block-text>You have not been responding to some trials.  Please respond on every trial that requires a response.</p>'
      }
      feedback_text += '<p class = block-text>We are going to repeat the practice round now. Press <i>enter</i> to begin.</p>'
      return true
    }
  }
}

var testTrials = []
for (let i = 0; i < numTrialsPerBlock; i++) {
  var shuffle_block_types = shuffleArray(['simple', 'operation'])
  testTrials.push(set_stims_block, start_trial_block)
  for (let j = 0; j < num_digits; j++) {
    testTrials.push(stimulus_block, equation_block)
  }
  testTrials.push(response_block)
}

var testCounmt = 0
var testNode = {
  timeline: [feedback_block].concat(testTrials, switch_block_type),
  loop_function: function(data) {

    testCount += 1		
    var sum_trial_responses = 0
    var trial_correct = 0
    var total_trials = 0
    var sum_equation_responses = 0
    var equation_correct = 0
    var total_equations = 0
    
    for (var i = 0; i < data.trials.length; i++){
      if (data.trials[i].trial_id == 'response'){
        total_trials+=1
        if (data.trials[i].response != null){
          sum_trial_responses += 1
          trial_correct += data.trials[i].correct_trial ///// MAKE SURE THIS WORKS!
        }
      } else if (data.trials[i].trial_id == 'equation') {
        total_equations += 1
        if (data.trials[i].response != null){
          sum_equation_responses += 1
          equation_correct += data.trials[i].correct_trial ///// MAKE SURE THIS WORKS!
        }
      }
    }
    var trial_accuracy = trial_correct / total_trials
    var equation_accuracy = equation_correct / total_equations
    var missed_responses = (total_trials - sum_trial_responses) / total_trials
    var missed_equations = (total_equations - sum_equation_responses) / total_equations
  
    if (testCount == numTestBlocks){
      return false
    } else { 
      feedback_text = "<p class = block-text>Please take this time to read your feedback and to take a short break!<br>" +
					"You have completed: "+testCount+" out of "+numTestBlocks+" blocks of trials.</p>"
      if (trial_accuracy < accuracy_thresh) {
        feedback_text += '<p class = block-text>Your accuracy is low. Do your best to remember all the letters and report them in the order they appeared!</p>' 
      }
      if (equation_accuracy < accuracy_thresh) {
        feedback_text += '<p class = block-text>Your accuracy on the equations is low. Do your best to verify if the equation is true or false using the ' + equation_choices[0] + ' and ' + equation_choices[1] + ' keys.</p>'
      }
      if (missed_responses > missed_response_thresh || missed_equations > missed_response_thresh){
        feedback_text += '<p class = block-text>You have not been responding to some trials.  Please respond on every trial that requires a response.</p>'
      }
      feedback_text += '<p class = block-text>We are going to repeat the practice round now. Press <i>enter</i> to begin.</p>'
      return true
    }
  }
}

var fullscreen = {
  type: jsPsychFullscreen,
  fullscreen_mode: true
}
var exit_fullscreen = {
  type: jsPsychFullscreen,
  fullscreen_mode: false
}

//Set up experiment
span_rdoc_experiment = []
var span_rdoc_init = () => {
	document.body.style.background = 'gray' //// CHANGE THIS

	span_rdoc_experiment.push(fullscreen)
	span_rdoc_experiment.push(instruction_node)
	span_rdoc_experiment.push(practiceNode)
	span_rdoc_experiment.push(testNode)
	span_rdoc_experiment.push(post_task_block)
	span_rdoc_experiment.push(end_block)
	span_rdoc_experiment.push(exit_fullscreen)
}


/* OLD CODE TO LEAVE JUST IN CASE! 

var test_block = {
  type: 'poldrack-multi-stim-multi-response',
  stimuli: getStims,
  is_html: true,
  timing_stim: getTimeArray,
  timing_gap: gap_time,
  choices: [
    ['none']
  ],
  data: {
    trial_id: "stim",
    exp_stage: 'test'
  },
  timing_response: getTotalTime,
  timing_post_trial: 0,
  on_finish: function() {
    jsPsych.data.addDataToLastTrial({
      "sequence": curr_seq,
      "num_digits": num_digits
    })
  }
}
var forward_response_block = {
  type: 'single-stim-button',
  stimulus: response_grid,
  button_class: 'submit_button',
  data: {
    trial_id: "response",
    exp_stage: 'test'
  },
  on_finish: function() {
    jsPsych.data.addDataToLastTrial({
      "response": response.slice(),
      "sequence": curr_seq,
      "num_digits": num_digits,
      "condition": "forward"
    })
    var correct = false
      // staircase
    if (arraysEqual(response, curr_seq)) {
      num_digits += 1
      feedback = '<span style="color:green">Correct!</span>'
      stims = setStims()
      correct = true
    } else {
      errors += 1
      if (num_digits > 1 && errors == 2) {
        num_digits -= 1
        errors = 0
      }
      feedback = '<span style="color:red">Incorrect</span>'
      stims = setStims()
    }
    jsPsych.data.addDataToLastTrial({
      correct: correct
    })
    response = []
  },
  timing_post_trial: 500
}
var getStims = function() {
  return stim_array
}
var getTimeArray = function() {
  return time_array
}
*/