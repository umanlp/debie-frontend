var vectorTypeEnum = 'fasttext';
var evaluationMethodEnum = 'all';
var fileContent = '';
var resultData = {};

// Handle uploaded file
function handleFileSelect(evt) {
  var files = evt.target.files;
  for (var i = 0, f; f = files[i]; i++) {
      let output = '';
      output += `<strong>${f.name}</strong>: ${f.type}, ${f.size} bytes, last modified: ${f.lastModifiedDate.toLocaleDateString()}`;
      document.getElementById('filedetails').innerHTML = output;
      var reader = new FileReader();
      reader.onload = (function(theFile) {
      return function(e) {
          fileContent += e.target.result;
      };
  })(f);
  reader.readAsText(f);
  }
}
document.getElementById('customFile').addEventListener('change', handleFileSelect, false);

//Updates the values of the currently selected parameters
function getSelectionValues() {
  let activeVectorType = document.getElementById('word_embedding').getElementsByClassName('active')[0]
  let activeEvalMethod = document.getElementById('evaluation_methods').getElementsByClassName('active')[0];
  vectorTypeEnum = activeVectorType.id;
  if (vectorTypeEnum == "uploadSpace"){
    fileInputName = document.getElementById("inputLabel")
    if (fileInputName.innerHTML != undefined){
      vectorTypeEnum = fileInputName.innerHTML;
    }
    else{
      vectorTypeEnum = fileInputName.getAttribute("placeholder");
    }
  }
  evaluationMethodEnum = activeEvalMethod.id;
  console.log("Current Values: " + vectorTypeEnum + " " + evaluationMethodEnum);
}

// Get the toggle-button selection
function getToggleSelection(){
  switcher = document.getElementById('vectorsEnabled');
  console.log(switcher.checked);
  if (switcher.checked == false){
    return 'false';
  }
  if (switcher.checked == true){
    return 'true';
  }
}

// Starts a spinner inside the parameter html-object
function startSpinner(object_id) {
  spinner = `
        <div class="d-flex justify-content-center">
          <div class="spinner-border text-primary" role="status">
            <span class="sr-only">Loading...</span>
          </div>
        </div>
        `
  try {
    document.getElementById(object_id).innerHTML = spinner;
  } catch (error) {
    console.error();
  }
}

