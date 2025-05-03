



const picdir = "images/"
const codeversion_begins = 2;//!! v2= render backend!!

const confirmid = `https://app.prolific.com/submissions/complete?cc=CJBB6PTO`;//!!!!!change this 

// console.log("newtry__________")
var is_debug = true //!!
console.log("is_debug:", is_debug)
const is_inst_fullscreen = true;//!!
const is_showcorrect_inlog = false; //!!
const timeout_inmin = 200; //100 minutes
const timelimit_finalinst=1000*5;//check this in curr file. 
const timelimit_initial_inst = 1000*5;//check this, it's how much time compulsive is for the instructions initial 
const timeout = 1000 * 60 * timeout_inmin ; // 70 minutes in milliseconds
const condi='r'; 
console.log("current condition:", condi)
var num_trials_useddebug = 1;//number of tirals show in intial test
let lastActivityTime = Date.now();
// var styleElement = document.createElement('style');
// document.head.appendChild(styleElement);

const trialDurationLimit = 1000;
const num_tottest_finaltest = 492;

const picdir_arr = () => picnames.map(iname => picdir + iname);

if (is_debug) {
    var study_duration = 10;
    var initial_test_duration = 10;
    var prompt_duration = 10;
    var prompt_duration_testInitial = 10;
    var prompt_finaltestlist_duration = 10;
    var counting_duration = 10;
    var fixation_duration = 10;
    var counting_gap = 0;
    var posgap_duration = 0;
    var rtfastcut_duration = 0;
    var response_rtlimit_duration = 10;
    var responsekeys = "NO_KEYS";
    var choiceenter = "NO_KEYS";
    // var responsekeys_final = "NO_KEYS";
    var instruction_duration = 10; //1 hour 
    var instruction_duration_between = 10;//10 minutes   
    var finaltest_rtlimit_duration = 10;
    var warning_duration = 10;
    var feedbackmes_duration = 10;
    var feedbackmes_wordinitial_duration = 5; 
    var feedbackmes_wordfinal_duration = 5; 
    var finalfeedback_duration = 5;
    var keychoice_finaltest = "NO_KEYS";
} else{
    var study_duration = 2000;
    var initial_test_duration = 3500; //remember to assign 
    var prompt_duration = 2000;
    var prompt_duration_testInitial = 3000;
    var prompt_finaltestlist_duration = 3000;
    var counting_duration = 2000;
    var counting_gap = 1000;
    var fixation_duration = 1000;
    var posgap_duration = 100;
    var rtfastcut_duration = 150;
    var response_rtlimit_duration = 3500; //3.5s to respond each question
    var responsekeys = ['f','j'];
    var choiceenter = 'enter';
    // var responsekeys_final = ['s','f','j','l'];
    var instruction_duration = 1000*60*60; //1 hour
    var instruction_duration_between = 10*60*60;//10 minutes   
    var finaltest_rtlimit_duration = 4000;
    var warning_duration = 1500;
    var feedbackmes_duration = 1500; 
    var feedbackmes_wordinitial_duration = 700; //intial test feedback length
    var feedbackmes_wordfinal_duration = 500; //final test feedback 
    // length
    var finalfeedback_duration = 500;
    var keychoice_finaltest = 'enter';
}



