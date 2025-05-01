/**
 * This script defines a complex experimental setup using jsPsych for a memory test experiment.
 * It includes various configurations, timelines, and trial definitions for study, test, and final test phases.
 * The experiment involves presenting images, summing digits, and responding to test stimuli.
 * 
 * 
 *  1. Changed from last V1.2(2), further change consent form. 
 * 2. Important instruction of between-list prompt changed, list 2 told them to remember press F for pictures from previous but not the current list
 * 
 * !! The final test instrucitons were wrong
 * 
 * 
 * subject_id
 */

// // Add version log information to the data properties
// jsPsych.data.addProperties({
//     version_log: [
//         { version: "1.2", changes: "Changed consent form, added between-list prompt for list 2." },
//         { version: "1.3", changes: "Updated instructions and fixed minor bugs." },
//         { version: "1.4", changes: "Further changes to consent form and instructions." }
//     ],
        // {
//        version: "1.5",changes:
            // 1. line roughtly 935; new_obj_store and obj_iFinalFoil wrong on listNum_pickedFrom;
            // 2. Roughly line 654" currAssign_nPlusOneTrial = currAssign ; + "+1"; //MO to currAssign_nPlusOneTrial = currAssign + "+1"; //MO
            // 3. roughly line 678; backward conditon:  
            // else if (['Cn+1','Dn+1'].includes(condi))
            //   else if (['Cn+1','Dn+1'].includes(currAssign_nPlusOneTrial))
        // }
        
// });


