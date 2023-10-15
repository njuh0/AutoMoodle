function convertToPlainText(element) {
    var children = element.childNodes;
    var text = "";
    for (var i = 0; i < children.length; ++i) {
        var child = children[i];
        if (child.nodeType == 3) {
            text += child.textContent;
        } else if (child.nodeType == 1 && (child.tagName == "SCRIPT" || child.tagName == "P")) {
            text += child.innerHTML;
        }
    }
    text = text.replace(/^[A-Za-z]\.\s*/, "");
    return text;
}

function parseMultichoiceDiv(div) {
    var answerChoiceDivs = div.getElementsByClassName("answer")[0].childNodes;
    var answerChoices = [];

    var question = div.getElementsByClassName("qtext")[0].innerHTML;
    // question = convertToPlainText(question);

    for (var i = 0; i < answerChoiceDivs.length; ++i) {
        var answerChoiceDiv = answerChoiceDivs[i];
        // console.log('answerChoiceDiv', answerChoiceDiv);

        if (answerChoiceDiv.tagName != "DIV" || !answerChoiceDiv.className.startsWith("r")) {
            continue;
        }
        var inputs = answerChoiceDiv.getElementsByTagName("input");
        var input;
        for (var x = 0; x < inputs.length; ++x) {
            if (inputs[x].type != "hidden") {
                input = inputs[x];
                break;
            }
        }
        var label = answerChoiceDiv.getElementsByClassName("ml-1")[0];
        // var label = answerChoiceDiv.getElementsByTagName("label")[0];
        var checked = input.checked;
        // var text = convertToPlainText(label);
        var text = label.innerHTML

        answerChoices.push({
            "checked": checked,
            "text": text
        });
    }
    // console.log('answerChoices', answerChoices);

    return {
        "type": "multichoice",
        "answers": answerChoices,
        "question": question
    };
}

function parseShortAnswerDiv(div) {
    var answerDiv = div.getElementsByClassName("answer")[0];
    var input = answerDiv.getElementsByTagName("input")[0];
    var value = input.value;
    console.log('value', value);

    var question = div.getElementsByClassName("qtext")[0].innerHTML;
    // question = convertToPlainText(question);

    
    
    return {
        "type": "shortanswer",
        "value": value,
        "question": question
    };
}

function parseMultianswerDiv(div) {
    var content = div.getElementsByClassName("content")[0];
    var pRaw = content.getElementsByTagName("p");
    textAnswers = [];
    var question = content.getElementsByTagName("p")[0].textContent;
    pRaw.forEach(element => {
        
        var p = element.childNodes;
        
        // var answerDiv = div.getElementsByClassName("answer")[0];
        // var input = answerDiv.getElementsByTagName("input")[0];
        // var value = input.value;
        // console.log('value', value);

        // console.log('p', p)
        for (var i = 0; i < p.length; i++) {
            if (p[i].tagName == 'SPAN') {
                var spanElement = p[i];
                var correctIcon = spanElement.querySelectorAll('[title="Correct"]');
                // console.log('correctIcon', correctIcon);
                // coppy only correct answers
                var inputs = spanElement.getElementsByTagName("input");
                if (correctIcon.length > 0) {
                    // if (inputs.length == 0 || inputs[0].type == "hidden") {
                    //     continue;
                    // }
                    console.log('inputs', inputs)
                    textAnswers.push(inputs[0].value);
                    // console.log('input', inputs[0].value)
                } else {
                    if (inputs.length == 0 || inputs[0].type == "hidden") {
                        continue;
                    }
                    textAnswers.push('');
                    
                }
                // console.log('correctIcon', correctIcon);
            }
        }
    });
    // console.log('p childNodes', p[0])

    // var spanElement = p.querySelector('span');
    // console.log('spanElement', spanElement)

    // var spanText = spanElement.textContent;
    // // Remove the text of the <span> element from the <p> element
    // var newText = p.textContent.replace(spanText, '[]');
    // console.log('newText', newText)

    // var question = p.textContent;
    // console.log('textAnswers', textAnswers)

    
    return {
        "type": "multianswer",
        "value": textAnswers,
        "question": question
    };
}

