/* ************************************ */
/* Define helper functions */
/* ************************************ */

function addID() {
  jsPsych.data.addDataToLastTrial({exp_id: 'ax_cpt_rdoc'})
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
  return check_percent
}

var getChar = function() {
  return '<div class = centerbox><div class = AX_text>' + chars[Math.floor(Math.random() * chars.length)] + '</div></div>'
}

var getInstructFeedback = function() {
    return '<div class = centerbox><p class = center-block-text>' + feedback_instruct_text +
      '</p></div>'
  }
  /* ************************************ */
  /* Define experimental variables */
  /* ************************************ */
  // generic task variables
var run_attention_checks = true
var attention_check_thresh = 0.65
var sumInstructTime = 0 //ms
var instructTimeThresh = 0 ///in seconds

// task specific variables
var possible_responses = [['index finger', 188, 'comma key (,)'], ['middle finger', 190, 'period key (.)']]

var chars = 'BCDEFGHIJLMNOPQRSTUVWZ'
var trial_proportions = ["AX", "AX", "AX", "AX", "AX", "AX", "AX", "BX", "AY", "BY"]
var block1_list = jsPsych.randomization.repeat(trial_proportions, 4)
var block2_list = jsPsych.randomization.repeat(trial_proportions, 4)
var block3_list = jsPsych.randomization.repeat(trial_proportions, 4)
var blocks = [block1_list, block2_list, block3_list]

var practice_proportions = ["AX", "AX", "AX", "BX", "AY", "BY"] // change this to trial_proportions?
var practice_block_list = jsPsych.randomization.repeat(practice_proportions, 1) // change this to change practice length

var speed_reminder = '<p class = block-text>Try to respond as quickly as possible without sacrificing accuracy.</p>'

//rule reminder for practice
var prompt_text = '<div class = prompt_box>'+
            '<p class = center-block-text style = "font-size:16px; line-height:80%%;">A -> X: ' + possible_responses[0][0]+'</li>' +
            '<p class = center-block-text style = "font-size:16px; line-height:80%%;">Anything else: ' + possible_responses[1][0] +'</li>' +
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
   type: 'survey-text',
   data: {
       trial_id: "post task questions"
   },
   questions: ['<p class = center-block-text style = "font-size: 20px">Please summarize what you were asked to do in this task.</p>',
              '<p class = center-block-text style = "font-size: 20px">Do you have any comments about this task?</p>'],
   rows: [15, 15],
   columns: [60,60]
};


/* define static blocks */
var end_block = {
  type: 'poldrack-text',
  timing_response: 180000,
  data: {
    exp_id: "ax_cpt_rdoc",
    trial_id: "end"
  },
  text: '<div class = centerbox><p class = center-block-text>Thanks for completing this task!</p><p class = center-block-text>Press <i>enter</i> to continue.</p></div>',
  cont_key: [13],
  timing_post_trial: 0
};

var feedback_instruct_text =
  '<p class=center-block-text>Welcome! This experiment will take around 5 minutes.</p>' +
  '<p class=center-block-text>To avoid technical issues, please keep the experiment tab (on Chrome or Firefox) active and in full-screen mode for the whole duration of each task.</p>' +
  '<p class=center-block-text> Press <i>enter</i> to begin.</p>'
var feedback_instruct_block = {
  type: 'poldrack-text',
  cont_key: [13],
  text: getInstructFeedback,
  data: {
    trial_id: 'instruction'
  },
  timing_post_trial: 0,
  timing_response: 180000
};

var start_test_block = {
  type: 'poldrack-text',
  data: {
    trial_id: "test_intro"
  },
  timing_response: 180000,
  text: '<div class = centerbox><p class = center-block-text>We will now start the test portion.</p>' + 
  '<p class = center-block-text>Keep your index finger on the ' + possible_responses[0][2] + ' and your middle finger on the ' +  possible_responses[1][2] + '</p>' + 
  '<p class = center-block-text>Press <i>enter</i> to begin.</p></div>',
  cont_key: [13],
  timing_post_trial: 1000,
  on_finish: function() {
    exp_stage = 'test'
  }
};


