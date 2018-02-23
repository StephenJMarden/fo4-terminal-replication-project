const LINE_NUMBER = 32;
const LINE_LENGTH = 12;
const NUM_TRIES = 4;
const MAX_LENGTH = 8;
/*global $*/

var difficulty = "novice";
var version = randomizeVersion();
var wordLength = getWordLength(difficulty, version);
var wordList = getWords(difficulty);
var unalteredWordList = wordList.slice(0);
var password = getPassword(wordList);
var lines = constructLines(difficulty, wordList);
var tries = NUM_TRIES;
var hints = getHintCount(difficulty);

onInit();
eventHandlers();

function getWords(difficulty) {
    var selectedWords = [];
    var numWords;
    
    switch (difficulty) {
        case "novice":
            numWords = 16;
            break;
        case "advanced":
            numWords = 14;
            break;
        case "expert":
            numWords = 12;
            break;
        case "master":
            numWords = 10;
            break;
        default:
            console.log("Error: Difficulty not found");
    }
    
    var positions = [];
    var length = window.words[difficulty][version].length;
    var initialNumber = Math.floor(Math.random() * length);
    positions.push(initialNumber);
    selectedWords.push(window.words[difficulty][version][initialNumber]);
    for(var i = 1; i < numWords; i++) {
        var number = Math.floor(Math.random() * length);
        while(arrayContains(positions, number)) {           //if the random number is already in the list, generate a new number
            number = Math.floor(Math.random() * length);
        }
        positions.push(number);
        selectedWords.push(window.words[difficulty][version][number]);
    }
    
    return selectedWords;
}

function getHintCount(difficulty) {
    switch(difficulty) {
        case "novice":
            return 6;
        case "advanced":
            return 5;
        case "expert", "master":
            return 4;
    }
}

function arrayContains(array, searchTerm) {
    for(var i = 0; i < array.length; i++) {
        if(array[i] === searchTerm) {
            return true;
        }
    }
    return false;
}

function randomizeVersion() {
    var random = Math.floor(Math.random() * 2);
    if(random === 0){
        return "a";
    }else if(random === 1) {
        return "b";
    }
}

function getWordLength(difficulty, version) {
    var length;
    switch(difficulty) {
        case "novice":
            if(version === 'a') {
                length = 4;
            } else {
                length = 5;
            }
            break;
        case "advanced":
            length = 6;
            break;
        case "expert":
            length = 7;
            break;
        case "master":
            length = 8;
    }
    return length;
}

function getPassword(wordList) {
    var random = Math.floor(Math.random() * wordList.length);
    return wordList[random];
}

function constructLines(difficulty, wordList) {
    var lines = [];
    for(var i = 0; i < LINE_NUMBER; i++) {
        var hasWord = false;
        
        if(wordList.length > 0) {
            if(wordList.length < (LINE_NUMBER - i)) {            //if there are less words than lines remaining to fill, randomly choose if it should fill the line with a word
                var random = Math.floor(Math.random() * 2);
                if(random === 0) { hasWord = true; }
            } else if(wordList.length === (LINE_NUMBER - i)) {   //if there are equal lines and words, the line must have a word
                hasWord = true;
            } else if(wordList.length > (LINE_NUMBER - i)) {
                console.log("Error: Ran out of lines, something went wrong . . .");
            }    
        }
        
        var curLine;
        if(hasWord) {
            curLine = wordList.pop();
        } else {
            curLine = getRandomJunkData(null, null);
        }
        
        while(curLine.length < LINE_LENGTH) {
            var random = Math.floor(Math.random() * 2);
            if(random === 0) {
                curLine = getRandomJunkData(null, curLine[0]) + curLine;
            } else {
                curLine = curLine + getRandomJunkData(curLine[curLine.length], null);
            }
        }
        curLine = tagReplacer(curLine);
        lines.push(curLine);
    }
    return lines;
}

