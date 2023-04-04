 /* ************************************ */
/* Define helper functions */
/* ************************************ */
function addID() {
	jsPsych.data.get().addToLast({exp_id: 'cued_task_switching_rdoc'})
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
  
  var experiment_data = jsPsych.data.get().filter({exp_stage: 'test', trial_id: 'test_trial'}).trials
  var missed_count = 0
  var trial_count = 0
  var rt_array = []
  var rt = 0
  var correct = 0
  //record choices participants made
  var choice_counts = {}
  choice_counts[null] = 0
  choice_counts[response_keys.key[0]] = 0
  choice_counts[response_keys.key[1]] = 0

  for (var i = 0; i < experiment_data.length; i++) {
    if (experiment_data[i].trial_id == 'test_trial') {
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
  credit_var = (missed_percent < 0.25 && avg_rt > 200 && responses_ok && accuracy > 0.60)

  jsPsych.data.get().addToLast({final_credit_var: credit_var,
                   final_missed_percent: missed_percent,
                   final_avg_rt: avg_rt,
                   final_responses_ok: responses_ok,
                   final_accuracy: accuracy})
}

var randomDraw = function(lst) {
  var index = Math.floor(Math.random() * (lst.length))
  return lst[index]
}


var getInstructFeedback = function() {
  return '<div class = centerbox><p class = center-block-text>' + feedback_instruct_text +
    '</p></div>'
}

var getFeedback = function() {
  return '<div class = bigbox><div class = picture_box><p class = block-text><font color="white">' + feedback_text + '</font></p></div></div>'
}

// Task Specific Functions
var getKeys = function(obj) {
  var keys = [];
  for (var key in obj) {
    keys.push(key);
  }
  return keys
}

var genStims = function(n) {
  stims = []
  for (var i = 0; i < n; i++) {
    var number = randomDraw('12346789')
    var color = 'white' // randomDraw(['white'])
    var stim = {
      number: parseInt(number),
      color: color
    }
    stims.push(stim)
  }
  return stims
}

//Sets the cue-target-interval for the cue block
var setCTI = function() {
  return CTI
}

var getCTI = function() {
  return CTI
}

/* Index into task_switches using the global var current_trial. Using the task_switch and cue_switch
change the task. If "stay", keep the same task but change the cue based on "cue switch". 
If "switch new", switch to the task that wasn't the current or last task, choosing a random cue. 
If "switch old", switch to the last task and randomly choose a cue.
*/
var setStims = function() {
  var tmp;
  switch (task_switches[current_trial].task_switch) {
    case "na":
      tmp = curr_task
      curr_task = randomDraw(getKeys(tasks))
      cue_i = randomDraw([0, 1])
      break
    case "stay":
      if (curr_task == "na") {
        tmp = curr_task
        curr_task = randomDraw(getKeys(tasks))
      }
      if (task_switches[current_trial].cue_switch == "switch") {
        cue_i = 1 - cue_i
      }
      break
    case "switch":
      task_switches[current_trial].cue_switch = "switch"
      cue_i = randomDraw([0, 1])
      if (last_task == "na") {
        tmp = curr_task
        curr_task = randomDraw(getKeys(tasks).filter(function(x) {
          return (x != curr_task)
        }))
        last_task = tmp
      } else {
        tmp = curr_task
        curr_task = getKeys(tasks).filter(function(x) {
          return (x != curr_task)
        })[0]
        last_task = tmp
      }
      break
    case "switch_old":
      task_switches[current_trial].cue_switch = "switch"
      cue_i = randomDraw([0, 1])
      if (last_task == "na") {
        tmp = curr_task
        curr_task = randomDraw(getKeys(tasks).filter(function(x) {
          return (x != curr_task)
        }))
        last_task = tmp
      } else {
        tmp = curr_task
        curr_task = last_task
        last_task = tmp
      }
      break

  }
  curr_cue = tasks[curr_task].cues[cue_i]
  curr_stim = stims[current_trial]
  current_trial = current_trial + 1
  CTI = setCTI()
  correct_response = getResponse()
  correct = false
  console.log(correct_response)
}

var getCue = function() {
  var cue_html = '<div class = upperbox><div class = "center-text" >' + curr_cue + '</div></div>'+
           '<div class = lowerbox><div class = fixation>+</div></div>'
  return cue_html
}

var getStim = function() {
  var stim_html = '<div class = upperbox><div class = "center-text" >' + curr_cue + '</div></div>'+
            '<div class = lowerbox><div class = gng_number><div class = cue-text>'+ preFileType + curr_stim.number + fileTypePNG + '</div></div></div>'
  return stim_html
}

//Returns the key corresponding to the correct response for the current
// task and stim
var getResponse = function() {
  switch (curr_task) {
    case 'color':
      if (curr_stim.color == 'orange') {
        return response_keys.key[0]
      } else {
        return response_keys.key[1]
      }
      break;
    case 'magnitude':
      if (curr_stim.number > 5) {
        return response_keys.key[0]
      } else {
        return response_keys.key[1]
      }
      break;
    case 'parity':
      if (curr_stim.number % 2 === 0) {
        return response_keys.key[0]
      } else {
        return response_keys.key[1]
      }
  }
}


/* Append gap and current trial to data and then recalculate for next trial*/
var appendData = function() {
  var urr_trial = jsPsych.getProgress().current_trial_global
  var trial_id = jsPsych.data.get().filter({trial_index: curr_trial}).trials[0].trial_id
  var trial_num = current_trial - 1 //current_trial has already been updated with setStims, so subtract one to record data
  var task_switch = task_switches[trial_num]

  jsPsych.data.get().addToLast({
    cue: curr_cue,
    stim_number: curr_stim.number,
    task: curr_task,
    task_condition: task_switch.task_switch,
    cue_condition: task_switch.cue_switch,
    current_trial: trial_num,
    correct_response: correct_response,
    CTI: CTI
  })

  if ((trial_id == 'practice_trial') || (trial_id == 'test_trial')){
  correct_trial = 0
    if (jsPsych.data.get().last().trials[0].response == correct_response){
      correct_trial = 1
    }
    jsPsych.data.get().addToLast({
        correct_trial: correct_trial
    })
  } 
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

// task specific variables
var randomize_response_keys = true
var response_keys = {key: [',','.'], key_name: ["index finger","middle finger"], key_description: ["comma", "period"]} // haven't implemented counterbalancing!!!
var choices = response_keys.key
var practice_length = 16 // must be divisible by 4
var exp_len = 192 // must be divisible by 4
var numTrialsPerBlock = 48 
var numTestBlocks = exp_len / numTrialsPerBlock

var practice_thresh = 3 // 3 blocks of 16 trials
var rt_thresh = 1000;
var missed_response_thresh = 0.10;
var accuracy_thresh = 0.75;

var fileTypePNG = ".png'></img>"
var preFileType = "<img class = center src='/static/experiments/cued_task_switching_rdoc/images/"

//set up block stim. correct_responses indexed by [block][stim][type]
var tasks = {
  parity: {
    task: 'parity',
    cues: ['Parity', 'Odd-Even']
  },
  magnitude: {
    task: 'magnitude',
    cues: ['Magnitude', 'High-Low']
  }
}

var task_switch_types = ["stay", "switch"]
var cue_switch_types = ["stay", "switch"]
var task_switches_arr = []
for (var t = 0; t < task_switch_types.length; t++) {
  for (var c = 0; c < cue_switch_types.length; c++) {
    task_switches_arr.push({
      task_switch: task_switch_types[t],
      cue_switch: cue_switch_types[c]
    })
  }
}

var practiceStims = genStims(practice_length + 1)
var testStims = genStims(numTrialsPerBlock + 1)
var stims = practiceStims
var curr_task = randomDraw(getKeys(tasks))
var last_task = 'na' //object that holds the last task, set by setStims()
var curr_cue = 'na' //object that holds the current cue, set by setStims()
var cue_i = randomDraw([0, 1]) //index for one of two cues of the current task
var curr_stim = 'na' //object that holds the current stim, set by setStims()
var current_trial = 0
var CTI = 150 //cue-target-interval or cue's length (7/29, changed from 300 to 150; less time to process the cue should increase cue switch costs and task switch costs)
var exp_stage = 'practice' // defines the exp_stage, switched by start_test_block

var task_list = '<ul><li>Cue: "Parity" or "Odd-Even". Response: Press your <b>' + response_keys.key_name[
    0] + '</b> if even and your <b>' + response_keys.key_name[1] + '</b> if odd.' +
  '</li><li>Cue: "Magnitude" or "High-Low". Response: Press your <b>' + response_keys.key_name[
    0] + '</b> if the number is greater than 5 and your <b>' + response_keys.key_name[1] +
  '</b> if less than 5.</li></ul>'

var prompt_task_list = '<ul style="text-align:left"><li>"Parity" or "Odd-Even": ' + response_keys.key_name[0] +
  ' if even and ' + response_keys.key_name[1] + ' if odd.' +
  '</li><li>"Magnitude" or "High-Low": ' + response_keys.key_name[0] +
  ' if >5 and ' + response_keys.key_name[1] + ' if <5.</li></ul>'

var speed_reminder = '<p class = block-text>Try to respond as quickly and accurately as possible.</p>'


//PRE LOAD IMAGES HERE
var pathSource = "/static/experiments/cued_task_switching_rdoc/images/"
var numbersPreload = ['1','2','3','4','6','7','8','9']
var images = []
for(i=0;i<numbersPreload.length;i++){
  images.push(pathSource + numbersPreload[i] + '.png')
}
// preloaded later, where jsPsych variable is available 


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
//   conditional_function: function() {
//     return run_attention_checks
//   }
// }

//Set up post task questionnaire
var post_task_block = {
   type: jsPsychSurveyText,
   data: {
       exp_id: "cued_task_switching_rdoc",
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
var feedback_instruct_text = '<p class=center-block-text>Welcome! This experiment will take around 10 minutes.</p>' +
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
  trial_duration: 180000,
};

/// This ensures that the subject does not read through the instructions too quickly.  If they do it too quickly, then we will go over the loop again.
var instructions_block = {
  type: jsPsychInstructions,
  data: {
    trial_id: "instructions"
  },
  pages: [
    '<div class = centerbox><p class = block-text>In this experiment you will respond to a sequence of numbers.</p>' + 
    '<p class=block-text>Place your <b>' + response_keys.key_name[0] + '</b> on the <i>' + response_keys.key_description[0] + '</i> key (' + response_keys.key[0] + ') and your <b>' + response_keys.key_name[1] + '</b> on the <i>' + response_keys.key_description[1] + '</i> key (' + response_keys.key[1] + ') </p>' + 
    '<p class = block-text>Your response will depend on the current task, which can change each trial. On some trials, you will have to indicate whether the number is <b>odd or even</b>, and on other trials you will indicate whether the number is <b>higher or lower than 5</b>. Each trial will start with a cue telling you which task to do on that trial.</p></div>',
    
    '<div class = centerbox><p class = block-text>The cue before the number will be a word indicating the task. There will be <b>four</b> different cues indicating <b>two</b> different tasks. The cues and tasks are described below:</p>' +
    task_list +
    speed_reminder +
    '<p class = block-text>You\'ll start with a practice round. During practice, you will receive feedback and a reminder of the rules. These will be taken out for the test, so make sure you understand the instructions before moving on.</p>'
  ],
  allow_keys: false,
  show_clickable_nav: true,
  post_trial_gap: 0
};

var instruction_node = {
  timeline: [feedback_instruct_block, instructions_block],
  /* This function defines stopping criteria */
  loop_function: function() {
    data = jsPsych.data.get().filter({trial_id: 'instructions'}).trials
    for (i = 0; i < data.length; i++) {
      if (data[i].rt != null) {
        sumInstructTime += data[i].rt
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
  },
  stimulus: '<div class = centerbox><p class = center-block-text>Thanks for completing this task!</p><p class = center-block-text>Press <i>enter</i> to continue.</p></div>',
  choices: ['Enter'],
  trial_duration: 180000,
  on_finish: function(data){
    assessPerformance()
    evalAttentionChecks()
  }
};

var start_test_block = {
  type: jsPsychHtmlKeyboardResponse,
  data: {
    trial_id: "test_intro"
  },
  choices: ['Enter'],
  trial_duration: 180000,
  stimulus: '<div class = centerbox>'+
      '<p class = block-text>We will now start the test portion.</p>'+
      '<p class = block-text>Keep your ' + response_keys.key_name[0] + ' on the ' + response_keys.key_description[0] + ' key (' + response_keys.key[0] + ')' +
      ' and your ' + response_keys.key_name[1] + ' on the ' + response_keys.key_description[1] + ' key (' + response_keys.key[1] + ')' +
      ' Your response to each trial will depend on the cue--on some trials, you will indicate whether the number is odd or even, and on other trials you will indicate whether the number is higher or lower than 5.</p>'+
      '<p class = block-text>The cue before the number will be a word indicating the task. There will be four different cues indicating two different tasks. The cues and tasks are described below:</p>' +
      task_list +
      speed_reminder+ 
      '<p class = block-text>Press <i>enter</i> to continue.</p>' +
    '</div>',
  on_finish: function() {
    current_trial = 0
    feedback_text = 'Starting a test block. Press <i>enter</i> to continue.'
    exp_stage = 'test'
  },
  post_trial_gap: 1000
}

/* define practice and test blocks */
var setStims_block = {
  type: jsPsychCallFunction,
  data: {
    trial_id: "set_stims"
  },
  func: setStims,
  post_trial_gap: 0
}

var feedback_text = '<div class = centerbox><p class = center-block-text>Press <i>enter</i> to begin practice.</p></div>'
var feedback_block = {
  type: jsPsychHtmlKeyboardResponse,
  data: {
    trial_id: "feedback"
  },
  choices: ['Enter'],
  stimulus: getFeedback,
  is_html: true,
  stimulus_duration: 180000,
  trial_duration: 180000,
  post_trial_gap: 0,
  response_ends_trial: true,
};


var practiceTrials = []
for (var i = 0; i < practice_length + 1; i++) {
  var practice_fixation_block = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: '<div class = upperbox><div class = fixation>+</div></div><div class = lowerbox><div class = fixation>+</div></div>',
    is_html: true,
    choices: ['NO_KEYS'],
    data: {
      trial_id: "practice_fixation",
      exp_stage: exp_stage
    },
    post_trial_gap: 0,
    stimulus_duration: 500, //500
    trial_duration: 500, //500
    prompt: '<div class = promptbox>' + prompt_task_list + '</div>'
  }

  var practice_cue_block = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: getCue,
    is_html: true,
    choices: ['NO_KEYS'],
    data: {
      trial_id: 'practice_cue',
      exp_stage: exp_stage
    },
    trial_duration: getCTI, //getCTI
    stimulus_duration: getCTI,  //getCTI
    post_trial_gap: 0,
    prompt: '<div class = promptbox>' + prompt_task_list + '</div>',
    on_finish: appendData
  };
  
  var practice_block = {
    type: jsPsychCategorizeHtml,
    stimulus: getStim,
    is_html: true,
    key_answer: getResponse,
    correct_text: '<div class = fb_box><div class = center-text><font size = 20>Correct!</font></div></div><div class = promptbox>' +
      prompt_task_list + '</div>',
    incorrect_text: '<div class = fb_box><div class = center-text><font size = 20>Incorrect</font></div></div><div class = promptbox>' +
      prompt_task_list + '</div>',
    timeout_message: '<div class = fb_box><div class = center-text><font size = 20>Respond Faster!</font></div></div><div class = promptbox>' +
      prompt_task_list + '</div>',
    choices: choices,
    data: {
      trial_id: 'practice_trial'
    },
    feedback_duration: 1000, //500
    show_stim_with_feedback: true,
    trial_duration: 1000, //2000
    stimulus_duration: 1000, //1000
    post_trial_gap: 0,
    response_ends_trial: false,
    prompt: '<div class = promptbox>' + prompt_task_list + '</div>',
    on_finish: appendData,
  }
  var practice_post_trial_gap = { // adding this and shortening actual trial to 1000ms
    type: jsPsychHtmlKeyboardResponse,
    stimulus: '',
    data: {trial_id: 'practice_post_trial_gap'},
    choices: ["NO_KEYS"],
    prompt: '<div class = promptbox>' + prompt_task_list + '</div>',
    trial_duration: 1000
  }
  practiceTrials.push(setStims_block, practice_fixation_block, practice_cue_block, practice_block, practice_post_trial_gap)
}

var practiceCount = 0
var practiceNode = {
  timeline: [feedback_block].concat(practiceTrials),
  loop_function: function(data) {
    practiceCount += 1
    task_switches = jsPsych.randomization.repeat(task_switches_arr, practice_length / 4)
    task_switches.unshift({task_switch: 'na', cue_switch: 'na', go_no_go_type: jsPsych.randomization.repeat(['go','nogo'],1).pop()})
    stims = genStims(practice_length + 1)
    current_trial = 0
  
    var sum_rt = 0
    var sum_responses = 0
    var correct = 0
    var total_trials = 0
  
    for (var i = 0; i < data.trials.length; i++){
      if (data.trials[i].trial_id == "practice_trial"){
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

    feedback_text = "<p class = block-text>Please take this time to read your feedback and to take a short break!</p>"

    if (accuracy > accuracy_thresh){
      feedback_text += '<p class = block-text>No feedback: done with this practice. Press <i>enter</i> to continue.</p>' 
      task_switches = jsPsych.randomization.repeat(task_switches_arr, numTrialsPerBlock / 4)
      task_switches.unshift({task_switch: 'na', cue_switch: 'na', go_no_go_type: jsPsych.randomization.repeat(['go','nogo'],1).pop()})
      stims = genStims(numTrialsPerBlock + 1)
      return false
  
    } else { // accuracy < accuracy_thresh
      feedback_text += '<p class = block-text>Your accuracy is low.  Remember: </p>' + prompt_task_list 
      if (ave_rt > rt_thresh){
        feedback_text += '<p class = block-text>You have been responding too slowly.' + speed_reminder + '</p>'
      }
      if (missed_responses > missed_response_thresh){
        feedback_text += '<p class = block-text>You have not been responding to some trials.  Please respond on every trial that requires a response.</p>'
      }

      if (practiceCount == practice_thresh) {
        feedback_text += '<p class = block-text>Done with this practice. Press <i>enter</i> to continue.</p>' 
        task_switches = jsPsych.randomization.repeat(task_switches_arr, numTrialsPerBlock / 4)
        task_switches.unshift({task_switch: 'na', cue_switch: 'na', go_no_go_type: jsPsych.randomization.repeat(['go','nogo'],1).pop()})
        stims = genStims(numTrialsPerBlock + 1)
        return false
      } else {
        feedback_text += '<p class = block-text>We are going to repeat the practice round now. Press <i>enter</i> to begin.</p>'
        return true
      }
    } 
  }
}


var testTrials = []
// testTrials.push(attention_node)
for (i = 0; i < numTrialsPerBlock + 1; i++) {
  var fixation_block = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: '<div class = upperbox><div class = fixation>+</div></div><div class = lowerbox><div class = fixation>+</div></div>',
    is_html: true,
    choices: ["NO_KEYS"],
    data: {
      trial_id: "test_fixation",
      exp_stage: exp_stage
    },
    post_trial_gap: 0,
    stimulus_duration: 500, //500
    trial_duration: 500, //500
  }

  var cue_block = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: getCue,
    is_html: true,
    choices: ['NO_KEYS'],
    data: {
      trial_id: 'test_cue',
      exp_stage: exp_stage
    },
    trial_duration: getCTI, 
    stimulus_duration: getCTI, 
    post_trial_gap: 0,
    on_finish: appendData
  };


  var test_block = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: getStim,
    is_html: true,
    choices: choices,
    data: {
      trial_id: 'test_trial',
      exp_stage: 'test'
    },
    timing_post_trial: 0,
    timing_response: 2000, //2000
    timing_stim: 1000, //1000
    response_ends_trial: false,
    on_finish: appendData
   }
  
  testTrials.push(setStims_block)
  testTrials.push(fixation_block)
  testTrials.push(cue_block);
  testTrials.push(test_block);
}

var testCount = 0
var testNode = {
  timeline: [feedback_block].concat(testTrials),
  loop_function: function(data) {
    testCount += 1
    current_trial = 0
    task_switches = jsPsych.randomization.repeat(task_switches_arr, numTrialsPerBlock / 4)
    task_switches.unshift({task_switch: 'na', cue_switch: 'na', go_no_go_type: jsPsych.randomization.repeat(['go','nogo'],1).pop()})
    stims = genStims(numTrialsPerBlock + 1)
    
    var sum_rt = 0
    var sum_responses = 0
    var correct = 0
    var total_trials = 0

    for (var i = 0; i < data.trials.length; i++){
      if (data.trials[i].trial_id == "test_trial"){
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
  
    feedback_text = "<p class = block-text>Please take this time to read your feedback and to take a short break!<br>"
    feedback_text += "You have completed: "+testCount+" out of "+numTestBlocks+" blocks of trials.</p>"
    
    if (accuracy < accuracy_thresh){
      feedback_text += '<p class = block-text>Your accuracy is too low.  Remember: </p>' + prompt_task_list 
    }
    if (missed_responses > missed_response_thresh){
      feedback_text += '<p class = block-text>You have not been responding to some trials.  Please respond on every trial that requires a response.</p>'
    }

    if (ave_rt > rt_thresh) {
      feedback_text += 
          '<p class = block-text>You have been responding too slowly. Try to respond as quickly and accurately as possible.</p>'
    }
  
    if (testCount >= numTestBlocks){
      feedback_text += '</p><p class = block-text>Done with this test. Press <i>enter</i> to continue. <br>If you have been completing tasks continuously for one hour or more, please take a 15-minute break before starting again.'
      return false
    } else {
      feedback_text += '<p class = block-text>Press <i>enter</i> to continue.</p>'
      return true
    }
  }
}

/* create experiment definition array */

var cued_task_switching_rdoc_experiment = [];
var cued_task_switching_rdoc_init = () => {

  document.body.style.background = 'gray' //// CHANGE THIS

  jsPsych.pluginAPI.preloadImages(images);

  task_switches = jsPsych.randomization.repeat(task_switches_arr, practice_length / 4)
  task_switches.unshift({task_switch: 'na', cue_switch: 'na', go_no_go_type: jsPsych.randomization.repeat(['go','nogo'],1).pop()})

  cued_task_switching_rdoc_experiment.push(instruction_node)
  cued_task_switching_rdoc_experiment.push(practiceNode);

  cued_task_switching_rdoc_experiment.push(start_test_block)
  cued_task_switching_rdoc_experiment.push(testNode);

  cued_task_switching_rdoc_experiment.push(post_task_block)
  cued_task_switching_rdoc_experiment.push(end_block)
}