/// This ensures that the subject does not read through the instructions too quickly.  If they do it too quickly, then we will go over the loop again.
var instructions_block = {
  type: 'poldrack-instructions',
  pages: [
    '<div class = centerbox>'+
      '<p class=block-text>Place your <b>index finger</b> on the <b>' + possible_responses[0][2] + '</b> and your <b>middle finger</b> on the <b>' + possible_responses[1][2] + '</b> </p>' + 
      
      '<p class = block-text>In this task, on each trial you will see a letter presented, a short break, and then a second letter. For instance, you may see "A", which would then disappear to be replaced by "F".</p>' +
      '<p class = block-text>Your task is to respond by pressing a button during the presentation of the <b>second</b> letter. If the first letter was an "A" <b>AND</b> the second letter is an "X", press your <b>' +
      possible_responses[0][0] + '</b>. Otherwise, press your <b>' + possible_responses[1][0] + '</b>.</p>' +
    '</div>',
    '<div class = centerbox><p class = block-text>A practice round will start when you press "end instructions". During practice, you will receive feedback and a reminder of the rules. '+
    'These will be taken out for test, so make sure you understand the instructions before moving on.</p>'+
    '<p class = block-text>Remember, press your ' + possible_responses[0][0] + ' after you see "A" followed by an "X", and your ' + possible_responses[1][0] + ' for all other combinations.</p>' +
     speed_reminder + '</div>',
  ],
  allow_keys: false,
  data: {
    exp_id: "ax_cpt_rdoc",
    trial_id: 'instruction'
  },
  show_clickable_nav: true,
  timing_post_trial: 1000
};

var instruction_node = {
  timeline: [feedback_instruct_block, instructions_block],
  /* This function defines stopping criteria */
  loop_function: function(data) {
    for (i = 0; i < data.length; i++) {
      if ((data[i].trial_type == 'poldrack-instructions') && (data[i].rt != -1)) {
        rt = data[i].rt
        sumInstructTime = sumInstructTime + rt
      }
    }
    if (sumInstructTime <= instructTimeThresh * 1000) {
      feedback_instruct_text =
        'Read through instructions too quickly.  Please take your time and make sure you understand the instructions.  Press <i>enter</i> to continue.'
      return true
    } else if (sumInstructTime > instructTimeThresh * 1000) {
      feedback_instruct_text =
        'Done with instructions. Press <i>enter</i> to continue.'
      return false
    }
  }
}

var rest_block = {
  type: 'poldrack-text',
  timing_response: 180000,
  data: {
    trial_id: "rest"
  },
  text: '<div class = centerbox><p class = block-text>Take a break! Press any key to continue.</p></div>',
  timing_post_trial: 1000
};

var wait_block = {
  type: 'poldrack-single-stim',
  stimulus: '<div class = centerbox><div class = AX_feedback>Trial over, get ready for the next one.</div></div>',
  is_html: true,
  choices: 'none',
  data: {
    trial_id: "wait"
  },
  timing_post_trial: 500,
  timing_stim: 1000,
  timing_response: 1000
}

var wait_block_practice = {
  type: 'poldrack-single-stim',
  stimulus: '<div class = centerbox><div class = AX_feedback>Trial over, get ready for the next one.</div></div>',
  is_html: true,
  choices: 'none',
  data: {
    trial_id: "wait"
  },
  timing_post_trial: 0,
  timing_stim: 1000,
  timing_response: 1500,
  prompt: prompt_text
}


/* define test block cues and probes*/
var A_cue = {
  type: 'poldrack-single-stim',
  stimulus: '<div class = centerbox><div class = AX_text>A</div></div>',
  is_html: true,
  choices: 'none',
  data: {
    trial_id: "cue",
    exp_stage: "test"
  },
  timing_stim: 300,
  timing_response: 5200,
  response_ends_trial: false,
  timing_post_trial: 0
};

