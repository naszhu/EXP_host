

//********************************************************************************************************
//                    Functions
//********************************************************************************************************
//
// Brief description of this section and its purpose.
// Additional details or important information.
// List of key tasks or functions performed here.
//
//********************************************************************************************************
// JT = x=>jsPsych.timelineVariable(x);
// JRR = (x,y)=>jsPsych.randomization.repeat(x,y);
function replaceUndefinedWithNull(obj) {
    if (obj === undefined) {
      return null; // Base case: if the object itself is undefined
    }
    if (obj === null || typeof obj !== 'object') {
      return obj; // Return primitives, null, or non-objects as is
    }
  
    // Handle arrays
    if (Array.isArray(obj)) {
      return obj.map(item => replaceUndefinedWithNull(item));
    }
  
    // Handle objects (maps)
    const newObj = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        newObj[key] = replaceUndefinedWithNull(obj[key]);
      }
    }
    return newObj;
  }
  
function endTrialAfterDuration() {
    jsPsych.finishTrial(); //Check this in v8
}

function JRR(jsPsych, x, y) {
    return jsPsych.randomization.repeat(x, y);
  }

function JT(jsPsych, x) {
    return jsPsych.timelineVariable(x);
  }

  function cleanData(data) {
    return JSON.parse(
      JSON.stringify(data, (key, value) => (value === undefined ? null : value))
    );
  }



// function getListForPosition(testPosition, listSizes) {
//     let ranges = [];
//     let start = 1;  // Start position for the first list

//     // Calculate cumulative ranges based on list sizes
//     listSizes.forEach(size => {
    //         let end = start + size - 1;  // End position for the current list
//         ranges.push({ start, end });
//         start = end + 1;  // The start of the next list
//     });

//     // Check which range the testPosition falls into
//     for (let i = 0; i < ranges.length; i++) {
//         if (testPosition >= ranges[i].start && testPosition <= ranges[i].end) {
//         return i + 1;  // Return the list number (1-based)
//         }
//     }
//     return null;  // If the position doesn't match any list (shouldn't happen if valid)
// }
function getListForPosition(testPosition, listSizes) {
    let ranges = [];
    let start = 1;  // Start position for the first list
    
    // Calculate cumulative ranges based on list sizes
    listSizes.forEach(size => {
        let end = start + size - 1;  // End position for the current list
        ranges.push({ start, end });
        start = end + 1;  // The start of the next list
    });
    
    // Check which range the testPosition falls into and calculate position in the list
    for (let i = 0; i < ranges.length; i++) {
        if (testPosition >= ranges[i].start && testPosition <= ranges[i].end) {
            let positionInList = testPosition - ranges[i].start + 1; // Position within the current list
            return { listNumber: i + 1, positionInList };  // Return list number and position within the list
        }
    }
    
    return null;  // If the position doesn't match any list (shouldn't happen if valid)
}

//the following shuffles array while changes it's original copy
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));  // pick a random index <= i
        [array[i], array[j]] = [array[j], array[i]];    // swap
    }
    return array;
};