//Send a bias evaluation request 
function sendRequest() {
  startSpinner('card_response')
  getSelectionValues()
  var targetSet1 = document.getElementById('target_set1').value
  var targetSet2 = document.getElementById('target_set2').value
  var argSet1 = document.getElementById('argument_set1').value
  var argSet2 = document.getElementById('argument_set2').value
  //var url = 'http://127.0.0.1:5000/REST/bias-evaluation'
  var url = 'http://wifo5-29.informatik.uni-mannheim.de:8000/REST/bias-evaluation';
  url += '/' + evaluationMethodEnum;
  url += '?space=' + vectorTypeEnum;
  //url += '&vectors=false'
  var postDict1 = {T1: targetSet1, T2: targetSet2, A1: argSet1, A2: argSet2 }
  var postJson = JSON.stringify(postDict1)
  console.log(postJson)
  document.getElementById('card').removeAttribute("hidden");
  var statusFlag = 200;

  try {
    const response = fetch(url, {
        method: 'POST',
        body: postJson,
        headers: {
          'Content-Type': 'application/json'
        }
      })
      .then((res) => {
        if (!res.ok){
          statusFlag = res.status;
        }
        return res.json();
      })
      .then((data) => {
        console.log(statusFlag);
        console.log(data);
        let output = '';
        if (statusFlag != 200){
          output += `
          <h5 class="card-title mb-3">ERROR</h5>
          <p>${statusFlag} ${data.message}</p> 
          <p>Please check your input and try again.</p>
          `
        }
        else{
          switch (evaluationMethodEnum) {
            case 'all':
              output += `
                <h5 class="card-title mb-3">Evaluation results: </h5>
                <table class="table table-borderless table-dark">
                  <tbody>
                    <tr>
                    <th scope="row">ECT with combined argument sets: </th>
                    <td>${data.EctValue}</td>
                    </tr>
                    <tr>
                    <th scope="row">ECT p-value with combined argument sets: </th>
                    <td>${data.EctPValue}</td>
                    </tr>
                    <tr>
                    <th scope="row">ECT with argument set 1: </th>
                    <td>${data.EctValue1}</td>
                    </tr>
                    <tr>
                    <th scope="row">ECT p-value with argument set 1: </th>
                    <td>${data.EctPValue1}</td>
                    </tr>
                    <tr>
                    <th scope="row">ECT with argument set 2: </th>
                    <td>${data.EctValue2}</td>
                    </tr>
                    <tr>
                    <th scope="row">ECT p-value with argument set 2: </th>
                    <td>${data.EctPValue2}</td>
                    </tr>
                    <tr>
                    <th scope="row">BAT score: </th>
                    <td>${data.BatValue}</td>
                    </tr>
                    <tr>
                    <th scope="row">WEAT effect size: </th>
                    <td>${data.WeatEffectSize}</td>
                    </tr>
                    <tr>
                    <th scope="row">WEAT p-value: </th>
                    <td>${data.WeatPValue}</td>
                    </tr>
                    <tr>
                    <th scope="row">K-Means result: </th>
                    <td>${data.KmeansValue}</td>
                    </tr>
                  </tbody>
                </table>       
              `;
              break;
            case 'ect':
                output += `
                <h5 class="card-title">ECT Results</h5>
                <table class="table table-borderless table-dark">
                  <tbody>
                    <tr>
                    <th scope="row">ECT with combined argument sets: </th>
                    <td>${data.EctValue}</td>
                    </tr>
                    <tr>
                    <th scope="row">ECT p-value with argument set 1: </th>
                    <td>${data.EctPValue}</td>
                    </tr>
                    <tr>
                    <th scope="row">ECT with argument set 1: </th>
                    <td>${data.EctValue1}</td>
                    </tr>
                    <tr>
                    <th scope="row">ECT p-value with argument set 1: </th>
                    <td>${data.EctPValue1}</td>
                    </tr>
                    <tr>
                    <th scope="row">ECT with argument set 2: </th>
                    <td>${data.EctValue2}</td>
                    </tr>
                    <tr>
                    <th scope="row">ECT p-value with argument set 2: </th>
                    <td>${data.EctPValue2}</td>
                    </tr>
                  </tbody>
                </table>
                `;
              break;
            case 'bat':
                output += `
                <h5 class="card-title">BAT Results</h5>
                <table class="table table-borderless table-dark">
                  <tbody>
                    <tr>
                      <th scope="row">BAT score: </th>
                      <td>${data.BatValue}</td>
                    </tr>
                  </tbody>
                </table>  
              `;
              break;
            case 'weat':
                output += `
                <h5 class="card-title">WEAT Results</h5>
                <table class="table table-borderless table-dark">
                  <tbody>
                  <tr>
                  <th scope="row">WEAT effect size: </th>
                  <td>${data.WeatEffectSize}</td>
                  </tr>
                  <tr>
                  <th scope="row">WEAT p-value: </th>
                  <td>${data.WeatPValue}</td>
                  </tr>
                  </tbody>
                </table>  
              `;
              break;
            case 'kmeans':
                output += `
                <h5 class="card-title">KMeans Results</h5>
                <table class="table table-borderless table-dark">
                  <tbody>
                    <tr>
                      <th scope="row">K-Means result: </th>
                      <td>${data.KmeansValue}</td>
                    </tr>
                  </tbody>
                </table> 
              `;
              break;
          }
          output += `
                <h6 class="card-subtitle mt-3 mb-2">Download results as JSON: </h6>
         `;
          document.getElementById('download').removeAttribute("hidden");
          createDownloadJson(resultData, postDict1, data)
        }
        document.getElementById('card_response').innerHTML = output;
      })
  } catch (error) {
    console.error();
  }
}

