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

var numTestBlocks = 3
var numTrialsPerBlock = 48

// task specific variables
var possible_responses = [['index finger', ',', 'comma key (,)'], ['middle finger', '.', 'period key (.)']] // [instruct_name, key_code, key_description]
var choices = [possible_responses[0][1], possible_responses[1][1]]

var current_trial = 0
var exp_stage = 'practice'

/* set up stim: location (2) * cue (4) * direction (2) * condition (3) */
var locations = ['up', 'down']
var cues = ['nocue', 'center', 'double', 'spatial']

// images to preload
var path = '/static/experiments/spatial_cueing_rdoc/images/'
var images = [path + 'right_arrow.png', path + 'left_arrow.png', path + 'no_arrow.png']

var test_stimuli = []
for (let l = 0; l < locations.length; l++) {
	var loc = locations[l]
	for (let ci = 0; ci < cues.length; ci++) {
		var c = cues[ci]
		stims = [{
			stimulus: '<div class = centerbox><div class = ANT_text>+</div></div><div class = ANT_' + loc +
				'><img class = ANT_img src = ' + images[2] + '></img><img class = ANT_img src = ' + images[2] + '></img><img class = ANT_img src = ' + images[1] + '></img><img class = ANT_img src = ' + images[2] + '></img><img class = ANT_img src = ' + images[2] + '></img></div>',
			data: {
				correct_response: choices[0],
				flanker_middle_direction: 'left',
				flanker_type: 'neutral',
				flanker_location: loc,
				cue: c, 
				trial_id: 'stim'
			}
		}, {
			stimulus: '<div class = centerbox><div class = ANT_text>+</div></div><div class = ANT_' + loc +
				'><img class = ANT_img src = ' + images[1] + '></img><img class = ANT_img src = ' + images[1] + '></img><img class = ANT_img src = ' + images[1] + '></img><img class = ANT_img src = ' + images[1] + '></img><img class = ANT_img src = ' + images[1] + '></img></div>',
			data: {
				correct_response: choices[0],
				flanker_middle_direction: 'left',
				flanker_type: 'congruent',
				flanker_location: loc,
				cue: c, 
				trial_id: 'stim'
			}
		}, {
			stimulus: '<div class = centerbox><div class = ANT_text>+</div></div><div class = ANT_' + loc +
				'><img class = ANT_img src = ' + images[0] + '></img><img class = ANT_img src = ' + images[0] + '></img><img class = ANT_img src = ' + images[1] + '></img><img class = ANT_img src = ' + images[0] + '></img><img class = ANT_img src = ' + images[0] + '></img></div>',
			data: {
				correct_response: choices[0],
				flanker_middle_direction: 'left',
				flanker_type: 'incongruent',
				flanker_location: loc,
				cue: c, 
				trial_id: 'stim'
			}
		}, {
			stimulus: '<div class = centerbox><div class = ANT_text>+</div></div><div class = ANT_' + loc +
				'><img class = ANT_img src = ' + images[2] + '></img><img class = ANT_img src = ' + images[2] + '></img><img class = ANT_img src = ' + images[0] + '></img><img class = ANT_img src = ' + images[2] + '></img><img class = ANT_img src = ' + images[2] + '></img></div>',
			data: {
				correct_response: choices[1],
				flanker_middle_direction: 'right',
				flanker_type: 'neutral',
				flanker_location: loc,
				cue: c, 
				trial_id: 'stim'
			}
		}, {
			stimulus: '<div class = centerbox><div class = ANT_text>+</div></div><div class = ANT_' + loc +
				'><img class = ANT_img src = ' + images[0] + '></img><img class = ANT_img src = ' + images[0] + '></img><img class = ANT_img src = ' + images[0] + '></img><img class = ANT_img src = ' + images[0] + '></img><img class = ANT_img src = ' + images[0] + '></img></div></div>',
			data: {
				correct_response: choices[1],
				flanker_middle_direction: 'right',
				flanker_type: 'congruent',
				flanker_location: loc,
				cue: c, 
				trial_id: 'stim'
			}
		}, {
			stimulus: '<div class = centerbox><div class = ANT_text>+</div></div><div class = ANT_' + loc +
				'><img class = ANT_img src = ' + images[1] + '></img><img class = ANT_img src = ' + images[1] + '></img><img class = ANT_img src = ' + images[0] + '></img><img class = ANT_img src = ' + images[1] + '></img><img class = ANT_img src = ' + images[1] + '></img></div>',
			data: {
				correct_response: choices[1],
				flanker_middle_direction: 'right',
				flanker_type: 'incongruent',
				flanker_location: loc,
				cue: c, 
				trial_id: 'stim'
			}
		}]
		test_stimuli = test_stimuli.concat(stims)
	}
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
		'<p class = block-text>In this task, you will see two boxes on either side of the screen. On each trial, a star will appear in one of them.</p>' +
		'<p class = block-text>Your task is to press your <b>' + possible_responses[0][0] + '</b> if the star appears in the <b>left box</b>, and your <b>' + possible_responses[1][0] + '</b> if the star appears in the <b>right box</b>.</p>' +
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


/***** TRIAL BLOCKS *****/

//initialize
var first_fixation_gap = Math.floor(Math.random() * 1200) + 400;
var last_fixation_gap = Math.floor(Math.random() * 1200) + 400;
function getFixationBlock(which='middle', prompt='') {
	var timing = 400 //ms
	if (which == 'first') {
		timing = first_fixation_gap
	} else if (which == 'last') {
		timing = last_fixation_gap
	} 
	var fixation_block = {
		type: jsPsychHtmlKeyboardResponse,
		stimulus: '<div class = centerbox><div class = fixation>+</div></div>',
		choices: ['NO_KEYS'],
		data: {
			trial_id: 'fixation',
			exp_stage: exp_stage
		},
		post_trial_gap: 0,
		stimulus_duration: timing,
		trial_duration: timing,
		prompt: prompt
	}
	return fixation_block
}


function getCueBlock(cuetype, cue_location = 'Error', prompt='') {
	var cue_block = {
		type: jsPsychHtmlKeyboardResponse,
		stimulus: function () {
			if (cuetype == 'nocue') {
				return '<div class = centerbox><div class = ANT_text>+</div></div>'
			} else if (cuetype == 'center') {
				return '<div class = centerbox><div class = ANT_centercue_text>*</div></div>'
			} else if (cuetype == 'double') {
				'<div class = centerbox><div class = ANT_text>+</div></div><div class = ANT_down><div class = ANT_text>*</div></div><div class = ANT_up><div class = ANT_text>*</div><div></div>'
			} else if (cuetype == 'spatial') {
				return '<div class = centerbox><div class = ANT_text>+</div></div><div class = centerbox><div class = ANT_' + cue_location +
				'><div class = ANT_text>*</p></div></div>'
			}
		},
		choices: ['NO_KEYS'], 
		data: {
			trial_id: cuetype,
			exp_stage: exp_stage
		},
		post_trial_gap: 0,
		stimulus_duration: 100,
		trial_duration: 100,
		prompt: prompt
	}
	return cue_block
}

function getTrialBlock(trial_stim, trial_data, prompt='') {
	var trial = {
		type: jsPsychHtmlKeyboardResponse,
		stimulus: trial_stim,
		choices: choices,
		data: Object.assign({}, trial_data, {
			trial_id: 'stim',
			exp_stage: exp_stage
		}),
		trial_duration: 1700,
		stimulus_duration: 1700,
		response_ends_trial: false,
		post_trial_gap: 0,
		on_finish: appendData,
		prompt: prompt
	}
	return trial
}


var get_practiceNode = function() {
	var practiceTrials = []
	var trial_num = 0
	for (let i = 0; i < practice_stims.length; i++) {

		trial_num += 1
		practice_stims[i].data.trial_num = trial_num
		first_fixation_gap = Math.floor(Math.random() * 1200) + 400

		practiceTrials.push(
			getFixationBlock(which='first', prompt=prompt_text),
			getCueBlock(practice_stims[i].data.cue, practice_stims[i].data.flanker_location, prompt=prompt_text),
			getFixationBlock(which='middle', prompt=prompt_text),
			getTrialBlock(practice_stims[i].stimulus, practice_stims[i].data, prompt=prompt_text),
			practice_feedback_block,
			// getFixationBlock(which='last', practice=true) //idrk what this is for
		)
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
				exp_stage = 'test'
				block_stims = jsPsych.randomization.repeat(test_stimuli, numTrialsPerBlock / test_stimuli.length)
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
				practice_stims = jsPsych.randomization.repeat(
					test_stimuli.slice(0, 12).concat(test_stimuli.slice(
					18, 21)).concat(test_stimuli.slice(36, 45)), 
					1, true);
				return true
			}
		}
	}
	return practiceNode
}

