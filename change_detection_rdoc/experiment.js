/* ************************************ */
/* Define helper functions */
/* ************************************ */
function addID() {
	jsPsych.data.get().addToLast({exp_id: 'change_detection_rdoc'})
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
	var avg_rt = -1
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

function appendData() {
	jsPsych.data.get().addToLast({correct_trial: data.response == data.correct_response ? 1: 0})
}

var setBlockStims = function() {
  if (search_type == 'feature') {
    
  } else if (search_type == 'conjunction') {
    
  } else if (block_type == 'high') {
    
  } else if (block_type == 'low') {
    
  }
}

var getStim = function() {
  currStim = block_stims.shift()
  return currStim.stimulus
}

var getStimData = function() {
 return currStim.data
}

var getBlockType = function() {
  return block_type
}

var getExpStage = function() {
  return exp_stage
}

var getInstructFeedback = function() {
	return '<div class = centerbox><p class = center-block-text>' + feedback_instruct_text + '</p></div>'
}

var getFeedback = function() {
  return '<div class = centerbox><div class = center-text>' + feedback_text + '</div></div>'
}

/* ************************************ */
/* Define experimental variables */
/* ************************************ */
// generic task variables
const run_attention_checks = false
const attention_check_thresh = 0.65
const sumInstructTime = 0 //ms
const instructTimeThresh = 0 ///in seconds

const accuracy_thresh = 0.6
const rt_thresh = 20000
const missed_response_thresh = 0.1
const practice_thresh = 3 // max repetitions

// task specific variables
var possible_responses = {key: [',','.'], key_name: ["index finger","middle finger"], key_description: ["comma key (,)", "period key (.)"]} 
var choices = possible_responses.key

const target_present_prob = 0.5 

const numPracticeTrials = 12 // 2 simple, 2 operation
const numTrialsPerBlock = 48
const numTestBlocks = 4

var exp_stage = 'practice'
const possible_block_types = ['feature', 'conjunction'] // this will randomize load size trial-by-trial. setting this to ['low', 'high'] will randomize search type
var block_type = possible_block_types[0] 
var currStim = ''

var prompt_text = '<div class = prompt_box>'+
					  '<p class = center-block-text style = "font-size:16px; line-height:80%%;">Target present: press ' + possible_responses.key_name[1] + '</p>' +
					  '<p class = center-block-text style = "font-size:16px; line-height:80%%;">Target absent: press ' + possible_responses.key_name[0] + '</p>' +
				  '</div>'
  
var speed_reminder = '<p class = block-text>Try to respond as quickly and accurately as possible.</p>'


////// CREATE STIMULI !!! //////////////////////////////////////////
var stimuli = [
  {
    'stimulus': '<stim path here>',
    'data': {
      'target_present': 0, //1
      'num_distractors': 9, // 24
      'search_type': 'feature', // 'conjunction'
      'correct_response': choices[0] // choices[1]
    }
  },
]
////// CREATE STIMULI !!! //////////////////////////////////////////


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
		exp_id: 'change_detection_rdoc',
		trial_id: 'post task questions'
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
		trial_id: 'end',
    	exp_id: 'change_detection_rdoc'
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
		trial_id: 'instruction_feedback'
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
      '<p class=block-text>Place your <b>' + possible_responses.key_name[0] + '</b> on the <b>' + possible_responses.key_description[0] + '</b> and your <b>' + possible_responses.key_name[1] + '</b> on the <b>' + possible_responses.key_description[1] + '</b></p>' + 
      '<p class = block-text>In this experiment, on each trial you will see several black and white rectangles at various angles.</p>' +
      '<p class = block-text>On some trials, <b>one</b> of these rectangles will be angled differently than all others of its color. We will call this rectangle the \'target\'.</p>' + 
      '<p class = block-text>A target will only be present on some trials--your task is to determine whether a target is present or absent on each trial. You will only have a few seconds to do so.</p>' + 
      '<p class=block-text>If you determine a target is <b>present, press your <b>' + possible_responses.key_name[0] + '</b>, and if you determine a target is <b>absent, press your ' + possible_responses.key_name[1] + '</b>.</p>' + 
      speed_reminder + 
    '</div>',
    '<div class = centerbox>'+
      '<p class = block-text>We\'ll start with a practice round. During practice, you will receive feedback and a reminder of the rules. These will be taken out for the test, so make sure you understand the instructions before moving on.</p>' +
    '</div>',
	],
	allow_keys: false,
	data: {
		trial_id: 'instructions'
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
		trial_id: 'feedback'
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

var fixation_block = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: '<div class = centerbox><div class = fixation>+</div></div>',
  data: function () {
    return {
      trial_id: 'practice_fixation',
      exp_stage: getExpStage()
    }
  },
  choices: ['NO_KEYS'],
  stimulus_duration: 500, //500 
  trial_duration: 500, //500
  post_trial_gap: 0,
  prompt: function() {return getExpStage == 'practice' ? prompt_text : ''},
};

var stimulus_block = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: getStim,
  stimulus_duration: 5000,
  trial_duration: 5000,
  post_trial_gap: 0,
  data: function () {
    return {
      trial_id: 'stim',
      exp_stage: getExpStage(),
    }
  },
  choices: ['NO_KEYS'],
  prompt: function() {return getExpStage() == 'practice' ? prompt_text : ''}
}

var set_stims_block = {
  type: jsPsychCallFunction,
  func: setBlockStims
}

var practiceTrials = []
for (let i = 0; i < numPracticeTrials; i++) {
  practiceTrials.push(set_stims_block, fixation_block, stimulus_block, practice_feedback_block)
}

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
			setBlockStims()
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
			setBlockStims()  /// PRACTICE STIMS?? 
			return true
		}
	}
}

var testTrials = []
for (let i = 0; i < numTrialsPerBlock; i++) {
  testTrials.push(fixation_block, stimulus_block)
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
			if (data.trials[i].trial_id == 'test_trial') {
				total_trials+=1
				if (data.trials[i].rt != null){
					sum_rt += data.trials[i].rt
					sum_responses += 1
					if (data.trials[i].response == data.trials[i].correct_response){
						correct += 1
		
					}
				}
		
			}
		}
		var accuracy = correct / total_trials
		var missed_responses = (total_trials - sum_responses) / total_trials
		var ave_rt = sum_rt / sum_responses
	
		if (testCount == numTestBlocks){
			feedback_text = '</p><p class = block-text>Done with this test. Press <i>enter</i> to continue.<br> If you have been completing tasks continuously for an hour or more, please take a 15-minute break before starting again.'
			return false
		} else {
			feedback_text = "<p class = block-text>Please take this time to read your feedback and to take a short break!<br>" +
				"You have completed: "+testCount+" out of "+numTestBlocks+" blocks of trials.</p>"

			if (accuracy < accuracy_thresh){
				feedback_text += '<p class = block-text>Your accuracy is too low.  Remember: <br>' + prompt_text_list
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
      block_type = possible_block_types.filter((x => x != block_type))[0] // switch block type
      setBlockStims()
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
change_detection_rdoc_experiment = []
var change_detection_rdoc_init = () => {
	document.body.style.background = 'gray' //// CHANGE THIS

	change_detection_rdoc_experiment.push(fullscreen)
	change_detection_rdoc_experiment.push(instruction_node)
	change_detection_rdoc_experiment.push(practiceNode)
	change_detection_rdoc_experiment.push(testNode)
	change_detection_rdoc_experiment.push(post_task_block)
	change_detection_rdoc_experiment.push(end_block)
	change_detection_rdoc_experiment.push(exit_fullscreen)
}