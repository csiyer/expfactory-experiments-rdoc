/* ************************************ */
/* Define helper functions */
/* ************************************ */

function addID() {
	jsPsych.data.get().addToLast({exp_id: 'ax_cpt_rdoc'})
}

function assessPerformance() {
	var experiment_data = jsPsych.data.get().filter({exp_stage: 'test', trial_id: 'probe'}).trials
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
	credit_var = (missed_percent < 0.4 && avg_rt > 200 && responses_ok)
  var accuracy = correct / trial_count
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

var setStims = function() {
  currCondition = block_list.pop()
  switch (currCondition) {
    case "AX":
      currStim = '<div class = centerbox><div class = AX_text>X</div></div>'
      currCue = '<div class = centerbox><div class = AX_text>A</div></div>'
      break;
    case "BX":
      currStim = getChar()
      currCue = '<div class = centerbox><div class = AX_text>X</div></div>'
      break;
    case "AY":
      currStim = '<div class = centerbox><div class = AX_text>A</div></div>'
      currCue = getChar()
      break;
    case "BY":
      currStim = getChar()
      currCue = getChar()
      break;
  }
}

var getCue = function() {
  return currCue
}
var getStim = function() {
  return currStim
}
var getCondition = function(){
  return currCondition
}

var getChar = function() {
  return '<div class = centerbox><div class = AX_text>' + chars[Math.floor(Math.random() * chars.length)] + '</div></div>'
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
var instructTimeThresh = 0 ///in seconds
var run_attention_checks = true
var attention_check_thresh = 0.65

var accuracy_thresh = 0.75
var rt_thresh = 1000
var missed_response_thresh = 0.10
var practice_thresh = 3 // 3 blocks max


// task specific variables
var possible_responses = [['index finger', ',', 'comma key (,)'], ['middle finger', '.', 'period key (.)']] // [instruct_name, key_code, key_description]
var choices = [possible_responses[0][1], possible_responses[1][1]]

var chars = 'BCDEFGHIJLMNOPQRSTUVWZ'
var trial_proportions = ["AX", "AX", "AX", "AX", "AX", "AX", "AX", "BX", "AY", "BY"] // repeats n = 4 times for test block
var practice_proportions = ["AX", "AX", "AX", "BX", "AY", "BY"]
var numTestBlocks = 3
var numTrialsPerBlock = trial_proportions.length * 4
var numPracticeTrials = practice_proportions.length

var currCondition = ''
var currCue = ''
var currStim = ''

//rule reminder for practice
var prompt_text_list = '<ul style="text-align:left;">'+
						'<li>A -> X: ' + possible_responses[0][0]+'</li>' +
						'<li>Anything else: ' + possible_responses[1][0] +'</li>' +
					  '</ul>'
var prompt_text = '<div class = prompt_box>'+
            '<p class = center-block-text style = "font-size:16px; line-height:80%%;">A -> X: ' + possible_responses[0][0]+'</li>' +
            '<p class = center-block-text style = "font-size:16px; line-height:80%%;">Anything else: ' + possible_responses[1][0] +'</li>' +
          '</div>'

var speed_reminder = '<p class = block-text>Try to respond as quickly and accurately as possible.</p>'


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
};

var attention_node = {
  timeline: [attention_check_block],
  conditional_function: function() {
    return run_attention_checks
  }
};

//Set up post task questionnaire
var post_task_block = {
   type: jsPsychSurveyText,
   data: {
      exp_id: "ax_cpt_rdoc",
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
    	exp_id: 'ax_cpt_rdoc'
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
  '<p class=center-block-text>Welcome! This experiment will take around 5 minutes.</p>' +
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

var instructions_block = {
  type: jsPsychInstructions,
  pages: [
    '<div class = centerbox>'+
      '<p class=block-text>Place your <b>' + possible_responses[0][0] + '</b> on the <b>' + possible_responses[0][2] + '</b> and your <b>' + possible_responses[1][0] + '</b> on the <b>' + possible_responses[1][2] + '</b> </p>' + 
      
      '<p class = block-text>In this task, on each trial you will see a letter presented, a short break, and then a second letter. For instance, you may see "A", which would then disappear to be replaced by "F".</p>' +
      '<p class = block-text>Your task is to respond by pressing a button during the presentation of the <b>second</b> letter. If the first letter was an "A" <b>AND</b> the second letter is an "X", press your <b>' +
      possible_responses[0][0] + '</b>. Otherwise, press your <b>' + possible_responses[1][0] + '</b>.</p>' +
    '</div>',
    '<div class = centerbox><p class = block-text>We\'ll start with a practice round. During practice, you will receive feedback and a reminder of the rules. '+
    'These will be taken out for test, so make sure you understand the instructions before moving on.</p>'+
    '<p class = block-text>Remember, press your ' + possible_responses[0][0] + ' after you see "A" followed by an "X", and your ' + possible_responses[1][0] + ' for all other combinations.</p>' +
     speed_reminder + '</div>',
  ],
  allow_keys: false,
  data: {
    exp_id: "ax_cpt_rdoc",
    trial_id: 'instructions'
  },
  show_clickable_nav: true,
  post_trial_gap: 0
};

/// This ensures that the subject does not read through the instructions too quickly.  If they do it too quickly, then we will go over the loop again.
var sumInstructTime = 0 // ms
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
      feedback_instruct_text =
        'Read through instructions too quickly.  Please take your time and make sure you understand the instructions.  Press <i>enter</i> to continue.'
      return true
    } else {
      feedback_instruct_text =
        'Done with instructions. Press <i>enter</i> to continue.'
      return false
    }
  }
};