async function runExperiment( ) {

    await preloadExperimentFiles();


    let isFirstTrial = true;

    
    var jsPsych = initJsPsych({
        on_trial_finish: async function(data){
            jsPsych.data.get().addToLast({timepassed_mins: ((Date.now()-lastActivityTime)/1000/60).toFixed(2) });//adding passed time
            if (jsPsych.data.get().last(1).trials[0].testPos_final===num_tottest_finaltest && jsPsych.data.get().last(1).trials[0].task==="finalTest") {
                jsPsych.data.addProperties({
                    is_finished: 1
            })};
            data.width =  window.innerWidth;
            data.height = window.innerHeight;

            // const parms = new URLSearchParams(window.location.search);
            // var subject_id = parms.get('subject_id');
            // if (subject_id !== undefined){
            //     subject_id = data.id;
            //     console.log("dataid-----------",data.id)
            // }
            
            var participantId = jsPsych.data.get().last(1).select('subject_id').values[0]; 
            // if (!participantId){
            if (jsPsych.data.get().last(1).select('subject_id').values[0]===undefined){

                participantId = jsPsych.data.get().last(1).select('id').values[0]; 
            }

                // const participantRef = collection('participants').doc(participantId);
                
                // participantRef.set({
                //     trials: firebase.firestore.FieldValue.arrayUnion(trialData)
                //   }, { merge: true })
                //   .then(() => {
                //     console.log("Data saved for participant " + participantId);
                //   })
                //   .catch((error) => {
                //     console.error("Error saving data: ", error);
                //   });

if (participantId){
    try {
        // console.log("PID           ",participantId)
        const cleanedData = cleanData(jsPsych.data.get().last(1).values()[0]);

        const participantRef = doc(db, 'participants', participantId);


        const trialData = {
            subject_id: participantId,
            trial_data: cleanedData // the whole trial data
        };
        // console.log("       PIss",participantId,trialData)

        try {

            if (data.trial_index<=2){
                await setDoc(participantRef, {

                    trial_data: [trialData], // Replace with actual trial data
                    timestamp: serverTimestamp()
                  });
                
                  isFirstTrial = false;
            }else{
                console.log("addtodoc now")
                docRef = await updateDoc(participantRef, {

                    // trial_data: trialData, // Replace with actual trial data
                    trial_data: arrayUnion(trialData), // Replace with actual trial data
                    timestamp: serverTimestamp()
                  });
            }
            
            // docRef = await setDoc(participantRef, cleanedData);

            console.log('Document written with ID: ', participantRef.id);
          } catch (e) {

            console.error('Error adding document: ', e);
          }


        // console.log('Document written with ID: ', docRef.id);
        } catch (e) {

            console.error('Error adding document: ', e);
    }
}
                  
                


            // }



        },

        on_finish: function() {
            
            lasttestpos = jsPsych.data.get().select("testPos_final").values;
            console.log(jsPsych.data.get())
            console.log(lasttestpos)


            if (lasttestpos[lasttestpos.length-1]===num_tottest_finaltest) { 

                const countdownDuration = 3; // seconds
                let countdown = countdownDuration;

                const countdownInterval = setInterval(() => {
                    if (countdown > 0) {
                        const countdownElement = document.createElement('div');
                        countdownElement.style.position = 'fixed';
                        countdownElement.style.top = '50%';
                        countdownElement.style.left = '50%';
                        countdownElement.style.transform = 'translate(-50%, -50%)';
                        countdownElement.style.fontSize = '20px';
                        countdownElement.style.color = 'black';
                        countdownElement.style.backgroundColor = 'white';
                        countdownElement.style.padding = '10px';
                        countdownElement.style.border = '1px solid black';
                        countdownElement.style.textAlign = 'center';
                        countdownElement.innerText = `Redirecting to Google in ${countdown} second(s)...`;
                        document.body.appendChild(countdownElement);

                        countdown--;
                        if (countdown < 0) {
                            document.body.removeChild(countdownElement);
                        }
                    } else {
                        console.log("sucess!!")
                        clearInterval(countdownInterval);
                        window.location = confirmid;
                    }
                }, 1000);
                
                
                // window.location = "https://www.google.com";
            }


           
            //Check below
            if (lasttestpos[lasttestpos.length-1]===num_tottest_finaltest) {
                console.log("sucess!!")
                window.location = confirmid;
                }
            },
    on_start: function(){
        

    }
    });

    var timeline=[];
   
    var subject_id = jsPsych.data.getURLVariable('PROLIFIC_PID');
    var study_id = jsPsych.data.getURLVariable('STUDY_ID');
    var session_id = jsPsych.data.getURLVariable('SESSION_ID');

    JT = x=>jsPsych.timelineVariable(x);
    JRR = (x,y)=>jsPsych.randomization.repeat(x,y);

    console.log("new working")


    startExperimentTimer()

    jsPsych.data.addProperties({
        subject_id: subject_id,
        study_id: study_id,
        session_id: session_id,
        condition: condi,
        is_finished: 0,
        codeversion: codeversion_begins, 
        is_changedfullscreen: 0, 
        designversion:3
    });

   
//****************************************************
//                    CONST var assignment here
//****************************************************
// 
// 
// 
// 
//****************************************************


    const picnames_rand = JRR(picnames,1); 

    const n_lists_singular = 10;//number of lists
    const n_itemInUnit_singular = 3; //3 items in each category. This haven't been converge this var to Int
    const n_itemInUnit_final_singular = n_itemInUnit_singular-1;//number

    const n_NumAllUnit_exceptOverlapInCurrentList_InUnitScale_perList_singular =  15;//15 units of pictures used current list
    const n_NumAllItem_exceptOverlapInCurrentList_InItemScale_perList_singular =  n_NumAllUnit_exceptOverlapInCurrentList_InUnitScale_perList_singular * n_itemInUnit_singular;//45 pictures used current list, regardless of from prior or not
    const n_imageStudyOrTest_perList_inUnitScale_singular = n_NumAllUnit_exceptOverlapInCurrentList_InUnitScale_perList_singular * (2/3); // 10 unit of tests or 10 unit of studies 
    const n_imageStudyOrTest_perList_inItemScale_singular = n_imageStudyOrTest_perList_inUnitScale_singular*n_itemInUnit_singular; //30 tests or 30 studies
    // (portion) of item used in each category
    const finalTest_PortionItemUseInType_singular = 2/3; 
    const n_howMuchMoreUnitSpecialForList1_inUnitScale_forFnn_forAll_singular = 3; //3 more units in list 1, and all that is from Fn;


    const num_digits_pres = 8; // present n digits each trial to fill 24s
    const digit_list_nonfalt = range(0,n_lists_singular).map(i=>jsPsych.randomization.sampleWithReplacement(range(4,10),num_digits_pres)); //create nf easier for final 
    const digit_totCorrect_sum = digit_list_nonfalt.map(i=>arrsum(i));
    const digit_totCorrect_sum_arrObj_inUse = digit_totCorrect_sum.map((i,iidx)=>{
        return({
        sum_currList : i,
        listNum_appear0_initial: iidx + 1
    })
    })
    console.log("digit_totCorrect_sum_arrObj_inUse",digit_totCorrect_sum_arrObj_inUse)
    console.log("digit_list_nonfalt,digit_totCorrect_sum---followed next",digit_list_nonfalt,digit_totCorrect_sum)
    const digit_list_arrArrObj_inUse = digit_list_nonfalt.map((i,iidx)=>i.map((j, jidx)=>{return({
        digit_value : j,
        presPos_digit : jidx+1,
        sum_currList: digit_totCorrect_sum[iidx],
        listNum_appear0_initial: iidx + 1
    })}))
    console.log("digit_list_arrArrObj_inUse",digit_list_arrArrObj_inUse)


    /*************************************************
     *  size_inList_inUnitScale_newInList [a,b] is the how many unit (each unit of size 3) of that kind is needed AS NEW is in each list. a is that for list 1, and b is that for all the rest list.
     * nInType_allList is the number of item across all lists (in current experiment) of the current type 
     * 
     * size_inList_inUnitScale_newInList: applies for initial test number of new items in each list , 
     *          and applies for forward and random condition of number items patching in each list 
     * nInType_allList: is the number of typeX item across the whole experiment 
     *          (they need to be patched with double times, but the patched item have type "FF")   
     * size_inList_inUnitScale_newPosFinal [a,b,c]]: 
     *      a is that special for list1, 
     *      b is that special for list 2 to (n-1),
     *      c is that special for list n
     * 
     * Check the picture of written chart of final test assignment in each list each kind for more info 
     * 
     * sum of size_inList_inUnitScale_newPosFinal_f_r equals sum of size_inList_inUnitScale_newPosFinal_b
    ***********************************************/
    const Design_TypeAll_objOfObj_initial = {
        A:{
            size_inList_inUnitScale_newInList:[4,4], 
            size_inList_inUnitScale_newPosFinal_f_r: [4,4,4],
            size_inList_inUnitScale_newPosFinal_b: [4,4,4],
            nInType_allList:n_itemInUnit_singular*n_lists_singular*4,
            type_comment: "studied only, not in trial",
            type_code_studiedCurr: 1, 
            type_code_testiedCurr: 0, 
            type_code_testiedNext: 0
        },
        B:{
            size_inList_inUnitScale_newInList:[4,4],
            size_inList_inUnitScale_newPosFinal_f_r: [4,4,4],
            size_inList_inUnitScale_newPosFinal_b: [4,4,4],
            nInType_allList:n_itemInUnit_singular*n_lists_singular*4,
            type_comment: "current target, not in next trial",
            type_code_studiedCurr: 1, 
            type_code_testiedCurr: 1, 
            type_code_testiedNext: 0
        },
        Dn:{
            size_inList_inUnitScale_newInList:[1,1],
            size_inList_inUnitScale_newPosFinal_f_r: [1,1,1],
            size_inList_inUnitScale_newPosFinal_b: [0,1,2],
            nInType_allList:n_itemInUnit_singular*n_lists_singular*1,
            type_comment: "current target, in next trial",
            type_code_studiedCurr: 1, 
            type_code_testiedCurr: 1, 
            type_code_testiedNext: 1
        },
        Cn:{
            size_inList_inUnitScale_newInList:[1,1],
            size_inList_inUnitScale_newPosFinal_f_r: [1,1,1],
            size_inList_inUnitScale_newPosFinal_b: [0,1,2],
            nInType_allList:n_itemInUnit_singular*n_lists_singular*1,
            type_comment: "studied only, in next trial",
            type_code_studiedCurr: 1, 
            type_code_testiedCurr: 0, 
            type_code_testiedNext: 1
        },
        Fnn:{
            size_inList_inUnitScale_newInList:[1,1],
            size_inList_inUnitScale_newPosFinal_f_r: [1,1,1],
            size_inList_inUnitScale_newPosFinal_b: [0,1,2],
            nInType_allList:n_itemInUnit_singular*n_lists_singular*1,
            type_comment: "tested only, in next trial",
            type_code_studiedCurr: 0, 
            type_code_testiedCurr: 1, 
            type_code_testiedNext: 1
        },
        Fn:{
            size_inList_inUnitScale_newInList:[4,1], //list 1 have 3 unit, the rest have 1 unit,
            size_inList_inUnitScale_newPosFinal_f_r: [4,1,1],
            size_inList_inUnitScale_newPosFinal_b: [4,1,1],
            nInType_allList:n_itemInUnit_singular*n_lists_singular*1 + 3*n_itemInUnit_singular,
            type_comment: "tested only, not in next trial",
            type_code_studiedCurr: 0, 
            type_code_testiedCurr: 1, 
            type_code_testiedNext: 0
        }
    }
    const nType_singular = Object.keys(Design_TypeAll_objOfObj_initial).length; //6 types
    const TypeNames_arr = Object.keys(Design_TypeAll_objOfObj_initial); //All names
    const n_eachTypeSize_InWholeExp_inItemScale_arr = range(0,nType_singular).map(i=>{return(Design_TypeAll_objOfObj_initial[TypeNames_arr[i]].nInType_allList)}); //[120, 120, 30, 30, 30, 39]
    const Map_NameToTypeSize_initial = new Map(TypeNames_arr.map((key,idx)=>[key, n_eachTypeSize_InWholeExp_inItemScale_arr[idx]]));

    const n_sumNewInEachList_inUnitScale_list1_singular = n_NumAllUnit_exceptOverlapInCurrentList_InUnitScale_perList_singular;//15; number of new item needed in each list (in a unit scaling). It yeilds a single value - 15 here
    const n_sumNewInEachList_inUnitScale_listRested_singular = n_sumNewInEachList_inUnitScale_list1_singular - n_howMuchMoreUnitSpecialForList1_inUnitScale_forFnn_forAll_singular; // 12 here

    const n_newInList_inItemScale_arr = [n_sumNewInEachList_inUnitScale_list1_singular*n_itemInUnit_singular,...JRR(n_sumNewInEachList_inUnitScale_listRested_singular*n_itemInUnit_singular,n_lists_singular-1)]; // [15*3, 12*3, 12*3...12*3]
    const n_fromPriorInList_inItemScale_arr = [0,...JRR(n_howMuchMoreUnitSpecialForList1_inUnitScale_forFnn_forAll_singular*n_itemInUnit_singular , n_lists_singular-1)];//[0,3*3, 3*3...]

    // const n_fromPriorList_inItemScale_2ElementArr_List1_ListRest = [n_NumAllUnit_exceptOverlapInCurrentList_InUnitScale_perList_singular - ] 
    
    // const n_fromPriorList_inItemScale = n_newInList_inItemScale_arr.map(inow=>inow)

    ////////////////
    ///I had a mental breakdown. I will not write the following according to my syntax above (the syntax for initial test) 
    // The following is for pre assign final test index 
    const n_newInList_inItemScale_finaltoPatch_f_r_arr =  [15,...JRR(12,9)].map(i=>i*n_itemInUnit_singular*finalTest_PortionItemUseInType_singular);//*3* 2/3
    // const n_newInList_inItemScale_finalToPatch_b_arr = [...JRR(12,9),15].map(i=>i*n_itemInUnit_singular*finalTest_PortionItemUseInType_singular);///Though this is written, this is not used below
    
    const n_newInList_inItemScale_finaltoPatchDouble_f_r_arr = n_newInList_inItemScale_finaltoPatch_f_r_arr.map(i=>i*2); //[15*3* 2/3 *2, 12*3* 2/3 *2 ,12*3* 2/3 *2,... ]
    const n_newInList_inItemScale_finaltoPatchDouble_now_arr = ['f','r'].includes(condi) ? n_newInList_inItemScale_finaltoPatchDouble_f_r_arr : n_newInList_inItemScale_finaltoPatchDouble_f_r_arr.reverse(); //[15*3* 2/3 *2, 12*3* 2/3 *2 ,12*3* 2/3 *2,... ]

    // const n_newInList_inItemScale_finaltoPatchDouble_b_arr = n_newInList_inItemScale_finalToPatch_b_arr.map(i=>i*2); //[10*3*2, 8*3*2,8*3*2,... ]
    console.log("n_newInList_inItemScale_finaltoPatch_f_r_arr",n_newInList_inItemScale_finaltoPatch_f_r_arr)
    

    //The following number is also total number of pictures that will be used in backward condition
    const n_itemFinalTest_total_singular = sum(n_newInList_inItemScale_finaltoPatchDouble_f_r_arr) ; //=around 480 ; sum all numbers in the array; this has been doubled; 240 new pics in intial test
    // const n_itemFinalTest_b_singular = sum(n_newInList_inItemScale_finaltoPatchDouble_b_arr) ; //=around 480 ; sum all numbers in the array; this has been doubled; 240 new pics in intial test


    // forward and backward list order (reverse outer array
    const finalTestIndex_forward_arr = generateTestPositions(n_newInList_inItemScale_finaltoPatchDouble_f_r_arr).map(i=>i+1);//e.g., [[2,1...] ,[14,11,...],]
    const finalTestIndex_backward_arr = [...finalTestIndex_forward_arr].reverse();
    const finalTestIndex_random_flat_arr = shuffledRange(n_itemFinalTest_total_singular).map(i=>i+1);
    const finalTestIndex_random_arr = n_newInList_inItemScale_finaltoPatchDouble_f_r_arr.reduce(
        ([res, i], size) => [ [...res, finalTestIndex_random_flat_arr.slice(i, i + size)], i + size ],
        [[], 0]
    )[0]; //making the flat array to become a nested one like the two above

    let finalTestIndex_arr;//this store and the next will be popped
    //check the following if it assigns globally
    if (condi==='f') finalTestIndex_arr = finalTestIndex_forward_arr;
    if (condi==='b') finalTestIndex_arr = finalTestIndex_backward_arr;
    if (condi==='r') finalTestIndex_arr = finalTestIndex_random_arr;
    const finalTestIndex_arr_shallowCopy =  [...finalTestIndex_arr]; //This is used to be popped


    console.log("finalTestIndex_forward_arr",finalTestIndex_forward_arr)
    console.log("finalTestIndex_backward_arr",finalTestIndex_backward_arr)
    console.log("finalTestIndex_random_arr",finalTestIndex_random_arr)



        // const n_eachTypeSize_InWholeExp_inItemScale_arr=[120, 120, 30, 30, 30, 39]
        // const TypeNames_arr=['n_A','n_B','n_Dn','n_Cn','n_Fnn','n_Fn'];


        
    /******
     * Algorithems below, 334 lines in total
    ******/
   //This is a var because it will be popped out
    var picnames_rand_MasterPool_initialPlusFinal_obj_ofArr = chunkToObject(picnames_rand,n_eachTypeSize_InWholeExp_inItemScale_arr.map(i=>(i+i*finalTest_PortionItemUseInType_singular)),TypeNames_arr); //i+i*finalTest_PortionItemUseInType_singular is for adding final test items
    // A: (120*  1+2/3): picname1, picname2,...
    // B: (120*  1+2/3)
    // Cn....
    const picnames_rand_MasterPool_initial_obj_ofArr = Object.fromEntries(Object.entries(picnames_rand_MasterPool_initialPlusFinal_obj_ofArr).map(([key, value])=>[key, value.splice(0,Map_NameToTypeSize_initial.get(key))]));//from position 0, remove n {A: Array(120), B: Array(120), Dn: Array(30), Cn: Array(30), Fnn: Array(30), …}
    const picnames_rand_MasterPool_finalFoil_obj_ofArr = picnames_rand_MasterPool_initialPlusFinal_obj_ofArr; //{A: Array(80), B: Array(80), Dn: Array(20), Cn: Array(20), Fnn: Array(20), …}
    const picnames_rand_MasterPool_finalFoil_obj_ofArr_shallowCopy = {...picnames_rand_MasterPool_initialPlusFinal_obj_ofArr} ; //this will be directly used in later assignment of study and test object, and will not be condensed into ArrObj as for initial test
    //because the original object's array has been spliced
    // const picnames_rand_MasterPool_final_obj_ofArr = TypeNames_arr.map(iname=>)
    // console.log("nowtest,")

    console.log('Design_TypeAll_objOfObj_initial',Design_TypeAll_objOfObj_initial)
    console.log("picnames_rand_MasterPool_initial_obj_ofArr",picnames_rand_MasterPool_initial_obj_ofArr,picnames_rand_MasterPool_finalFoil_obj_ofArr);

    const n_item_total_singular =  sum(Object.values(picnames_rand_MasterPool_initial_obj_ofArr).map(i=>i.length)) + sum(Object.values(picnames_rand_MasterPool_finalFoil_obj_ofArr).map(i=>i.length));


    var preloass= {
        type: jsPsychPreload,
        images: picnames_rand.slice(0,n_item_total_singular).map(i_pic=>picdir+i_pic),
        message: "loading pictures...",
        show_detailed_errors: false,
        // error_message: "The experiment failed to load due to some glitch. The experiment has to end now",
        on_error: (function() {
            let alertShown = false;
            return function(filepath) {
                if (!alertShown) {
                    alertShown = true;
                    alert(`
    Dear Participant,

    The images are currently not able to preload.

    Please try again later. If the issue persists, 
    kindly contact the experimenter for assistance.

    Thank you for your understanding.
                    `);
                    jsPsych.endExperiment();

                    window.onbeforeunload = null;
                    const countdownDuration = 3; // seconds
                    let countdown = countdownDuration;

                    window.location = "https://www.google.com";
                    window.close = true;
                    jsPsych.endExperiment();

                    // const countdownInterval = setInterval(() => {
                    //     if (countdown > 0) {
                    //         const countdownElement = document.createElement('div');
                    //         countdownElement.style.position = 'fixed';
                    //         countdownElement.style.top = '50%';
                    //         countdownElement.style.left = '50%';
                    //         countdownElement.style.transform = 'translate(-50%, -50%)';
                    //         countdownElement.style.fontSize = '20px';
                    //         countdownElement.style.color = 'black';
                    //         countdownElement.style.backgroundColor = 'white';
                    //         countdownElement.style.padding = '10px';
                    //         countdownElement.style.border = '1px solid black';
                    //         countdownElement.style.textAlign = 'center';
                    //         countdownElement.innerText = `Redirecting to Google in ${countdown} second(s)...`;
                    //         document.body.appendChild(countdownElement);

                    //         countdown--;
                    //         if (countdown < 0) {
                    //             document.body.removeChild(countdownElement);
                    //         }
                    //     } else {
                    //         clearInterval(countdownInterval);
                    //         window.location = "https://www.google.com";
                    //         window.close = true;
                    //         jsPsych.endExperiment();
                    //     }
                    // }, 1000);
                    
                    // window.location = "https://www.google.com";
                }
            };
        })()



    }
    
    
    // Initialize arrays, its key would be the types and its value would an object be the intialized 
    // typeArry = type : obj 
    //this is the time when the object is firstly initialized. 
    

    // It will becomes: {A: Array(10), B: Array(10), Dn: Array(10), Cn: Array(10), Fnn: Array(10), …};
    // A.0 key"0": Array(12 objects), A.1 key "1": Array(....
    // B.0 key"0": Array().... 
    //Notice!! The following initialize for initial only
    const master_obj_arr_arrObj_initial =  Object.fromEntries(TypeNames_arr.map(name => [name, []]));//TypeArray, stores that for intial 

    for (const type of TypeNames_arr) {

        const TC = Design_TypeAll_objOfObj_initial[type].type_comment;
        const Code1 = Design_TypeAll_objOfObj_initial[type].type_code_studiedCurr;
        const Code2 = Design_TypeAll_objOfObj_initial[type].type_code_testiedCurr;
        const Code3 = Design_TypeAll_objOfObj_initial[type].type_code_testiedNext;
        const size_inList_inUnitScale_newInList = Design_TypeAll_objOfObj_initial[type].size_inList_inUnitScale_newInList ;
        // const size_inList_inUnitScale_newPosFinal = ['f','r'].includes(condi) ? Design_TypeAll_objOfObj_initial[type].size_inList_inUnitScale_newPosFinal_f_r : Design_TypeAll_objOfObj_initial[type].size_inList_inUnitScale_newPosFinal_b ; //this line didn't consider conditions other than f, b, r; =[a,b,c] 3 elements array
        
        const nitem_list1 =  size_inList_inUnitScale_newInList[0] * n_itemInUnit_singular; //store for later easier use

        for (let i = 0; i < n_lists_singular; i++) {
            // Slice correct portion

            //The following step initialize the picNames_listi_typeX_initial array in making it have the correct number items and an id of each item of each list 
            // picNames_listi_typeX_initial
            let picNames_listi_typeX_initial;
            //Warning right here, check later if error
            if (i===0){ //list 1, special right here
                picNames_listi_typeX_initial = picnames_rand_MasterPool_initial_obj_ofArr[type].slice(0, nitem_list1); //e.g. length 4 for Fn,  4 for A
            }else{
                picNames_listi_typeX_initial = picnames_rand_MasterPool_initial_obj_ofArr[type].slice( nitem_list1 + (i-1)*size_inList_inUnitScale_newInList[1]*n_itemInUnit_singular, nitem_list1 + i*size_inList_inUnitScale_newInList[1]*n_itemInUnit_singular); //e.g. length 1 for Fn., 4 for A
            }
            
            

            //Following are for picking the item used for final test
            const picNames_toPatch_listi_typeX = Math.floor(picNames_listi_typeX_initial.length * finalTest_PortionItemUseInType_singular); 
            const allIndices = Array.from({ length: picNames_toPatch_listi_typeX }, (_, inow) => inow);//give array of length n, array values to be inow (1 to n), bassically range(1,n)
            // console.log("Indices:::",picNames_toPatch_listi_typeX,allIndices);

            // Shuffle the index array and pick first picNames_toPatch_listi_typeX
            const finalTestIndices = allIndices.sort(() => Math.random() - 0.5).slice(0, picNames_toPatch_listi_typeX);
            const chosenFinalSet = new Set(finalTestIndices);

            // console.log("type",type,"i",i)
            // console.log("listitems",picNames_listi_typeX_initial)
            // Map into objects
            // console.log("type",finalTestIndices,chosenFinalSet,picNames_listi_typeX_initial)
            const master_arrObj_typei_listi = picNames_listi_typeX_initial.map((id_picName, idx) => ({
                type_comment: TC,
                type_code_studiedCurr : Code1,
                type_code_testiedCurr : Code2,
                type_code_testiedNext : Code3,
                id_picName: id_picName,
                id_picDir: picdir + id_picName,
                stimulusConditions : type, //condition for the whole exp, ABC, etc
                condi,
                anRepeatedItem: ['Cn','Dn','Fnn'].includes(type) ? true : false,
                current_assignmentTypesWithinList: null,//T_target/T_foil/T_nontarget
                listNum_appear1_initial: i+1,
                listNum_appear2_initial: null,
                listNum_infinalOrder: null,
                listNum_pickedFrom: 0,
                task: null,//study/test
                studyPos_appear1_initial: null,
                testPos_appear1_initial: null,
                is_studied_appear1_initial: null,
                is_tested_appear1_initial: null,
                studyPos_appear2_initial: null,//This is actually always 0
                testPos_appear2_initial: null,
                is_studied_appear2_initial: null,
                is_tested_appear2_initial: null,
                studyPos_appear0_initial: null,
                testPos_appear0_initial: null,
                is_studied_appear0_initial: null,
                is_tested_appear0_initial: null,
                is_currentObjAppear1: null,
                num_CurrObjAppear: null,
                testPos_final: null,//initialize to be 0
                stimulusConditionName_nPlusOneTrial: null,//initialize to be 0
                is_chosenFinal: chosenFinalSet.has(idx), //for backward condi, it's firstly chosen in list 1, for example, but it will be popped with a final index in the later for loop  
                listNum_appear0_initial: null,
                is_old: null,
                correct_response_key: null,
                is_finalFoil: false
            }));

            master_obj_arr_arrObj_initial[type].push(master_arrObj_typei_listi);
            // master_obj_arr_arrObj_initial[type].push(master_arrObj_typei_listi);
        };

    }

    //line 338 for idxs;
    // testpos=picnames_rand_MasterPool_finalFoil_obj_ofArr[iname]
    let master_obj_arrObj_finalFoil = {};
    TypeNames_arr.forEach((iname,idx)=>{
        master_obj_arrObj_finalFoil[iname] = picnames_rand_MasterPool_finalFoil_obj_ofArr[iname].map((ipic,idx_pic)=>{
            return({
                type_comment: "final Foil",
                type_code_studiedCurr : null,//not valid, this is for initial test
                type_code_testiedCurr : null,//not valid
                type_code_testiedNext : null,//not valid
                id_picName: ipic,
                id_picDir: picdir + ipic,
                stimulusConditions : "FF", //FF stand for final foil
                condi,
                anRepeatedItem: false,
                current_assignmentTypesWithinList: "F",//T_target/T_foil/T_nontarget in initial test, but different here
                listNum_appear1_initial: 0,//not valid, this is different from initial above
                listNum_appear2_initial: 0,
                listNum_infinalOrder: null,//not known here, but need to assign later
                listNum_pickedFrom : 0,
                task: "final_test",//study/test; must be final test
                studyPos_appear1_initial: 0,//not valid all below null
                testPos_appear1_initial: 0,
                is_studied_appear1_initial: false,
                is_tested_appear1_initial: false,
                studyPos_appear2_initial: 0,
                testPos_appear2_initial: 0,
                is_studied_appear2_initial: false,
                is_tested_appear2_initial: false,
                studyPos_appear0_initial: null,
                testPos_appear0_initial: null,
                is_studied_appear0_initial: null,
                is_tested_appear0_initial: null,
                is_currentObjAppear1: null,
                num_CurrObjAppear: 1, //will only appear once
                testPos_final: null,//will assign later
                stimulusConditionName_nPlusOneTrial: null ,//will not have another name
                is_chosenFinal: true, //this is different from initial above
                listNum_appear0_initial: null,//doesn't exist; this is different from initial above
                is_old: false, //necessarily new in final test
                correct_response_key: "f", //must be new in final test, thus using f key to response
                is_finalFoil: true //diff
            })
        })
    });
    const master_obj_arrObj_finalFoil_shallowCopy = {...master_obj_arrObj_finalFoil};
    


    // const master_obj_arr_arrObj_initial_final = Object.fromEntries(TypeNames_arr.map(name => [name, []]))


    console.log('master_obj_arr_arrObj_initial',master_obj_arr_arrObj_initial);//TypeArray
    // const picnames_rand_MasterPool_initial_obj_ofArr = Object.fromEntries(Object.entries(picnames_rand_MasterPool_initialPlusFinal_obj_ofArr).map(([key, value])=>[key, value.splice(0,Map_NameToTypeSize_initial.get(key))]));

    //example: [ [ {}, {}, ... 30 ], ...10 ];  // 10 lists of 30 study objects
    let study_lists_arrArrObj_inUse = [];//array of objects
    let test_lists_arrArrObj_inUse = [];
    
    // let AllTargetFinalPos_store_map = new Map();
    // console.log("Ss",master_obj_arr_arrObj_initial)
    // let finalTest_lists_arrArrObj_inUse = [];
    // let finalTest_lists_arrArrObj_inUse = new Array(n_itemFinalTest_total_singular);
    let finalTest_lists_arrArrObj_inUse = n_newInList_inItemScale_finaltoPatchDouble_now_arr.map(ilist => {return(new Array(ilist))});
    // console.log(finalTest_lists_arrArrObj_inUse, 701)

    let finaltestMap = new Map();
    for (let ilist = 0; ilist < n_lists_singular; ilist++){
        // console.log("first",ilist)
        // Combine items for this list
        let finalTest_lists_arrObj = [];

        const A_items = master_obj_arr_arrObj_initial.A[ilist];
        const B_items = master_obj_arr_arrObj_initial.B[ilist];
        const Cn_items = master_obj_arr_arrObj_initial.Cn[ilist];
        const Dn_items = master_obj_arr_arrObj_initial.Dn[ilist];
        const Fn_items = master_obj_arr_arrObj_initial.Fn[ilist];
        const Fnn_items = master_obj_arr_arrObj_initial.Fnn[ilist];
        const Dn_priorList_items = ilist!==0 ? master_obj_arr_arrObj_initial.Dn[ilist-1] : undefined; 
        const Cn_priorList_items = ilist!==0 ? master_obj_arr_arrObj_initial.Cn[ilist-1] : undefined;
        const Fnn_priorList_items = ilist!==0 ? master_obj_arr_arrObj_initial.Fnn[ilist-1] : undefined;

        // Define study and test for this list
        let study = deepcopyarobj(shuffleArray([...A_items, ...B_items, ...Cn_items, ...Dn_items]));//Cn,Dn goes to next; A, B current 
        let test = deepcopyarobj(shuffleArray(
            ilist === 0
                ? [...B_items, ...Dn_items, ...Fn_items, ...Fnn_items]
                : [...B_items, ...Dn_items, ...Fn_items, ...Fnn_items, ...Dn_priorList_items, ...Cn_priorList_items, ...Fnn_priorList_items]
        ));//(B Dn) from current; (Fnn_l,Cn_l,Dn,l) from last list; (Fn, Fnn) current new            

        //In the following, I will assign types with their n+1 trial name:
        // A, Cn+1, B, Dn+1 || B, Dn+1, Dn, Cn, Fnn+1, Fn+1, Fnn 
        // let icount = 0;
        // ilist===1 ? console.log("study:::", study) : null;



        study.forEach((obj, idx) => {//only type A, Cn, B, Dn
            
            let addobjnow = false;
            let obj_iFinalFoil = {};
            currAssign = obj.stimulusConditions;
            if (['B','A'].includes(currAssign)){
                currAssign_nPlusOneTrial = currAssign;
                // obj.stimulusConditionName_nPlusOneTrial = currAssign;
            }else if (['Cn','Dn'].includes(currAssign)){
                currAssign_nPlusOneTrial = currAssign + "+1"; //MODIFEID HERE v1.5
                // obj.stimulusConditionName_nPlusOneTrial = currAssign + "+1";
            }

            if (['f','r'].includes(condi)){
                if (obj.is_chosenFinal){

                    addobjnow = true;
                }else{
                    obj.testPos_final = 0;
                }
                // if (ilist===1){ 
                //         console.log("studyobj",idx, obj.testPos_final,obj)
                // }
            }else if ('b'===condi){
                if (['A','B'].includes(currAssign_nPlusOneTrial)){

                    if (obj.is_chosenFinal){

                        addobjnow = true;
                    }else{
                        obj.testPos_final = 0;
                    }
                }else if (['Cn+1','Dn+1'].includes(currAssign_nPlusOneTrial)) { //MODIFIED v1.5
                    // console.log("modified v1.5")
                    obj.testPos_final = "don't konow yet";
                    if (ilist === (n_lists_singular-1)){

                        if (obj.is_chosenFinal){
                            
                            addobjnow = true;
                        }else{
                            obj.testPos_final = 0;
                        }
                    }
                    //Cn+1, Dn+1 find testposition in next test pos
                }
            }

            obj.is_old = null;
            obj.correct_response_key = null;
            obj.listNum_appear0_initial = ilist+1;
            // console.log(obj.listNum_appear0_initial, obj.listNum_appear1_initial)
            obj.stimulusConditionName_nPlusOneTrial = currAssign_nPlusOneTrial;


            obj.current_assignmentTypesWithinList = ['A','Cn'].includes(obj.stimulusConditions) ? "T_nontarget" : "T_target"; // keep this for now; B Dn is target
            obj.is_currentObjAppear1 = true;
            obj.num_CurrObjAppear = 1;

            obj.studyPos_appear1_initial = idx + 1;
            obj.testPos_appear1_initial = obj.current_assignmentTypesWithinList==="T_target" ? test.findIndex(iobj=>iobj.id_picName===obj.id_picName)+1 : 0;
            // console.log(obj,obj.current_assignmentTypesWithinList,obj.testPos_appear1_initial)
            obj.is_studied_appear1_initial = true;
            obj.is_tested_appear1_initial = obj.testPos_appear1_initial === 0 ? false : true;

            obj.studyPos_appear2_initial = 0;
            obj.testPos_appear2_initial = obj.anRepeatedItem ? "don't know here, assign later" : 0;
            obj.is_studied_appear2_initial = false;
            obj.is_tested_appear2_initial = obj.anRepeatedItem ? "don't know here, assign later" : false; 

            obj.studyPos_appear0_initial = obj.studyPos_appear1_initial;
            obj.testPos_appear0_initial = obj.testPos_appear1_initial;
            obj.is_studied_appear0_initial = obj.is_studied_appear1_initial;
            obj.is_tested_appear0_initial = obj.is_tested_appear1_initial;
            obj.listNum_appear2_initial = obj.anRepeatedItem ? "don't know here, assign later" : 0;//if repeat, find from next 

            obj.task = "study";
            
            if (addobjnow){
                obj.testPos_final =  finalTestIndex_arr_shallowCopy[ilist].pop(1);
                const getnow = getListForPosition(obj.testPos_final, n_newInList_inItemScale_finaltoPatchDouble_now_arr);
                obj.listNum_infinalOrder = getnow.listNumber;
                obj.testPos_final_iInList = getnow.positionInList;
                
                obj_iFinalFoil = master_obj_arrObj_finalFoil_shallowCopy[currAssign].pop(1);
                // console.log(currAssign,master_obj_arrObj_finalFoil_shallowCopy)
                obj_iFinalFoil.testPos_final = finalTestIndex_arr_shallowCopy[ilist].pop(1);
                const getnow_FF = getListForPosition(obj_iFinalFoil.testPos_final, n_newInList_inItemScale_finaltoPatchDouble_now_arr);
                obj_iFinalFoil.listNum_infinalOrder = getnow_FF.listNumber;
                obj_iFinalFoil.testPos_final_iInList = getnow_FF.positionInList;
                obj_iFinalFoil.listNum_pickedFrom = ilist + 1;

                new_obj_store = deepcopyobj(obj);
                new_obj_store.is_old=true;
                new_obj_store.task= "final_test";
                new_obj_store.correct_response_key = 'j';
                new_obj_store.is_studied_appear0_initial = null;
                new_obj_store.is_tested_appear0_initial = null;
                new_obj_store.listNum_appear0_initial = null;
                new_obj_store.studyPos_appear0_initial= null;
                new_obj_store.testPos_appear0_initial= null;
                new_obj_store.type_code_studiedCurr= null;
                new_obj_store.type_code_testiedCurr= null;
                new_obj_store.type_code_testiedNext= null;
                new_obj_store.is_currentObjAppear1 = null;
                new_obj_store.stimulusConditionName_nPlusOneTrial = null;
                new_obj_store.num_CurrObjAppear = null;

                // console.log(getnow)
                // console.log(finalTest_lists_arrArrObj_inUse,getnow.listNumber-1,getnow.positionInList-1)
                finalTest_lists_arrArrObj_inUse[getnow.listNumber-1][getnow.positionInList-1] = new_obj_store;
                finalTest_lists_arrArrObj_inUse[getnow_FF.listNumber-1][getnow_FF.positionInList-1] = obj_iFinalFoil
                // console.log(new_obj_store,obj_iFinalFoil)
                finaltestMap.set(new_obj_store.id_picName,new_obj_store);
                // finaltestMap.set(obj_iFinalFoil.id_picName,obj_iFinalFoil);
            }

        });




        // A, Cn+1, B, Dn+1 || B, Dn+1, Dn, Cn, Fnn+1, Fn+1, Fnn 
        // console.log(study,test)
        // ilist===1 ? console.log("test:::", test) : null;
        test.forEach((obj, idx) => {
            let addobjnow = false;
            let obj_iFinalFoil = {};

            obj.listNum_appear0_initial = ilist+1;
            crrObjListNum_jsidx = obj.listNum_appear1_initial -1;

            currAssign = obj.stimulusConditions;
            if (['B','Fn'].includes(currAssign)){
                currAssign_nPlusOneTrial = currAssign;
                if (currAssign==='Fn'){//the name of Fn is special
                    currAssign_nPlusOneTrial = currAssign + "+1"
                }
            }else if (['Cn','Dn','Fnn'].includes(currAssign)){

                if (crrObjListNum_jsidx === ilist){
                    currAssign_nPlusOneTrial = currAssign + "+1" ;
                }else{
                    currAssign_nPlusOneTrial = currAssign
                    obj.type_comment = obj.type_comment + ", from last trial"
                }
                 //when ilist=1; all obj listNum_appear1_initial=1,thus no item is named Cn, Dn or Fnn, they are all named Cn+1, Dn+1, Fnn+1, so they won't go through the following finding of [ilist-1], the following code doesn't have a problem
            }

            // curr_nPlusOneTrial_itemName = obj.stimulusConditionName_nPlusOneTrial;

            if (['f','r'].includes(condi)){
                if (['Fnn+1','Fn+1'].includes(currAssign_nPlusOneTrial)){

                    if (obj.is_chosenFinal){
                        
                        addobjnow = true;
                    }else{
                        obj.testPos_final = 0;
                    }
                    // if (ilist===1){ 
                    //     console.log("testobj", idx,obj.testPos_final,obj)
                    // }
                }else if (['B','Dn+1'].includes(currAssign_nPlusOneTrial)){
                    obj.testPos_final = study.find(istudy=>istudy.id_picName === obj.id_picName).testPos_final;//tricky findout here
                }else if (['Dn','Fnn'].includes(currAssign_nPlusOneTrial)){
                    obj.testPos_final = test_lists_arrArrObj_inUse[ilist-1].find(itest=>itest.id_picName === obj.id_picName).testPos_final;
                }else if ('Cn'===currAssign_nPlusOneTrial){
                    obj.testPos_final = study_lists_arrArrObj_inUse[ilist-1].find(istudy=>istudy.id_picName === obj.id_picName).testPos_final;
                }

                
            }else if ('b'===condi){
                if (['Dn','Cn','Fnn','Fn+1'].includes(currAssign_nPlusOneTrial)){

                    if (obj.is_chosenFinal){
                        
                        addobjnow = true;
                    }else{
                        obj.testPos_final = 0;
                    }
                    // icount ++;
                }else if (['B','Dn+1'].includes(currAssign_nPlusOneTrial)){
                    obj.testPos_final = study.find(istudy=>istudy.id_picName = obj.id_picName).testPos_final;
                }else if ('Fnn+1' === currAssign_nPlusOneTrial){
                    obj.testPos_final = "don't know yet";
                    if (ilist === (n_lists_singular-1)){

                        if (obj.is_chosenFinal){

                            addobjnow = true;
                        }else{
                            obj.testPos_final = 0;
                        }
                    }
                }
            } 

            obj.stimulusConditionName_nPlusOneTrial = currAssign_nPlusOneTrial;

            // is_currentObj_PriorItem = obj.listNum_appear1_initial !== ilist;
            obj.is_currentObjAppear1 = crrObjListNum_jsidx === ilist;

            curr_isTarget = ['B','Dn'].includes(obj.stimulusConditions) &&  crrObjListNum_jsidx===ilist ? true : false;
            obj.current_assignmentTypesWithinList = curr_isTarget ? "T_target" : "T_foil"; 
            // console.log(il)

            obj.is_old = obj.current_assignmentTypesWithinList === curr_isTarget;
            obj.correct_response_key = curr_isTarget ? 'j' : 'f';

            if (obj.is_currentObjAppear1) { //list 1 only go throug this condition 

                obj.num_CurrObjAppear = 1;
                obj.studyPos_appear1_initial = study.findIndex(iobj=>iobj.id_picName===obj.id_picName)+1;
                obj.testPos_appear1_initial = idx + 1;
                obj.is_studied_appear1_initial = obj.studyPos_appear1_initial === 0 ? false : true;
                obj.is_tested_appear1_initial = true;

                obj.studyPos_appear2_initial = 0; 
                obj.testPos_appear2_initial = obj.anRepeatedItem ? "don't know here, assign later" : 0;//restricted to only type 'Cn+1','Dn+1'
                obj.is_studied_appear2_initial = false;
                obj.is_tested_appear2_initial = obj.anRepeatedItem ? "don't know here, assign later" : false; 

                obj.listNum_appear2_initial = obj.anRepeatedItem ? "don't know here, assign later" : false; 

                obj.studyPos_appear0_initial = obj.studyPos_appear1_initial;
                obj.testPos_appear0_initial = obj.testPos_appear1_initial;
                obj.is_studied_appear0_initial = obj.is_studied_appear1_initial;
                obj.is_tested_appear0_initial = obj.is_tested_appear1_initial;
            }else{//only possible to be Dn, Cn, Fnn, when they were the second appear
                // console.log(ilist,obj,study_lists_arrArrObj_inUse[ilist-1].find(iobj=>iobj.id_picName===obj.id_picName))
                obj.num_CurrObjAppear=2;
                if (obj.stimulusConditionName_nPlusOneTrial !== "Fnn"){
                    obj.studyPos_appear1_initial = study_lists_arrArrObj_inUse[ilist-1].find(iobj=>iobj.id_picName===obj.id_picName).studyPos_appear1_initial;
                }else{
                    obj.studyPos_appear1_initial = 0;
                }

                if (obj.stimulusConditionName_nPlusOneTrial !== "Cn"){
                    obj.testPos_appear1_initial = test_lists_arrArrObj_inUse[ilist-1].find(iobj=>iobj.id_picName===obj.id_picName).studyPos_appear1_initial;
                }else{
                    obj.testPos_appear1_initial = 0;
                }
                obj.is_studied_appear1_initial = obj.studyPos_appear1_initial === 0 ? false : true;
                obj.is_tested_appear1_initial = obj.testPos_appear1_initial === 0 ? false : true;

                obj.studyPos_appear2_initial = 0;
                obj.testPos_appear2_initial = idx + 1;
                obj.is_studied_appear2_initial = false;
                obj.is_tested_appear2_initial = true; 

                obj.listNum_appear2_initial = ilist + 1; 

                obj.studyPos_appear0_initial = obj.studyPos_appear2_initial;
                obj.testPos_appear0_initial = obj.testPos_appear2_initial;
                obj.is_studied_appear0_initial = obj.is_studied_appear2_initial;
                obj.is_tested_appear0_initial = obj.is_tested_appear2_initial;
            }

            obj.task = "initialTest";

            let new_obj_store;
            if (addobjnow){
                obj.testPos_final =  finalTestIndex_arr_shallowCopy[ilist].pop(1);
                const getnow = getListForPosition(obj.testPos_final, n_newInList_inItemScale_finaltoPatchDouble_now_arr);
                obj.listNum_infinalOrder = getnow.listNumber;
                obj.testPos_final_iInList = getnow.positionInList;
                
                obj_iFinalFoil = master_obj_arrObj_finalFoil_shallowCopy[currAssign].pop(1);
                // console.log(currAssign,master_obj_arrObj_finalFoil_shallowCopy)
                obj_iFinalFoil.testPos_final = finalTestIndex_arr_shallowCopy[ilist].pop(1);
                const getnow_FF = getListForPosition(obj_iFinalFoil.testPos_final, n_newInList_inItemScale_finaltoPatchDouble_now_arr);
                obj_iFinalFoil.listNum_infinalOrder = getnow_FF.listNumber;
                obj_iFinalFoil.testPos_final_iInList = getnow_FF.positionInList;
                // obj_iFinalFoil.listNum_pickedFrom = ilist + 1;
                obj_iFinalFoil.listNum_pickedFrom = 0;

                new_obj_store = deepcopyobj(obj);
                new_obj_store.is_old=true;
                new_obj_store.task= "final_test";
                new_obj_store.correct_response_key = 'j';
                new_obj_store.is_studied_appear0_initial = null;
                new_obj_store.is_tested_appear0_initial = null;
                new_obj_store.listNum_appear0_initial = null;
                new_obj_store.studyPos_appear0_initial= null;
                new_obj_store.testPos_appear0_initial= null;
                new_obj_store.type_code_studiedCurr= null;
                new_obj_store.type_code_testiedCurr= null;
                new_obj_store.type_code_testiedNext= null;
                new_obj_store.is_currentObjAppear1 = null;
                new_obj_store.stimulusConditionName_nPlusOneTrial = null;
                new_obj_store.num_CurrObjAppear = null;
                new_obj_store.listNum_pickedFrom = ilist+1;//MODIFIED

                // console.log(getnow)
                // console.log(finalTest_lists_arrArrObj_inUse,getnow.listNumber-1,getnow.positionInList-1)
                finalTest_lists_arrArrObj_inUse[getnow.listNumber-1][getnow.positionInList-1] = new_obj_store;

                finalTest_lists_arrArrObj_inUse[getnow_FF.listNumber-1][getnow_FF.positionInList-1] = obj_iFinalFoil
                
                finaltestMap.set(new_obj_store.id_picName,new_obj_store);
            }

            // if (obj.stimulusConditionName_nPlusOneTrial==="B"){
            //     console.log(obj)
            //     console.log(new_obj_store)
            // }


        });

        // const currTestMap = new Map();
        // test.forEach((obj, idx) => {
        //     currTestMap.set(obj.id_picName, obj);
        // });

        // const currStudyMap = new Map();
        // study.forEach((obj, idx) => {
        //     currStudyMap.set(obj.id_picName, obj);
        // });x

        study_lists_arrArrObj_inUse.push(study);
        test_lists_arrArrObj_inUse.push(test);
        // finalTest_lists_arrArrObj_inUse.push(finalTest_lists_arrObj);
    };

    console.log("finalTestIndex After pop:",finalTestIndex_arr_shallowCopy)
    console.log("finalTest_lists_arrArrObj_inUse",finalTest_lists_arrArrObj_inUse)

    console.log("studylist",study_lists_arrArrObj_inUse)
    console.log("testlist",test_lists_arrArrObj_inUse)
    

    //Assign testPos_appear2_initial = obj.anRepeatedItem ? "don't know here, assign later" : 0;
    /// is_tested_appear2_initial
    //Though maybe a single property function call could handle the following task, the for loop is kept and used because more stuff might be add in later in this part. A for loop will be easier for later usage. 
    // for (let n = 0; n < n_lists_singular ; n++) {
    //     // console.log("n",n)
    //     study_lists_arrArrObj_inUse[n].forEach(obj => {
    //         console.log(`listNum_appear0_initial: ${obj.listNum_appear1_initial}, listNum_pickedFrom: ${obj.listNum_pickedFrom}`);
    //     });
    //     test_lists_arrArrObj_inUse[n].forEach(obj => {
    //         console.log(`listNum_appear0_initial: ${obj.listNum_appear1_initial}, listNum_pickedFrom: ${obj.listNum_pickedFrom}`);
    //     });
    // }
    // let finalTest_lists_arrObj = [];
    // let finalTestPositionSet = new Map();
    // let itempnow=0;
    console.log(finaltestMap)
    //finalTest_lists_arrArrObj_inUse
    for (let n = 0; n < n_lists_singular ; n++) {

        const concat_arr = [...study_lists_arrArrObj_inUse[n], ...test_lists_arrArrObj_inUse[n]];

        // finalTestMapOfMap_ListKey.set(n,concat_arr) 
        if (n < n_lists_singular - 1){
            const nextTestList = test_lists_arrArrObj_inUse[n + 1];

            // Create a map: id → index in next test list
            const nextTestMap = new Map();
            nextTestList.forEach((obj, idx) => {
                nextTestMap.set(obj.id_picName, obj);
            });
            
            // Now go through current list's study and test objects,
            // Assign the next list test pos in both study and test 
            // testPos_appear2_initial
            for (const obj of concat_arr){

                const nextObj = nextTestMap.get(obj.id_picName);
                // obj.testPos_appear2_initial = nextObj ? nextObj.testPos_appear1_initial : 0;
                // obj.is_tested_appear2_initial = nextObj ? nextObj.testPos_appear1_initial !==0  : false;
                // let sa;
                // let sb;
                
                if (nextObj){//will be double assigned with the same number when same like study and test overlap
                    sa = nextObj.testPos_appear2_initial;
                    sb = nextObj.listNum_appear2_initial;
                    // console.log(sa)
                    // console.log("sucess1",finaltestMap,obj.id_picName,objfi)

                    obj.testPos_appear2_initial = sa;
                    obj.is_tested_appear2_initial = true;
                    obj.listNum_appear2_initial = sb;

                    const objfi = finaltestMap.get(nextObj.id_picName);
                    if (nextObj.is_chosenFinal){

                        // console.log(objfi,nextObj,nextObj.id_picName)
                    }

                    if (objfi){

                        objfi.testPos_appear2_initial = sa;
                        objfi.is_tested_appear2_initial = true;
                        objfi.listNum_appear2_initial = sb;
                    // console.log("sucess2",objfi)
                    };
                }

                if (condi==="b"){ //this could be moved to the previous for loop as well, but is instead written here for better clarity
                    if (['Cn+1','Dn+1','Fnn+1'].includes(obj.stimulusConditionName_nPlusOneTrial)){
                        obj.testPos_final = nextObj.testPos_final;
                    };
                }
            }

            // for (const obj of  finalTest_lists_arrArrObj_inUse[n]){
            //     const nextObj 
            // }
        }else{//list 10
            for (const obj of concat_arr){
                
                obj.testPos_appear2_initial = 0;
                obj.is_tested_appear2_initial = false;
                obj.listNum_appear2_initial = 0;

                const objfi = finaltestMap.get(obj.id_picName);
                // console.log(objfi, obj.id_picName, obj.listNum_pickedFrom, obj.listNum_appear1_initial)
                // console.log(objfi,nextObj,nextObj.id_picName)
                if (objfi){

                    objfi.testPos_appear2_initial = 0;
                    objfi.is_tested_appear2_initial = false;
                    objfi.listNum_appear2_initial = 0;
                    // console.log("sucess2",objfi)
                };

            }
        };

        // console.log(n, finalTest_lists_arrObj.length, study_lists_arrArrObj_inUse[n].length, concat_arr)

    };

// console.log(finalTest_lists_arrArrObj_inUse.flat().flat())
// finalTest_lists_arrArrObj_inUse.flat().flat().forEach((iobj,idx)=>{
//     struef = iobj.testPos_appear2_initial==="don't know here, assign later";
//     if (struef){
//         console.log(iobj.stimulusConditions,iobj.listNum_appear1_initial)
//         console.log("a",iobj)
//         console.log("b",finaltestMap.get(iobj.id_picName))
//         // console.log("from study",study_lists_arrArrObj_inUse.flat().flat().find(iiobj=>iiobj.id_picName===iobj.id_picName))
//     }
// })


// iA=0;
// iB=0;
// iDn=0;
// iCn=0;
// iFnn=0;
// iFn=0
// finalTest_lists_arrArrObj_inUse.flat().flat().forEach((iobj,idx)=>{
//     xnow=iobj.stimulusConditions
//     if (xnow==="A"){
//         iA++
//     }else if(xnow==="B"){
//         iB++
//     }else if(xnow==="Dn"){
//         iDn++
//     }else if(xnow==="Cn"){
//         iCn++
//     }else if(xnow==="Fnn"){
//         iFnn++
//     }else if(xnow==="Fn"){
//         iFn++
//     }
// })
// console.log([iA,iB,iDn,iCn,iFnn,iFn])


// map(iobj=>iobj.testPos_appear2_initial==="don't know here, assign later"))

    //The following is a little mistaken right now because it is a flat array. 
    // let finalTest_lists_arrArrObj_inUse = deepcopyarobj(finalTest_lists_arrObj);
    // const propertiesToRemove = ['is_currentObjAppear1',"is_studied_appear0_initial","is_tested_appear0_initial","listNum_appear0_initial","stimulusConditionName_nPlusOneTrial","num_CurrObjAppear","studyPos_appear0_initial","testPos_appear0_initial"]
    //type comment here is kept but is a little mistaken for the last part "from last trial";
    // for (const obj of finalTest_lists_arrArrObj_inUse) {
    //     obj.task = "finaltest";
    //     // propertiesToRemove.forEach(prop => delete obj[prop]);
    // };
    // console.log("finalTest_lists_arrArrObj_inUse",finalTest_lists_arrArrObj_inUse)

//********************************************************************************************************
//                    Experiment variables - experiment start now
//********************************************************************************************************
//
// .
//.
// 
//
//********************************************************************************************************

var enter_fullscreen = {
// type: jsPsychFullscreen,
// fullscreen_mode: true

    type: jsPsychFullscreen,
    fullscreen_mode: true,
    message: `To start the experiment, please enter fullscreen mode.  <p>You should not exit fullscreen until you finish the experiment. </p> <br><br>Press 'enter' to continue`,
    on_load:function(){
        document.addEventListener('keydown', function (event) {
        // Check if the pressed key is Enter (key code 13)
        if (event.key === 'Enter') {
            // Simulate a click event on the hidden "Continue" button
            var continueButton = document.getElementById('jspsych-fullscreen-btn');
            // console.log(continueButton)
            if (continueButton) continueButton.click();
        }
    });
    }
}

var handleFullscreenChange = true;
is_inst_fullscreen? 
document.addEventListener('fullscreenchange', function(event) {
    if (handleFullscreenChange&&!document.fullscreenElement) {
        // Handle the case when the user exits fullscreen during the experiment
        // jsPsych.enterFullscreen(); // Re-enter fullscreen
        alert('Please keep the experiment in fullscreen mode. Press F11. Or your data might not be valid');
        jsPsych.data.addProperties({
            is_changedfullscreen: 1
        });
        // timeline.push(enter_fullscreen)
    }
}) : null;


is_inst_fullscreen? window.onbeforeunload = function() {
    return "Do you really want to leave?";
    //if we return nothing here (just calling return;) then there will be no pop-up question at all
    //return;
} : null;

var browser_check = {
    type: jsPsychBrowserCheck,
    on_finish: function(data){
        // window.onbeforeunload = null;
        console.log(data.browser)
        if (!(["chrome","Chrome"].includes(data.browser))){
        // console.log(data.browser)
            alert("You must use Chrome as your browser! You may switch your browser and come back later.")
            window.onbeforeunload = null;
            window.location="https://www.google.com"
            window.close = true
        } else if (data.mobie){
            alert("You must use a desktop/laptop computer to participate in this experiment.")
            window.onbeforeunload = null;
            window.location="https://www.google.com"
            window.close = true
        }
    }
    
};

var enterid = {
    type: jsPsychSurveyText,
    questions: [{prompt: "<p color:black>What is your prolific ID?</p> <p> Press 'enter' to continue after filling in your ID.",required:true}],
    on_load:function(){
        var continueButton = document.getElementById('jspsych-survey-text-next');
        if (continueButton) continueButton.style.display='block !important'
        console.log(continueButton)
    },
    on_finish:function(data){

        // console.log(data.response["Q0"],"data!!!!!!!11")
        current_id = data.response["Q0"];
        jsPsych.data.addProperties({
            id: current_id
        });
        // check below
        if (oldids.includes(current_id)) {
            alert(`
            Dear participant,
            
            We have identified that you have previously taken part in one of our research studies, and we sincerely value your prior involvement. Regrettably, we must inform you that you are ineligible to participate in the current study once more.
            
            If you believe this determination to be in error, please do not hesitate to reach out to our research team. We will promptly address your concerns.
            
            Thank you for your understanding.
            `);
            console.log("true")
            window.onbeforeunload = null;
            window.location="https://www.google.com"
            window.close = true
            jsPsych.endExperiment();
        }
    },
    data: {
        task: "enterid"
    }
}

var fixation = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: '<div style="font-size:60px;">+</div>',
    choices: "NO_KEYS",
    trial_duration: fixation_duration,
    data: {
        task: 'fixation'
    }
};

