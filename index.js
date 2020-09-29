// You load your file "Non Natural Language Processing" library
const LIBRARIES = {
    NNLP: require("./src/NNLP")
};

// You instantiate
const NNLP = new LIBRARIES.NNLP();

// You define a corpus
const CORPUS = [
    {
        "intent": "music.play",
        "utterances": [
            "Remets la musique",
            "Remets de la musique",
            "Mets de la musique",
            "Mets-moi de la musique",
            "Joue-moi de la musique",
            "Remets-moi de la musique",
            "Rejoue moi de la musique"
        ],
        "answers": [
            "Ok",
            "C'est parti"
        ]
    },
    {
        "intent": "music.next",
        "utterances": [
            "Musique suivante",
            "Mets la musique d'après"
        ],
        "errors": {
            "noMusic": [
                "Il n'y a plus de musiques disponibles.",
                "Votre bibliothèque ne dispose plus de musiques."
            ]
        }
    },
    {
        "intent": "music.previous",
        "utterances": [
            "Musique précédente",
            "Remets la musique d'avant"
        ]
    },
    {
        "intent": "music.pause",
        "utterances": [
            "Pose",
            "Pause",
            "Stop"
        ]
    },
    {
        "intent": "music.play.specific.name.artist",
        "utterances": [
            "Mets la musique {name} de {artist}",
        ],
        "answers": [
            "Très bien, voici %name% de l'artiste %artist%.",
            "OK, voici %name% de l'artiste %artist%.",
            "Voici %name% de l'artiste %artist%."
        ]
    },
    {
        "intent": "music.play.specific.name",
        "utterances": [
            "Mets la musique {name}"
        ],
        "answers": [
            "Très bien, voici %name%.",
            "OK, voici %name%.",
            "Voici %name%."
        ]
    }
];

// You load the corpus
NNLP.loadCorpus(CORPUS);

// You can add actions to be performed when the sentence is spoken.
NNLP.addAction("music.play", function(_intent, _result){
    // You can do what you want here
    console.log("Ok, je lance une musique aléatoire !");
});
NNLP.addAction("music.next", function(_intent, _result){
    // If you detect an error, you can trigger them like this.
    _result.answer = _intent.error("noMusic");
});

// All you have to do now is let the magic happen
console.log(NNLP.process("Je ne sais pas quoi te demander"));
console.log(NNLP.process("Mets de la musique"));
console.log(NNLP.process("Musique suivante"));
console.log(NNLP.process("Mets la musique Crossfire"));
console.log(NNLP.process("Mets la musique No Beef de Afrojack"));