var get_testNode = function() {
	var trial_num = 0
	var testTrials = []

	for (i = 0; i < block_stims.length; i++) {
		trial_num += 1
		block_stims[i].data.trial_num = trial_num
		first_fixation_gap = Math.floor(Math.random() * 1200) + 400

		testTrials.push(
			getFixationBlock(which='first', practice=true),
			getCueBlock(block_stims[i].data.cue, block_stims[i].data.flanker_location),
			getFixationBlock(which='middle', practice=true),
			getTrialBlock(block_stims[i].stimulus, block_stims[i].data),
			// getFixationBlock(which='last', practice=true) //idrk what this is for
		)
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
				block_stims = jsPsych.randomization.repeat(test_stimuli, numTrialsPerBlock / test_stimuli.length)
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

var spatial_cueing_rdoc_experiment = [];
spatial_cueing_rdoc_init = () => {
	document.body.style.background = 'gray' //// CHANGE THIS
	
	jsPsych.pluginAPI.preloadImages(images)

	/* 24 practice trials. Included all nocue up trials, center cue up trials, double cue down trials, and 6 spatial trials (3 up, 3 down) */
	practice_stims = jsPsych.randomization.repeat(
		test_stimuli.slice(0, 12).concat(test_stimuli.slice(
		18, 21)).concat(test_stimuli.slice(36, 45)), 
		1);
	block_stims = jsPsych.randomization.repeat(test_stimuli, numTrialsPerBlock / test_stimuli.length, true) // jsPsych.randomization.repeat($.extend(true, [], test_stimuli), 1, true)

	spatial_cueing_rdoc_experiment.push(fullscreen)
	spatial_cueing_rdoc_experiment.push(instruction_node);

	spatial_cueing_rdoc_experiment.push(get_practiceNode())
	// spatial_cueing_rdoc_experiment.push(rest_block)
	spatial_cueing_rdoc_experiment.push(get_testNode())

	spatial_cueing_rdoc_experiment.push(post_task_block)
	spatial_cueing_rdoc_experiment.push(end_block)
	spatial_cueing_rdoc_experiment.push(exit_fullscreen)
}