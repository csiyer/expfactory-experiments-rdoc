/* ************************************ */
/* Define helper functions */
/* ************************************ */
function addID() {
	jsPsych.data.get().addToLast({exp_id: 'flanker_rdoc'})
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
	var experiment_data = jsPsych.data.get().filter({trial_id: 'test_trial'}).trials 
	var missed_count = 0
	var trial_count = 0
	var rt_array = []
	var rt = 0
	var correct = 0
	//record choices participants made
	var choice_counts = {}
	choice_counts[-1] = 0
	choice_counts[response_keys.key[0]] = 0
	choice_counts[response_keys.key[1]] = 0
	for (var i = 0; i < experiment_data.length; i++) {
		trial_count += 1
		rt = experiment_data[i].rt
		key = experiment_data[i].response
		choice_counts[key] += 1
		if (rt == -1) {
			missed_count += 1
		} else {
			rt_array.push(rt)
		}
		
		if (key == experiment_data[i].correct_response){
			correct += 1
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
	credit_var = (missed_percent < 0.25 && avg_rt > 200 && responses_ok && accuracy > 0.60)

	jsPsych.data.get().addToLast({final_credit_var: credit_var,
								final_missed_percent: missed_percent,
								final_avg_rt: avg_rt,
								final_responses_ok: responses_ok,
								final_accuracy: accuracy})
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
var run_attention_checks = true
var attention_check_thresh = 0.45
var sumInstructTime = 0 //ms
var instructTimeThresh = 0 ///in seconds

var accuracy_thresh = 0.75
var rt_thresh = 1000
var missed_response_thresh = 0.10
var practice_thresh = 3 // 3 blocks of 12 trials
var response_keys = {key: [',','.'], key_name: ["index finger","middle finger"], key_description: ["comma", "period"]} 
// lets just say response_keys.key[0] 'H' and response_keys.key[1] 'F' // havent implemented counterbalancing
var choices = response_keys.key

var fileTypePNG = '.png"></img>'
var preFileType = '<img class = center src="/static/experiments/flanker_rdoc/images/'
var flanker_boards = [['<div class = bigbox><div class = centerbox><div class = flankerLeft_2><div class = cue-text>'],['</div></div><div class = flankerLeft_1><div class = cue-text>'],['</div></div><div class = flankerMiddle><div class = cue-text>'],['</div></div><div class = flankerRight_1><div class = cue-text>'],['</div></div><div class = flankerRight_2><div class = cue-text>'],['</div></div></div></div>']]					   

var test_stimuli = [{
	image: flanker_boards[0]+ preFileType + 'F' + fileTypePNG +
		   flanker_boards[1]+ preFileType + 'F' + fileTypePNG +
		   flanker_boards[2]+ preFileType + 'H' + fileTypePNG +
		   flanker_boards[3]+ preFileType + 'F' + fileTypePNG +
		   flanker_boards[4]+ preFileType + 'F' + fileTypePNG,
	data: {
		correct_response: response_keys.key[0],
		flanker_condition: 'incongruent',
		trial_id: 'stim',
		flanker: 'F',
		center_letter: 'H'
	}
}, {
	image: flanker_boards[0]+ preFileType + 'H' + fileTypePNG +
		   flanker_boards[1]+ preFileType + 'H' + fileTypePNG +
		   flanker_boards[2]+ preFileType + 'F' + fileTypePNG +
		   flanker_boards[3]+ preFileType + 'H' + fileTypePNG +
		   flanker_boards[4]+ preFileType + 'H' + fileTypePNG,
	data: {
		correct_response: response_keys.key[1],
		flanker_condition: 'incongruent',
		trial_id: 'stim',
		flanker: 'H',
		center_letter: 'F'
	}
}, {
	image: flanker_boards[0]+ preFileType + 'H' + fileTypePNG +
		   flanker_boards[1]+ preFileType + 'H' + fileTypePNG +
		   flanker_boards[2]+ preFileType + 'H' + fileTypePNG +
		   flanker_boards[3]+ preFileType + 'H' + fileTypePNG +
		   flanker_boards[4]+ preFileType + 'H' + fileTypePNG,
	data: {
		correct_response: response_keys.key[0],
		flanker_condition: 'congruent',
		trial_id: 'stim',
		flanker: 'H',
		center_letter: 'H'
	}
}, {
	image: flanker_boards[0]+ preFileType + 'F' + fileTypePNG +
		   flanker_boards[1]+ preFileType + 'F' + fileTypePNG +
		   flanker_boards[2]+ preFileType + 'F' + fileTypePNG +
		   flanker_boards[3]+ preFileType + 'F' + fileTypePNG +
		   flanker_boards[4]+ preFileType + 'F' + fileTypePNG,
	data: {
		correct_response: response_keys.key[1],
		flanker_condition: 'congruent',
		trial_id: 'stim',
		flanker: 'F',
		center_letter: 'F'
	}
}];

var practice_len = 12 // must be divisible by 4
var exp_len = 96 // must be divisible by 4, 100 in original
var numTrialsPerBlock = 48 //must be divisible by 4
var numTestBlocks = exp_len / numTrialsPerBlock


var speed_reminder = '<p class = block-text>Try to respond as quickly and accurately as possible.</p>'

var prompt_text_list = '<ul style="text-align:left;">'+
						'<li>Indicate the identity of the <i> middle </i> letter.</li>' +
						'<li>H: ' + response_keys.key_name[0] +'</li>' +
						'<li>F: ' + response_keys.key_name[1] +'</li>' +
					  '</ul>'

var prompt_text = '<div class = prompt_box>'+
					  '<p class = center-block-text style = "font-size:16px; line-height:80%%;">Indicate the identity of the <i> middle </i> letter.</p>' +
					  '<p class = center-block-text style = "font-size:16px; line-height:80%%;">H: ' + response_keys.key_name[0] +'</li>' +
					  '<p class = center-block-text style = "font-size:16px; line-height:80%%;">F: ' + response_keys.key_name[1] +'</li>' +
				  '</div>'
				  
//PRE LOAD IMAGES HERE
var pathSource = "/static/experiments/flanker_rdoc/images/"
var images = []
images.push(pathSource + 'F.png')
images.push(pathSource + 'H.png')


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
var post_task_block = {
	type: jsPsychSurveyText,
	data: {
		exp_id: "flanker_rdoc",
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
var feedback_instruct_text = '<p class=center-block-text>Welcome! This experiment will take around 5 minutes.</p>' +
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
			'<p class=block-text>Place your <b>' + response_keys.key_name[0] + '</b> on the <i>' + response_keys.key_description[0] + '</i> key (' + response_keys.key[0] + ') and your <b>' + response_keys.key_name[1] + '</b> on the <i>' + response_keys.key_description[1] + '</i> key (' + response_keys.key[1] + ') </p>' + 
			'<p class = block-text>On each trial, you will see a string of F\'s and H\'s. For instance, you might see \'FFFFF\' or \'HHFHH\'. </p>'+
			'<p class = block-text>If the middle letter is an <b>H</b>, press your <b>' + response_keys.key_name[0] + '</b>. <br> If the middle letter is an <b>F</b>, press your <b>' + response_keys.key_name[1] + '</b>. <br> So, if you see \'FFHFF\', you would press your ' + response_keys.key_name[0]  + '.</p>'+
			 speed_reminder + 
			'<p class = block-text>You\'ll start with a practice round. During practice, you will receive feedback and a reminder of the rules. These will be taken out for the test, so make sure you understand the instructions before moving on.</p>'+
		'</div>'
	],
	allow_keys: false,
	data: {
		trial_id: "instruction"
	},
	show_clickable_nav: true,
	post_trial_gap: 0
};

var instruction_node = {
	timeline: [feedback_instruct_block, instructions_block],
	/* This function defines stopping criteria */
	loop_function: function(data) {
		for (i = 0; i < data.trials.length; i++) {
			if ((data.trials[i].trial_id == 'instruction') && (data.trials[i].rt != null)) {
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

var end_block = {
	type: jsPsychHtmlKeyboardResponse,
	trial_duration: 180000,
	data: {
		trial_id: "end",
	},
	stimulus: '<div class = centerbox><p class = center-block-text>Thanks for completing this task!</p><p class = center-block-text>Press <i>enter</i> to continue.</p></div>',
	choices: ['Enter'],
	post_trial_gap: 0,
	on_finish: function(){
		assessPerformance()
		evalAttentionChecks()
    }
};

var start_test_block = {
	type: jsPsychHtmlKeyboardResponse,
	data: {
		trial_id: "test_intro"
	},
	trial_duration: 180000,
	stimulus: '<div class = centerbox><p class = block-text>We will now start the test portion.</p>' +
	'<p class = block-text>Keep your ' + response_keys.key_name[0] + ' on the ' + response_keys.key_description[0] + ' key and your ' + response_keys.key_name[1] + ' on the ' + response_keys.key_description[1] + ' key.</p>' + 
	'<p class = block-text>Press <i>enter</i> to begin.</p></div>',
	choices: ['Enter'],
	post_trial_gap: 1000,
	on_finish: function(){
		feedback_text = 'Starting a test block.  Press <i>enter</i> to continue.'
	}
};

var feedback_text = '<div class = centerbox><p class = center-block-text>Press <i>enter</i> to begin practice.</p></div>'
var feedback_block = {
	type: jsPsychHtmlKeyboardResponse,
	data: {
		trial_id: "feedback"
	},
	choices: ['Enter'],
	stimulus: getFeedback,
	post_trial_gap: 1000,
	is_html: true,
	trial_duration: 180000,
	response_ends_trial: true, 
};

var get_practiceNode = function() {
	var practiceTrials = []
	for (i = 0; i < practice_len; i++) {
		var practice_fixation_block = {
			type: jsPsychHtmlKeyboardResponse,
			stimulus: '<div class = centerbox><div class = fixation>+</div></div>',
			is_html: true,
			data: {
				trial_id: "practice_fixation",
				exp_stage: "practice"
			},
			choices: ['NO_KEYS'],
			stimulus_duration: 500, //500 
			trial_duration: 500, //500
			post_trial_gap: 0,
			// on_finish: changeData, // deleted this function. look in old versions if u want it
			prompt: prompt_text
		};
		var practice_block = {
			type: jsPsychCategorizeHtml,
			stimulus: practice_trials.image[i],
			is_html: true,
			key_answer: practice_response_array[i],
			correct_text: '<div class = fb_box><div class = center-text><font size = 20>Correct!</font></div></div>' + prompt_text,
			incorrect_text: '<div class = fb_box><div class = center-text><font size = 20>Incorrect</font></div></div>' + prompt_text,
			timeout_message: '<div class = fb_box><div class = center-text><font size = 20>Respond Faster!</font></div></div>' + prompt_text,
			choices: response_keys.key,
			data: practice_trials.data[i],
			feedback_duration: 1000, //500
			stimulus_duration: 1000, //1000
			show_stim_with_feedback: true,
			trial_duration: 2000, //2000
			post_trial_gap: 0, //0 
			prompt: prompt_text,
			on_finish: function(data) {
				correct_trial = 0
				if (data.response == data.correct_response) {
					correct_trial = 1
				}
				current_block = practiceCount
			
				jsPsych.data.get().addToLast({correct_trial: correct_trial,
												trial_id: 'practice_trial',
												current_block: current_block,
												current_trial: i,
												exp_stage: 'practice'
												})
			}
		}
		var practice_post_trial_gap = { // adding this and shortening actual trial to 1000ms
			type: jsPsychHtmlKeyboardResponse,
			stimulus: '',
			data: {trial_id: 'practice_post_trial_gap'},
			choices: ["NO_KEYS"],
			prompt: prompt_text,
			trial_duration: 1000
		}
		practiceTrials.push(practice_fixation_block, practice_block, practice_post_trial_gap)
		practiceTrials.push(practice_block)
	}

	var practiceCount = 0
	var practiceNode = {
		timeline: [feedback_block].concat(practiceTrials),
		loop_function: function(data) {
			practiceCount += 1
			current_trial = 0 
			
			practice_trials = jsPsych.randomization.repeat(test_stimuli, practice_len / 4, true);
			practice_response_array = [];
			for (i = 0; i < practice_trials.data.length; i++) {
				practice_response_array.push(practice_trials.data[i].correct_response)
			}		
			
			var sum_rt = 0
			var sum_responses = 0
			var correct = 0
			var total_trials = 0
		
			for (var i = 0; i < data.trials.length; i++){
				if (data.trials[i].trial_id == 'practice_trial'){
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
			console.log(total_trials, sum_responses, ave_rt, missed_responses)
		
			feedback_text = "<p class = block-text>Please take this time to read your feedback and to take a short break!</p>"

			if (accuracy > accuracy_thresh){
				feedback_text += '<p class = block-text>No feedback: done with this practice. Press <i>enter</i> to continue.</p>' 
				test_trials = jsPsych.randomization.repeat(test_stimuli, numTrialsPerBlock / 4, true);
				return false
		
			} else { // accuracy < accuracy_thresh
				feedback_text += '<p class = block-text>Your accuracy is low.  Remember: </p>' + prompt_text_list 
				if (ave_rt > rt_thresh){
					feedback_text += '<p class = block-text>You have been responding too slowly. Try to respond as quickly and accurately as possible.</p>'
				}
				if (missed_responses > missed_response_thresh){
					feedback_text += '<p class = block-text>You have not been responding to some trials.  Please respond on every trial that requires a response.</p>'
				}
				if (practiceCount == practice_thresh) {
					feedback_text += '<p class = block-text>Done with this practice. Press <i>enter</i> to continue.</p>' 
					test_trials = jsPsych.randomization.repeat(test_stimuli, numTrialsPerBlock / 4, true);
					return false
				} else {
					feedback_text += '<p class = block-text>We are going to repeat the practice round now. Press <i>enter</i> to begin.</p>'
					return true
				}
			}
		}
	}
	return practiceNode
}

var get_testNode = function() {
	var testTrials = []
	//testTrials.push(attention_node)
	for (i = 0; i < numTrialsPerBlock; i++) {
		var test_fixation_block = {
			type: jsPsychHtmlKeyboardResponse,
			stimulus: '<div class = centerbox><div class = fixation>+</div></div>',
			is_html: true,
			data: {
				trial_id: "test_fixation",
				exp_stage: "test"
			},
			choices: ['NO_KEYS'],
			stimulus_duration: 500,
			trial_duration: 500, 
			post_trial_gap: 0,
			// on_finish: changeData // deleted this function. look in old versions if u want it
		};
		
		var test_block = {
			type: jsPsychHtmlKeyboardResponse,
			stimulus: test_trials.image[i], 
			is_html: true,
			choices: response_keys.key,
			data: test_trials.data[i],  
			trial_duration: 2000,
			stimulus_duration: 1000, //1000
			response_ends_trial: false,
			post_trial_gap: 0,
			on_finish: function(data) {
				correct_trial = 0
				if (data.response == data.correct_response) {
					correct_trial = 1
				}
				current_block = testCount
				jsPsych.data.get().addToLast({correct_trial: correct_trial,
												trial_id: 'test_trial',
												current_block: current_block,
												current_trial: i,
												exp_stage: 'test'
												})
			}
		};
		
		testTrials.push(test_fixation_block)
		testTrials.push(test_block)
	}

	var testCount = 0
	var testNode = {
		timeline: [feedback_block].concat(testTrials),
		loop_function: function(data) {
			testCount += 1
			test_trials = jsPsych.randomization.repeat(test_stimuli, numTrialsPerBlock / 4, true);
			current_trial = 0 
		
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
		
			if (testCount == numTestBlocks){
				feedback_text += '</p><p class = block-text>Done with this test. Press <i>enter</i> to continue.<br> If you have been completing tasks continuously for an hour or more, please take a 15-minute break before starting again.'
				return false
			} else {
				feedback_text += '<p class = block-text>Press <i>enter</i> to continue.</p>'
				return true
			}
		}
	}
	return testNode
}

//Set up experiment
flanker_rdoc_experiment = []
var flanker_rdoc_init = () => {
	document.body.style.background = 'gray' //// CHANGE THIS

	jsPsych.pluginAPI.preloadImages(images);

	//global vars
	practice_trials = jsPsych.randomization.repeat(test_stimuli, practice_len / 4, true);
	test_trials = jsPsych.randomization.repeat(test_stimuli, numTrialsPerBlock / 4, true);
	
	practice_response_array = [];
	for (i = 0; i < practice_trials.data.length; i++) {
		practice_response_array.push(practice_trials.data[i].correct_response)
	}

	test_response_array = [];
	for (i = 0; i < test_trials.data.length; i++) {
		test_response_array.push(test_trials.data[i].correct_response)
	}

	// flanker_rdoc_experiment.push(instruction_node)
	// flanker_rdoc_experiment.push(get_practiceNode())

	flanker_rdoc_experiment.push(start_test_block)
	flanker_rdoc_experiment.push(get_testNode())

	flanker_rdoc_experiment.push(post_task_block)
	flanker_rdoc_experiment.push(end_block)
}
