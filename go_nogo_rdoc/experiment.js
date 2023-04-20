/* ************************************ */
/* Define helper functions */
/* ************************************ */
function addID() {
	jsPsych.data.get().addToLast({exp_id: 'go_nogo_rdoc'})
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
	/* Function to calculate the "credit_var", which is a boolean used to
	credit individual experiments in expfactory. */
	var experiment_data = jsPsych.data.get().filter({trial_id: 'test_trial'}).trials 
	var missed_count = 0
	var trial_count = 0
	var rt_array = []
	var rt = 0
	var correct = 0
		//record choices participants made
	var choice_counts = {}
	choice_counts[null] = 0
	choice_counts[possible_responses] = 0
	
	for (var i = 0; i < experiment_data.length; i++) {
		if (experiment_data[i].trial_id == 'test_trial') {
			trial_count += 1
			key = experiment_data[i].response
			choice_counts[key] += 1
			if (experiment_data[i].go_nogo_condition == 'go'){
				if (experiment_data[i].response == experiment_data[i].correct_response){
					correct += 1
				}
				if (experiment_data[i].rt == null){
					missed_count += 1
				} else {
					rt = experiment_data[i].rt
					rt_array.push(rt)
				}
			} else if (experiment_data[i].go_nogo_condition == 'nogo'){
				if (experiment_data[i].rt == null){
					correct += 1
				} else {
					rt = experiment_data[i].rt
					rt_array.push(rt)
				}
			}
		}	
	}
	
	//calculate average rt
	var avg_rt = null
	if (rt_array.length !== 0) {
		avg_rt = math.median(rt_array) // ???median???
	} 
	//calculate whether response distribution is okay
	var responses_ok = true
	Object.keys(choice_counts).forEach(function(key, index) {
		if (choice_counts[key] > trial_count * 0.95) {
			responses_ok = false
		}
	})
	var missed_percent = missed_count/trial_count
	var accuracy = correct / trial_count
	credit_var = (missed_percent < 0.25 && avg_rt > 200 && accuracy > 0.60)
	jsPsych.data.get().addToLast({final_credit_var: credit_var,
									 final_missed_percent: missed_percent,
									 final_avg_rt: avg_rt,
									 final_responses_ok: responses_ok,
									 final_accuracy: accuracy})
}

var get_response_time = function() {
  gap = 750 + Math.floor(Math.random() * 500) + 250
  return gap;
}

/* Append gap and current trial to data and then recalculate for next trial*/
var appendData = function(data) {
	var curr_trial = jsPsych.data.get().last().trials[0]
	var correct_trial = 0
	if (curr_trial.response == correct_response){
		correct_trial = 1
	}
	jsPsych.data.get().addToLast({
		correct_trial: correct_trial,
		current_trial: current_trial,
	})
	current_trial +=1
}

var getFeedback = function() {
  if (stim.key_answer == 'NO_KEYS') {
    return '<div class = centerbox><div class = center-text>Correct!</div></div>' + prompt_text_list
  } else {
    return '<div class = centerbox><div class = center-text>The shape was outlined</div></p></div>'  + prompt_text_list
  }
}

var getFeedback = function() {
	return '<div class = bigbox><div class = picture_box><p class = block-text>' + feedback_text + '</font></p></div></div>' //<font color="white">
}

var getInstructFeedback = function() {
  return '<div class = centerbox><p class = center-block-text>' + feedback_instruct_text +
    '</p></div>'
}

var getStim = function(){
	stim = block_stims.pop()
	correct_response = stim.data.correct_response
	return stim.stimulus
}

var getData = function(){
	stim_data = stim.data
	return stim_data
}

var getCorrectResponse = function(){
	return stim_data.correct_response
}

/* ************************************ */
/* Define experimental variables */
/* ************************************ */
// generic task variables
var run_attention_checks = true
var attention_check_thresh = 0.45
var sumInstructTime = 0 //ms
var instructTimeThresh = 0 ///in seconds
var credit_var = 0
var possible_responses = ' ' // space bar


// task specific variables
var num_go_stim = 6 //per one no-go stim
var correct_responses = [
  ['go', possible_responses],
  ['nogo', null]
]

