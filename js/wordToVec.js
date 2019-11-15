document.getElementById('SEND_word').addEventListener('click', getWordVecRepresentation);
document.getElementById('SEND_words').addEventListener('click', getWordListVecRepresentation);

function getWordVecRepresentation() {
  word = document.getElementById('word2Send').value;
  console.log(word);
  const url = 'http://127.0.0.1:5000/REST/POST_word';
  dataJSON = { data: word };

  try {
    const response = fetch(url, {
        method: 'POST',
        body: JSON.stringify(dataJSON),
        headers: {
          'Content-Type': 'application/json'
        }
      })
      .then((res) => res.json())
      .then((data) => {
        let output = '<h2>Test Result</h2>';
        output += `
            <ul>
                <a>Word: ${data.word}</a>
                <br>
                <a>Vector:</a>
                <br>
                <a>${data.vector}</a>
            </ul>  
            `;
        document.getElementById('card_word_response').innerHTML = output;
      })
  } catch (error) {
    console.error();
  }
}

function getWordListVecRepresentation() {
  var words = document.getElementById('words2Send').value;
  console.log(words);
  const url = 'http://127.0.0.1:5000/REST/POST_words';
  dataJSON = { data: words };

  try {
    const response = fetch(url, {
        method: 'POST',
        body: JSON.stringify(dataJSON),
        headers: {
          'Content-Type': 'application/json'
        }
      })
      .then((res) => res.json())
      .then((data) => {
        // console.log(data);
        let output = '<h2>Test Result</h2>';
        words = data.word;
        vectors = data.vector;
        // console.log(typeof data)
        // console.log(typeof data.vectors)
        for (var i = 0; i < words.length; i++) {
          output += `
             <ul>
             <a>Word: ${words[i]}</a>
              <br>
              <a>Vector: ${vectors[i]}</a>
            </ul> 
          `;
        }
        document.getElementById('card_words_response').innerHTML = output;
      })
  } catch (error) {
    console.error();
  }
}