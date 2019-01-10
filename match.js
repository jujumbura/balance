var stringSimilarity = require('string-similarity');

function findBestMatches(input, options, count) {
  let result = stringSimilarity.findBestMatch(input, options);
  
  let sorted = result.ratings.sort((a, b) => {
    let value = b.rating - a.rating;
    return value;
  });
  
  let matches = [];
  for (let i = 0; i < sorted.length && i < count; ++i) {
    let rating = sorted[i];
    if (rating.rating <= 0) {
      break;
    }
    matches.push(rating.target);
  }
  return matches;
}

module.exports = {};
module.exports.findBestMatches = findBestMatches;
