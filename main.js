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

    var question = div.getElementsByClassName("qtext")[0];
    question = convertToPlainText(question);

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

function parseTrueFalseDiv(div) {
    var obj = parseMultichoiceDiv(div);
    obj.type = "truefalse";
    return obj;
}

function parseMatchDiv(div) {
    var questionTable = div.getElementsByClassName("answer")[0];
    var rows = questionTable.getElementsByTagName("tr");
    var answerChoices = [];
    for (var i = 0; i < rows.length; ++i) {
        var questionCell = rows[i].getElementsByClassName("text")[0];
        var questionText = convertToPlainText(questionCell);
        var answerCell = rows[i].getElementsByClassName("control")[0];
        var answerBox = answerCell.getElementsByTagName("select")[0];
        var answerText = answerBox.options[answerBox.selectedIndex].text;
        answerChoices.push({
            "question": questionText,
            "answer": answerText
        });
    }
    return {
        "type": "match",
        "answers": answerChoices
    };
}

function parseNumericalDiv(div) {
    var answerDiv = div.getElementsByClassName("answer")[0];
    var input = answerDiv.getElementsByTagName("input")[0];
    var value = input.value;
    return {
        "type": "numerical",
        "value": value
    };
}

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
        } else if (questionDiv.className.indexOf("truefalse") >= 0) {
            console.log('truefalse');
            questions[questionId] = parseTrueFalseDiv(questionDiv);
        } else if (questionDiv.className.indexOf("match") >= 0) {
            console.log('match');
            questions[questionId] = parseMatchDiv(questionDiv);
        } else if (questionDiv.className.indexOf("numerical") >= 0) {
            console.log('numerical');
            questions[questionId] = parseNumericalDiv(questionDiv);
        }
        // if (questionDiv.className.indexOf("multichoice") >= 0) {
        //     var p = parseMultichoiceDiv(questionDiv)
        //     questions[p.answers['question']] = p;
        // } else if (questionDiv.className.indexOf("truefalse") >= 0) {
        //     var p = parseMultichoiceDiv(questionDiv)
        //     questions[p.answers['question']] = p;
        // } else if (questionDiv.className.indexOf("match") >= 0) {
        //     var p = parseMultichoiceDiv(questionDiv)
        //     questions[p.answers['question']] = p;
        // } else if (questionDiv.className.indexOf("numerical") >= 0) {
        //     var p = parseMultichoiceDiv(questionDiv)
        //     questions[p.answers['question']] = p;
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

function writeTrueFalseResponse(questionDiv, questionInfo) {
    writeMultichoiceResponse(questionDiv, questionInfo);
}

function writeMatchResponse(questionDiv, questionInfo) {
    var questionTable = questionDiv.getElementsByClassName("answer")[0];
    var rows = questionTable.getElementsByTagName("tr");
    var previousAnswers = questionInfo.answers;
    for (var i = 0; i < rows.length; ++i) {
        var questionCell = rows[i].getElementsByClassName("text")[0];
        var questionText = convertToPlainText(questionCell);
        var answerCell = rows[i].getElementsByClassName("control")[0];
        var answerBox = answerCell.getElementsByTagName("select")[0];
        var answerOptions = answerBox.options;
        for (var j = 0; j < previousAnswers.length; ++j) {
            var previousAnswer = previousAnswers[j];
            if (previousAnswer.question == questionText) {
                for (var k = 0; k < answerOptions.length; ++k) {
                    if (previousAnswer.answer == answerOptions[k].text) {
                        answerBox.selectedIndex = k;
                        break;
                    }
                }
                break;
            }
        }
    }
}

function writeNumericalResponse(questionDiv, questionInfo) {
    var answerDiv = questionDiv.getElementsByClassName("answer")[0];
    var input = answerDiv.getElementsByTagName("input")[0];
    input.value = questionInfo.value;
}

function writeResponses(iframe, attemptChoices) {
    var iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
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
        // console.log('attemptChoices', attemptChoices); // all previous questions
        // console.log('questionInfo', questionInfo); // previous question
        // // var questionDiv = iframeDoc.getElementById(key);
        // var selector = '[id^="' + keyParts[0] + '-"][id$="-' + keyParts[keyParts.length - 1] + '"]';
        // console.log("selector", selector);
        // var questionDiv = iframeDoc.querySelector(selector);
        // console.log("questionDiv", questionDiv);

        // for every question and check if contains     var question = div.getElementsByClassName("qtext")[0]; question = convertToPlainText(question);
        var selector = '[id^="question-"]';
        var newQuestionDivs = iframeDoc.querySelectorAll(selector);
        for (var i = 0; i < newQuestionDivs.length; ++i) {
            var questionDiv = newQuestionDivs[i];
            var question = questionDiv.getElementsByClassName("qtext")[0];
            question = convertToPlainText(question);
            if (question == questionInfo.question) {
                break;
            }
        }

        // console.log("questionDiv", questionDiv);
        // console.log("questionInfo", questionInfo);

        var questionType = questionInfo.type;
        if (questionType == "multichoice") {
            writeMultichoiceResponse(questionDiv, questionInfo);
        } else if (questionType == "truefalse") {
            writeTrueFalseResponse(questionDiv, questionInfo);
        } else if (questionType == "match") {
            writeMatchResponse(questionDiv, questionInfo);
        } else if (questionType == "numerical") {
            writeNumericalResponse(questionDiv, questionInfo);
        }
    }
    iframe.onload = function() {
        document.location.reload();
    };
    iframeDoc.getElementById("responseform").submit();
}

function startAttempt(attemptChoices) {
    var iframe = document.createElement("iframe");
    // iframe.style = "display:none";
    // iframe width and height must be set 400
    iframe.width = "600";
    iframe.height = "600";

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