//var stims = jsPsych.randomization.shuffle([["orange", "stim1"],["blue","stim2"]])
var stims = [["solid", "stim1"],["outlined","stim2"]] //solid and outlined squares used as stimuli for this task are not png files as in some others, but they are defined in style.css
var gap = 0
var current_trial = 0
var practice_stimuli = [{ //To change go:nogo ratio, add or remove one or more sub-dictionaries within practice_stimuli and test_stimuli_block
  stimulus: '<div class = bigbox><div class = centerbox><div class = gng_number><div class = cue-text><div id = ' + stims[1][1] + '></div></div></div></div></div>',
  data: {
    correct_response: correct_responses[1][1],
    go_nogo_condition: correct_responses[1][0],
    trial_id: 'practice_trial'
  },
  key_answer: correct_responses[1][1]
}].concat(Array(num_go_stim).fill( {
	  stimulus: '<div class = bigbox><div class = centerbox><div class = gng_number><div class = cue-text><div  id = ' + stims[0][1] + '></div></div></div></div></div>',
	  data: {
	    correct_response: correct_responses[0][1],
	    go_nogo_condition: correct_responses[0][0],
	    trial_id: 'practice_trial'
	  },
	  key_answer: correct_responses[0][1]
}))

//set up block stim. test_stim_responses indexed by [block][stim][type]
var test_stimuli_block = [{
  stimulus: '<div class = bigbox><div class = centerbox><div class = gng_number><div class = cue-text><div id = ' + stims[1][1] + '></div></div></div></div></div>',
  data: {
    correct_response: correct_responses[1][1],
    go_nogo_condition: correct_responses[1][0],
    trial_id: 'test_trial'
  }
}].concat(Array(num_go_stim).fill({
    stimulus: '<div class = bigbox><div class = centerbox><div class = gng_number><div class = cue-text><div  id = ' + stims[0][1] + '></div></div></div></div></div>',
    data: {
      correct_response: correct_responses[0][1],
      go_nogo_condition: correct_responses[0][0],
      trial_id: 'test_trial'
    }
}))

var accuracy_thresh = 0.75
var rt_thresh = 1000
var missed_response_thresh = 0.10

var practice_len = 4
var practice_thresh = 3

var exp_len = 245 //multiple of numTrialsPerBlock
var numTrialsPerBlock = 49 // multiple of 7 (6go:1nogo)
var numTestBlocks = exp_len / numTrialsPerBlock



var prompt_text_list = '<ul style="text-align:left;">'+
						'<li>'+stims[0][0]+' square: respond</li>' +
						'<li>'+stims[1][0]+' square: do not respond</li>' +
					  '</ul>'

var prompt_text = '<div class = prompt_box>'+
					'<p class = center-block-text style = "font-size:16px; line-height:80%%;">'+stims[0][0]+' square: respond.</p>' +
					'<p class = center-block-text style = "font-size:16px; line-height:80%%;">'+stims[1][0]+' square: do not respond</li>'
				'</div>'

					  

var speed_reminder = '<p class = block-text>Try to respond as quickly and accurately as possible.</p>'

/* ************************************ */
/* Set up jsPsych blocks */
/* ************************************ */
// Set up attention check node
// var attention_check_block = {
//   type: 'attention-check-rdoc',
//   data: {
//     trial_id: "attention_check"
//   },
//   timing_response: 180000,
//   response_ends_trial: true,
//   timing_post_trial: 200
// }

// var attention_node = {
//   timeline: [attention_check_block],
//   go_nogo_conditional_function: function() {
//     return run_attention_checks
//   }
// }