function sendRequestJSON(){
  startSpinner('card_response2')
  getSelectionValues()
  //var url = 'http://127.0.0.1:5000/REST/bias-evaluation'
  var url = 'http://wifo5-29.informatik.uni-mannheim.de:8000/REST/bias-evaluation';
  url += '/' + evaluationMethodEnum;
  url += '?space=' + vectorTypeEnum;
  url += '&vectors='+ getToggleSelection()
  console.log(fileContent);
  document.getElementById('card2').removeAttribute("hidden");
  var statusFlag = 200;

  try {
    const response = fetch(url, {
        method: 'POST',
        body: fileContent,
        headers: {
          'Content-Type': 'application/json'
        }
      })
      .then((res) => {
        if (!res.ok){
          statusFlag = res.status;
        }
        return res.json();
      })
      .then((data) => {
        console.log(statusFlag);
        console.log(data);
        let output = '';
        if (statusFlag != 200){
          output += `
          <h5 class="card-title mb-3">ERROR</h5>
          <p>${statusFlag} ${data.message}</p> 
          <p>Please check your input and try again.</p>
          `
        }
        else{
          switch (evaluationMethodEnum) {
            case 'all':
              output += `
                <h5 class="card-title mb-3">Evaluation results: </h5>
                <table class="table table-borderless table-dark">
                  <tbody>
                    <tr>
                    <th scope="row">ECT with combined argument sets: </th>
                    <td>${data.EctValue}</td>
                    </tr>
                    <tr>
                    <th scope="row">ECT p-value with combined argument sets: </th>
                    <td>${data.EctPValue}</td>
                    </tr>
                    <tr>
                    <th scope="row">ECT with argument set 1: </th>
                    <td>${data.EctValue1}</td>
                    </tr>
                    <tr>
                    <th scope="row">ECT p-value with argument set 1: </th>
                    <td>${data.EctPValue1}</td>
                    </tr>
                    <tr>
                    <th scope="row">ECT with argument set 2: </th>
                    <td>${data.EctValue2}</td>
                    </tr>
                    <tr>
                    <th scope="row">ECT p-value with argument set 2: </th>
                    <td>${data.EctPValue2}</td>
                    </tr>
                    <tr>
                    <th scope="row">BAT score: </th>
                    <td>${data.BatValue}</td>
                    </tr>
                    <tr>
                    <th scope="row">WEAT effect size: </th>
                    <td>${data.WeatEffectSize}</td>
                    </tr>
                    <tr>
                    <th scope="row">WEAT p-value: </th>
                    <td>${data.WeatPValue}</td>
                    </tr>
                    <tr>
                    <th scope="row">K-Means result: </th>
                    <td>${data.KmeansValue}</td>
                    </tr>
                  </tbody>
                </table>       
              `;
              break;
            case 'ect':
                output += `
                <h5 class="card-title">ECT Results</h5>
                <table class="table table-borderless table-dark">
                  <tbody>
                    <tr>
                    <th scope="row">ECT with combined argument sets: </th>
                    <td>${data.EctValue}</td>
                    </tr>
                    <tr>
                    <th scope="row">ECT p-value with argument set 1: </th>
                    <td>${data.EctPValue}</td>
                    </tr>
                    <tr>
                    <th scope="row">ECT with argument set 1: </th>
                    <td>${data.EctValue1}</td>
                    </tr>
                    <tr>
                    <th scope="row">ECT p-value with argument set 1: </th>
                    <td>${data.EctPValue1}</td>
                    </tr>
                    <tr>
                    <th scope="row">ECT with argument set 2: </th>
                    <td>${data.EctValue2}</td>
                    </tr>
                    <tr>
                    <th scope="row">ECT p-value with argument set 2: </th>
                    <td>${data.EctPValue2}</td>
                    </tr>
                  </tbody>
                </table>
                `;
              break;
            case 'bat':
                output += `
                <h5 class="card-title">BAT Results</h5>
                <table class="table table-borderless table-dark">
                  <tbody>
                    <tr>
                      <th scope="row">BAT score: </th>
                      <td>${data.BatValue}</td>
                    </tr>
                  </tbody>
                </table>  
              `;
              break;
            case 'weat':
                output += `
                <h5 class="card-title">WEAT Results</h5>
                <table class="table table-borderless table-dark">
                  <tbody>
                  <tr>
                  <th scope="row">WEAT effect size: </th>
                  <td>${data.WeatEffectSize}</td>
                  </tr>
                  <tr>
                  <th scope="row">WEAT p-value: </th>
                  <td>${data.WeatPValue}</td>
                  </tr>
                  </tbody>
                </table>  
              `;
              break;
            case 'kmeans':
                output += `
                <h5 class="card-title">KMeans Results</h5>
                <table class="table table-borderless table-dark">
                  <tbody>
                    <tr>
                      <th scope="row">K-Means result: </th>
                      <td>${data.KmeansValue}</td>
                    </tr>
                  </tbody>
                </table> 
              `;
              break;
          }
          output += `
                <h6 class="card-subtitle mt-3 mb-2">Download results as JSON: </h6>
         `;
          document.getElementById('download2').removeAttribute("hidden");
          createDownloadJson2(data)
        }
        document.getElementById('card_response2').innerHTML = output;
      })
  } catch (error) {
    console.error();
  }

}