function shuffledRange(n) {
    const arr = Array.from({ length: n }, (_, i) => i);
    for (let i = n - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
};


function repeatedArray(x,a) {return Array.from({ length: a }, () => x)};

function generateTestPositions(lengths) {//input an array with lengthens of each subarray
    let currentPos = 0;
    let result = [];
    
    // Loop through the lengths array
    for (let i = 0; i < lengths.length; i++) {
        const subArrayLength = lengths[i];
        
        // Generate continuous range for the current subarray
        let range = [];
        for (let j = currentPos; j < currentPos + subArrayLength; j++) {
            range.push(j);
        }
        
        // Shuffle the positions inside the subarray
        range = shuffleArray(range);
        
        // Add the shuffled positions to the result array
        result.push(range);
        
        // Update the current position for the next subarray
        currentPos += subArrayLength;
    }
    
    return result;
}

function average(arr) {
    const sum = arr.reduce((acc, value) => {
        // Convert boolean to 0 or 1 for calculation
        const numericValue = typeof value === 'boolean' ? (value ? 1 : 0) : value;
        return acc + numericValue;
    }, 0);
    
    return sum / arr.length;
}

function sum(arr) {
    return arr.reduce((acc, num) => acc + num, 0);
}


function range(start, end)
{
    var array = new Array();
    for(var i = start; i < end; i++)
        {
        array.push(i);
    }
    return array;
}

function deepcopyobj(obj_f){
    return (Object.assign({},obj_f))//this could've been done better with spread operator ...
}

function deepcopyarobj(arobj_f){
    return(range(0,arobj_f.length).map(i=>deepcopyobj(arobj_f[i])))
}
function randomize_ar_inside_nfar(nfar){//randomize 1*1 nonflat ar
    return range(0,nfar.length).map(i=>jsPsych.randomization.sampleWithoutReplacement(nfar[i],nfar[i].length));
}   

function chunkToObject(arr, sizes, names) {
    if (sizes.length !== names.length) {
        throw new Error("Mismatch between number of sizes and names");
    }
    
    const result = {};
    let index = 0;
    
    for (let i = 0; i < sizes.length; i++) {
        result[names[i]] = arr.slice(index, index + sizes[i]);
        // result[names[i]] = 'sss';
        index += sizes[i];
    }
    
    return result;
}


function readTextFileHTTP(file) {
    
    const rawFile = new XMLHttpRequest();
    let content = null;
    rawFile.open("GET", file, false);
    rawFile.onreadystatechange = function () {
        if (rawFile.readyState === 4) {
            if (rawFile.status === 200 || rawFile.status === 0) {
                content = rawFile.responseText;
            }
        }
    };
    rawFile.send(null);
    return content;
};

function warningfunc(jsPsych, message,timedur){
    
    var messageDiv = document.createElement("div");
    messageDiv.innerHTML = message;
    // messageDiv.className="jspsych-content-wrapper"
    messageDiv.style.padding = `350px 0`;
    messageDiv.style.textAlign = "center";
    messageDiv.style.margin = "0px"
    // messageDiv.style.height = "100vh";
    messageDiv.style.display = "flex";
    messageDiv.style.justifyContent = "center";
    var exp = document.getElementsByClassName("jspsych-content-wrapper")[0]
    exp.style.visibility = "hidden";
    jsPsych.pauseExperiment() 
    document.body.prepend(messageDiv);
    setTimeout(function() {
        document.body.removeChild(messageDiv); // Remove the div
        exp.style.visibility = "visible";
        jsPsych.resumeExperiment();
    }, timedur);//remove after 1.5s
}

function arrsum(ar){return(ar.reduce((a,b)=>a+b,0))};

function combinedReorderArray(reorder) {
    // let reverseReorder = reorder;
    let original = new Array(reorder.length);
    let original2 = new Array(reorder.length);
    let left = 0;
    let right = reorder.length - 1;
    
    for (let i = 0; i < reorder.length; i += 2) {
        if (left == right) {
            original[left] = original2[left] = reorder[i];
        } else {
            original[left] = original2[right] = reorder[i];
            // Ensure we don't go out of bounds when the original array has an odd length
            if (i + 1 < reorder.length) {
                original[right] = original2[left] = reorder[i + 1];
            }
        }
        left++;
        right--;
    }
    
    return [original,original2];
}



function startExperimentTimer() {
    
    const experimentTimerInterval = window.setInterval(function() {
        
        const currentTime = Date.now();
        if (currentTime - lastActivityTime > timeout) {
            alert(`
            Dear participant,
                
            We regret to inform you that the experiment has been terminated automatically due to exceeding the allowed time. Please close the page to finalize the results. And we kindly request you not to attempt this experiment again.
                
            We would like to thank you for your participation. Although you were unable to complete this particular experiment, we hope that you will consider joining us for future experiments. Thank you again for your time and effort; you may close the page now.
        `);
                clearInterval(experimentTimerInterval);
                console.log(currentTime - lastActivityTime);
                window.onbeforeunload = null;
                window.location = "https://www.google.com";
                window.close = true;
                jsPsych.endExperiment();
            }
        }, 1000);
    }
    