//Set up post task questionnaire
var post_task_block = {
	type: jsPsychSurveyText,
	data: {
		exp_id: "go_nogo_rdoc",
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
var feedback_instruct_text = '<p class=center-block-text>Welcome! This experiment will take around 15 minutes.</p>' +
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

var instructions_block = {
  type: jsPsychInstructions,
  data: {
    trial_id: "instructions"
  },
  pages: [
    '<div class = centerbox>'+
    	'<p class = block-text>Please place your <b>index finger</b> on the <b>space bar</b>.</p>' +
	    '<p class = block-text>In this experiment, ' + stims[0][0] + ' and ' + stims[1][0] + ' squares will appear on the screen. </p>'+
	    '<p class = block-text>If you see the <b>' + stims[0][0] + ' square</b>, you should respond by <b>pressing the spacebar as quickly as possible</b>. </p>'+
	    '<p class = block-text>If you see the <b>' + stims[1][0] + ' square</b>, you should <b>not respond</b>.</p>'+
		speed_reminder + '<p class = block-text>We\'ll start with a practice round. During practice, you will receive feedback and a reminder of the rules. These will be taken out for the test, so make sure you understand the instructions before moving on.</p>'+
	'</div>'
  ],
  allow_keys: false,
  show_clickable_nav: true,
  post_trial_gap: 0
};

/// This ensures that the subject does not read through the instructions too quickly.  If they do it too quickly, then we will go over the loop again.
var instruction_node = {
  timeline: [feedback_instruct_block, instructions_block],
  /* This function defines stopping criteria */
  loop_function: function(data) {
    for (i = 0; i < data.trials.length; i++) {
      if ((data.trials[i].trial_id == 'instructions') && (data.trials[i].rt != null)) {
        sumInstructTime += data.trials[i].rt
      }
    }
    if (sumInstructTime <= instructTimeThresh * 1000) {
      feedback_instruct_text = 'Read through instructions too quickly.  Please take your time and make sure you understand the instructions.  Press <i>enter</i> to continue.'
      return true
    } else if (sumInstructTime > instructTimeThresh * 1000) {
      feedback_instruct_text = 'Done with instructions. Press <i>enter</i> to continue.'
      return false
    }
  }
}

var end_block = {
	type: jsPsychHtmlKeyboardResponse,
	data: {
		trial_id: "end",
    	exp_id: 'go_nogo_rdoc'
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

var feedback_text = '<div class = centerbox><p class = center-block-text>Press <i>enter</i> to begin practice.</p></div>'
var feedback_block = {
	type: jsPsychHtmlKeyboardResponse,
	data: {
		trial_id: "feedback"
	},
	choices: ['Enter'],
	stimulus: getFeedback,
	post_trial_gap: 0,
	trial_duration: 180000,
	response_ends_trial: true, 
};

var fixation_block = {
	type: jsPsychHtmlKeyboardResponse,
	stimulus: '<div class = centerbox><div class = fixation>+</div></div>',
	choices: ['NO_KEYS'],
	data: {
		trial_id: "fixation",
	},
	post_trial_gap: 0,
	stimulus_duration: 500,
	trial_duration: 500
};

var prompt_fixation_block = {
	type: jsPsychHtmlKeyboardResponse,
	stimulus: '<div class = centerbox><div class = fixation>+</div></div>',
	choices: 'none',
	data: {
		trial_id: "prompt_fixation",
	},
	post_trial_gap: 0,
	stimulus_duration: 500,
	trial_duration: 500,
	prompt: prompt_text
};


/// need to put these in a function because it has to call jsPsych-dependent stuff
var practiceTrials = []
for (var i = 0; i < practice_len; i ++){
	var practice_block = {
		type: jsPsychHtmlKeyboardResponse,
		stimulus: getStim,
		data: function() {return Object.assign(getData(), {exp_stage: 'test'})},
		choices: [possible_responses],
		trial_duration: 1000, //2000
		stimulus_duration: 1000, //1000,
		response_ends_trial: false,
		post_trial_gap: 0,
		on_finish: appendData,
		prompt: prompt_text
	}

	var practice_feedback_block = { // adding this and shortening actual trial to 1000ms
		type: jsPsychHtmlKeyboardResponse,
		stimulus: function () {
			var last = jsPsych.data.get().last(1).values()[0]
			if (last.go_nogo_condition == 'go') {
				if (last.response == last.correct_response) {
					return '<div class = center-box><divp class = center-text>Correct!</div></div>'
				} else {
					return '<div class = center-box><div class = center-text>The shape was solid</div></div>'
				}
			} else {
				if (last.response == last.correct_response) {
					return '<div class = center-box><div class = center-text>Correct!</div></div>'
				} else {
					return '<div class = center-box><div class = center-text>The shape was outlined</div></div>'
				}
			}
		},
		data: {trial_id: 'practice_post_trial_gap'},
		choices: ["NO_KEYS"],
		prompt: prompt_text,
		trial_duration: 500
	}
	practiceTrials.push(prompt_fixation_block, practice_block, practice_feedback_block)
}

var practiceCount = 0
var practiceNode = {
	timeline: [feedback_block].concat(practiceTrials),
	loop_function: function(data){
		practiceCount += 1
		current_trial = 0
	
		var sum_rt = 0
		var sum_responses = 0
		var correct = 0
		var total_trials = 0
		
		var total_go_trials = 0
		var missed_response = 0
	
		for (var i = 0; i < data.trials.length; i++){
			if (data.trials[i].trial_id == "practice_trial"){
				total_trials+=1
				if (data.trials[i].rt != null){
					sum_rt += data.trials[i].rt
					sum_responses += 1
				}
				if (data.trials[i].response == data.trials[i].correct_response){
					correct += 1
	
				}
				
				if (data.trials[i].go_nogo_condition == 'go'){
					total_go_trials += 1
					if (data.trials[i].rt == null){
						missed_response += 1
					}
				}		
			}
		}
	
		var accuracy = correct / total_trials
		var missed_responses = missed_response / total_go_trials
		var ave_rt = sum_rt / sum_responses
		if (accuracy > accuracy_thresh || practiceCount == practice_thresh) {
			feedback_text = '<div class = centerbox><p class = block-text>We will now start the test portion.</p>'+
				'<p class = block-text>Remember, keep your index finger on the space bar, and if you see the ' + stims[0][0] + ' square you should <i>respond by pressing the spacebar as quickly as possible</i>. '+
				'If you see the ' + stims[1][0] + ' square you should <i>not respond</i>.</p><p class = block-text>Press <i>enter</i> to begin.</p></div>'
			block_stims = jsPsych.randomization.repeat(test_stimuli_block, numTrialsPerBlock / test_stimuli_block.length);
			return false
		} else {
			feedback_text = "<p class = block-text>Please take this time to read your feedback and to take a short break!</p>"

			if (accuracy < accuracy_thresh){
				feedback_text += '<p class = block-text>Your accuracy is low.  Remember: </p>' + prompt_text_list 
			}
				if (ave_rt > rt_thresh){
				feedback_text += '<p class = block-text>You have been responding too slowly.' + speed_reminder + '</p>'
			}
			if (missed_responses > missed_response_thresh){
				feedback_text += '<p class = block-text>You have not been responding to some trials.  Please respond on every trial that requires a response.</p>'
			}
			feedback_text += '<p class = block-text>We are going to repeat the practice round now. Press <i>enter</i> to begin.</p>'
			block_stims = jsPsych.randomization.repeat(practice_stimuli, practice_len / practice_stimuli.length); 
			return true
		}
	}	
}

var testTrials = []
// testTrials.push(attention_node)
for (var i = 0; i < numTrialsPerBlock; i ++){
	
	var test_block = {
		type: jsPsychHtmlKeyboardResponse,
		stimulus: getStim,
		choices: [possible_responses],
		data: function() {return Object.assign(getData(), {exp_stage: 'test'})},
		post_trial_gap: 0,
		stimulus_duration: 1000, //1000
		trial_duration: 2000, //2000
		response_ends_trial: false,
		on_finish: appendData
	};
	testTrials.push(fixation_block)
	testTrials.push(test_block)
}

var testCount = 0
var testNode = {
	timeline: [feedback_block].concat(testTrials),
	loop_function: function(data){
		testCount += 1
		current_trial = 0
	
		var sum_rt = 0
		var sum_responses = 0
		var correct = 0
		var total_trials = 0
		var total_go_trials = 0
		var missed_response = 0
	
		for (var i = 0; i < data.trials.length; i++){
			if (data.trials[i].trial_id == "test_trial"){
				total_trials+=1
				if (data.trials[i].rt != null){
					sum_rt += data.trials[i].rt
					sum_responses += 1
				}
				if (data.trials[i].response == data.trials[i].correct_response){
					correct += 1
				}
				if (data[i].go_nogo_condition == 'go'){
					total_go_trials += 1
					if (data[i].rt == null){
						missed_response += 1
					}
				}
			}
		}
		var accuracy = correct / total_trials
		var missed_responses = missed_response / total_go_trials
		var ave_rt = sum_rt / sum_responses
	
		if (testCount >= numTestBlocks){
			feedback_text += '</p><p class = block-text>Done with this test. Press <i>enter</i> to continue. <br>If you have been completing tasks continuously for one hour or more, please take a 15-minute break before starting again.'
			return false
		} else {
			feedback_text = "<p>Please take this time to read your feedback and to take a short break! Press <i>enter</i> to continue." + 
				"<br>You have completed " +testCount+ " out of " +numTestBlocks+ " blocks of trials.</p>"

			if (accuracy < accuracy_thresh){
				feedback_text += '<p class = block-text>Your accuracy is too low.  Remember: </p>' + prompt_text_list 
			}
			if (missed_responses > missed_response_thresh){
				feedback_text += '<p class = block-text>You have not been responding to some trials.  Please respond on every trial that requires a response.</p>'
			}

			if (ave_rt > rt_thresh) {
				feedback_text += '<p class = block-text>You have been responding too slowly. Try to respond as quickly and accurately as possible.</p>'
			}
			feedback_text += '<p class = block-text>Press <i>enter</i> to continue.</p>'
			block_stims = jsPsych.randomization.repeat(test_stimuli_block, numTrialsPerBlock / test_stimuli_block.length);
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


//// initialize the experiment
var go_nogo_rdoc_experiment = [];
var go_nogo_rdoc_init = () => {

	document.body.style.background = 'gray' //// CHANGE THIS

	block_stims = jsPsych.randomization.repeat(practice_stimuli, practice_len / practice_stimuli.length); //initialize
	
	go_nogo_rdoc_experiment.push(fullscreen)
	go_nogo_rdoc_experiment.push(instruction_node)
	go_nogo_rdoc_experiment.push(practiceNode)
	go_nogo_rdoc_experiment.push(testNode)
	go_nogo_rdoc_experiment.push(post_task_block)
	go_nogo_rdoc_experiment.push(end_block)
	go_nogo_rdoc_experiment.push(exit_fullscreen)
}
