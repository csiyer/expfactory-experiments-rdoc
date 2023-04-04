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
	jsPsych.data.addDataToLastTrial({final_credit_var: credit_var,
		final_missed_percent: missed_percent,
		final_avg_rt: avg_rt,
		final_responses_ok: responses_ok,
		final_accuracy: accuracy})
}

function evalAttentionChecks() {
	var check_percent = 1
	if (run_attention_checks) {
		var attention_check_trials = jsPsych.data.getTrialsOfType('attention-check-rdoc')
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

var getInstructFeedback = function() {
	return '<div class = centerbox><p class = center-block-text>' + feedback_instruct_text +
		'</p></div>'
}

/* ************************************ */
/* Define experimental variables */
/* ************************************ */
// generic task variables
var credit_var = 0
var run_attention_checks = true
var attention_check_thresh = 0.45
var instructTimeThresh = 0 ///in seconds

var possible_responses = [['index finger', ',', 'comma key (,)'], 
	['middle finger', '.', 'period key (.)'], 
	['ring finger', '/', 'slash key (/)']]

// task specific variables
var exp_stage = 'practice' // just initialize to use later on
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
var practice_len = 24
var exp_len = 96
var choices = [possible_responses[0][1], possible_responses[1][1], possible_responses[2][1]]

var speed_reminder = '<p class = block-text>Try to respond as quickly and accurately as possible.</p>'
var response_keys = 
	'<ul list-text><li><span class = "large" style = "color:red">WORD</span>: ' + possible_responses[0][0] + 
	'</li><li><span class = "large" style = "color:blue">WORD</span>: ' + possible_responses[1][0] + 
	'</li><li><span class = "large" style = "color:green">WORD</span>: ' + possible_responses[2][0] + ' </li></ul>'

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
	   prompt: '<p class = center-block-text style = "font-size: 20px">Please summarize what you were asked to do in this task.</p>',
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
		trial_id: "instruction"
	},
	pages: [
		'<div class = centerbox>'+
			'<p class=block-text>Place your <b>' + possible_responses[0][0] + '</b> on the <b>' + possible_responses[0][2] + '</b> your <b>' + possible_responses[1][0] + '</b> on the <b>' + possible_responses[1][2] + '</b> and your <b>' + possible_responses[2][0] + '</b> on the <b>' + possible_responses[2][2] + '</b> </p>' + 
			'<p class = block-text>In this task, you will see a series of "color" words (RED, BLUE, GREEN). The "ink" of the words will also be colored. For example, you may see: ' +
			'<span class = "large" style = "color:blue">RED</span>, <span class = "large" style = "color:blue">BLUE</span>, or <span class = "large" style = "color:red">BLUE</span>.</p>' +
			'<p class = block-text>Your task is to press the following buttons corresponding to the <b>ink color</b> (not the word itself):' +
			response_keys +
		'</div>',
		'<div class = centerbox><p class = block-text>A practice round will start when you press "end instructions". During practice, you will receive feedback and a reminder of the rules. '+
    	'These will be taken out for test, so make sure you understand the instructions before moving on.</p>'+
		'<p class = block-text>Remember, press the key corresponding to the <strong>ink</strong> color of the word: </p>' + response_keys + speed_reminder + '</div>',
	],
	allow_keys: false,
	show_clickable_nav: true,
	post_trial_gap: 1000
};

