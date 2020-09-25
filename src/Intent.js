class Intent {
    constructor(_name) {
        this.Name = _name;
        this.Documents = [];
        this.Answers = [];
        this.Errors = {};
        this.Actions = [];
        this.Variables = {};
    }

    addDocuments(_utterances){
        this.Documents = this.Documents.concat(_utterances);
    }

    addAnswers(_answers){
        this.Answers = this.Answers.concat(_answers);
    }

    addActions(_actions){
        this.Actions = this.Actions.concat(_actions);
    }

    addErrors(_errorsName, _errors){
        if(this.Errors[_errorsName] === undefined){
            this.Errors[_errorsName] = [];
        }
        this.Errors[_errorsName] = this.Errors[_errorsName].concat(_errors);
    }

    answer(_answer){
        if(_answer === undefined){
            _answer = this.Answers[Math.floor(Math.random() * this.Answers.length)];
        }
        if(_answer !== undefined){
            for(let variable in this.Variables){
                _answer = _answer.replace("%" + variable + "%", this.Variables[variable])
            }

            return _answer;
        }
    }

    error(_errorName){
        let text = this.Errors[_errorName][Math.floor(Math.random() * this.Errors[_errorName].length)];
        if(text !== undefined){
            for(let variable in this.Variables){
                text = text.replace("%" + variable + "%", this.Variables[variable])
            }

            return text;
        }
    }
}

module.exports = Intent;