function createDownloadJson2(evalResults){
  resultData['EmbeddingSpace'] = vectorTypeEnum;
  resultData['EvaluationMethods'] = evaluationMethodEnum;
  console.log(evalResults.weat_effect_size);

  resultData['T1'] = evalResults.T1;
  resultData['T2'] = evalResults.T2;
  resultData['A1'] = evalResults.A1;
  resultData['A2'] = evalResults.A2;

  switch(evaluationMethodEnum){
    case 'all':
      resultVar['EctValue'] = evalResults.EctValue;
      resultVar['EctPValue'] = evalResults.EctPValue;
      resultVar['EctValue1'] = evalResults.EctValue1;
      resultVar['EctPValue1'] = evalResults.EctPValue1;
      resultVar['EctValue2'] = evalResults.EctValue2;
      resultVar['EctPValue2'] = evalResults.EctPValue2;
      resultVar['BatValue'] = evalResults.BatValue;
      resultVar['WeatEffectSize'] = evalResults.WeatEffectSize;
      resultVar['WeatPValue'] = evalResults.WeatPValue;
      resultVar['KmeansValue'] = evalResults.KmeansValue;
      break;
    case 'ect':
      resultVar['EctValue'] = evalResults.EctValue;
      resultVar['EctPValue'] = evalResults.EctPValue;
      resultVar['EctValue1'] = evalResults.EctValue1;
      resultVar['EctPValue1'] = evalResults.EctPValue1;
      resultVar['EctValue2'] = evalResults.EctValue2;
      resultVar['EctPValue2'] = evalResults.EctPValue2;
      break;
    case 'bat':
      resultVar['BatValue'] = evalResults.BatValue;
      break;
    case 'weat':
      resultVar['WeatEffectSize'] = evalResults.WeatEffectSize;
      resultVar['WeatPValue'] = evalResults.WeatPValue;
      break;
    case 'kmeans':
      resultVar['KmeansValue'] = evalResults.KmeansValue;
      break;
  }
  
  console.log(resultData)
}

function createDownloadJson(resultVar, sourceFile, evalResults){
  resultVar['EmbeddingSpace'] = vectorTypeEnum;
  resultVar['EvaluationMethods'] = evaluationMethodEnum;
  switch(evaluationMethodEnum){
    case 'all':
      resultVar['ECT-Value1'] = evalResults.ECT-Value;
      resultVar['ECT-P-Value1'] = evalResults.ECT-ValueP;
      resultVar['ECT-Value1'] = evalResults.ECT-Value1;
      resultVar['ECT-P-Value1'] = evalResults.ECT-ValueP1;
      resultVar['ECT-Value2'] = evalResults.ECT-Value2;
      resultVar['ECT-P-Value2'] = evalResults.ECT-ValueP2;
      resultVar['BAT-Value'] = evalResults.BAT-Value;
      resultVar['WEAT-effect-size'] = evalResults.WEAT-effect-size;
      resultVar['WEAT-p-value'] = evalResults.WEAT-p-value;
      resultVar['K-Means-value'] = evalResults.K-Means-value;
      break;
    case 'ect':
      resultVar['ECT-Value1'] = evalResults.ECT-Value;
      resultVar['ECT-P-Value1'] = evalResults.ECT-ValueP;
      resultVar['ECT-Value1'] = evalResults.ECT-Value1;
      resultVar['ECT-P-Value1'] = evalResults.ECT-ValueP1;
      resultVar['ECT-Value2'] = evalResults.ECT-Value2;
      resultVar['ECT-P-Value2'] = evalResults.ECT-ValueP2;
      break;
    case 'bat':
      resultVar['BAT-Value'] = evalResults.BAT-Value;
      break;
    case 'weat':
      resultVar['WEAT-effect-size'] = evalResults.WEAT-effect-size;
      resultVar['WEAT-p-value'] = evalResults.WEAT-p-value;
      break;
    case 'kmeans':
      resultVar['K-Means-value'] = evalResults.K-Means-value;
      break;  
  }
  resultVar['T1'] = sourceFile.T1;
  resultVar['T2'] = sourceFile.T2;
  resultVar['A1'] = sourceFile.A1;
  resultVar['A2'] = sourceFile.A2;
  console.log(resultVar)
}

function download(filename, content){
  var element = document.createElement('a');
  element.style.display = 'none';
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(content)));
  element.setAttribute('download', filename);
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
  console.log('Downloaded')
}

document.getElementById('Evaluate1').addEventListener("click", function() { sendRequest() });
document.getElementById('download').addEventListener("click", function() { download('Evaluation.json', resultData)})
document.getElementById('Evaluate2').addEventListener("click", function() { 
  sendRequestJSON();
});
document.getElementById('download2').addEventListener("click", function() { download('Evaluation.json', resultData)})
