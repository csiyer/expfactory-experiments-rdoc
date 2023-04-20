/* ************************************ */
/* Define helper functions */
/* ************************************ */

function addID() {
	jsPsych.data.get().addToLast({exp_id: 'spatial_cueing_rdoc'})
}

function assessPerformance() {
	/* Function to calculate the "credit_var", which is a boolean used to
	credit individual experiments in expfactory. 
	 */
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
		trial_count += 1
		rt = experiment_data[i].rt
		key = experiment_data[i].key_press
		correct += experiment_data[i].correct_trial
		choice_counts[key] += 1
		if (rt == null) {
			missed_count += 1
		} else {
			rt_array.push(rt)
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
	var credit_var = (missed_percent < 0.4 && avg_rt > 200 && responses_ok)
	jsPsych.data.get().addToLast({final_credit_var: credit_var,
								final_missed_percent: missed_count/trial_count,
								final_avg_rt: avg_rt,
								final_responses_ok: responses_ok,
								final_accuracy: correct/trial_count})

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
var run_attention_checks = false
var attention_check_thresh = 0.65
var instructTimeThresh = 0 ///in seconds
var accuracy_thresh = 0.75
var rt_thresh = 1000
var missed_response_thresh = 0.10
var practice_thresh = 3 // 3 blocks max

var numPracticeTrials = 4 // 12 
var numTestBlocks = 3
var numTrialsPerBlock = 48 // should be multiple of 24

// task specific variables
var possible_responses = [['index finger', ',', 'comma key (,)'], ['middle finger', '.', 'period key (.)']] // [instruct_name, key_code, key_description]
var choices = [possible_responses[0][1], possible_responses[1][1]]

var trial_proportions = ['valid', 'valid', 'valid',  'invalid']

var current_trial = 0
var exp_stage = 'practice'
var currStim = ''

var fixation = '<div class = centerbox><div class = fixation style="font-size:100px">+</div></div>'

var images = {
	left: {
		box: '<div class = bigbox><div id = left_box></div></div>',
		bold: '<div class = bigbox><div id = left_box style="border-width:15px"></div></div>',
		star: '<div class = bigbox><div id = left_box><div class=center-text>*</div></div></div>',
	},
	right: {
		box: '<div class = bigbox><div id = right_box></div></div>',
		bold: '<div class = bigbox><div id = right_box style="border-width:15px"></div></div>',
		star: '<div class = bigbox><div id = right_box><div class=center-text>*</div></div></div>',
	},
}

var stimuli = []
// making 24 stimuli: 4 nocue left, 4 nocue right; 4 doublecue left, 4 doublecue right; 3 valid left, 1 invalid left, 3 valid right, 1 invalid right
for (let i = 0; i < 2; i++) {
	var loc = ['left', 'right'][i]
	var noloc = ['left', 'right'].filter(value => value != loc)[0]
	// for this side, add 4 nocue, 4 double cue, 3 valid, 1 invalid
	nocue_trials = Array(4).fill(
		{
			stimulus: images[loc].star + images[noloc].box + fixation,
			cue_stimulus: images[loc].box + images[noloc].box + fixation,
			data: {
				cue_type: 'nocue',
				correct_response: choices[i]
			}
		}
	) 
	doublecue_trials = Array(4).fill(
		{
			stimulus: images[loc].star + images[noloc].box + fixation,
			cue_stimulus: images[loc].bold + images[noloc].bold + fixation,
			data: {
				cue_type: 'doublecue',
				correct_response: choices[i]
			}
		}
	)
	valid_trials = Array(3).fill(
		{
			stimulus: images[loc].star + images[noloc].box + fixation,
			cue_stimulus: images[loc].bold + images[noloc].box + fixation,
			data: {
				cue_type: 'valid',
				correct_response: choices[i]
			}
		}
	)
	invalid_trial = [
		{
			stimulus: images[loc].star + images[noloc].box + fixation,
			cue_stimulus: images[loc].box + images[noloc].bold + fixation,
			data: {
				cue_type: 'invalid',
				correct_response: choices[i]
			}
		}
	]
	stimuli = stimuli.concat(nocue_trials, doublecue_trials, valid_trials, invalid_trial)
}

var prompt_text = '<div class = prompt_box>'+
            '<p class = center-block-text style = "font-size:16px; line-height:80%%;">Star in left box: ' + possible_responses[0][0]+'</li>' +
            '<p class = center-block-text style = "font-size:16px; line-height:80%%;">Star in right box: ' + possible_responses[1][0] +'</li>' +
          '</div>'

var speed_reminder = '<p class = block-text>Try to respond as quickly and accurately as possible.</p>'


/* ************************************ */
/* Set up jsPsych blocks */
/* ************************************ */
// Set up attention check node
// var attention_check_block = {
// 	type: 'attention-check',
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
var post_task_block = {
	type: jsPsychSurveyText,
	data: {
		exp_id: "spatial_cueing_rdoc",
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

var feedback_instruct_text =
  '<p class=center-block-text>Welcome! This experiment will take around 15 minutes.</p>' +
  '<p class=center-block-text>To avoid technical issues, please keep the experiment tab (on Chrome or Firefox) active and in full-screen mode for the whole duration of each task.</p>' +
  '<p class=center-block-text> Press <i>enter</i> to begin.</p>'
var feedback_instruct_block = {
  type: jsPsychHtmlKeyboardResponse,
  choices: ['Enter'],
  stimulus: getInstructFeedback,
  data: {
    trial_id: 'instruction_feedback'
  },
  post_trial_gap: 0,
  trial_duration: 180000
};

/// This ensures that the subject does not read through the instructions too quickly.  If they do it too quickly, then we will go over the loop again.
var instructions_block = {
	type: jsPsychInstructions,
	pages: [
	  '<div class = centerbox>'+
		'<p class=block-text>Place your <b>' + possible_responses[0][0] + '</b> on the <b>' + possible_responses[0][2] + '</b> and your <b>' + possible_responses[1][0] + '</b> on the <b>' + possible_responses[1][2] + '</b> </p>' + 
		'<p class = block-text>In this task, you should focus your gaze on the \'+\' sign in the center of the screen throughout. </p>' +
		'<p class = block-text>There will be two boxes on either side of the screen. On each trial, a star will appear in one of them.</p>'+ 
		'<p class = block-text>While focusing on the central \'+\', your task is to press your <b>' + possible_responses[0][0] + '</b> if the star appears in the <b>left box</b>, and your <b>' + possible_responses[1][0] + '</b> if the star appears in the <b>right box</b>.</p>' +
		'<p class = block-text>On some trials, one or both of the boxes will be highlighted before the star appears. No matter which box(es) are highlighted, it is important that you quickly and accurately indicate where the star appears.</p>' +
	  '</div>',
	  '<div class = centerbox><p class = block-text>We\'ll start with a practice round. During practice, you will receive feedback and a reminder of the rules. '+
	  'These will be taken out for test, so make sure you understand the instructions before moving on.</p>'+
	   speed_reminder + '</div>',
	],
	allow_keys: false,
	data: {
	  exp_id: "spatial_cueing_rdoc",
	  trial_id: 'instructions'
	},
	show_clickable_nav: true,
	post_trial_gap: 0
};

var sumInstructTime = 0 //ms
var instruction_node = {
timeline: [feedback_instruct_block, instructions_block],
/* This function defines stopping criteria */
loop_function: function(data) {
	for (i = 0; i < data.trials.length; i++) {
	if ((data.trials[i].trial_id == 'instructions') && (data.trials[i].rt != null)) {
		rt = data.trials[i].rt
		sumInstructTime = sumInstructTime + rt
	}
	}
	if (sumInstructTime <= instructTimeThresh * 1000) {
	feedback_instruct_text = 'Read through instructions too quickly.  Please take your time and make sure you understand the instructions.  Press <i>enter</i> to continue.'
	return true
	} else {
	feedback_instruct_text = 'Done with instructions. Press <i>enter</i> to continue.'
	return false
	}
}
};

var rest_block = {
type: jsPsychHtmlKeyboardResponse,
trial_duration: 180000,
data: {
	trial_id: "rest"
},
choices: ["ALL_KEYS"],
stimulus: '<div class = centerbox><p class = block-text>Take a break! Press any key to continue.</p></div>',
post_trial_gap: 1000
};

// for each practice trial
var practice_feedback_block = {
	type: jsPsychHtmlKeyboardResponse,
	stimulus: function() {
	  var last = jsPsych.data.get().last(1).values()[0]
	  if (last.response == null) {
		return '<div class = fb_box><div class = center-text><font size =20>Respond Faster!</font></div></div>' + images.left.box + images.right.box + fixation
	  } else if (last.correct_trial == 1) {
		return '<div class = fb_box><div class = center-text><font size =20>Correct!</font></div></div>' + images.left.box + images.right.box + fixation
	  } else {
		return '<div class = fb_box><div class = center-text><font size =20>Incorrect</font></div></div>' + images.left.box + images.right.box + fixation
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


var getCue = function(){
	currStim = block_stims.pop()
	currStim.data.trial_num = trial_num
	return currStim.cue_stimulus
}

var getStim = function() {
 	return currStim.stimulus
}

var getStimData = function() {
	return currStim.data
}


// initialize
var first_fixation_gap = 1000
var second_fixation_gap = Math.floor(Math.random() * 1200) + 400; //CTI
var last_fixation_gap = 400

var practiceTrials = []
var trial_num = 0
for (let i = 0; i < numPracticeTrials; i++) {

	trial_num += 1
	var first_fixation_block = {
		type: jsPsychHtmlKeyboardResponse,
		stimulus: images.left.box + images.right.box + fixation,
		choices: ['NO_KEYS'],
		data: {
			trial_id: 'fixation',
			exp_stage: 'practice'
		},
		post_trial_gap: 0,
		stimulus_duration: first_fixation_gap,
		trial_duration: first_fixation_gap,
		prompt: prompt_text
	}
	var cue_block = {
		type: jsPsychHtmlKeyboardResponse,
		stimulus: getCue, 
		choices: ['NO_KEYS'], 
		data: function () {
			return {
				trial_id: getStimData().cue_type,
				exp_stage: 'practice'
			}
		},
		post_trial_gap: 0,
		stimulus_duration: 500,
		trial_duration: 500,
		prompt: prompt_text
	}
	var second_fixation_block = {
		type: jsPsychHtmlKeyboardResponse,
		stimulus: images.left.box + images.right.box + fixation,
		choices: ['NO_KEYS'],
		data: {
			trial_id: 'fixation',
			exp_stage: 'practice'
		},
		post_trial_gap: 0,
		stimulus_duration: second_fixation_gap,
		trial_duration: second_fixation_gap,
		prompt: prompt_text,
		on_finish: function() {second_fixation_gap = Math.floor(Math.random() * 1200) + 400}
	}
	var trial_block = {
		type: jsPsychHtmlKeyboardResponse,
		stimulus: getStim,
		choices: choices,
		data: function() {
			return Object.assign({}, getStimData(), {
				trial_id: 'stim',
				exp_stage: 'practice'})
		},
		trial_duration: 1000,
		stimulus_duration: 1000,
		response_ends_trial: false,
		post_trial_gap: 0,
		on_finish: appendData,
		prompt: prompt_text
	}
	practiceTrials.push(first_fixation_block, cue_block, second_fixation_block, trial_block, practice_feedback_block)
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
			'<p class = block-text>Keep your gaze on the central \'+\', your ' + possible_responses[0][0] + ' on the ' + possible_responses[0][2] + ' and your ' + possible_responses[1][0] + ' on the ' +  possible_responses[1][2] +  '</p>' + 
			'<p class = center-block-text>Press <i>enter</i> to continue.</p></div>'
			exp_stage = 'test'
			block_stims = jsPsych.randomization.repeat(stimuli, numTrialsPerBlock / stimuli.length) 
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
			block_stims = jsPsych.randomization.repeat(stimuli, 1).slice(0, numPracticeTrials)
			return true
		}
	}
}

var trial_num = 0
var testTrials = []

for (i = 0; i < numTrialsPerBlock; i++) {
	trial_num += 1

	trial_num += 1
	var first_fixation_block = {
		type: jsPsychHtmlKeyboardResponse,
		stimulus: images.left.box + images.right.box + fixation,
		choices: ['NO_KEYS'],
		data: {
			trial_id: 'fixation',
			exp_stage: 'test'
		},
		post_trial_gap: 0,
		stimulus_duration: first_fixation_gap,
		trial_duration: first_fixation_gap,
	}
	var cue_block = {
		type: jsPsychHtmlKeyboardResponse,
		stimulus: getCue, 
		choices: ['NO_KEYS'], 
		data: function () {
			return {
				trial_id: getStimData().cue_type,
				exp_stage: 'test'
			}
		},
		post_trial_gap: 0,
		stimulus_duration: 500,
		trial_duration: 500,
		prompt: prompt_text
	}
	var second_fixation_block = {
		type: jsPsychHtmlKeyboardResponse,
		stimulus: images.left.box + images.right.box + fixation,
		choices: ['NO_KEYS'],
		data: {
			trial_id: 'fixation',
			exp_stage: 'test'
		},
		post_trial_gap: 0,
		stimulus_duration: second_fixation_gap,
		trial_duration: second_fixation_gap,
		prompt: prompt_text,
		on_finish: function() {second_fixation_gap = Math.floor(Math.random() * 1200) + 400}
	}
	var trial_block = {
		type: jsPsychHtmlKeyboardResponse,
		stimulus: getStim,
		choices: choices,
		data: function() {
			return Object.assign({}, getStimData(), {
				trial_id: 'stim',
				exp_stage: 'test'})
		},
		trial_duration: 1000,
		stimulus_duration: 1000,
		response_ends_trial: false,
		post_trial_gap: 0,
		on_finish: appendData,
		prompt: prompt_text
	}
	var last_fixation_block = {
		type: jsPsychHtmlKeyboardResponse,
		stimulus: images.left.box + images.right.box + fixation,
		choices: ['NO_KEYS'],
		data: {
			trial_id: 'fixation',
			exp_stage: 'test'
		},
		post_trial_gap: 0,
		stimulus_duration: last_fixation_gap,
		trial_duration: last_fixation_gap,
		prompt: prompt_text,
		on_finish: function() {second_fixation_gap = Math.floor(Math.random() * 1200) + 400}
	}
	practiceTrials.push(first_fixation_block, cue_block, second_fixation_block, trial_block, last_fixation_gap)
}
// testTrials.push(attention_node)
// testTrials.push(rest_block)

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
			block_stims = jsPsych.randomization.repeat(stimuli, numTrialsPerBlock / stimuli.length) 
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

var spatial_cueing_rdoc_experiment = [];
spatial_cueing_rdoc_init = () => {
	document.body.style.background = 'gray' //// CHANGE THIS

	/* 24 practice trials. Included all nocue up trials, center cue up trials, double cue down trials, and 6 spatial trials (3 up, 3 down) */
	block_stims = jsPsych.randomization.repeat(stimuli, 1).slice(0, numPracticeTrials)
	
	spatial_cueing_rdoc_experiment.push(fullscreen)
	spatial_cueing_rdoc_experiment.push(instruction_node);
	spatial_cueing_rdoc_experiment.push(practiceNode)
	spatial_cueing_rdoc_experiment.push(testNode)
	spatial_cueing_rdoc_experiment.push(post_task_block)
	spatial_cueing_rdoc_experiment.push(end_block)
	spatial_cueing_rdoc_experiment.push(exit_fullscreen)
}