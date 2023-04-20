var jsPoldrackLabMultiStimMultiResponse = (function (jspsych) {
  "use strict";

  const info = {
    name: "poldracklab-multistim-multiresponse",
    parameters: {
      stimuli: {
        type: jspsych.ParameterType.COMPLEX,
        default: undefined
      },
      stimulus_durations: {
        type: jspsych.ParameterType.COMPLEX,
        default: []
      },
      trial_duration: {
        type: jspsych.ParameterType.INT,
        default: -1
      },
      gap_duration: {
        type: jspsych.ParameterType.INT,
        default: 0
      },
      response_ends_trial: {
        type: jspsych.ParameterType.BOOL,
        default: true
      },
      post_trial_gap: {
        type: jspsych.ParameterType.INT,
        default: 1000
      },
      prompt: {
        type: jspsych.ParameterType.HTML_STRING,
        default: ""
      },
      stimulus_choices: {
        type: jspsych.ParameterType.KEYS,
        default: ""
      },
      response_choices: {
        type: jspsych.ParameterType.COMPLEX,
        default: []
      },
      correct_responses: {
        type: jspsych.ParameterType.COMPLEX,
        default: []
      },
      return_strings: {
        type: jspsych.ParameterType.BOOL,
        default: true
      }
    }
  };

  /**
   * **sPoldracklabMultiStimMultiResponse**
   *
   * jsPsych7 converstion of https://github.com/jodeleeuw/jsPsych-GUI/blob/master/jspsych-5.0.1/jspsych-5.0.1/docs/markdown_docs/plugins/jspsych-multi-stim-multi-response.md
   * which was apparently phased out for jsPsych 6/7. 
   * Shows a series of stimuli and then collects an array of responses via pad.
   *
   * @author 
   * @see
   */
  class PoldrackLabMultiStimMultiResponse {
    constructor(jsPsych) {
      this.jsPsych = jsPsych;
    }
    trial(display_element, trial) {

      // set default for trial.stimulus_durations
      if (trial.stimulus_durations == undefined ) {
        trial.stimulus_durations = Array(trial.stimuli.length).fill(1000)
      }

      // this array holds handlers from setTimeout calls that need to be cleared if the trial ends early
      var setTimeoutHandlers = [];

      // array to store if we have gotten a valid response for all the different response types
      var validResponses = [];
      for (var i = 0; i < trial.stimulus_choices.length; i++) {
        validResponses[i] = false;
      }

      // array for response times for each of the different response types
      var responseTimes = [];
      for (var i = 0; i < trial.stimulus_choices.length; i++) {
        responseTimes[i] = -1;
      }

      // array for response keys for each of the different response types
      var responseKeys = [];
      for (var i = 0; i < trial.stimulus_choices.length; i++) {
        responseKeys[i] = -1;
      }

      // function to check if all of the valid responses are received
      function checkAllResponsesAreValid() {
        for (var i = 0; i < validResponses.length; i++) {
          if (validResponses[i] == false) {
            return false;
          }
        }
        return true;
      }

      // function to end trial when it is time
      var end_trial = function() {

        // kill any remaining setTimeout handlers
        for (var i = 0; i < setTimeoutHandlers.length; i++) {
          clearTimeout(setTimeoutHandlers[i]);
        }

        // kill keyboard listeners
        this.jsPsych.pluginAPI.cancelKeyboardResponse(keyboardListener);

        if (trial.response_ends_trial) {
          //If all responses are valid, add up the rt's and the gaps between them to determine block duration
          if (checkAllResponsesAreValid()) {
            var overall_time = 0
            for (var i = 0; i < validResponses.length; i++) {
              overall_time += (responseTimes[i] + trial.gap_duration)
            }
            var block_duration = overall_time - trial.gap_duration
          } else {
            var block_duration = trial.trial_duration
          }
        } else {
          var block_duration = trial.trial_duration
        }

        // gather the data to store for the trial
        correct = responseKeys == trial.correct_response
        
        var trial_data = {
          "rt": trial.return_strings ? JSON.stringify(responseTimes) : responseTimes,
          "stimuli": trial.return_strings ? JSON.stringify(trial.stimuli): trial.stimuli,
          "response": trial.return_strings ? JSON.stringify(responseKeys): responseKeys,
          "stimulus_durations": trial.return_strings ? JSON.stringify(trial.stimulus_durations) : trial.stimulus_durations,
          "gap_duration": trial.gap_duration,
          "block_duration": block_duration,
          "correct_response": trial.correct_response,
          "correct": responseKeys == trial.correct_response
        };

        // clear the display
        display_element.html('');

        // move on to the next trial
        this.jsPsych.finishTrial(trial_data);
      };

      // function to handle responses by the subject
      var after_response = function(info) {

        var whichResponse;
        for (var i = 0; i < trial.choices.length; i++) {

          // allow overlap between response groups
          if (validResponses[i]) {
            continue;
          }

          for (var j = 0; j < trial.choices[i].length; j++) {
            if(this.jsPsych.pluginAPI.compareKeys(info.key, trial.choices[i][j])) {
              whichResponse = i;
              break;
            }
          }

          if (typeof whichResponse !== 'undefined') {
            break;
          }
        }

        if (validResponses[whichResponse] != true) {
          validResponses[whichResponse] = true;
          responseTimes[whichResponse] = info.rt;
          responseKeys[whichResponse] = info.key;
        }

        if (trial.response_ends_trial) {
          if (checkAllResponsesAreValid()) {
            end_trial();
          }
        }
      };

      // flattened version of the choices array
      var allchoices = trial.choices;
      for (var i = 0; i < trial.choices.length; i++) {
        allchoices = allchoices.concat(trial.choices[i]);
      }

      var whichStimulus = 0;

      function showNextStimulus() {

        // display stimulus
        if (!trial.is_html) {
          display_element.append($('<img>', {
            src: trial.stimuli[whichStimulus],
            id: 'jspsych-multi-stim-multi-response-stimulus'
          }));
        } else {
          display_element.append($('<div>', {
            html: trial.stimuli[whichStimulus],
            id: 'jspsych-multi-stim-multi-response-stimulus'
          }));
        }

        //show prompt if there is one
        if (trial.prompt !== "") {
          display_element.append(trial.prompt);
        }

        if (typeof trial.timing_stim[whichStimulus] !== 'undefined' && trial.timing_stim[whichStimulus] > 0) {
            var t1 = setTimeout(function() {
              // clear the display, or hide the display
              if (typeof trial.stimuli[whichStimulus + 1] !== 'undefined') {
                display_element.html('');
                // show the next stimulus
                whichStimulus++;
                if (trial.timing_gap > 0) {
                  var t3 = setTimeout(function() {
                    showNextStimulus();
                  }, trial.timing_gap)
                  setTimeoutHandlers.push(t3)
                } else {
                  showNextStimulus()
                }
              } else {
                $('#jspsych-multi-stim-multi-response-stimulus').css('visibility', 'hidden');
              }

            }, trial.timing_stim[whichStimulus]);

            setTimeoutHandlers.push(t1);
          }

      }

      // show first stimulus
      showNextStimulus();

      // start the response listener
      var keyboardListener = this.jsPsych.pluginAPI.getKeyboardResponse({
        callback_function: after_response,
        valid_responses: allchoices,
        rt_method: 'date',
        persist: true,
        allow_held_key: false
      });

      // end trial if time limit is set
      if (trial.trial_duration > 0) {
        var t2 = setTimeout(function() {
          end_trial();
        }, trial.trial_duration);
        setTimeoutHandlers.push(t2);
      }
    }
  }
  PoldrackLabMultiStimMultiResponse.info = info;
  return PoldrackLabMultiStimMultiResponse;
})(jsPsychModule);



