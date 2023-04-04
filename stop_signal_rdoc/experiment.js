/* ************************************ */
/*       Define Helper Functions        */
/* ************************************ */

function addID() {
	jsPsych.data.get().addToLast({exp_id: 'stop_signal_rdoc'})
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
	var all_trials = 0
	
	//record choices participants made
	var choice_counts = {}
	choice_counts[null] = 0
	choice_counts[choices[0]] = 0
	choice_counts[choices[1]] = 0
	
	for (var i = 0; i < experiment_data.length; i++) {
		all_trials += 1
		key = experiment_data[i].response
		choice_counts[key] += 1
		if (experiment_data[i].stop_signal_condition == 'go'){
			trial_count += 1
		}
		if ((experiment_data[i].stop_signal_condition == 'go') && (experiment_data[i].rt != null)){
			rt_array.push(experiment_data[i].rtrt)
			if (experiment_data[i].response == experiment_data[i].correct_response){
				correct += 1
			}
		} else if ((experiment_data[i].stop_signal_condition == 'stop') && (experiment_data[i].rt != null)){
			rt_array.push(experiment_data[i].rt)
		} else if ((experiment_data[i].stop_signal_condition == 'go') && (experiment_data[i].rt == null)){
			missed_count += 1
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
		if (choice_counts[key] > all_trials * 0.85) {
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

var getFeedback = function() {
	return '<div class = bigbox><div class = picture_box><p class = block-text><font color="white">' + feedback_text + '</font></p></div></div>'
}

var getInstructFeedback = function() {
	return '<div class = centerbox><p class = center-block-text>' + feedback_instruct_text + '</p></div>'
}

var getCategorizeFeedback = function(){
	var last = jsPsych.data.get().last(1).trials[0]
	if (last.trial_id == 'practice_trial') {
		if (last.stop_signal_condition=='go') {
			if (last.response == null) {
				return '<div class = fb_box><div class = center-text><font size = 20>Respond Faster!</font></div></div>' + prompt_text
			} else if (last.response == last.correct_response) {
				return '<div class = fb_box><div class = center-text><font size = 20>Correct!</font></div></div>' + prompt_text
			} else { 
				return '<div class = fb_box><div class = center-text><font size = 20>Incorrect</font></div></div>' + prompt_text
			}
		} else { //stop
			if (last.rt == null) {
				return '<div class = fb_box><div class = center-text><font size = 20>Correct!</font></div></div>' + prompt_text
			} else {
				return '<div class = fb_box><div class = center-text><font size = 20>There was a star</font></div></div>' + prompt_text
			}
		}
	} 
}

var createTrialTypes = function(numTrialsPerBlock){
	var unique_combos = stop_signal_conditions.length*totalShapesUsed
	
	var stims = []
	for (var x = 0; x < stop_signal_conditions.length; x++){
		for (var j = 0; j < totalShapesUsed; j++){
			stim = {
				stim: shapes[j],
				correct_response: possible_responses[j][1],
				stop_signal_condition: stop_signal_conditions[x]
			}
			stims.push(stim)
		}	
	}
	var iteration = numTrialsPerBlock/unique_combos
	stims = jsPsych.randomization.repeat(stims,iteration)
	return stims
}


var getStopStim = function(){
	return preFileType  + 'stopSignal' + fileTypePNG
}

var getStim = function(){
	if(exp_phase == "practice1"){
		stim = stims.pop()
		shape = stim.stim
		correct_response = stim.correct_response
		stop_signal_condition = "practice_no_stop"
		
	} else if ((exp_phase == "test") || (exp_phase == "practice2")){
		stim = stims.pop()
		shape = stim.stim
		stop_signal_condition = stim.stop_signal_condition
		correct_response = stim.correct_response
		
		if(stop_signal_condition == "stop"){
			correct_response = null
		} 
	}
	stim = {
		image: '<div class = bigbox><div class = centerbox><div class = gng_number><div class = cue-text>' + preFileType  + shape + fileTypePNG + '</div>',
		data: { 
			stim: shape,
			stop_signal_condition: stop_signal_condition,
			correct_response: correct_response
			}
	}
	stimData = stim.data
	return stim.image
}

function getSSD(){
	return SSD
}

function getSSType(){
	return stop_signal_condition
}

var appendData = function(){
	var last = jsPsych.data.get().last(1).trials[0]
	current_trial+=1

	if (exp_phase == "practice1"){
		currBlock = practiceCount
	} else if (exp_phase == "practice2"){
		currBlock = practiceStopCount
	} else if (exp_phase == "test"){
		currBlock = testCount
	}
	
	if ((exp_phase == "practice1") || (exp_phase == "practice2") || (exp_phase == "test")){
		jsPsych.data.get().addToLast({
			stim: stimData.stim,
			correct_response: correct_response,	
			current_block: currBlock,
			current_trial: current_trial,
			stop_signal_condition: stimData.stop_signal_condition
		})
		
		var correct_current = 0
		if (last.response == correct_response){
			correct_trial = 1
		}
		jsPsych.data.get().addToLast({
			correct_trial: correct_current
		})
	}
	
	if ((exp_phase == "test") || (exp_phase == "practice2")){	
		
		if ((last.response == null) && (last.stop_signal_condition == 'stop') && (SSD < maxSSD)){
			jsPsych.data.get().addToLast({stop_acc: 1})
			SSD+=50
		} else if ((last.response != -1) && (last.stop_signal_condition == 'stop') && (SSD > minSSD)){
			jsPsych.data.get().addToLast({stop_acc: 0})
			SSD-=50
		}
	
		if ((last.response == last.correct_response) && (last.stop_signal_condition == 'go')){
			jsPsych.data.get().addToLast({go_acc: 1})
		} else if ((jsPsych.data.getDataByTrialIndex(curr_trial).key_press != jsPsych.data.getDataByTrialIndex(curr_trial).correct_response) && (jsPsych.data.getDataByTrialIndex(curr_trial).stop_signal_condition == 'go')){
			jsPsych.data.get().addToLast({go_acc: 0})
		}
	}
}

/* ************************************ */
/*    Define Experimental Variables     */
/* ************************************ */
// generic task variables
var sumInstructTime = 0 //ms
var instructTimeThresh = 0 ///in seconds
var credit_var = 0
var run_attention_checks = true


var practice_len = 24 // 24 must be divisible by 12
var exp_len = 144 // must be divisible by 12
var numTrialsPerBlock = 48 // must be divisible by 12
var numTestBlocks = exp_len / numTrialsPerBlock
var practice_thresh = 3 // 3 blocks of 12 trials

var accuracy_thresh = 0.80
var missed_thresh = 0.10
var SSD = 350
var maxSSD = 1000
var minSSD = 0 
var current_trial = 0


var rt_thresh = 1000;
var missed_response_thresh = 0.10;
var accuracy_thresh = 0.75;

var maxStopCorrect = 0.70
var minStopCorrect = 0.30

var maxStopCorrectPractice = 1
var minStopCorrectPractice = 0


var stop_signal_conditions = ['go','go','stop']
var shapes = ['circle','square'] //'hourglass', 'Lshape', 'moon', 'oval', 'rectangle', 'rhombus', 'tear', 'trapezoid'
var color = "black"
var totalShapesUsed = 2

var possible_responses = [['index finger', ',', 'comma key (,)'], ['middle finger', '.', 'period key (.)']]
var choices = [possible_responses[0][1], possible_responses[1][1]]

var postFileType = "'></img>"
var pathSource = "/static/experiments/stop_signal_rdoc/images/"
var fileType = ".png"
var preFileType = "<img class = center src='"

var fileTypePNG = ".png'></img>"
var preFileType = "<img class = center src='/static/experiments/stop_signal_rdoc/images/"

// IMAGES TO PRELOAD
var images = []
for(i=0;i<shapes.length;i++){
	images.push(pathSource + shapes[i] + '.png')
}


var prompt_text_list = '<ul style="text-align:left;">'+
						'<li>' + shapes[0] + ': ' + possible_responses[0][0] + '</li>' +
						'<li>' + shapes[1] + ': ' + possible_responses[1][0] + '</li>' +
						'<li>Do not respond if a star appears!</li>' +
					  '</ul>'

var prompt_text = '<div class = prompt_box>'+
					  '<p class = center-block-text style = "font-size:16px; line-height:80%%;">' + shapes[0] + ': ' + possible_responses[0][0] + '</p>' +
					  '<p class = center-block-text style = "font-size:16px; line-height:80%%;">' + shapes[1] + ': ' + possible_responses[1][0] + '</p>' +
					  '<p class = center-block-text style = "font-size:16px; line-height:80%%;">Do not respond if a star appears!</p>' +
				  '</div>'

var speed_reminder = '<p class = block-text>Try to respond as quickly and accurately as possible.</p>'

var exp_phase = "practice1"


/* ************************************ */
/*        Set up jsPsych blocks         */
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
//   conditional_function: function() {
//     return run_attention_checks
//   }
// }

var end_block = {
	type: jsPsychHtmlKeyboardResponse,
	trial_duration: 180000,
	data: {
	  trial_id: "end",
	},
	stimulus: '<div class = centerbox><p class = center-block-text>Thanks for completing this task!</p>'+
	'<p class = center-block-text>Press <i>enter</i> to continue.</p></div>',
	choices: ['Enter'],
	post_trial_gap: 0,
	on_finish: function(){
		  assessPerformance()
		  evalAttentionChecks()
	  }
  };


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
	data: {
		trial_id: "instructions"
	},
	pages:[
		'<div class = centerbox>'+
			'<p class=block-text>Place your <b>' + possible_responses[0][0] + '</b> on the <b>' + possible_responses[0][2] + '</b> and your <b>' + possible_responses[1][0] + '</b> on the <b>' + possible_responses[1][2] + '</b> </p>' + 
			'<p class = block-text>In this task, you will see shapes appear on the screen one at a time. </p>' +
			'<p class = block-text>If the shape is a <b>'+shapes[0]+'</b>, press your <b>'+possible_responses[0][0]+'</b>.</p>'+
			'<p class = block-text>If the shape is a <b>'+shapes[1]+'</b>, press your '+possible_responses[1][0]+'</b>.</p>'+
			'<p class = block-text>You should respond as quickly and accurately as possible to each shape.</p>'+
		'</div>',
		'<div class = centerbox>' + 
			'<p class = block-text>On some trials, a star will appear around the shape, shortly after the shape appears.</p>'+
			'<p class = block-text>If you see the star, please try your best to <b>withhold your response</b> on that trial.</p>'+
			'<p class = block-text>If the star appears and you try your best to withhold your response, you will find that you will be able to stop sometimes, but not always.</p>'+
			'<p class = block-text>Please <b>do not</b> slow down your responses in order to wait for the star.  It is equally important to respond quickly on trials without the star as it is to stop on trials with the star.</p>'+
		'</div>',
		'<div class = centerbox>' + speed_reminder + 
			'<p class = block-text>We\'ll start with a practice round. During practice, you will receive feedback and a reminder of the rules. These will be taken out for the test, so make sure you understand the instructions before moving on.</p>' + 
		'</div>',
	],
	allow_keys: false,
	show_clickable_nav: true,
	post_trial_gap: 0,
};

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

var fixation_block = {
	type: jsPsychHtmlKeyboardResponse,
	stimulus: '<div class = centerbox><div class = fixation>+</div></div>',
	choices: ['NO_KEYS'],
	data: {
		trial_id: "fixation",
	},
	post_trial_gap: 0,
	stimulus_duration: 500, //500
	trial_duration: 500 //500
};

var prompt_fixation_block = {
	type: jsPsychHtmlKeyboardResponse,
	stimulus: '<div class = centerbox><div class = fixation>+</div></div>',
	choices: ['NO_KEYS'],
	data: {
		trial_id: "prompt_fixation",
	},
	post_trial_gap: 0,
	stimulus_duration: 500, //500
	trial_duration: 500, //500
	prompt: prompt_text
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

var start_test_block = {
	type: jsPsychHtmlKeyboardResponse,
	stimulus: '<div class = centerbox>'+
				'<p class = block-text>We will now begin the test portion.</p>'+
				'<p class = block-text>Keep your ' + possible_responses[0][0] + ' on the ' + possible_responses[0][2] + ' and your ' + possible_responses[1][0] + ' on the ' + possible_responses[1][2] + '. ' +
				'You will see a shape on every trial. Please respond to each shape as quickly and accurately as possible!</p>'+
				'<p class = block-text>If the shape is a '+shapes[0]+', press your '+possible_responses[0][0]+'.</p>'+
				'<p class = block-text>If the shape is a '+shapes[1]+', press your '+possible_responses[1][0]+'.</p>'+
				'<p class = block-text>Do not respond if you see a star.</p>'+
				'<p class = block-text>You will no longer receive the rule prompt, so remember the instructions before you continue. Press <i>enter</i> to begin.</p>'+
			 '</div>',
	choices: ['Enter'],
	data: {
		trial_id: "start_test_block"
	},
	post_trial_gap: 1000,
	trial_duration: 180000,
	response_ends_trial: true,
	on_finish: function(){
		feedback_text = 'Starting a test block. Press <i>enter</i> to continue.'
	}
};


//Set up post task questionnaire
var post_task_block = {
	type: jsPsychSurveyText,
	data: {
		exp_id: "stop_signal_rdoc",
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

/********************************************/
/*				Set up nodes				*/
/********************************************/

var practiceStopTrials = []
for (i = 0; i < practice_len; i++) {
	var practice_block = {
		type: 'stop-signal',
		stimulus: getStim,
		SS_stimulus: getStopStim,
		SS_trial_type: getSSType,
		data: {
			trial_id: "practice_trial",
			exp_stage: 'practice'
		},
		choices: choices,
		stimulus_duration: 1000, //1000
		trial_duration: 2000, //2000
		response_ends_trial: false,
		SSD: getSSD,
		timing_SS: 500, //500
		timing_post_trial: 0,
		on_finish: appendData,
		prompt: prompt_text,
		on_start: function(){
			stoppingTracker = []
			stoppingTimeTracker = []
		}
	}
	
	var practice_feedback_block = {
		type: jsPsychHtmlKeyboardResposne,
		data: {
			trial_id: "practice-stop-feedback",
			exp_stage: 'practice'
		},
		choices: ['NO_KEYS'],
		stimulus: getCategorizeFeedback,
		post_trial_gap: 0,
		stimulus_duration: 500, //500
		trial_duration: 500, //500
		response_ends_trial: false, 
	};

	practiceStopTrials.push(prompt_fixation_block, practice_block, practice_feedback_block)
}


var practiceStopCount = 0
var practiceStopNode = {
	timeline: [feedback_block].concat(practiceStopTrials),
	loop_function: function(data) {
		practiceStopCount += 1
		current_trial = 0
		stims = createTrialTypes(numTrialsPerBlock)
		
		var total_trials = 0
		var sum_stop_rt = 0;
		var sum_go_rt = 0;
		var sumGo_correct = 0;
		var sumStop_correct = 0;
		var num_go_responses = 0;
		var num_stop_responses = 0;
		var go_length = 0;
		var stop_length = 0
		
		for (i = 0; i < data.trials.length; i++) {
			if (data.trials[i].trial_id == "practice_trial"){
				total_trials += 1
			}
			
			if (data.trials[i].stop_signal_condition == "go"){
				go_length += 1
				if (data.trials[i].rt != null) {
					num_go_responses += 1
					sum_go_rt += data.trials[i].rt;
					if (data.trials[i].response == data[i].correct_response) {
						sumGo_correct += 1
					}
				}				
			} else if (data.trials[i].stop_signal_condition == "stop") {
				stop_length += 1
				if (data.trials[i].rt != null){
					num_stop_responses += 1
					sum_stop_rt += data[i].rt
				} else {
					sumStop_correct += 1
				}				
			} 
		}
		
		var average_rt = sum_go_rt / num_go_responses;
		var missed_responses = (go_length - num_go_responses) / go_length
		var aveShapeRespondCorrect = sumGo_correct / go_length 
		var stop_signal_respond = num_stop_responses / stop_length

		feedback_text = "<p class = block-text>Please take this time to read your feedback and to take a short break!</p>"

		if ((practiceStopCount == practice_thresh) || ((aveShapeRespondCorrect > accuracy_thresh) && (stop_signal_respond < maxStopCorrectPractice) && (stop_signal_respond > minStopCorrectPractice))){
			feedback_text += '</p><p class = block-text>Done with this practice.'
			exp_phase = "test"
			return false;
		} else {
			if (aveShapeRespondCorrect < accuracy_thresh) {
				feedback_text += '<p class = block-text>Your accuracy is low.  Remember: </p>' + prompt_text_list 
			}
			if (average_rt > rt_thresh) {
				feedback_text += '<p class = block-text>You have been responding too slowly.' + speed_reminder + '</p>'
			}
			if (missed_responses > missed_response_thresh){
				feedback_text += '<p class = block-text>We have detected a number of trials that <i>required a response</i>, where no response was made.  Please <i>ensure that you are responding accurately and quickly  </i>to the shapes.</p>'
			}
			if (stop_signal_respond === maxStopCorrectPractice){
				feedback_text += '<p class = block-text>You have not been stopping your response when stars are present.  Please try your best to stop your response if you see a star.</p>'
			}
			if (stop_signal_respond === minStopCorrectPractice){
				feedback_text += '<p class = block-text>You have been responding too slowly.  Do not wait for the star; respond as quickly and accurately to each stimulus that requires a response.</p>'
			}
			feedback_text += '<p class = block-text>We are going to repeat the practice round now. Press <i>enter</i> to begin.</p>'
			return true
		}
	}
}



var testTrials = []
//testTrials.push(attention_node)
for (i = 0; i < numTrialsPerBlock; i++) {
	var test_block = {
		type: 'stop-signal',
		stimulus: getStim,
		SS_stimulus: getStopStim,
		SS_trial_type: getSSType,
		data: {
			trial_id: "test_trial",
			exp_stage: 'test'
		},
		choices: choices,
		stimulus_duration: 1000, //1000
		trial_duration: 2000, //2000
		response_ends_trial: false,
		SSD: getSSD,
		timing_SS: 500, //500
		timing_post_trial: 0,
		on_finish: appendData,
		on_start: function(){
			stoppingTracker = []
			stoppingTimeTracker = []
		}
	}
	testTrials.push(fixation_block, test_block)
}

var testCount = 0
var testNode = {
	timeline: [feedback_block].concat(testTrials),
	loop_function: function(data) {
		current_trial = 0
		testCount += 1
		stims = createTrialTypes(numTrialsPerBlock)
		
		var total_trials = 0
		var sum_stop_rt = 0
		var sum_go_rt = 0
		var sumGo_correct = 0
		var sumStop_correct = 0
		var num_go_responses = 0
		var num_stop_responses = 0
		var go_length = 0
		var stop_length = 0
		
		for (i = 0; i < data.trials.length; i++) {
			if (data[i].trial_id == "test_trial"){
				total_trials += 1
			}
			if (data[i].stop_signal_condition == "go"){
				go_length += 1
				if (data.trials[i].rt != null) {
					num_go_responses += 1
					sum_go_rt += data.trials[i].rt;
					if (data.trials[i].response == data[i].correct_response) {
						sumGo_correct += 1
					}
				}				
			} else if (data.trials[i].stop_signal_condition == "stop") {
				stop_length += 1
				if (data.trials[i].rt != null){
					num_stop_responses += 1
					sum_stop_rt += data.trials[i].rt
				} else {
					sumStop_correct += 1
				}				
			}
		}
		
		var average_rt = sum_go_rt / num_go_responses;
		var missed_responses = (go_length - num_go_responses) / go_length
		var aveShapeRespondCorrect = sumGo_correct / go_length 
		var stop_signal_respond = num_stop_responses / stop_length
		

		feedback_text = "<p>Please take this time to read your feedback and to take a short break! Press <i>enter</i> to continue." + 
			"<br>You have completed " +testCount+ " out of " +numTestBlocks+ " blocks of trials.</p>"

		if (testCount == numTestBlocks) {
			feedback_text += '<p class = block-text>Done with this test. If you have been completing tasks continuously for an hour or more, please take a 15-minute break before starting again.</p>'
			return false;
		} else {
			if (aveShapeRespondCorrect < accuracy_thresh) {
				feedback_text += '<p class = block-text>Your accuracy is too low. Remember:</p>' + prompt_text_list
			}
			if (average_rt > rt_thresh) {
				feedback_text += '<p class = block-text>You have been responding too slowly, please respond to each shape as quickly and as accurately as possible.</p>'
			}
			if (missed_responses > missed_response_thresh){
				feedback_text += '<p class = block-text>We have detected a number of trials that <i>required a response</i>, where no response was made.  Please <i>ensure that you are responding accurately and quickly  </i>to the shapes.</p>'
			}
			if (stop_signal_respond > maxStopCorrect){
				feedback_text += '<p class = block-text>You have not been stopping your response when stars are present.  Please try your best to stop your response if you see a star.</p>'
			}
			if (stop_signal_respond < minStopCorrect){
				feedback_text += '<p class = block-text>You have been responding too slowly.  Please respond as quickly and accurately to each stimulus that requires a response.</p>'
			}
			return true;
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

/* ************************************ */
/*          Set up Experiment           */
/* ************************************ */

var stop_signal_rdoc_experiment = []

var stop_signal_rdoc_init = () => {
	document.body.style.background = 'gray' //// CHANGE THIS

	jsPsych.pluginAPI.preloadImages(images);

	// globals
	stims = createTrialTypes(numTrialsPerBlock)

	stop_signal_rdoc_experiment.push(fullscreen)

	stop_signal_rdoc_experiment.push(instruction_node)
	stop_signal_rdoc_experiment.push(practiceStopNode)
	stop_signal_rdoc_experiment.push(feedback_block);

	stop_signal_rdoc_experiment.push(start_test_block);
	stop_signal_rdoc_experiment.push(testNode);
	stop_signal_rdoc_experiment.push(feedback_block);

	stop_signal_rdoc_experiment.push(post_task_block);
	stop_signal_rdoc_experiment.push(end_block);

	stop_signal_rdoc_experiment.push(exit_fullscreen)
}