//Returns a random piece of junk data
function getRandomJunkData(previousCharacter, nextCharacter) {
    var junkData = ["{", "}", "[", "]", "*", "<", ">", "?", ".", ",", "!", "@", "#", "$", "%", "^", "&", "*", "(", ")", "-", "+", "_"];
    function getJunkData() {
        return junkData[Math.floor(Math.random() * junkData.length)];
    }
    var selection = getJunkData();
    
    if(previousCharacter === "<") {
        while(selection === "?" || selection === "/") {
            selection = getJunkData();
        }
    }
    
    if(nextCharacter === "?" || nextCharacter === "/") {
        while(selection === "<") {
            selection = getJunkData();
        }
    }
    
    return selection;
}

function isJunkData(char) {
    var junkData = ["{", "}", "[", "]", "*", "<", ">", "?", ".", ",", "!", "@", "#", "$", "%", "^", "&", "*", "(", ")", "-", "+", "_"];
    for(var i = 0; i < junkData.length; i++) {
        if(junkData[i] === char) {
            return true;
        }
    }
    return false;
}

function isHintStart(char) {
    var hintStarts = ["{", "[", "<", "("];
    for(var i = 0; i < hintStarts.length; i++) {
        if(hintStarts[i] === char) {
            return true;
        }
    }
    return false;
}

function hasHintEnd(char, line) {
    var end;
    switch(char) {
        case "{":
            end = "}";
            break;
        case "[":
            end = "]";
            break;
        case "<":
            end = ">";
            break;
        case "(":
            end = ")";
            break;
    }
    
    var start = false;
    var lineBuffer = "";
    for(var i = 0; i < line.length; i++) {
        if(line[i] === "~") {
            start = true;
            lineBuffer += char;
            continue;
        }
        if(start) {
            lineBuffer += line[i];
            if(line[i] === end) {
                return lineBuffer;
            }
        }
    }
    return null;
}

function buildPuzzle(lines) {
    var columnSize = LINE_NUMBER / 2;
    $("#column-1 > .pass-column").empty();
    $("#column-2 > .pass-column").empty();
    
    for(var i = 0; i < columnSize; i++) {
        var newLine = formatLine(lines[i]);
        $("#column-1 > .pass-column").append(newLine);
    }
    for(var i = columnSize; i < columnSize * 2; i++) {
        var newLine = formatLine(lines[i]);
        $("#column-2 > .pass-column").append(newLine);
    }
}

function formatLine(line) {
    var lineStart = "<span class='pass'>";
    var lineEnd = "<span class='line-end'></span></span>";
    var itemStart = "<span class=";
    var itemEnd = "</span>";
    
    var pass = line.split('');
    var newLine = [lineStart];
    
    for(var i = 0; i < pass.length; i++) {
        if(isJunkData(line[i])) {
            var item = itemStart + "'jd'>" + line[i] + itemEnd;
            newLine.push(item);
        } else {
            var word = "";
            for(var j = 0; j < wordLength; j++) {
                word += pass[i+j];
            }
            var item = itemStart + "'word'>";
            for(var j = 0; j < word.length; j++) {
                item += itemStart + "'letter'>" + word[j] + itemEnd;
            }
            item += itemEnd;
            //console.log(item);
            newLine.push(item);
            i += wordLength - 1;
        }
    }
    newLine.push(lineEnd);
    newLine = newLine.join('');
    
    return newLine;
}

function tagReplacer(string) {
    for(var i = 0; i < string.length; i++) {
        switch(string[i]) {
            case "<":
                string[i] = "&lt;";
                break;
            case ">":
                string[i] = "&gt;";
                break;
            case "?":
                string[i] = "&#63;";
                break;
        }
    }
    return string;
}

function checkPass(guess, answer, list) {
    guess = guess.toLowerCase();
    var flag = false;
    for(var i = 0; i < list.length; i++) {
        if(guess === list[i]) {
            flag = true;
            i = list.length + 1;
        }
    }
    if(flag === false) {
        return -2;
    }
    
    if(guess === answer) {
        return -1;
    } else {
        var correct = 0;
        for(var i = 0; i < guess.length; i++) {
            if(guess[i] === answer[i]) {
                correct++;
            }
        }
        return correct;
    }
}

function checkPass(guess, answer) {
    guess = guess.toLowerCase();
    if(guess === answer) {
        return -1;
    } else {
        var correct = 0;
        for(var i = 0; i < guess.length; i++) {
            if(guess[i] === answer[i]) {
                correct++;
            }
        }
        return correct;
    }
}