var other_cue = {
  type: 'poldrack-single-stim',
  stimulus: getChar,
  is_html: true,
  choices: 'none',
  data: {
    trial_id: "cue",
    exp_stage: "test"
  },
  timing_stim: 300,
  timing_response: 5200,
  response_ends_trial: false,
  timing_post_trial: 0
};

var X_probe = {
  type: 'poldrack-single-stim',
  stimulus: '<div class = centerbox><div class = AX_text>X/div></div>',
  is_html: true,
  choices: [possible_responses[0][1], possible_responses[1][1]],
  data: {
    trial_id: "probe",
    exp_stage: "test",
    correct_response: possible_responses[0][1],
  },
  timing_stim: 300,
  timing_response: 1300,
  response_ends_trial: false,
  timing_post_trial: 0,
  on_finish: function(data) {
    correct_trial = 0
    if (data.key_press == data.correct_response) {
      correct_trial = 1
    }
    jsPsych.data.addDataToLastTrial({correct_trial: correct_trial})
  }
};

var other_probe = {
  type: 'poldrack-single-stim',
  stimulus: getChar,
  is_html: true,
  choices: [possible_responses[0][1], possible_responses[1][1]],
  data: {
    trial_id: "probe",
    exp_stage: "test",
    correct_response: possible_responses[1][1]
  },
  timing_stim: 300,
  timing_response: 1300,
  response_ends_trial: false,
  timing_post_trial: 0,
  on_finish: function(data) {
    correct_trial = 0
    if (data.key_press == data.correct_response) {
      correct_trial = 1
    }
    jsPsych.data.addDataToLastTrial({correct_trial: correct_trial})
  }
};

var practice_A_cue = {
  type: 'poldrack-single-stim',
  stimulus: '<div class = centerbox><div class = AX_text>A</div></div>',
  is_html: true,
  choices: 'none',
  data: {
    trial_id: "cue",
    exp_stage: "practice"
  },
  timing_stim: 300,
  timing_response: 5200,
  response_ends_trial: false,
  timing_post_trial: 0,
  prompt: prompt_text,
};

var practice_other_cue = {
  type: 'poldrack-single-stim',
  stimulus: getChar,
  is_html: true,
  choices: 'none',
  data: {
    trial_id: "cue",
    exp_stage: "practice "
  },
  timing_stim: 300,
  timing_response: 5200,
  response_ends_trial: false,
  timing_post_trial: 0,
  prompt: prompt_text,
};

var practice_X_probe = {
  type: 'poldrack-categorize',
  stimulus: '<div class = centerbox><div class = AX_text>X</div></div>',
  is_html: true,
  choices: [possible_responses[0][1], possible_responses[1][1]],
  key_answer: possible_responses[0][1], //correct response
  correct_text: '<div class = fb_box><div class = center-text><font size = 20>Correct!</font></div></div>' + prompt_text,
  incorrect_text: '<div class = fb_box><div class = center-text><font size = 20>Incorrect</font></div></div>' + prompt_text,
  timeout_message: '<div class = fb_box><div class = center-text><font size = 20>Respond Faster!</font></div></div>' + prompt_text,
  data: {
    trial_id: "probe",
    exp_stage: "practice",
  },
  timing_feedback_duration: 500, //500
  timing_stim: 300, //1000
  show_stim_with_feedback: false,
  response_ends_trial: false,
  timing_response: 1300, //2000
  timing_post_trial: 0,
  prompt: prompt_text,
  on_finish: function(data) {
    correct_trial = 0
    if (data.key_press == data.correct_response) {
      correct_trial = 1
    }
    jsPsych.data.addDataToLastTrial({correct_trial: correct_trial})
  }
}

