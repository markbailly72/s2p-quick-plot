exports.spJson = function(filename) {
  var fs = require('fs');
  //var filename = process.argv.slice(2)[0];
  //test
  var options = {encoding: 'utf8',flag: 'r'};
  var paramsObj,spJSON,numberOfPorts,firstLine;
  var spStarted = false;
  var freqs = [];
  var s11 = [];
  var s21 = [];
  var s12 = [];
  var s22 = [];
  var spComplete = {};
  var data;
//  var numberOfPorts = filename.split(".")[1].split("s")[1].split("p")[0];
var ext = filename.split(".")[filename.split(".").length-1];
var numberOfPorts = ext.replace(/[p P]/,"").replace(/[s S]/,"");
console.log(numberOfPorts);
  //Check file for erros
  var fileError = "none";
  if (ext.toLowerCase() != 's2p') {
    fileError = "Incorrect File Extension. Must be s2p.";
  }
//  var stats = fs.stat(filename, function(err,stats) {
  var stats = fs.statSync(filename);
  console.log(stats.size);
  if (stats.size == 0) {
    fileError = "ERROR: Empty File";
  }
  if (fileError == "none") {
    //fs.readFile(filename,options, function(err, data) {getS(err,data);});
    try {
      data = fs.readFileSync(filename,options);
      getS(data);
    }
    catch (err) {
      fileError = "ERROR: Failed to open file.";
    }
  }
  else {
    console.log(fileError);
  }
//  });


  function getS(data) {
    var errors = "none";
    var noData = true;
    const newfilename = filename.concat(".json");
  /*  if (err) {
      console.log('Failed to open file.');
      fileError = "ERROR: Failed to open file.";
    }*/

  //  else {
      //add code to check that file is formatted correctly
      try {
        //remove blanklines
        const text = data.split(/\n/);
        for (let i=0;i < text.length;i++) {
          if (text[i].startsWith("!")) {
            if(spStarted) {
              i = text.length;
            }
          }
          else if (text[i].startsWith("#")) {
            //whitespace removal input.split(/[ ]+/);
          //let line = text[i].replace(/\s{2,}/g,' ').split(" ");
          //  console.log(line.length);
            if (text[i].split(/[ ]+/).length != 6) {
              console.log("Incorrect definition line.");
              fileError = "ERROR: Incorrect definition line.";
            }
            else {var paramsObj = {
              freqUnits: text[i].split(/[ ]+/)[1],
              networkType: text[i].split(/[ ]+/)[2],
              dataFormat: text[i].split(/[ ]+/)[3],
              systemImpedance: text[i].split(/[ ]+/)[5].trim(),
              numPorts: numberOfPorts
              }
            }
          }
         else if (text[i].match(/^\d/)) {
           //string = string.replace(/\s\s+/g, ' '); replace all whitesplace
           spStarted = true;
           let line = "";
           line = text[i].replace(/\s+/g, ",").split(",");
           //console.log(line.length);
            freqs.push(line[0]);
            s11.push({a:line[1], b:line[2]});
          //  console.log(Number(text[i].split(/\t/)[1]));
            if (numberOfPorts == 2) {
              s21.push({a:line[3], b:line[4]});
              s12.push({a:line[5], b:line[6]});
              s22.push({a:line[7], b:line[8]});
            }
          }
        }
        spComplete.params = paramsObj;
        spComplete.freqs = freqs;
        spComplete.s11 = s11;
        if (numberOfPorts == 2) {
          spComplete.s21 = s21;
          spComplete.s12 = s12;
          spComplete.s22 = s22;
        }
        spJSON = JSON.stringify(spComplete);
        ///Remove file creation for this version//////////////
      /*  fs.writeFile(newfilename,spJSON, (err) => {
          if (err) throw err;
          console.log('File Saved');
          fileError = "File Saved";
        });*/
        //////////////////////////////////
       // console.log(spJSON);
      }
      catch(e) {
        console.log("ERROR: The touchstone file has an error or incorrect format. Open the file in any text editor and verify that it is correct.");
        fileError = "ERROR: The touchstone file has an error or incorrect format. Open the file in any text editor and verify that it is correct."
      }
  //  }
  }
  return {fileError, spJSON};
}