function deductTry() {
    tries--;
    if(tries === 0) {
        return false;
    } else {
        return true;
    }
}

function enableHint($clicked) {
    $clicked.text(".");
    var dud = Math.floor(Math.random() * unalteredWordList.length);
    while(unalteredWordList[dud] === password) {
        dud = Math.floor(Math.random() * unalteredWordList.length);
    }
    var dudText = unalteredWordList[dud];
    var wordReplacement = "";
    for(var i = 0; i < wordLength; i++) {
        wordReplacement += "<span class='jd'>.</span>";
    }
    $(".word:contains(" + dudText + ")").replaceWith(wordReplacement);
}

function cycleDifficulty(diff) {
    var newDifficulty;
    switch(diff.toLowerCase()) {
        case "novice":
            newDifficulty = "advanced";
            break;
        /*case "advanced":
            newDifficulty = "expert";
            break;
        case "expert":
            newDifficulty = "master";
            break;
        case "master":
            newDifficulty = "novice";
            break;*/
        case "advanced":
            newDifficulty = "novice";
            break;
    }
    
    difficulty = newDifficulty;
    $("#game-difficulty").text(newDifficulty.toUpperCase());
}

function onInit() {
    $("#attempts-remaining").empty();
    $("#console-content").empty();
    for(var i = 0; i < NUM_TRIES; i++) {
        $("#attempts-remaining").append("█ ");
    }
    
    buildPuzzle(lines);
}

function drawAttemptsRemaining(attempts) {
    $("#attempts-remaining").empty();
    for(var i = 0; i < attempts; i++) {
        $("#attempts-remaining").append("█ ");
    }
}

function eventHandlers() {
    $(".pass-column").on("click", ".word", function() {
        var $this = $(this);
        
        if(tries > 0) {
            var guessText = $this.text();
            var correctPass = checkPass(guessText, password);
            $("#console-content").append("<span class='console-line'>&gt; " + guessText + "</span>");
            if(correctPass === -1) {
                $("#console-content").append("<span class='console-line'>&gt; Password accepted.</span>");
                $("#console-content").append("<span class='console-line'>&gt; Reset terminal? <span class='new-game-button'>Y</span>/N</span>");
            } else {
                if(deductTry() === false) {
                    $("#console-content").append("<span class='console-line'>&gt; Too many tries. Reset terminal? <span class='new-game-button'>Y</span>/N</span>");
                    drawAttemptsRemaining(0);
                } else {
                    drawAttemptsRemaining(tries);
                    $("#console-content").append("<span class='console-line'>&gt; Entry denied.</span>");
                    $("#console-content").append("<span class='console-line'>&gt; Likeness=" + correctPass + "</span>");
                }
            }
        }
    });
    
    $(".pass-column").on("click", ".jd", function() {
        var $this = $(this);
        var data = $this.text();
        $this.text("~");
        $("#console-content").append("<span class='console-line'>&gt; " + data + "</span>");
        
        if(isHintStart(data)) {
            var $parent = $this.parent();
            var parentText = $parent.text();
            var hint = hasHintEnd(data, parentText);
            if(hint !== null && hint !== "") {
                enableHint($this);
                $("#console-content").append("<span class='console-line'>&gt; " + hint + "</span>");
                $("#console-content").append("<span class='console-line'>&gt; Dud removed.</span>")
            }
        }
    });
    
    $(".new-game-button").on("click", function() {
        refresh();
    });
    $("#working-console").on("click", ".new-game-button", function() {
        refresh();
    })
    
    $("#settings-button").on("click", function() {
        $("#settings-window").fadeToggle();
    });
    
    $("#settings-close").on("click", function() {
        $("#settings-window").fadeToggle();
    });
    
    $("#game-difficulty").on("click", function() {
        cycleDifficulty(difficulty);
    });
}

function refresh() {
    version = randomizeVersion();
    wordLength = getWordLength(difficulty, version);
    wordList = getWords(difficulty);
    unalteredWordList = wordList.slice(0);
    password = getPassword(wordList);
    lines = constructLines(difficulty, wordList);
    tries = NUM_TRIES;
    hints = getHintCount(difficulty);
    
    onInit();
}