var instructions = {
    type: jsPsychSurveyMultiChoice,
    on_load:function(){
    // var continueButton = document.getElementById('jspsych-fullscreen-btn');
    // if (continueButton) continueButton.style.display='block'
    // console.log(continueButton)
    },
    questions: [
    {
    prompt: `<h1 style='text-align: left;color: crimson;background: white;font: caption-;''> INDIANA UNIVERSITY STUDY INFORMATION SHEET FOR RESEARCH MEMORY TEST FOR WORD AND PICTURE </h1> <br>

        <h1 style='color: black;text-align: left;background: white;font: caption;'> You are being asked to participate in a research study. Scientists do research to answer important questions that might help change or improve the way we do things in the future. This document will give you information about the study to help you decide whether you want to participate. Please read this form, and ask any questions you have, before agreeing to be in the study. This study is being conducted under the approval of the Indiana University Institutional Review Board (IRB) with protocol number 18431, including any approved amendments.</h1><br>

        <h1 style='color: black;text-align: left;background: white;font: caption;'> All research is voluntary. You can choose not to take part in this study. If  you decide to participate, you can change your mind later and leave the study at any time. You will not be penalized or lose any benefits if you decide not to participate or choose to leave the study later.</h1> <br> 

        <h1 style='color: black;text-align: left;background: white;font: caption;'> This research is intended for individuals 18 years of age or older. If you are under age 18, do not complete the survey. This research is for residents of the United States. If you are not a U.S. resident, do not complete the survey.</h1> <br> 

        <h1 style='color: black;text-align: left;background: white;font: caption;'> The purpose of this study is to investigate how people remember words and/or pictures.</h1> <br> <h1 style='color: black;text-align: left;background: white;font: caption;'> We are asking you if you want to be in this study because you registered for this study on Prolific. The study is being conducted by Dr. Richard Shiffrin, a professor in the department of Psychological and Brain Science and the Program in Cognitive Science.</h1> <br> 


        
        <h1 style='color: black;text-align: left;background: white;font: caption;'> To protect against loss of confidentiality, any identifiable information from the data that could lead back to you will be removed within two days of your completion of the study. We don’t think you will have any personal benefits from taking part in this study, but we hope to learn things that will help researchers in the future.
        </h1> <br> 
        
        <h1 style='color: black;text-align: left;background: white;font: caption;'><strong><FONT color='#CC5500'> You will be paid for participating in this study.</FONT>We pay at an hourly rate of $10.50, and the payment will be disbursed within 5 days after completing the experiment. The maximum time of taking this experiment is 120 minutes. The timer began as soon as you accessed the link to this study. <strong> <br><FONT COLOR="#CC5500"> TO BE APPROVED AND GET FULLY PAID, YOU WILL HAVE TO PAY ATTENTION TO THE INSTRUCTIONS AND SHOW THAT YOU COULD REMEMBER SOME OF THE PICTURES THAT YOU STUDY. </FONT> You will receive feedback telling you whether you have been able to remember the pictures.</strong> </h1><br>

        <h1 style='color: black;text-align: left;background: white;font: caption;'> 
    <strong><FONT color='#CC5500'>If you agree to be in the study, you will do the following things.</FONT> First, the experiment will ask for you to input your ID in Prolific. You must use desktop or PC to do this experiment. You must use <FONT color='#CC5500'> Chrome</FONT> as your browser.  The experiment contains practice trials and real trials. In these trials, you will see a list of pictures to remember. After each list, you will see some digits to add up. Then type the sum. You will then see test pictures. If a picture was one you had studied in the preceding list, you will press the J key, and if not, press the F key.  </strong> 
    </h1> <br> 
        <h1 style='color: black;text-align: left;background: white;font: caption;'> We will protect your information and make every effort to keep your personal information confidential, but we cannot guarantee absolute confidentiality. No information which could identify you will be shared in publications about this study. Your personal information may be shared outside the research study if required by law. We also may need to share your research records with other groups for quality assurance or data analysis. These groups include the Indiana University Institutional Review Board or its designees, and state or federal agencies who may need to access the research records (as allowed by law). </h1><br>

        <h1 style='color: black;text-align: left;background: white;font: caption;'> If you have questions about the study or encounter a problem with the research, contact the researcher. For questions about the study, contact either Shuchun Lai at shulai@iu.edu , or Dr. Richard Shiffrin at shiffrin@indiana.edu.
        For questions about your rights as a research participant, to discuss problems, complaints, or concerns about a research study, or to obtain information or to offer input, please contact the IU Human Research Protection Program office at 800-696-2949 or at irb@iu.edu. </h1><br>
        
        <h1 style='color: black;text-align: left;background: white;font: caption;'> Thank you for agreeing to participate in our research. Before you begin, please note that the data you provide may be collected and used by Prolific as per its privacy agreement. Additionally, this research is for subjects over the age of 18*; if you are under the age of 18, please do not complete this survey.</h1><br>
        `,
    
    name: 'consent', 
    options:[`I have read and understand this information and agree to join this study. <p style='text-align: left'> Clicking to confirm, then press 'enter' to continue.</p>`],
    required: true
    }, 
],
};