var practice_other_probe = {
  type: 'poldrack-categorize',
  stimulus: getChar,
  is_html: true,
  choices: [possible_responses[0][1], possible_responses[1][1]],
  key_answer: possible_responses[1][1], //correct response
  correct_text: '<div class = fb_box><div class = center-text><font size = 20>Correct!</font></div></div>' + prompt_text,
  incorrect_text: '<div class = fb_box><div class = center-text><font size = 20>Incorrect</font></div></div>' + prompt_text,
  timeout_message: '<div class = fb_box><div class = center-text><font size = 20>Respond Faster!</font></div></div>' + prompt_text,
  data: {
    trial_id: "probe",
    exp_stage: "practice",
  },
  timing_feedback_duration: 500, //500
  timing_stim: 300, //1000
  show_stim_with_feedback: false,
  response_ends_trial: false,
  timing_response: 1300, //2000
  timing_post_trial: 0,
  prompt: prompt_text,
  on_finish: function(data) {
    correct_trial = 0
    if (data.key_press == data.correct_response) {
      correct_trial = 1
    }
    jsPsych.data.addDataToLastTrial({correct_trial: correct_trial})
  }
}

/* ************************************ */
/* Set up experiment */
/* ************************************ */

var ax_cpt_rdoc_experiment = []
ax_cpt_rdoc_experiment.push(instruction_node);

// add practice
for (i = 0; i < practice_block_list.length; i++) {
  switch (practice_block_list[i]) {
    case "AX":
      cue = jQuery.extend(true, {}, practice_A_cue)
      probe = jQuery.extend(true, {}, practice_X_probe)
      cue.data.condition = "AX"
      probe.data.condition = "AX"
      break;
    case "BX":
      cue = jQuery.extend(true, {}, practice_other_cue)
      probe = jQuery.extend(true, {}, practice_X_probe)
      cue.data.condition = "BX"
      probe.data.condition = "BX"
      break;
    case "AY":
      cue = jQuery.extend(true, {}, practice_A_cue)
      probe = jQuery.extend(true, {}, practice_other_probe)
      cue.data.condition = "AY"
      probe.data.condition = "AY"
      break;
    case "BY":
      cue = jQuery.extend(true, {}, practice_other_cue)
      probe = jQuery.extend(true, {}, practice_other_probe)
      cue.data.condition = "BY"
      probe.data.condition = "BY"
      break;
  }
  ax_cpt_rdoc_experiment.push(cue)
  ax_cpt_rdoc_experiment.push(probe)
  ax_cpt_rdoc_experiment.push(wait_block_practice)
}

ax_cpt_rdoc_experiment.push(start_test_block)
ax_cpt_rdoc_experiment.push(attention_node)

// add test
for (b = 0; b < blocks.length; b++) {
  var block = blocks[b]
  for (i = 0; i < block.length; i++) {
    switch (block[i]) {
      case "AX":
        cue = jQuery.extend(true, {}, A_cue)
        probe = jQuery.extend(true, {}, X_probe)
        cue.data.condition = "AX"
        probe.data.condition = "AX"
        break;
      case "BX":
        cue = jQuery.extend(true, {}, other_cue)
        probe = jQuery.extend(true, {}, X_probe)
        cue.data.condition = "BX"
        probe.data.condition = "BX"
        break;
      case "AY":
        cue = jQuery.extend(true, {}, A_cue)
        probe = jQuery.extend(true, {}, other_probe)
        cue.data.condition = "AY"
        probe.data.condition = "AY"
        break;
      case "BY":
        cue = jQuery.extend(true, {}, other_cue)
        probe = jQuery.extend(true, {}, other_probe)
        cue.data.condition = "BY"
        probe.data.condition = "BY"
        break;
    }
    ax_cpt_rdoc_experiment.push(cue)
    ax_cpt_rdoc_experiment.push(probe)
    ax_cpt_rdoc_experiment.push(wait_block)
  }
  ax_cpt_rdoc_experiment.push(attention_node)
  ax_cpt_rdoc_experiment.push(rest_block)
}
ax_cpt_rdoc_experiment.push(post_task_block)
ax_cpt_rdoc_experiment.push(end_block)