/// This ensures that the subject does not read through the instructions too quickly.  If they do it too quickly, then we will go over the loop again.
var sumInstructTime = 0 //ms
var instruction_node = {
	timeline: [feedback_instruct_block, instructions_block],
	/* This function defines stopping criteria */
	loop_function: function(data) {
		for (i = 0; i < data.trials.length; i++) {
			if ((data.trials[i].trial_id == 'instruction') && (data.trials[i].rt !=null)) {
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

var start_test_block = {
	type: jsPsychHtmlKeyboardResponse,
	data: {
		trial_id: "test_intro"
	},
	trial_duration: 180000,
	stimulus: '<div class = centerbox><p class = center-block-text>We will now start the test portion.</p>' + 
	'<p class = block-text>Keep your ' + possible_responses[0][0] + ' on the ' + possible_responses[0][2] + ' your ' + possible_responses[1][0] + ' on the ' +  possible_responses[1][2] + ' and your ' + possible_responses[2][0] + ' on the ' +  possible_responses[0][2] + '</p>' + 
	'<p class = center-block-text>Press <i>enter</i> to begin.</p></div>',
	choices: ['Enter'],
	post_trial_gap: 1000,
	on_finish: function() {
		exp_stage = 'test'
	}
};

var fixation_block = {
	type: jsPsychHtmlKeyboardResponse,
	stimulus: '<div class = centerbox><div class = fixation>+</div></div>',
	is_html: true,
	choices: ["NO_KEYS"],
	data: {
		trial_id: "fixation"
	},
	post_trial_gap: 500,
	stimulus_duration: 500,
	trial_duration: 500,
	on_finish: function() {
		jsPsych.data.addDataToLastTrial({'exp_stage': exp_stage})
	},
}

var end_block = {
	type: jsPsychHtmlKeyboardResponse,
	data: {
		trial_id: "end",
    	exp_id: 'stroop'
	},
	trial_duration: 180000,
	stimulus: '<div class = centerbox><p class = center-block-text>Thanks for completing this task!</p><p class = center-block-text>Press <i>enter</i> to continue.</p></div>',
	choices: ['Enter'],
	post_trial_gap: 0,
	on_finish: function() {
		assessPerformance()
		evalAttentionChecks()
	} 
};

/* create experiment definition array */
stroop_rdoc_experiment = []
var stroop_rdoc_init = () => {
	var practice_stims = jsPsych.randomization.repeat(stims, practice_len / 12, true)
	var test_stims = jsPsych.randomization.repeat(stims, exp_len / 12, true)

	stroop_rdoc_experiment.push(instruction_node)
	// practice trials
	for (i = 0; i < practice_len; i++) {
		stroop_rdoc_experiment.push(fixation_block)
		var practice_block = {
			type: jsPsychCategorizeHtml,
			stimulus: practice_stims.stimulus[i],
			data: practice_stims.data[i],
			key_answer: practice_stims.key_answer[i],
			is_html: true,
			correct_text: '<div class = fb_box><div class = center-text><font size = 20>Correct!</font></div></div>',
			incorrect_text: '<div class = fb_box><div class = center-text><font size = 20>Incorrect</font></div></div>',
			timeout_message: '<div class = fb_box><div class = center-text><font size = 20>Respond Faster!</font></div></div>',
			choices: choices,
			trial_duration: 1500,
			// stimulus_duration: -1, // null=until trial ends
			feedback_duration: 500,
			show_stim_with_feedback: true,
			response_ends_trial: false,
			post_trial_gap: 250,
			on_finish: function() {
				jsPsych.data.addDataToLastTrial({
					trial_id: 'stim',
					exp_stage: 'practice'
				})
			}
		}
		stroop_rdoc_experiment.push(practice_block)
	}
	// stroop_rdoc_experiment.push(attention_node)

	stroop_rdoc_experiment.push(start_test_block)
	// test trials 
	for (i = 0; i < exp_len; i++) {
		stroop_rdoc_experiment.push(fixation_block)
		var test_block = {
			type: jsPsychCategorizeHtml,
			stimulus: test_stims.stimulus[i],
			data: test_stims.data[i],
			key_answer: test_stims.key_answer[i],
			is_html: true,
			// correct_text: '<div class = fb_box><div class = center-text>Correct!</div></div>',
			// incorrect_text: '<div class = fb_box><div class = center-text>Incorrect</div></div>',
			// timeout_message: '<div class = fb_box><div class = center-text>Respond Faster!</div></div>',
			choices: choices,
			timing_response: 1500,
			// stimulus_duration: -1, // whole trial
			feedback_duration: 500,
			// show_stim_with_feedback: true,
			post_trial_gap: 250,
			response_ends_trial: false,
			on_finish: function() {
				jsPsych.data.addDataToLastTrial({
					trial_id: 'stim',
					exp_stage: 'test'
				})
			}
		}
		stroop_rdoc_experiment.push(test_block)
	}
	// stroop_rdoc_experiment.push(attention_node)
	stroop_rdoc_experiment.push(post_task_block)
	stroop_rdoc_experiment.push(end_block)
}