/* ************************************ */
/* Define helper functions */
/* ************************************ */

function addID() {
	jsPsych.data.get().addToLast({exp_id: 'stroop_rdoc'})
}

function assessPerformance() {
	var experiment_data = jsPsych.data.get().filter({exp_stage: 'test', trial_id: 'stim'}).trials
	var missed_count = 0
	var trial_count = 0
	var rt_array = []
	var rt = 0
	var correct = 0

	//record choices participants made
	var choice_counts = {}
	choice_counts[null] = 0
	for (var k = 0; k < choices.length; k++) {
		choice_counts[choices[k]] = 0
	}
	for (var i = 0; i < experiment_data.length; i++) {
		if (experiment_data[i].possible_responses != 'none') {
			trial_count += 1
			rt = experiment_data[i].rt
			key = experiment_data[i].response
			choice_counts[key] += 1
			if (rt == null) {
				missed_count += 1
			} else {
				rt_array.push(rt)
			}
			if (key == experiment_data[i].correct_response){
				correct += 1
			}
		}
	}
	//calculate average rt
	var avg_rt = null
	if (rt_array.length !== 0) {
		avg_rt = math.median(rt_array)
	} 
	//calculate whether response distribution is okay
	var responses_ok = true
	Object.keys(choice_counts).forEach(function(key, index) {
		if (choice_counts[key] > trial_count * 0.85) {
			responses_ok = false
		}
	})
	var missed_percent = missed_count/trial_count
	var accuracy = correct / trial_count
	credit_var = (missed_percent < 0.4 && avg_rt > 200 && responses_ok)
	jsPsych.data.get().addToLast({final_credit_var: credit_var,
		final_missed_percent: missed_percent,
		final_avg_rt: avg_rt,
		final_responses_ok: responses_ok,
		final_accuracy: accuracy})
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

function appendData() {
	var data = jsPsych.data.get().last(1).values()[0]
	correct_trial = 0
	  if (data.response == data.correct_response) {
		correct_trial = 1
	  }
	  jsPsych.data.get().addToLast({correct_trial: correct_trial})
  }

var getInstructFeedback = function() {
	return '<div class = centerbox><p class = center-block-text>' + feedback_instruct_text +
		'</p></div>'
}

var getFeedback = function() {
	return '<div class = bigbox><div class = picture_box><p class = block-text>' + feedback_text + '</font></p></div></div>' //<font color="white">
}

/* ************************************ */
/* Define experimental variables */
/* ************************************ */
// generic task variables
var credit_var = 0
var run_attention_checks = true
var attention_check_thresh = 0.45
var instructTimeThresh = 0 ///in seconds

var accuracy_thresh = 0.7
var rt_thresh = 1000
var missed_response_thresh = 0.10
var practice_thresh = 3 // 3 blocks max

// task specific variables
var possible_responses = [['index finger', ',', 'comma key (,)'], 
	['middle finger', '.', 'period key (.)'], 
	['ring finger', '/', 'slash key (/)']]

var congruent_stim = [{
	stimulus: '<div class = centerbox><div class = stroop-stim style = "color:red">RED</div></div>',
	data: {
		trial_id: 'stim',
		condition: 'congruent',
		stim_color: 'red',
		stim_word: 'red',
		correct_response: possible_responses[0][1]
	},
	key_answer: possible_responses[0][1]
}, {
	stimulus: '<div class = centerbox><div class = stroop-stim style = "color:blue">BLUE</div></div>',
	data: {
		trial_id: 'stim',
		condition: 'congruent',
		stim_color: 'blue',
		stim_word: 'blue',
		correct_response: possible_responses[1][1]
	},
	key_answer: possible_responses[1][1]
}, {
	stimulus: '<div class = centerbox><div class = stroop-stim style = "color:green">GREEN</div></div>',
	data: {
		trial_id: 'stim',
		condition: 'congruent',
		stim_color: 'green',
		stim_word: 'green',
		correct_response: possible_responses[2][1]
	},
	key_answer: possible_responses[2][1]
}];

var incongruent_stim = [{
	stimulus: '<div class = centerbox><div class = stroop-stim style = "color:red">BLUE</div></div>',
	data: {
		trial_id: 'stim',
		condition: 'incongruent',
		stim_color: 'red',
		stim_word: 'blue',
		correct_response: possible_responses[0][1]
	},
	key_answer: possible_responses[0][1]
}, {
	stimulus: '<div class = centerbox><div class = stroop-stim style = "color:red">GREEN</div></div>',
	data: {
		trial_id: 'stim',
		condition: 'incongruent',
		stim_color: 'red',
		stim_word: 'green',
		correct_response: possible_responses[0][1]
	},
	key_answer: possible_responses[0][1]
}, {
	stimulus: '<div class = centerbox><div class = stroop-stim style = "color:blue">RED</div></div>',
	data: {
		trial_id: 'stim',
		condition: 'incongruent',
		stim_color: 'blue',
		stim_word: 'red',
		correct_response: possible_responses[1][1]
	},
	key_answer: possible_responses[1][1]
}, {
	stimulus: '<div class = centerbox><div class = stroop-stim style = "color:blue">GREEN</div></div>',
	data: {
		trial_id: 'stim',
		condition: 'incongruent',
		stim_color: 'blue',
		stim_word: 'green',
		correct_response: possible_responses[1][1]
	},
	key_answer: possible_responses[1][1]
}, {
	stimulus: '<div class = centerbox><div class = stroop-stim style = "color:green">RED</div></div>',
	data: {
		trial_id: 'stim',
		condition: 'incongruent',
		stim_color: 'green',
		stim_word: 'red',
		correct_response: possible_responses[2][1]
	},
	key_answer: possible_responses[2][1]
}, {
	stimulus: '<div class = centerbox><div class = stroop-stim style = "color:green">BLUE</div></div>',
	data: {
		trial_id: 'stim',
		condition: 'incongruent',
		stim_color: 'green',
		stim_word: 'blue',
		correct_response: possible_responses[2][1]
	},
	key_answer: possible_responses[2][1]
}];
var stims = [].concat(congruent_stim, congruent_stim, incongruent_stim)
var practice_length = 12
var block_length = 36
var numTestBlocks = 3
var exp_length = block_length * numTestBlocks

var choices = [possible_responses[0][1], possible_responses[1][1], possible_responses[2][1]]



var speed_reminder = '<p class = block-text>Try to respond as quickly and accurately as possible.</p>'
var response_keys = 
	'<ul list-text><li><span class = "large" style = "color:red">WORD</span>: ' + possible_responses[0][0] + 
	'</li><li><span class = "large" style = "color:blue">WORD</span>: ' + possible_responses[1][0] + 
	'</li><li><span class = "large" style = "color:green">WORD</span>: ' + possible_responses[2][0] + ' </li></ul>'

var prompt_text = '<div class = prompt_box>'+
	'<p class = center-block-text style = "font-size:16px; line-height:80%%;"><span class = "large" style = "color:red">WORD</span>: ' + possible_responses[0][0] + '</p>' +
	'<p class = center-block-text style = "font-size:16px; line-height:80%%;"><span class = "large" style = "color:blue">WORD</span>: ' + possible_responses[1][0] + '</p>' +
	'<p class = center-block-text style = "font-size:16px; line-height:80%%;"><span class = "large" style = "color:green">WORD</span>: ' + possible_responses[2][0] + '</p>' +
	'</div>'

/* ************************************ */
/* Set up jsPsych blocks */
/* ************************************ */
// Set up attention check node
var attention_check_block = {
	type: 'attention-check-rdoc',
	data: {
		trial_id: "attention_check"
	},
	timing_response: 180000,
	response_ends_trial: true,
	timing_post_trial: 200
}

var attention_node = {
	timeline: [attention_check_block],
	conditional_function: function() {
		return run_attention_checks
	}
}

//Set up post task questionnaire
var post_task_block = {
	type: jsPsychSurveyText,
	data: {
		exp_id: "stroop_rdoc",
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

/* define static blocks */

var feedback_instruct_text = '<p class=center-block-text>Welcome! This experiment will take around 8 minutes.</p>' +
  '<p class=center-block-text>To avoid technical issues, please keep the experiment tab (on Chrome or Firefox) active and in full-screen mode for the whole duration of each task.</p>' +
  '<p class=center-block-text> Press <i>enter</i> to begin.</p>'
var feedback_instruct_block = {
	type: jsPsychHtmlKeyboardResponse,
	data: {
		trial_id: "instruction_feedback"
	},
	choices: ['Enter'],
	stimulus: getInstructFeedback,
	post_trial_gap: 0,
	trial_duration: 180000
};

var instructions_block = {
	type: jsPsychInstructions,
	data: {
		trial_id: "instructions"
	},
	pages: [
		'<div class = centerbox>'+
			'<p class=block-text>Place your <b>' + possible_responses[0][0] + '</b> on the <b>' + possible_responses[0][2] + '</b> your <b>' + possible_responses[1][0] + '</b> on the <b>' + possible_responses[1][2] + '</b> and your <b>' + possible_responses[2][0] + '</b> on the <b>' + possible_responses[2][2] + '</b> </p>' + 
			'<p class = block-text>In this task, you will see a series of "color" words (RED, BLUE, GREEN). The "ink" of the words will also be colored. For example, you may see: ' +
			'<span class = "large" style = "color:blue">RED</span>, <span class = "large" style = "color:blue">BLUE</span>, or <span class = "large" style = "color:red">BLUE</span>.</p>' +
			'<p class = block-text>Your task is to press the following buttons corresponding to the <b>ink color</b> (not the word itself):' +
			response_keys +
		'</div>',
		'<div class = centerbox><p class = block-text>We\'ll start with a practice round. During practice, you will receive feedback and a reminder of the rules. '+
    	'These will be taken out for test, so make sure you understand the instructions before moving on.</p>'+
		'<p class = block-text>Remember, press the key corresponding to the <strong>ink</strong> color of the word: </p>' + response_keys + speed_reminder + '</div>',
	],
	allow_keys: false,
	show_clickable_nav: true,
	post_trial_gap: 0
};

/// This ensures that the subject does not read through the instructions too quickly.  If they do it too quickly, then we will go over the loop again.
var sumInstructTime = 0 //ms
var instruction_node = {
	timeline: [feedback_instruct_block, instructions_block],
	/* This function defines stopping criteria */
	loop_function: function(data) {
		for (i = 0; i < data.trials.length; i++) {
			if ((data.trials[i].trial_id == 'instructions') && (data.trials[i].rt !=null)) {
				sumInstructTime += data.trials[i].rt
			}
		}
		if (sumInstructTime <= instructTimeThresh * 1000) {
			feedback_instruct_text =
				'Read through instructions too quickly.  Please take your time and make sure you understand the instructions.  Press <i>enter</i> to continue.'
			return true
		} else {
			feedback_instruct_text = 'Done with instructions. Press <i>enter</i> to continue.'
			return false
		}
	}
}

var fixation_block = {
	type: jsPsychHtmlKeyboardResponse,
	stimulus: '<div class = centerbox><div class = fixation>+</div></div>',
	choices: ["NO_KEYS"],
	data: {
		trial_id: "fixation",
		exp_stage: 'test'
	},
	post_trial_gap: 0,
	stimulus_duration: 500,
	trial_duration: 1000
}

var practice_fixation_block = {
	type: jsPsychHtmlKeyboardResponse,
	stimulus: '<div class = centerbox><div class = fixation>+</div></div>',
	choices: ["NO_KEYS"],
	data: {
		trial_id: "fixation",
		exp_stage: 'practice'
	},
	post_trial_gap: 0,
	stimulus_duration: 500,
	trial_duration: 1000,
	prompt: prompt_text
}

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

// after each block 
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

var end_block = {
	type: jsPsychHtmlKeyboardResponse,
	data: {
		trial_id: "end",
    	exp_id: 'stroop_rdoc'
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

// create trials and repeat nodes
var get_practiceNode = function () {
	var practiceTrials = []
	for (i = 0; i < practice_length; i++) {
		var practice_block = {
			type: jsPsychHtmlKeyboardResponse,
			stimulus: practice_stims.stimulus[i],
			data: Object.assign({}, practice_stims.data[i], {
				trial_id: "stim",
				exp_stage: "practice",
				correct_response: practice_stims.key_answer[i]
			}),
			choices: choices,
			response_ends_trial: false,
			stimulus_duration: 1000,
			trial_duration: 1500,
			post_trial_gap: 0,
			prompt: prompt_text,
			on_finish: appendData
		}
		practiceTrials.push(practice_fixation_block, practice_block, practice_feedback_block)
	}

	// loop based on criteria
	var practiceCount = 0
	var practiceNode = {
		timeline: [feedback_block].concat(practiceTrials),
		loop_function: function(data) {
			
			practiceCount += 1
			
			var sum_rt = 0
			var sum_responses = 0
			var correct = 0
			var total_trials = 0
		
			for (var i = 0; i < data.trials.length; i++){
				if (data.trials[i].trial_id == 'stim'){
					total_trials+=1
					if (data.trials[i].rt != null){
						sum_rt += data.trials[i].rt
						sum_responses += 1
						if (data.trials[i].correct_trial == 1){
							correct += 1
						}
					}	
				}	
			}
			var accuracy = correct / total_trials
			var missed_responses = (total_trials - sum_responses) / total_trials
			var ave_rt = sum_rt / sum_responses
		
			if (accuracy > accuracy_thresh || practiceCount == practice_thresh){
				feedback_text = '<div class = centerbox><p class = center-block-text>We will now start the test portion.</p>' + 
				'<p class = block-text>Keep your ' + possible_responses[0][0] + ' on the ' + possible_responses[0][2] + ' your ' + possible_responses[1][0] + ' on the ' +  possible_responses[1][2] + ' and your ' + possible_responses[2][0] + ' on the ' +  possible_responses[0][2] + '</p>' + 
				'<p class = center-block-text>Press <i>enter</i> to continue.</p></div>'
				return false

			} else { 
				feedback_text = "<p class = block-text>Please take this time to read your feedback and to take a short break!</p>"
				if (accuracy < accuracy_thresh) {
					feedback_text += '<p class = block-text>Your accuracy is low.  Remember: </p>' + response_keys 
				}
				if (ave_rt > rt_thresh){
					feedback_text += '<p class = block-text>You have been responding too slowly. Try to respond as quickly and accurately as possible.</p>'
				}
				if (missed_responses > missed_response_thresh){
					feedback_text += '<p class = block-text>You have not been responding to some trials.  Please respond on every trial that requires a response.</p>'
				}
				feedback_text += '<p class = block-text>We are going to repeat the practice round now. Press <i>enter</i> to begin.</p>'
				practice_stims = jsPsych.randomization.repeat(stims, practice_length / 12, true)
				return true
			}
		}
	}
	return practiceNode
}

var get_testNode = function () {
	var testTrials = []
	// testTrials.push(attention_node)
	for (i = 0; i < block_length; i++) {
		var test_block = {
			type: jsPsychHtmlKeyboardResponse,
			stimulus: block_stims.stimulus[i],
			data: Object.assign({}, practice_stims.data[i], {
				trial_id: "stim",
				exp_stage: "test",
				correct_response: block_stims.key_answer[i],
			}),
			choices: choices,
			response_ends_trial: false,
			stimulus_duration: 1000,
			trial_duration: 1500,
			post_trial_gap: 0,
			on_finish: appendData
		}
		testTrials.push(fixation_block, test_block)
	}

	var testCount = 0
	var testNode = {
		timeline: [feedback_block].concat(testTrials),
		loop_function: function(data) {
			testCount += 1
		
			var sum_rt = 0
			var sum_responses = 0
			var correct = 0
			var total_trials = 0
		
			for (var i = 0; i < data.trials.length; i++){
				if (data.trials[i].trial_id == 'stim' && data.trials[i].exp_stage == 'test') {
					total_trials+=1
					if (data.trials[i].rt != null){
						sum_rt += data.trials[i].rt
						sum_responses += 1
						if (data.trials[i].correct_trial == 1){
							correct += 1
						}
          			}
				}
			}

			var accuracy = correct / total_trials
			var missed_responses = (total_trials - sum_responses) / total_trials
			var ave_rt = sum_rt / sum_responses
		
			if (testCount == numTestBlocks) {
				return false
			} else {
				feedback_text = "<p class = block-text>Please take this time to read your feedback and to take a short break!<br>" +
				"You have completed: "+testCount+" out of "+numTestBlocks+" blocks of trials.</p>"

				if (accuracy < accuracy_thresh){
					feedback_text += '<p class = block-text>Your accuracy is too low.  Remember: <br>' + response_keys
				}
				if (missed_responses > missed_response_thresh){
					feedback_text += '<p class = block-text>You have not been responding to some trials.  Please respond on every trial that requires a response.</p>'
				}
				if (ave_rt > rt_thresh){
					feedback_text += '<p class = block-text>You have been responding too slowly. Try to respond as quickly and accurately as possible.</p>'
				}
				if (accuracy >= accuracy_thresh && missed_responses <= missed_response_thresh && ave_rt <= rt_thresh) {
					feedback_text += '<p class = block-text>No feedback on this block.</p>'
				}
				feedback_text += '<p class = block-text>Press <i>enter</i> to continue.</p>'
				block_stims = jsPsych.randomization.repeat(stims, block_length / 12, true)
				return true
			}
		}
	}
	return testNode
}

var fullscreen = {
  type: jsPsychFullscreen,
  fullscreen_mode: true
}
var exit_fullscreen = {
  type: jsPsychFullscreen,
  fullscreen_mode: false
}

/* create experiment definition array */
stroop_rdoc_experiment = []
var stroop_rdoc_init = () => {

	/// document.body.style.background = 'gray' //// CHANGE THIS

	// globals
	practice_stims = jsPsych.randomization.repeat(stims, practice_length / 12, true)
	block_stims = jsPsych.randomization.repeat(stims, block_length / 12, true)

	stroop_rdoc_experiment.push(fullscreen)

	stroop_rdoc_experiment.push(instruction_node)
	
	stroop_rdoc_experiment.push(get_practiceNode())
	stroop_rdoc_experiment.push(get_testNode())

	stroop_rdoc_experiment.push(post_task_block)
	stroop_rdoc_experiment.push(end_block)

	stroop_rdoc_experiment.push(exit_fullscreen)
}