// function parseTrueFalseDiv(div) {
//     var obj = parseMultichoiceDiv(div);
//     obj.type = "truefalse";
//     return obj;
// }



// function parseMatchDiv(div) {
//     var questionTable = div.getElementsByClassName("answer")[0];
//     var rows = questionTable.getElementsByTagName("tr");
//     var answerChoices = [];
//     for (var i = 0; i < rows.length; ++i) {
//         var questionCell = rows[i].getElementsByClassName("text")[0];
//         var questionText = convertToPlainText(questionCell);
//         var answerCell = rows[i].getElementsByClassName("control")[0];
//         var answerBox = answerCell.getElementsByTagName("select")[0];
//         var answerText = answerBox.options[answerBox.selectedIndex].text;
//         answerChoices.push({
//             "question": questionText,
//             "answer": answerText
//         });
//     }
//     return {
//         "type": "match",
//         "answers": answerChoices
//     };
// }

// function parseNumericalDiv(div) {
//     var answerDiv = div.getElementsByClassName("answer")[0];
//     var input = answerDiv.getElementsByTagName("input")[0];
//     var value = input.value;
//     return {
//         "type": "numerical",
//         "value": value
//     };
// }

function parseAttemptHtml(html) {
    var container = document.createElement("div");
    container.innerHTML = html;
    var form = container.getElementsByTagName("form")[0];
    var allDivs = form.childNodes[0].childNodes;
    var questions = {};
    for (var i = 0; i < allDivs.length; ++i) {
        var questionDiv = allDivs[i];
        if (questionDiv.tagName != "DIV" || questionDiv.className.indexOf("que") < 0) {
            continue;
        }
        var questionId = questionDiv.id;
        if (questionDiv.className.indexOf("multichoice") >= 0) {
            console.log('multichoice');
            questions[questionId] = parseMultichoiceDiv(questionDiv);
        } else if (questionDiv.className.indexOf("shortanswer") >= 0) {
            console.log('shortanswer');
            questions[questionId] = parseShortAnswerDiv(questionDiv);
        }  else if (questionDiv.className.indexOf("multianswer") >= 0) {
            console.log('multianswer');
            questions[questionId] = parseMultianswerDiv(questionDiv);
        } 

        // else if (questionDiv.className.indexOf("truefalse") >= 0) {
        //     console.log('truefalse');
        //     questions[questionId] = parseTrueFalseDiv(questionDiv);
        // } else if (questionDiv.className.indexOf("match") >= 0) {
        //     console.log('match');
        //     questions[questionId] = parseMatchDiv(questionDiv);
        // } else if (questionDiv.className.indexOf("numerical") >= 0) {
        //     console.log('numerical');
        //     questions[questionId] = parseNumericalDiv(questionDiv);
        // }

    }
    return questions;
}

function writeMultichoiceResponse(questionDiv, previousQuestionInfo) {
    // given specific questionDiv, 
    // console.log('previous answers', previousQuestionInfo);
    var newAnswerDivs = questionDiv.getElementsByClassName("answer")[0].childNodes; // get only answer divs (new)
    // console.log('answerDivs', newAnswerDivs);
    var previousAnswers = previousQuestionInfo.answers;
    // console.log('previousAnswers', previousAnswers);
    var a = [];
    for (var i = 0; i < newAnswerDivs.length; ++i) {
        var answerDiv = newAnswerDivs[i];
        if (answerDiv.tagName != "DIV") {
            continue;
        }
        var inputs = answerDiv.getElementsByTagName("input");
        var input;
        for (var x = 0; x < inputs.length; ++x) {
            if (inputs[x].type != "hidden") {
                input = inputs[x];
                break;
            }   
        }
        var label = answerDiv.getElementsByClassName("ml-1")[0];
        // var label = answerDiv.getElementsByTagName("label")[0];
        // var answerText = convertToPlainText(label)
        var answerText = label.innerHTML
        for (var j = 0; j < previousAnswers.length; ++j) {
            var previousAnswer = previousAnswers[j];
            // console.log(previousAnswer.text, answerText, previousAnswer.text == answerText)
            if (previousAnswer.text == answerText) {
                input.checked = previousAnswer.checked;
                break;
            }
        }
    }
}