/* block definitions */
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

var set_stims_block = {
  type: jsPsychCallFunction,
  func: setStims
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

// after blocks 
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


/* trial blocks and nodes */
practiceTrials = []
for (i = 0; i < numPracticeTrials; i++) {
  var cue_block = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: getCue, //'<div class = centerbox><div class = AX_text>A</div></div>', getChar
    is_html: true,
    choices: ['NO_KEYS'],
    data: function () {
      return {
        trial_id: "cue",
        exp_stage: 'practice',
        condition: getCondition(),
      }
    },
    stimulus_duration: 300,
    trial_duration: 5200,
    response_ends_trial: false,
    post_trial_gap: 0,
    prompt: prompt_text
  }
  var probe_block = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: getStim, //'<div class = centerbox><div class = AX_text>X</div></div>', getChar
    choices: choices,
    data: function () {
      return {
        trial_id: "probe",
        exp_stage: 'practice',
        condition: getCondition(),
        correct_response: getCondition() == 'AX' ? possible_responses[0][1] : possible_responses[1][1]
      }
    }, 
    stimulus_duration: 300, //1000
    trial_duration: 1300, //2000
    post_trial_gap: 0,
    response_ends_trial: false,
    prompt: prompt_text,
    on_finish: appendData
  }
  var wait_block = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: '<div class = centerbox><div class = AX_feedback>Trial over, get ready for the next one.</div></div>',
    is_html: true,
    choices: ['NO_KEYS'],
    data: {
      trial_id: "wait",
      exp_stage: 'practice'
    },
    post_trial_gap: 0,
    stimulus_duration: 1000,
    trial_duration: 1500,
    prompt: prompt_text
  }
  practiceTrials.push(set_stims_block, cue_block, probe_block, practice_feedback_block, wait_block)
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
      if (data.trials[i].trial_id == 'probe'){
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
        '<p class = center-block-text>Keep your ' + possible_responses[0][0] + ' on the ' + possible_responses[0][2] + ' and your ' + possible_responses[1][0] + ' on the ' +  possible_responses[1][2] + '</p>' + 
        '<p class = center-block-text>Press <i>enter</i> to continue.</p></div>'
      block_list = jsPsych.randomization.repeat(trial_proportions, 4)
      return false
    } else {
      feedback_text = "<p class = block-text>Please take this time to read your feedback and to take a short break!</p>"
      if (accuracy < accuracy_thresh) {
        feedback_text += '<p class = block-text>Your accuracy is low.  Remember: </p>' + prompt_text_list 
      }
      if (ave_rt > rt_thresh){
        feedback_text += '<p class = block-text>You have been responding too slowly. Try to respond as quickly and accurately as possible.</p>'
      }
      if (missed_responses > missed_response_thresh){
        feedback_text += '<p class = block-text>You have not been responding to some trials.  Please respond on every trial that requires a response.</p>'
      }
      feedback_text += '<p class = block-text>We are going to repeat the practice round now. Press <i>enter</i> to begin.</p>'
      block_list = jsPsych.randomization.repeat(practice_proportions, 1) // reset for next
      return true
    }
  }
}