const practice_text = `

    <p style='text-align: justify;color: black;background: white;font: caption-;'>1. A list of 30 pictures will appear on the screen one at a time. Study the pictures as they appear.</p>
    <p style='text-align: justify;color: black;background: white;font: caption-;'>2. After a brief blank period, you will see a series of numbers. Add these numbers as they appear. When prompted with "TYPE THE SUM," use the number keys to enter your answer.</p>
     
    <p style='text-align: justify; color: black; background: white; font: caption-;'> 
    3. Next, you will see a series of test pictures from the list you just studied. For each picture, press the <strong>"J"</strong> key if you recognize it as one you have seen in the current list. Press the <strong>"F"</strong> key if you don’t recognize it as one from the current list. <br>   
      <strong>Accumulated accuracy will be displayed throughout the experiment. Please pay attention and try to get an averaged performance higher than 60% (chance level is 50%).</strong></p><br>
    <p style='text-align: justify; color: black; background: white; font: caption-;'>
    You will begin with a practice list, followed by nine formal test lists. <strong>For each test, respond based only on the list you JUST studied. If a picture appeared in a previous list but not the current one, press the <strong>"F"</strong> key.</strong>
    </p>

<p style='text-align: justify;color: black;background: white;font: caption-;'>Do not worry if you are unsure about some test pictures. This is normal, but please make your best guess.</p>
    <p style='text-align: justify;color: black;background: white;font: caption-;'>Press the "Enter" key to start the practice list.</p>
      
      `;