function writeShortAnswerResponse(questionDiv, questionInfo) {
    var answerDiv = questionDiv.getElementsByClassName("answer")[0];
    answerDiv = answerDiv.getElementsByTagName("input");

    var previousAnswer = questionInfo.value;
    for (var i = 0; i < answerDiv.length; i++) {
        if (answerDiv[i].type != "hidden") {
            answerDiv[i].value = previousAnswer;
            console.log(answerDiv[i], previousAnswer);
            break;
        }
    }
}

function writeMultianswerResponse(questionDiv, questionInfo) {
    // console.log('questionInfo', questionInfo);

    var content = questionDiv.getElementsByClassName("content")[0];
    var pRaw = content.getElementsByTagName("p");
    iForQuestionInfo = 0; // when multiple <p> in question, variable is needed to save where the responses stopped applying
    pRaw.forEach(element => {
        
        var p = element.childNodes;
        
        
        // var answerDiv = div.getElementsByClassName("answer")[0];
        // var input = answerDiv.getElementsByTagName("input")[0];
        // var value = input.value;
        console.log('element', element);
    
        var inputs = element.getElementsByTagName("input");
        if (inputs.length != 0) {
            
            // console.log('inputs', inputs);
            
            for(var i = 0; i < inputs.length; i++) {
                // console.log('questionInfo', questionInfo.value[iForQuestionInfo]);
                inputs[i].value = questionInfo.value[iForQuestionInfo];
                iForQuestionInfo++;
            }
        }
    });
}

// function writeTrueFalseResponse(questionDiv, questionInfo) {
//     writeMultichoiceResponse(questionDiv, questionInfo);
// }

// function writeMatchResponse(questionDiv, questionInfo) {
//     var questionTable = questionDiv.getElementsByClassName("answer")[0];
//     var rows = questionTable.getElementsByTagName("tr");
//     var previousAnswers = questionInfo.answers;
//     for (var i = 0; i < rows.length; ++i) {
//         var questionCell = rows[i].getElementsByClassName("text")[0];
//         var questionText = convertToPlainText(questionCell);
//         var answerCell = rows[i].getElementsByClassName("control")[0];
//         var answerBox = answerCell.getElementsByTagName("select")[0];
//         var answerOptions = answerBox.options;
//         for (var j = 0; j < previousAnswers.length; ++j) {
//             var previousAnswer = previousAnswers[j];
//             if (previousAnswer.question == questionText) {
//                 for (var k = 0; k < answerOptions.length; ++k) {
//                     if (previousAnswer.answer == answerOptions[k].text) {
//                         answerBox.selectedIndex = k;
//                         break;
//                     }
//                 }
//                 break;
//             }
//         }
//     }
// }

// function writeNumericalResponse(questionDiv, questionInfo) {
//     var answerDiv = questionDiv.getElementsByClassName("answer")[0];
//     var input = answerDiv.getElementsByTagName("input")[0];
//     input.value = questionInfo.value;
// }



