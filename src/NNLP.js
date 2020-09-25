const LIBRARIES = {
    Intent: require("./Intent")
};

class NNLP {
    constructor() {
        this.Intents = {};

        this._checkIntentExistence("none");
    }

    /* ################################################################## */
    /* ### PUBLIC ####################################################### */
    /* ################################################################## */

    /* Load */
    /* This function loads a corpus. */
    loadCorpus(_corpus){
        for(let j = 0; j < _corpus.length; j++) {
            if(_corpus[j].utterances !== undefined) {
                for(let k = 0; k < _corpus[j].utterances.length; k++) {
                    this.addDocuments(_corpus[j].intent, _corpus[j].utterances[k]);
                }
            }
            if(_corpus[j].answers !== undefined) {
                for(let k = 0; k < _corpus[j].answers.length; k++) {
                    this.addAnswers(_corpus[j].intent, _corpus[j].answers[k]);
                }
            }
            if(_corpus[j].errors !== undefined) {
                for(let code in _corpus[j].errors) {
                    this.addErrors(_corpus[j].intent, code, _corpus[j].errors[code]);
                }
            }
        }
    }

    /* Documents */
    /* This function adds a way to call an action. */
    addDocument(_intentName, _utterance){
        this.addDocuments(_intentName, [_utterance]);
    }

    /* This function adds ways to call an action. */
    addDocuments(_intentName, _utterances){
        this._checkIntentExistence(_intentName);
        this.Intents[_intentName].addDocuments(_utterances);
    }

    /* Answers */
    /* This function adds a response to an action. */
    addAnswer(_intentName, _answer){
        this.addAnswers(_intentName, [_answer]);
    }

    /* This function adds responses to an action. */
    addAnswers(_intentName, _answers){
        this._checkIntentExistence(_intentName);
        this.Intents[_intentName].addAnswers(_answers);
    }

    /* Errors */
    addErrors(_intentName, _errorsName, _errors){
        this._checkIntentExistence(_intentName);
        this.Intents[_intentName].addErrors(_errorsName, _errors);
    }

    /* Actions */
    /* This function adds an action. This action will be triggered when a document is called. */
    addAction(_intentName, _action){
        this.addActions(_intentName, [_action]);
    }

    /* This function adds actions. These actions will be triggered when a document is called. */
    addActions(_intentName, _actions){
        this._checkIntentExistence(_intentName);
        this.Intents[_intentName].addActions(_actions);
    }

    /* Process */
    /* This function executes the intent that matches the customer's phrase. */
    process(_utterance){
        const SPLITTED_SAY = _utterance.split(" ");
        let intent_name = null;
        let variables = null;
        let result = {
            utterance: _utterance,
            intent: undefined,
            variables: undefined,
            answers: undefined,
            answer: undefined
        };

        loop1:
            for(let loop_intent_name in this.Intents){
                for(let a = 0; a < this.Intents[loop_intent_name].Documents.length; a++){
                    const RESULT = this._process(this.Intents[loop_intent_name].Documents[a], SPLITTED_SAY);
                    if(RESULT !== false){
                        intent_name = loop_intent_name;
                        variables = RESULT;
                        break loop1;
                    }
                }
            }

        if(intent_name === null){
            loop1:
                for(let loop_intent_name in this.Intents){
                    for(let a = 0; a < this.Intents[loop_intent_name].Documents.length; a++){
                        const RESULT = this._process(this.Intents[loop_intent_name].Documents[a], SPLITTED_SAY, false);
                        if(RESULT !== false){
                            intent_name = loop_intent_name;
                            variables = RESULT;
                            break loop1;
                        }
                    }
                }
        }

        if(intent_name === null){
            intent_name = "none";
        }
        else{
            result.answers = this.Intents[intent_name].Answers;
        }
        result.intent = intent_name;

        for(let variable in variables){
            const VALUE = parseFloat(variables[variable]);
            if(!isNaN(VALUE)){
                variables[variable] = VALUE;
            }
        }
        this.Intents[intent_name].Variables = variables;
        result.variables = this.Intents[intent_name].Variables;
        if(result.answers!= undefined){
            if(result.answers.length > 0){
                result.answer = this.Intents[intent_name].answer();
            }
        }

        if(this.Intents[intent_name].Actions.length > 0){
            for(let index = 0; index < this.Intents[intent_name].Actions.length; index++){
                this.Intents[intent_name].Actions[index](this.Intents[intent_name], result);
            }
        }
        return result;
    }

    /* ################################################################## */
    /* ### PRIVATE ###################################################### */
    /* ################################################################## */

    /* This function checks if an intent exists, if not, it creates it. */
    _checkIntentExistence(_intentName){
        if(this.Intents[_intentName] === undefined){
            this.Intents[_intentName] = new LIBRARIES.Intent(_intentName);
        }
    }

    /* This function is an essential loop of the "process" function. */
    _process(_sentence, _splitedSay, _asc = true){
        let SPLITTED_SENTENSE = _sentence.split(" ");

        if(_asc === false){
            SPLITTED_SENTENSE = SPLITTED_SENTENSE.reverse();
            _splitedSay = _splitedSay.reverse();
        }

        const VARIABLES = {};
        let variables_position = 0;
        let variable_name = null;
        let ok = 0; // cette variablre représente le nombre de mots ou variables correspondantes à la phrase testée.
        loop3:
            for(let b = 0; b < SPLITTED_SENTENSE.length; b++){
                // SI LE MOT EST UNE VARIABLE
                if(SPLITTED_SENTENSE[b][0] === "{" && SPLITTED_SENTENSE[b][SPLITTED_SENTENSE[b].length - 1] === "}"){
                    let without_percent = SPLITTED_SENTENSE[b].substring(1, SPLITTED_SENTENSE[b].length - 1).split("|");
                    variable_name = without_percent[0];
                    let max_words = parseInt(without_percent[1]);
                    if(isNaN(max_words)){
                        max_words = 0;
                    }
                    VARIABLES[variable_name] = [];
                    let next_word = SPLITTED_SENTENSE[b + 1];
                    while(_splitedSay[b + variables_position] !== next_word && _splitedSay[b + variables_position] !== undefined){
                        VARIABLES[variable_name].push(_splitedSay[b + variables_position]);
                        variables_position = variables_position + 1;
                        //console.log(next_word, _splitedSay, _splitedSay[b + variables_position]);
                        if(max_words > 0){
                            if(VARIABLES[variable_name].length > max_words){
                                break loop3;
                            }
                        }
                    }
                    variables_position = variables_position - 1;
                    if(_asc === false){
                        VARIABLES[variable_name] = VARIABLES[variable_name].reverse()
                    }
                    VARIABLES[variable_name] = VARIABLES[variable_name].join(" ");
                    ok++;
                }
                // SI LE MOT N'EST PAS UNE VARIABLE
                else{
                    // SI LE MOT EN COUR EST EGAL AU MOT QUE L'ON A ENTENDU
                    if(SPLITTED_SENTENSE[b] === _splitedSay[b + variables_position]){
                        ok++;
                    }
                    else{
                        break;
                    }
                }
            }

        if(ok === SPLITTED_SENTENSE.length){
            return VARIABLES;
        }
        return false;
    }
}

module.exports = NNLP;