var flguse_ins=0;//Check this: don't know what its doing

var prompt_instructions_practice = {
    timeline: [{
        type: jsPsychHtmlKeyboardResponse,
        stimulus: practice_text,
        post_trial_gap: posgap_duration,
        trial_duration: instruction_duration,//1hr if not 
        choices: choiceenter,
        data: {task: "instructions_practice"},
        on_start: function() {
            // Record the start time of the trial
            if (flguse_ins===0){
                instructionsStartTime_practice = jsPsych.getTotalTime();
                flguse_ins=1;
                // console.log("once!")
            }
        },

    }],
    loop_function: function(data){

        // console.log()

        if (is_debug) return(false)

        //Check the following, the following has created problems
        var timeElapsed = jsPsych.getTotalTime() - instructionsStartTime_practice;
        // console.log(timeElapsed)
        timelimit = timelimit_initial_inst;
        timeleft = Math.round((timelimit-timeElapsed)/1000);
        if(timeElapsed < timelimit) {
            // Less than 10 seconds passed, continue looping
            warningfunc(jsPsych,`<div style="text-align:center ; font-size: larger; font-weight: bold; color: black;"><br> <br> <br> <br> <br>Please take more time to read the instructions! (${timeleft} seconds left)</div>`,warning_duration)
            return true; 
        } else {
            // 10 seconds have passed, break the loop
            return false;
        }
    }
}