function writeResponses(iframe, attemptChoices) {
    var iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
    // console.log('attemptChoices', attemptChoices); // all previous questions

    for (var key in attemptChoices) {
        if (!attemptChoices.hasOwnProperty(key)) {
            continue;
        }
        // console.log("key",key);
        // console.log(iframeDoc);

        // new
        var keyParts = key.split('-');
        // console.log("keyParts",keyParts);

        
        var questionInfo = attemptChoices[key]; // get previous question by key
        var questionType = questionInfo.type;

        // console.log('questionInfo', questionInfo); // previous question
        // // var questionDiv = iframeDoc.getElementById(key);
        // var selector = '[id^="' + keyParts[0] + '-"][id$="-' + keyParts[keyParts.length - 1] + '"]';
        // console.log("selector", selector);
        // var questionDiv = iframeDoc.querySelector(selector);
        // console.log("questionDiv", questionDiv);

        // for every question and check if contains     var question = div.getElementsByClassName("qtext")[0]; question = convertToPlainText(question);
        var selector = '[id^="question-"]';
        var newQuestionDivs = iframeDoc.querySelectorAll(selector);
        // console.log("newQuestionDivs", newQuestionDivs);
        for (var i = 0; i < newQuestionDivs.length; ++i) {

            var questionDiv = newQuestionDivs[i];
            var question;

            if (questionInfo.type == "multianswer") {
                var content = questionDiv.getElementsByClassName("content")[0];
                question = content.getElementsByTagName("p")[0].textContent;
                // console.log("question", question);
            } else {
                question = questionDiv.getElementsByClassName("qtext")[0].innerHTML;
                // console.log("question", question);
                // question = convertToPlainText(question);
                // console.log("questionPlainText", question);
            }

            if (question == questionInfo.question) {
                // console.log(questionInfo.type);
                break;
            }
        }

        // console.log("questionDiv", questionDiv);
        // console.log("questionInfo", questionInfo);

        if (questionType == "multichoice") {
            writeMultichoiceResponse(questionDiv, questionInfo);
        } else if (questionType == "shortanswer") {
            writeShortAnswerResponse(questionDiv, questionInfo);
        } else if (questionType == "multianswer") {
            writeMultianswerResponse(questionDiv, questionInfo);
        }
        // } else if (questionType == "truefalse") {
        //     writeTrueFalseResponse(questionDiv, questionInfo);
        // } else if (questionType == "match") {
        //     writeMatchResponse(questionDiv, questionInfo);
        // } else if (questionType == "numerical") {
        //     writeNumericalResponse(questionDiv, questionInfo);
        // }
    }
    iframe.onload = function() {
        document.location.reload();
    };
    iframeDoc.getElementById("responseform").submit();
}

function startAttempt(attemptChoices) {
    var iframe = document.createElement("iframe");
    // iframe.style = "display:none";
    iframe.width = "1000";
    iframe.height = "1000";

    iframe.name = "attemptframe";
    iframe.onload = function() {
        startAttemptForm.removeAttribute("target");
        writeResponses(iframe, attemptChoices);
    };
    document.body.appendChild(iframe);
    var startAttemptDiv = document.getElementsByClassName("quizstartbuttondiv")[0];
    var startAttemptForm = startAttemptDiv.getElementsByTagName("form")[0];
    startAttemptForm.target = "attemptframe";
    startAttemptForm.submit();
}

function copyAttempt(attemptUrl) {
    GM_xmlhttpRequest({
        method: "GET",
        url: attemptUrl,
        onload: function(response) {
            var attemptChoices = parseAttemptHtml(response.responseText);
            
            startAttempt(attemptChoices);
        }
    });
}

function insertCopyAttemptButtons() {
    var table = document.getElementsByClassName("quizattemptsummary")[0];
    var tbody = table.getElementsByTagName("tbody")[0];
    let tableRows = document.querySelectorAll('tr');

    tableRows.forEach((row) => {
        let tableData = row.querySelectorAll('td');
        tableData.forEach((data) => {
            if(data.querySelector('a')) {
                var reviewLinkElements = data.getElementsByTagName("a");
                var reviewLinkUrl = reviewLinkElements[0].href;
                var link = document.createElement("a");
                link.innerHTML = "Copy attempt";
                link.href = "#";
                link.addEventListener("click", function() {
                    copyAttempt(reviewLinkUrl);
                });
                data.appendChild(document.createElement("br"));
                data.appendChild(link);
            }
        });
    });
    // var rows = tbody.getElementsByTagName("tr");
    // for (var i = 0; i < rows.length; ++i) {
    //     var reviewCol = rows[i].getElementsByClassName("lastcol")[0];
    //     console.log(rows);
    //     var reviewLinkElements = reviewCol.getElementsByTagName("a");
    //     if (reviewLinkElements.length == 0) {
    //         continue;
    //     }
    //     var reviewLinkUrl = reviewLinkElements[0].href;
    //     var link = document.createElement("a");
    //     link.innerHTML = "Copy attempt";
    //     link.href = "#";
    //     link.addEventListener("click", function() {
    //         copyAttempt(reviewLinkUrl);
    //     });
    //     reviewCol.appendChild(document.createElement("br"));
    //     reviewCol.appendChild(link);
    // }
}
if (document.getElementsByClassName("quizstartbuttondiv").length > 0) {
    insertCopyAttemptButtons();
}