var testTrials = []
// testTrials.push(attention_node)
for (i = 0; i < numTrialsPerBlock; i++) {
  var cue_block = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: getCue, //'<div class = centerbox><div class = AX_text>A</div></div>', getChar
    is_html: true,
    choices: ['NO_KEYS'],
    data: function () {
      return {
        trial_id: "cue",
        exp_stage: 'test',
        condition: getCondition(),
      }
    },
    stimulus_duration: 300,
    trial_duration: 5200,
    response_ends_trial: false,
    post_trial_gap: 0,
    prompt: prompt_text
  }
  var probe_block = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: getStim, //'<div class = centerbox><div class = AX_text>X</div></div>', getChar
    choices: choices,
    data: function () {
      return {
        trial_id: "probe",
        exp_stage: 'test',
        condition: getCondition(),
        correct_response: getCondition() == 'AX' ? possible_responses[0][1] : possible_responses[1][1]
      }
    }, 
    stimulus_duration: 300, //1000
    trial_duration: 1300, //2000
    post_trial_gap: 0,
    response_ends_trial: false,
    prompt: prompt_text,
    on_finish: appendData
  }
  var wait_block = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: '<div class = centerbox><div class = AX_feedback>Trial over, get ready for the next one.</div></div>',
    is_html: true,
    choices: ['NO_KEYS'],
    data: {
      trial_id: "wait",
      exp_stage: 'test'
    },
    post_trial_gap: 0,
    stimulus_duration: 1000,
    trial_duration: 1500,
    prompt: prompt_text
  }
  testTrials.push(set_stims_block, cue_block, probe_block, wait_block)
}
// ax_cpt_rdoc_experiment.push(attention_node) // for now
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
      if (data.trials[i].trial_id == 'probe' && data.trials[i].exp_stage == 'test') {
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
  
    if (testCount == numTestBlocks){
      feedback_text += '</p><p class = block-text>Done with this test. Press <i>enter</i> to continue.<br> If you have been completing tasks continuously for an hour or more, please take a 15-minute break before starting again.'
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
      block_list = jsPsych.randomization.repeat(trial_proportions, 4)
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

/* ************************************ */
/* Set up experiment */
/* ************************************ */

var ax_cpt_rdoc_experiment = []
var ax_cpt_rdoc_init = () => {

  document.body.style.background = 'gray' //// CHANGE THIS?
  
  // globals
  block_list = jsPsych.randomization.repeat(practice_proportions, 1) // change this to change practice length

  ax_cpt_rdoc_experiment.push(fullscreen)
  ax_cpt_rdoc_experiment.push(instruction_node);
  ax_cpt_rdoc_experiment.push(practiceNode)
  ax_cpt_rdoc_experiment.push(testNode)
  ax_cpt_rdoc_experiment.push(post_task_block)
  ax_cpt_rdoc_experiment.push(end_block)
  ax_cpt_rdoc_experiment.push(fullscreen)
};