// timeline.push(prompt_instructions_practice)

var instructions_test = {//not used here becuase there is only one practice trial

    type: jsPsychHtmlKeyboardResponse,
    stimulus: `
    <p style='text-align: justify;color: black;background: white;font: caption-;''>
        Now you have finished the practice. When ready, start the study list with the ‘enter’ key.</p><p> Remember, respond based only on the list you JUST studied. If a picture appeared in a previous list but not the current one, press the <strong>"F"</strong> key.</p>
    `,
    post_trial_gap: posgap_duration,
    trial_duration: instruction_duration,
    choices: choiceenter
    };
    

var prompt_instructions_between = {//Check this

    type: jsPsychHtmlKeyboardResponse,
    stimulus: `
    <p style='text-align: justify;color: black;background: white;font: caption-;''>
        Press the 'enter' key to see the next list of pictures. </p>
    `,
    post_trial_gap: posgap_duration,
    trial_duration: instruction_duration_between,
    choices: choiceenter,
    on_start: function(){
        console.log("ii")
    }
};


var prompt_countingfeedback = {//correct and in correct

    type: jsPsychHtmlKeyboardResponse,
    stimulus: function(){
        // console.log(jsPsych.data.get().last(1).values()[0])
        if(jsPsych.data.get().last(1).values()[0].correct)
        return("<p background:white>CORRECT!</p>")
        else return("<p background:white>INCORRECT!</p>")
    },
    choices: "NO_KEYS",
    trial_duration: feedbackmes_duration,
    data:{
        task: "promptfeedback"
    }, 
    post_trial_gap: posgap_duration
};

//Check this
if (condi==='f'){mes = `ss`}
else if (condi==="b"){mes=`ss`}
else if (condi==="r") (mes='')

finalint_text = `<p style='text-align: justify;color: black;background: white;font: caption-;paddingRight =30px; paddingLeft =30px;'>
    <strong>You have now completed the first part of the study. <br>

     <strong>You will now see a very long series of test pictures.</strong> For each test,respond with the <FONT color="#C41E3A"><strong>"J"</FONT></strong> key to indicate you have seen this picture some time during first part of the experiment, whether <FONT color="#C41E3A"><strong>studied or tested</strong> on ANY list</FONT>. You will press the <FONT color="#C41E3A"><strong>"F"</FONT></strong> key to indicate that you have NEVER seen this pictures in first part of the study.</p>
  <p style='text-align: justify;color: black;background: white;font: caption-;paddingRight =10px; paddingLeft =10px;''>After each respond, your accumulated accuracy will be presented like before.  </p>


<p style='text-align: justify;color: black;background: white;font: caption-;paddingRight =30px; paddingLeft =30px;'>If you have read and understood these instructions, press the RETURN/ENTER key to go to the testing. </p>`


var flguse_final=0;
var instructions_finaltest = {
    timeline: [{
        on_start: function() {
            // Record the start time of the trial
            if (flguse_final===0){
                instructionsStartTime = jsPsych.getTotalTime();
                flguse_final=1;
        }
        },
        type: jsPsychHtmlKeyboardResponse,
        stimulus: finalint_text,
        post_trial_gap: posgap_duration,
        trial_duration: instruction_duration,
        choices: keychoice_finaltest,
        data: {
            task: "finalt_instructions"
        }
        // minimum_valid_rt:2000,
        // response_ends_trial:false
    }],

    loop_function: function(data){

        // console.log()

        if (is_debug) return(false)

        var timeElapsed = jsPsych.getTotalTime() - instructionsStartTime;
        console.log(timeElapsed)
        timelimit = timelimit_finalinst; //Attention! Check here! This has been causing problems
        // timelimit = 1000;
        timeleft = Math.round((timelimit-timeElapsed)/1000);
        if(timeElapsed < timelimit) {
            // Less than 10 seconds passed, continue looping
            warningfunc(jsPsych,`<div style="text-align:center ; font-size: larger; font-weight: bold; color: black;"><br> <br> <br> <br> <br>Please take more time to read the instructions! (${timeleft} seconds left)</div>`,warning_duration)
            return true; 
        } else {
            // 10 seconds have passed, break the loop
            return false;
        }
    }
}


var ISI = {
        type: jsPsychHtmlKeyboardResponse,
        stimulus: '',
        choices: "NO_KEYS",
        trial_duration: 100,
};   

var prompt_digits = {

    type: jsPsychHtmlKeyboardResponse,
    stimulus: 'Summing up the digits as they appear',
    choices: "NO_KEYS",
    trial_duration: prompt_duration,
    data:{
        task: "prompt"
    },
    post_trial_gap: posgap_duration
};

var prompt_test_initial = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: 'Now judge if you have seen this pictures from the list you JUST studied before the digits',
    choices: "NO_KEYS",
    trial_duration: prompt_duration_testInitial, //3000 ms
    data:{
      task: "prompt"
    },
    post_trial_gap: posgap_duration
};

let correctionmap = new Map();//store only type Dn and Fnn, yeild to total number item of 60; 

var v_initialstudy_trial = {

    type: jsPsychImageKeyboardResponse,
    stimulus: JT('id_picDir'),
    choices: "NO_KEYS",
    trial_duration: study_duration, //Check this
    post_trial_gap: posgap_duration, //And check this
    data: {
        anRepeatedItem: JT("anRepeatedItem"),
        task: "initial_study",
        current_assignmentTypesWithinList: JT("current_assignmentTypesWithinList"),
        is_chosenFinal: JT("is_chosenFinal"),
        is_currentObjAppear1: JT("is_currentObjAppear1"),
        is_studied_appear0_initial: JT("is_studied_appear0_initial"),
        is_studied_appear1_initial: JT("is_studied_appear1_initial"),
        is_studied_appear2_initial: JT("is_studied_appear2_initial"),
        is_tested_appear0_initial: JT("is_tested_appear0_initial"),
        is_tested_appear1_initial: JT("is_tested_appear1_initial"),
        is_tested_appear2_initial: JT("is_tested_appear2_initial"),
        listNum_appear0_initial:  JT('listNum_appear0_initial'),
        listNum_appear1_initial: JT("listNum_appear1_initial"),
        stimulusConditionName_nPlusOneTrial: JT("stimulusConditionName_nPlusOneTrial"),
        num_CurrObjAppear: JT("num_CurrObjAppear"),
        stimulusConditions: JT("stimulusConditions"),
        studyPos_appear0_initial: JT("studyPos_appear0_initial"),
        studyPos_appear1_initial: JT("studyPos_appear1_initial"),
        studyPos_appear2_initial: JT("studyPos_appear2_initial"),
        testPos_appear0_initial: JT("testPos_appear0_initial"),
        testPos_appear1_initial: JT("testPos_appear1_initial"),
        testPos_appear2_initial: JT("testPos_appear2_initial"),
        testPos_final: JT("testPos_final"),
        type_code_studiedCurr: JT("type_code_studiedCurr"),
        type_code_testiedCurr: JT("type_code_testiedCurr"),
        type_code_testiedNext: JT("type_code_testiedNext"),
        type_comment: JT("type_comment"),
        id_picName: JT("id_picName"),
        is_old: JT("is_old"),
        correct_response_key: JT("correct_response_key"),
        listNum_appear2_initial: JT("listNum_appear2_initial"),
        listNum_pickedFrom: JT("listNum_pickedFrom"),
        listNum_infinalOrder: JT("listNum_infinalOrder")
    },
    on_finish: function(data){
        // if (data.anRepeatedItem){
        //     correctionmap.set(data.id_picName,data)
        //     console.log(correctionmap)
        // }
    }
};

var v_digitpresent = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: JT('digit_value'),
    choices: "NO_KEYS",
    trial_duration: counting_duration,
    post_trial_gap: counting_gap,
    data: {
        task: "digitPresentation", 
        presPos_digit: JT("presPos_digit"),
        stimulus_id: JT("digit_value"),
        sum_currList: JT("sum_currList"),
        listNum_appear0_initial: JT("listNum_appear0_initial")
    },
    on_finish: function(data){
    // console.log(digits_list_sum_itrial);
    }
};

var v_answer_digit = {//nondebug

    on_start: function(trial){
        if (is_showcorrect_inlog) console.log("Correct answer:",trial,trial.data.correct_response);
        if (is_debug){
            setTimeout(function () {
            jsPsych.finishTrial({
                response: {
                    question: trial.questions[0].prompt,
                    answer: 'Skipped after ' + (10 / 1000) + ' seconds'
                }
            });
            }, 10);
        }
    },
    type: jsPsychSurveyText,
    questions: [
        {prompt: `Please enter the sum using your number keyboard <p>Press 'enter' to continue.</p>`,required: true}
    ],
    on_finish: function(data){
        //   console.log(digits_list_sum_itrial);
        // console.log(current_digit_response)
        ans = Object.values(data.response)[0];
        // console.log(ans)
        data.correct = ans==data.correct_response
        // console.log(data.correct_response);
        data.responsesum = ans;
    },
    data: {
        task: "answer_counting",
        correct_response: JT("sum_currList")
        // is_correct: ;
        // listNum_appear0_initial: "listNum_appear0_initial"
    }
};//check data structure of the current answer

