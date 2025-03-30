const natural = require("natural");
const stopwords = require("stopword");
const he = require("he");

const tokenizer = new natural.SentenceTokenizer();
const wordTokenizer = new natural.WordTokenizer();

const UNWANTED_PHRASES = [
    "also read", "click here", "watch video",
    "exclusive interview", "breaking news"
];

/**
 * Cleans the text by decoding HTML entities, removing unwanted phrases, 
 * and fixing excessive spaces.
 */
function cleanText(text) {
    if (!text || typeof text !== "string") {
        return ""; // Return an empty string if the input is invalid
    }

    let cleanedText = he.decode(text); // Decode HTML entities safely

    // Remove unwanted phrases
    UNWANTED_PHRASES.forEach(phrase => {
        const regex = new RegExp(`\\b${phrase}\\b.*?(\\.|!|\\?)?`, "gi");
        cleanedText = cleanedText.replace(regex, "").trim();
    });

    // Remove excessive spaces and non-breaking spaces
    cleanedText = cleanedText.replace(/\s+/g, " ").replace(/&nbsp;/g, " ");

    return cleanedText;
}


/**
 * Calculates scores for each sentence based on word frequency.
 */
function getSentenceScores(sentences, wordFrequencies) {
    const sentenceScores = new Map();

    sentences.forEach((sentence) => {
        const words = wordTokenizer.tokenize(sentence.toLowerCase());
        const score = words.reduce((sum, word) => sum + (wordFrequencies[word] || 0), 0);
        sentenceScores.set(sentence, score);
    });

    return sentenceScores;
}

/**
 * Capitalizes the first letter of each sentence in the summary.
 */
function capitalizeSentences(text) {
    return text.replace(/(^\s*\w|[.!?]\s*\w)/g, match => match.toUpperCase());
}

/**
 * Generates a summary by selecting the most important sentences.
 */
function summarize(text, numSentences = 3) {
    let cleanedText = cleanText(text);
    const sentences = tokenizer.tokenize(cleanedText);
    const words = wordTokenizer.tokenize(cleanedText.toLowerCase());
    const filteredWords = stopwords.removeStopwords(words);

    // Calculate word frequencies
    const wordFrequencies = {};
    filteredWords.forEach(word => {
        wordFrequencies[word] = (wordFrequencies[word] || 0) + 1;
    });

    // Get sentence scores
    const sentenceScores = getSentenceScores(sentences, wordFrequencies);

    // Select the top `numSentences` based on score
    const summarySentences = [...sentenceScores.entries()]
        .sort((a, b) => b[1] - a[1]) // Sort by importance
        .slice(0, numSentences) // Select top-ranked sentences
        .map(entry => entry[0]);

    // Restore original sentence order
    summarySentences.sort((a, b) => sentences.indexOf(a) - sentences.indexOf(b));

    return capitalizeSentences(summarySentences.join(" "));
}

module.exports = summarize;