var answer_digit_looptrial = {
    timeline: [v_answer_digit],
    loop_function: function(data){

        // console.log()

        if (is_debug) return(false)

        var cur_response = Object.values(data.values()[0].response);
        // console.log(cur_response);
        isdigits = /^[0-9]*$/.test(cur_response);
        // console.log(isdigits);
        if(!isdigits){
            warningfunc(jsPsych,`<div style="text-align:center ; font-size: larger; font-weight: bold; color: black;"><br> <br> <br> <br> <br> Not Digits! </div>`,warning_duration)
            return true;
        } else {

            // currentans = data.values()[0].response;
            return false;
        }
    }
};



var v_initialTest_trial = {

    type: jsPsychImageKeyboardResponse,
    trial_duration: initial_test_duration,
    stimulus: jsPsych.timelineVariable("id_picDir"),
    choices: responsekeys,
    post_trial_gap: posgap_duration,
    on_start:function(trial){

        // if (is_showcorrect_inlog) console.log("Correct answer:",trial,trial.data.correct_response_key);
        if (trial.data.testPos_appear0_initial === 1){
            trial.data.accumulated_accuracy = 0;
            // trial.data.accumulated_accuracy_last = 0;
        }else {
            // document.getElementById("Div1").style.visibility = "visible";
            // console.log(jsPsych.data.getLastTrialData())
            trial.data.accumulated_accuracy = jsPsych.data.getLastTrialData().trials[0].accumulated_accuracy;
            // trial.data.accumulated_accuracy_last = jsPsych.data.getLastTrialData().trials[0].accumulated_accuracy
        }

    },

    data:{
        task: 'initialTest_response',
        anRepeatedItem: JT("anRepeatedItem"),
        // task: "initial_test",
        current_assignmentTypesWithinList: JT("current_assignmentTypesWithinList"),
        is_chosenFinal: JT("is_chosenFinal"),
        is_currentObjAppear1: JT("is_currentObjAppear1"),
        is_studied_appear0_initial: JT("is_studied_appear0_initial"),
        is_studied_appear1_initial: JT("is_studied_appear1_initial"),
        is_studied_appear2_initial: JT("is_studied_appear2_initial"),
        is_tested_appear0_initial: JT("is_tested_appear0_initial"),
        is_tested_appear1_initial: JT("is_tested_appear1_initial"),
        is_tested_appear2_initial: JT("is_tested_appear2_initial"),
        listNum_appear0_initial:  JT('listNum_appear0_initial'),
        listNum_appear1_initial: JT("listNum_appear1_initial"),
        stimulusConditionName_nPlusOneTrial: JT("stimulusConditionName_nPlusOneTrial"),
        num_CurrObjAppear: JT("num_CurrObjAppear"),
        stimulusConditions: JT("stimulusConditions"),
        studyPos_appear0_initial: JT("studyPos_appear0_initial"),
        studyPos_appear1_initial: JT("studyPos_appear1_initial"),
        studyPos_appear2_initial: JT("studyPos_appear2_initial"),
        testPos_appear0_initial: JT("testPos_appear0_initial"),
        testPos_appear1_initial: JT("testPos_appear1_initial"),
        testPos_appear2_initial: JT("testPos_appear2_initial"),
        testPos_final: JT("testPos_final"),
        type_code_studiedCurr: JT("type_code_studiedCurr"),
        type_code_testiedCurr: JT("type_code_testiedCurr"),
        type_code_testiedNext: JT("type_code_testiedNext"),
        type_comment: JT("type_comment"),
        id_picName: JT("id_picName"),
        is_old: JT("is_old"),
        correct_response_key: JT("correct_response_key"),
        listNum_appear2_initial: JT("listNum_appear2_initial"),
        listNum_pickedFrom: JT("listNum_pickedFrom"),
        listNum_infinalOrder: JT("listNum_infinalOrder")
    },
    prompt: function(){
        lastresp = jsPsych.data.get().last(1).values()[0]
        // console.log(lastresp)
        if (lastresp.task == "initialTest_response"){
          
            return '<p color: black;background: white;><strong>"F" for new&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;"J" for old</strong></p>'.concat(
              "Your accumulated accuracy for this trial is: <FONT color=#C41E3A>").concat(
              Math.round(lastresp.accumulated_accuracy*100)).concat("%</FONT>")
        }
        else { //first trial
          
            return '<p color: black;background: white;><strong>"F" for new&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;"J" for old</strong></p>'.concat(
              "Your accumulated accuracy for this trial is: ")
        }
    },

    on_finish: function(data){

        data.correct = jsPsych.pluginAPI.compareKeys(data.response, data.correct_response_key);
        if (data.correct) tempcrr=1; else tempcrr=0;
        data.recognition_correct = tempcrr;
        
        data.accumulated_accuracy = (data.accumulated_accuracy*(data.testPos_appear0_initial-1)+tempcrr)/data.testPos_appear0_initial;
        // console.log(data.accumulated_accuracy,tempcrr,data.correct,data.testPos_appear0_initial)

        if (data.response === null){
            // document.getElementById("Div1").style.visibility = "hidden";
            warningfunc(jsPsych,"<div font-size: larger; font-weight: bold; color: black;> You need to respond faster!  </div>",warning_duration)
        };

        if (data.rt < rtfastcut_duration & data.response!==null){

            // document.getElementById("Div1").style.visibility = "hidden";
            warningfunc(jsPsych,`<div style= "text-align:center" ; font-size: larger; font-weight: bold; color: black; class="center-screen" ><br> <br> <br> <br> <br> Too fast!  </div>`,warning_duration)
        };

        // console.log(data.stimulusConditions,data.anRepeatedItem,data.num_CurrObjAppear,data.correct_appear1,data.correct_appear2)

        if (data.anRepeatedItem){
           

            if ( data.num_CurrObjAppear===1){//Dn+1,Fnn+1

                if (correctionmap.get(data.id_picName)) console.log("Error!!")
                correctionmap.set(data.id_picName,data)
                // console.log(correctionmap);
                data.correct_appear1 = data.correct;
                // data.correct_appear2 = null;

                //list 10, won't go to the else if below.
                if (data.listNum_appear0_initial===n_lists_singular){
                    data.correct_appear2 = null;
                }

            }else if( data.num_CurrObjAppear===2){//Dn, Cn, Fnn

                if (data.stimulusConditions==="Cn"){
                    data.correct_appear1 = null;
                    data.correct_appear2 = data.correct;
                    correctionmap.set(data.id_picName,data);

                }else if (['Dn','Fnn'].includes(data.stimulusConditions)){
                    
                    lastobj = correctionmap.get(data.id_picName);
                    // console.log(lastobj)
                    // last_trial =  jsPsych.data.get().filter({trial_index: lastobj.trial_index}).last(1).values()[0]; // Find trial 1 by trial_number
                    // last_trial = jsPsych.data.getDataByTimelineNode(lastobj.internal_node_id).last(1).values()[0];
                    // console.log(last_trial)
                    data.correct_appear1 = lastobj.correct_appear1;
                    data.correct_appear2 = data.correct;
                    
                    lastobj.correct_appear2 = data.correct;
                    // last_trial.correct_appear2 = data.correct;
                    
                    // console.log(data.stimulusConditions,data,last_trial,jsPsych.data.getDataByTimelineNode(lastobj.internal_node_id).last(1).values()[0])
                    // lastobj.xx="ss"
                };
                
            }
        } else{
            data.correct_appear1 = data.correct;
            data.correct_appear2 = null;
        }


        // console.log(data.stimulusConditions,data.anRepeatedItem,data.num_CurrObjAppear,data.correct_appear1,data.correct_appear2)


    }
    };
/**************************************************
                Finial trials
/
/**************************************************/

var prompt_f_list  = {

    type: jsPsychHtmlKeyboardResponse,
    stimulus: function(){
        listnum = jsPsych.timelineVariable('f_listnum');
        console.log(listnum)
        if (condi !== "r"){
            return (`Tests of pictures from <strong>LIST ${listnum}</strong>`)
        }else{
            return (`false!!! ${listnum}`)//Check this!!
        }
    },
    choices: "NO_KEYS",
    trial_duration: prompt_finaltestlist_duration,
    data:{
        task: "prompt"
    },
    post_trial_gap: posgap_duration
};

    
var v_finaltest = {

    on_start: function(trial){
        // if (is_showcorrect_inlog) console.log("Correct answer:",trial,trial.data.correct_response_key);
        if (is_showcorrect_inlog) console.log("Correct answer:",trial.data.correct_response_key);

        if (trial.data.testPos_final === 1){
            trial.data.accumulated_accuracy = 0;
        }
        else {
            trial.data.accumulated_accuracy = jsPsych.data.getLastTrialData().trials[0].accumulated_accuracy;
        };


        // console.log(jsPsych.data.get())
    },
        trial_duration: finaltest_rtlimit_duration,
        type: jsPsychImageKeyboardResponse,
        stimulus: jsPsych.timelineVariable('id_picDir'),
        choices: responsekeys,
        post_trial_gap: posgap_duration,
        data:{
            task: 'finalTest',
            current_assignmentTypesWithinList: JT("current_assignmentTypesWithinList"),
            is_chosenFinal: JT("is_chosenFinal"),
            is_currentObjAppear1: JT("is_currentObjAppear1"),
            is_studied_appear0_initial: JT("is_studied_appear0_initial"),
            is_studied_appear1_initial: JT("is_studied_appear1_initial"),
            is_studied_appear2_initial: JT("is_studied_appear2_initial"),
            is_tested_appear0_initial: JT("is_tested_appear0_initial"),
            is_tested_appear1_initial: JT("is_tested_appear1_initial"),
            is_tested_appear2_initial: JT("is_tested_appear2_initial"),
            listNum_appear0_initial:  JT('listNum_appear0_initial'),
            listNum_appear1_initial: JT("listNum_appear1_initial"),
            stimulusConditionName_nPlusOneTrial: JT("stimulusConditionName_nPlusOneTrial"),
            num_CurrObjAppear: JT("num_CurrObjAppear"),
            stimulusConditions: JT("stimulusConditions"),
            studyPos_appear0_initial: JT("studyPos_appear0_initial"),
            studyPos_appear1_initial: JT("studyPos_appear1_initial"),
            studyPos_appear2_initial: JT("studyPos_appear2_initial"),
            testPos_appear0_initial: JT("testPos_appear0_initial"),
            testPos_appear1_initial: JT("testPos_appear1_initial"),
            testPos_appear2_initial: JT("testPos_appear2_initial"),
            testPos_final: JT("testPos_final"),
            type_code_studiedCurr: JT("type_code_studiedCurr"),
            type_code_testiedCurr: JT("type_code_testiedCurr"),
            type_code_testiedNext: JT("type_code_testiedNext"),
            type_comment: JT("type_comment"),
            id_picName: JT("id_picName"),
            is_old: JT("is_old"),
            correct_response_key: JT("correct_response_key"),
            listNum_appear2_initial: JT("listNum_appear2_initial"),
            listNum_pickedFrom: JT("listNum_pickedFrom"),
            listNum_infinalOrder: JT("listNum_infinalOrder")
        },
        prompt: function(){
            lastresp =jsPsych.data.get().last(1).values()[0]

            if (lastresp.task == "finalTest"){
          
                return '<p color: black;background: white;><strong>"F" for new&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;"J" for old</strong></p>'.concat(
                    "Your accumulated accuracy for this trial is: <FONT color=#C41E3A>").concat(
                    Math.round(lastresp.accumulated_accuracy*100)).concat("%</FONT>")
            }
            else { //first trial
                
                return '<p color: black;background: white;><strong>"F" for new&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;"J" for old</strong></p>'.concat(
                    "Your accumulated accuracy for this trial is: ")
            }
            
            // feedbacknow = `<FONT color="white"><p> . </p> <p> . </p></FONT>`
            // return '<p color: black;background: white;>"F" for new&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;"J" for old</strong></p>'.concat(`<p><FONT color="white"> . </p><FONT>`)

        
        },
        on_finish: function(data){

            data.correct = jsPsych.pluginAPI.compareKeys(data.response, data.correct_response_key);
            if (data.correct) tempcrr=1; else tempcrr=0;
            data.recognition_correct = tempcrr;

            data.accumulated_accuracy = (data.accumulated_accuracy*(data.testPos_final-1)+tempcrr)/data.testPos_final;

            // data.accumulated_accuracy = (data.accumulated_accuracy*(data.testpos-1)+tempcrr)/data.testpos;  

            if (data.response === null & (!is_debug)){
                warningfunc(jsPsych,`<div font-size: larger; font-weight: bold; color: black;"> You need to respond faster!  </div>`,warning_duration)
            }
            if (data.rt < rtfastcut_duration & data.response!==null & (!is_debug)){
                warningfunc(jsPsych,`<div style= "text-align:center" ; font-size: larger; font-weight: bold; color: black; class="center-screen" ><br> <br> <br> <br> <br> Too fast!  </div>`,warning_duration)
            };

            // console.log(correctionmap);
            lastobj = correctionmap.get(data.id_picName);
            if (lastobj){

                if (!lastobj) console.log("Error!!",data.stimulusConditions)
                data.correct_appear1 = lastobj.correct_appear1;
                data.correct_appear2 = lastobj.correct_appear2;
            }

        }
        // post_trial_gap: posgap_duration
    };

var finaltest_feedbackss = {
    type: jsPsychHtmlKeyboardResponse,
    trial_duration: finalfeedback_duration,
    choices: "NO_KEYS",
    post_trial_gap: posgap_duration,
    stimulus: function(){
        
        // var last_trial = jsPsych.data.get().last(1).values()[0];
        // if (last_trial.correct) return picdir+"correct.jpg";
        // else return picdir+"Incorrect.jpg"
        return jsPsych.timelineVariable("id_picDir")
        
    },
    prompt: function(){
        

        var last_trial = jsPsych.data.get().last(1).values()[0];
        // console.log(last_trial);

        var lastresponse = last_trial.response;
        var last_trial_old = last_trial.is_old;
        
        // if (["F","f"].includes(lastresponse)) prompt_kj = `<strong>"F" for new</strong>&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;"J" for old`;
        // else prompt_kj = `"F" for new&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;<strong>"J" for old</strong>`
        prompt_kj = `"F" for new&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;"J" for old`
        
        // if (last_trial.correct) correcttext = `<p><strong>CORRECT! `;
        // else correcttext = `<p><strong> INCORRECT! `;
        correcttext = "<p><strong>"
        
        // acctrial = `<p>Your accumulated accuracy for this trial is: <strong><FONT color=#C41E3A>`.concat(
        //         Math.round(last_trial.accumulated_accuracy*10000)/100,"%</FONT></strong></p>")
        acctrial = `<p><FONT color="white">.</FONT></p>`
        
        // console.log(lastresponse,prompt_kj)
        if(last_trial_old){
            if (jsPsych.timelineVariable("anRepeatedItem")){
                if (jsPsych.timelineVariable("listNum_appear2_initial")===0) console.log("Error!!")
                return '<p color: black;background: white;>'.concat(prompt_kj,'</p>',correcttext,
                        "<strong>This item <FONT color=#C41E3A>had been studied or tested on list ",
                            jsPsych.timelineVariable("listNum_appear1_initial"),` and list ${jsPsych.timelineVariable("listNum_appear2_initial")}<FONT></strong>.</p>`); // the parameter value has to be returned from the function
            } else{
                return '<p color: black;background: white;>'.concat(prompt_kj,'</p>',correcttext,
                        "<strong>This item <FONT color=#C41E3A>had been studied or tested on list ",
                            jsPsych.timelineVariable("listNum_appear1_initial"),"<FONT></strong>.</p>"); // the parameter value has to be returned from the function
            }
        } else {
        return '<p color: black;background: white;>'.concat(prompt_kj,'</p>',correcttext,
                "This item <FONT color=#C41E3A>had never been seen previously.</FONT></strong></p>");// the parameter value has to be returned from the function
        }
        
        
    }
};

var finaltest_feedback = {
  type: jsPsychHtmlKeyboardResponse,
  trial_duration: finalfeedback_duration,
  choices: "NO_KEYS",
  post_trial_gap: posgap_duration,
  stimulus: function(){
    // The feedback stimulus is a dynamic parameter because we can't know in advance whether
    // the stimulus should be 'correct' or 'incorrect'.
    // Instead, this function will check the accuracy of the last response and use that information to set
    // the stimulus value on each trial.
    var last_trial = jsPsych.data.get().last(1).values()[0];

    if (last_trial.correct) correcttext = `<p><strong><FONT color=#C41E3A>CORRECT!</FONT></strong></p>`;
    else correcttext = `<p><strong><FONT color=#C41E3A> INCORRECT!</FONT>   </p></strong>`;
    // correcttext="";
    
    var last_trial_old = jsPsych.data.get().last(1).values()[0].is_old;
    if(last_trial_old){
    //   return correcttext.concat("<strong>This item <FONT color=#C41E3A>had been studied or tested on list ",jsPsych.timelineVariable("listNum_appear1_initial"),` and list ${jsPsych.timelineVariable("listNum_appear2_initial")}`,"<FONT></strong>.</p>"); // the parameter value has to be returned from the function
        return correcttext
    } else {
    //   return correcttext.concat("<strong><p>This item <FONT color=#C41E3A>had never been seen previously.</FONT></strong></p>");// the parameter value has to be returned from the function
        return correcttext
    }
  }
}

var final_instruction = {
    on_start: function(trial){
        window.onbeforeunload = null;
        nownow = jsPsych.data.get().select('recognition_correct');
        jsPsych.data.addProperties({
            all_accumulated_accuracy: average(nownow.values)
        });
    },
    type: jsPsychHtmlKeyboardResponse,
    stimulus: function(){
        nownow = average(jsPsych.data.get().select('recognition_correct').values);//Check this!!

        return "<p color:black>YOU FINISHED!<p><p color: black>Your overall accumulated accuracy is: <strong>".concat(
        Math.round(nownow*100)).concat(
            `%</strong><p> <p color:black>You will get a completion code if you hit 'enter'.<p>`)
    },
    // stimulus: `<p>You've finished the last task. Thanks for participating!</p>
        // <p><a href="https://app.prolific.co/submissions/complete?cc=C2P9U8QZ">Click here to return to Prolific and complete the study</a>.</p>`,
    choices: 'enter',//"will be waiting for enter regardless of debug"
    data:{
        task:"instruction"
        //check the following
        // tot_study_list_nf: tot_study_list_nf,
        // tot_foil_list_nf: tot_foil_list_nf,
        // tot_finalt_foil_list_nf: tot_finalt_foil_list_nf,
        // tot_digit_list_nf: tot_digit_list_nf,
        // tot_target_list_nf:tot_target_list_nf,
        // tot_nontarget_list_nf:tot_nontarget_list_nf,
        // tot_pretest_list_nf:tot_pretest_list_nf,
        // // finalt_forward_list_obj: finalt_forward_list_obj,
        // // finalt_backward_list_obj: finalt_backward_list_obj,
        // // finalt_random_list_obj: finalt_random_list_obj,
        // finalt_target_list_nf: finalt_target_list_nf,
        // finalt_nontarget_list_nf: finalt_nontarget_list_nf,
        // finalt_foil_list_nf: finalt_foil_list_nf
    },
    on_finish: function(data){
        jsPsych.data.get().localSave('csv', 'ekstra.csv');
        jsPsych.endExperiment();
                // jsPsych.endExperiment();
            }
        }
    // timeline.push(final_instruction)

var survey_HaveSeenImages = {
    type: jsPsychHtmlButtonResponse,
    stimulus:`<p>Have you seen any of the images used in this experiment before?</p>
    <p>These images may be part of a shared pool and could have been used in other studies. Please let us know if you believe you have participated in a different experiment where you saw a portion of overlaps of the exact same images.</p>
    <p>Your answer will not affect your approval rating or compensation.</p>`,
    choices: ['Yes', 'No'],
    on_finish: function (data) {
        // Store the participant's response
        var HaveSeenImages = data.response === 0 ? 'Yes' : 'No';
        jsPsych.data.addProperties({ HaveSeenImages: HaveSeenImages });
    },
    data:{task:"survey_HaveSeenImages"}
};

var survey_detailSeenImages ={

    timeline: [
        {
            type: jsPsychSurveyText,
            questions: [
                { prompt: `<p>If you have seen these images in a previous experiment, when did you participate in that study (approximately)?</p>
                <p>Also, based on your estimation, what proportion of the images in this experiment overlap with those you saw before?</p> `, name: 'detailSeenImages' }
            ],
            data:{task:"detailSeenImages"}
        }
    ],

    conditional_function: function(){
        // get the data from the previous trial,
        // and check which key was pressed
        var data = jsPsych.data.get().last(1).values()[0];
        console.log(data)
        return data.HaveSeenImages === 'Yes';
    }
};



var surveyend = {
    type: jsPsychSurveyText,
    questions: [
        { prompt: `<p>The experiment is currently in the pilot phase. Did you encounter any errors during the experiment?</p>
            <p>Were the instructions and feedback easy to understand?</p>
            <p>Did you have enough time to read the feedback after each trial?</p>
            <p>If you have any questions or feedback about the experiment, please type it below. Your feedback would be valuable to the experimenters. </p><p>If everything was clear, press 'Enter' to skip this section.</p>
            <p>You answer would not effect your approval rate or the compensation </p>`, 
            name: 'surveyend' }
    ],
    data:{task:"surveyatend"}
};
// timeline.push(surveyend)

function disableFullscreenListener() {
    handleFullscreenChange = false;
}

var exit_fullscreen = {
    on_start:function(){
        disableFullscreenListener();
    },
    type: jsPsychFullscreen,
    fullscreen_mode: false,
    delay_after: 0
}

//********************************************************************************************************
//                   Initial expeirments
//********************************************************************************************************
//
// .
//.
// 
//
//********************************************************************************************************
let all_lists_initial_inUse = [];

ndebugtemplistnum = n_lists_singular//2; //n_lists_singular

for (let ilist=0; ilist < ndebugtemplistnum; ilist++){
    all_lists_initial_inUse.push({
        studies: study_lists_arrArrObj_inUse[ilist],
        tests: test_lists_arrArrObj_inUse[ilist],
        digits: digit_list_arrArrObj_inUse[ilist]
    })
}

// console.log()
console.log("all_lists_initial_inUse",all_lists_initial_inUse)


const initialTest_timeline = all_lists_initial_inUse.map(function(list,list_ind){
        return {
            timeline: [
                {
                    timeline: list_ind === 0 ? [prompt_instructions_practice] : list_ind===1 ? [instructions_test] : [prompt_instructions_between]
                },
                {
                    timeline: [fixation]
                },
                {//The following are comparable to push the 'final' stuff into the timeline variable; as if creating a new timeline varible element
                    timeline: [v_initialstudy_trial],
                    timeline_variables: list.studies
                },
                {
                    timeline: [prompt_digits]
                },
                {
                    timeline: [fixation]
                },
                {
                    timeline: [v_digitpresent],
                    timeline_variables: list.digits
                },
                {
                    timeline: [answer_digit_looptrial],
                    timeline_variables: [digit_totCorrect_sum_arrObj_inUse[list_ind]]
                },                    
                {
                    timeline: [prompt_countingfeedback]
                },
                {
                    timeline: [prompt_test_initial]
                },                    
                {
                    timeline: [fixation]
                },                    
                {
                    timeline: [v_initialTest_trial],
                    timeline_variables: list.tests
                }
            ]
        };
});


let all_lists_final_inUse = [];
const f_test_promp_arrObj = range(0,n_lists_singular).map(i=>[{
    f_listnum: i,
    condi
}]);

console.log("Current jsPsych version: " + jsPsych.version());
for (let ilistf=0; ilistf < ndebugtemplistnum; ilistf++){
    all_lists_final_inUse.push({
        f_tests: finalTest_lists_arrArrObj_inUse[ilistf],
        f_test_prompi: f_test_promp_arrObj[ilistf]
    })
};

console.log(f_test_promp_arrObj)


const finalTest_timeline = all_lists_final_inUse.map(function(list,list_ind){
        return {
            timeline: [
                {
                    timeline: [prompt_f_list],
                    conditional_function: function(){
                        if (condi === "r") return false
                    }, //Check here! uncomment this later
                    timeline_variables: list.f_test_prompi
                },
                {
                    // timeline: [v_finaltest, finaltest_feedback],
                    timeline: [v_finaltest],
                    timeline_variables: list.f_tests
                }
            ],
            
        };
});

// timeline.push(surveyend,survey_HaveSeenImages,survey_detailSeenImages)//check this he

timeline.push(preloass)


if (is_inst_fullscreen) {
    timeline.push(enterid);
    timeline.push(browser_check);
    timeline.push(instructions);
    timeline.push(enter_fullscreen);
}

timeline.push(initialTest_timeline);

timeline.push(instructions_finaltest);
timeline.push(finalTest_timeline);
timeline.push(surveyend,survey_HaveSeenImages,survey_detailSeenImages)//check this here
timeline.push(exit_fullscreen,final_instruction);

// timeline.push(fixation);
jsPsych.run(timeline.flat());


}