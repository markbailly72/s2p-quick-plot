// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
var app = require('electron').remote;
var dialog = app.dialog;
var spjsonMsg = require("./js/sparameters-jsonfile.js");
//let math = require('mathjs');
//const parser = math.parser();
const { complex, add, subtract, abs, conj, pow, divide, multiply, log, atan, sin, cos, sqrt, pi, equal, sort, format } = require('mathjs')
//var Plotly = require("./js/plotly.js");
//const pi = Math.PI;
var thePath, spData;
var freqArr = [];
var s21dbArr = [];
var s12dbArr = [];
var s11dbArr = [];
var s22dbArr = [];
var vswr1 = [];
var vswr2 = [];
var mu = [];
var stabFactor;
var s11,s22,s21,s12;
var freqs = [100,200,300,400,500,600,700,800,900,1000];
var y = [15,14,13,12,10,12,13,15,15,16];
var y2 = [1,1.2,1.6,1.8,1.9,1.9,2.0,2.2,2.3,2.5];
var plotFormat = "dB";
var pmtGlobal = {
  freqUnits: "MHz",
  networkType: "S",
  dataFormat: "db",
  systemImpedance: 50,
  numerOfPorts: 2
}
var plotlyOptions = {
  responsive: true,
  displayModeBar: true,
  displaylogo: false
}
var trace1 = {
  x: freqs,
  y: y,
  mode: 'lines'
};
var data = [ trace1];
var layout = {
  title:'S-Parameters',
  height: 600,
  width: 800,
  yaxis: {
    title: "dB",
    zeroline: true,
    showline: true
  },
  xaxis: {
    title: "Frequency",
    zeroline: true,
    showline: true
  }
};

Plotly.newPlot('spPlot', data, layout,plotlyOptions);
layout = {
  title:'VSWR',
  height: 600,
  width: 800,
  yaxis: {
    title: "dB",
    zeroline: true,
    showline: true
  },
  xaxis: {
    title: "Frequency",
    zeroline: true,
    showline: true
  }
};
trace1 = {
  x: freqs,
  y: y2,
  mode: 'lines'
};
data = [ trace1];
Plotly.newPlot('swrPlot', data, layout,plotlyOptions);
///////////////////////////////////////
document.addEventListener('drop', (e) => {
    e.preventDefault();
    e.stopPropagation();

    for (const f of e.dataTransfer.files) {
      //console.log(f.path)
      //console.log(spjsonMsg.spJson(f.path));
      thePath = f.path;
    }
    if (e.dataTransfer.files.length > 1) {
        dialog.showMessageBox(
	        	{
	            	type: 'question',
	            	buttons: ['Ok'],
	            	title: 'File Number',
	            	message: 'Drag only one file'
	        });
    }
    else {
      freqArr = [];
      s21dbArr = [];
      s12dbArr = [];
      s11dbArr = [];
      s22dbArr = [];
      vswr1 = [];
      vswr2 = [];
      mu = [];
      let spResponse = spjsonMsg.spJson(thePath);
      let mag11,mag22,mag12,mag21;
      let ang11,ang22,ang21,ang12;
      let denom,num;
      let delta = complex(1,1);
      //console.log(spResponse.spJSON);
      if (spResponse.fileError == "none") {
        $('#userMessage').html('File Successfully Plotted');
        spData = JSON.parse(spResponse.spJSON);
        //console.log(spData.freqs.map(Number));
        freqArr = spData.freqs.map(Number);
        if (spData.params.freqUnits.toLowerCase() == "hz") {
          console.log('Hz');
          freqArr = freqArr.map(x => x/1000000);
        }
        if (spData.params.freqUnits.toLowerCase() == "ghz") {
          console.log('Hz');
          freqArr = freqArr.map(x => x*1000);
        }
      //  console.log(freqArr);

        for (let i=0;i<spData.s21.length;i++) {
        //  s21dbArr.push(parseFloat(spData.s21[i].a));
        //  s12dbArr.push(parseFloat(spData.s12[i].a));
      //    s11dbArr.push(parseFloat(spData.s11[i].a));
        //  s22dbArr.push(parseFloat(spData.s22[i].a));
          /*mag11 = Math.pow(10,parseFloat(spData.s11[i].a)/20);
          mag22 = Math.pow(10,parseFloat(spData.s22[i].a)/20);
          mag21 = Math.pow(10,parseFloat(spData.s21[i].a)/20);
          mag12 = Math.pow(10,parseFloat(spData.s12[i].a)/20);*/
          if (spData.params.dataFormat.toLowerCase() == "db") {
            mag11 = pow(10,divide(spData.s11[i].a,20));
            mag22 = pow(10,divide(spData.s22[i].a,20));
            mag21 = pow(10,divide(spData.s21[i].a,20));
            mag12 = pow(10,divide(spData.s12[i].a,20));
            ang11 = spData.s11[i].b*pi/180;
            ang22 = spData.s22[i].b*pi/180;
            ang21 = spData.s21[i].b*pi/180;
            ang12 = spData.s12[i].b*pi/180;
            s21dbArr.push(parseFloat(spData.s21[i].a));
            s12dbArr.push(parseFloat(spData.s12[i].a));
            s11dbArr.push(parseFloat(spData.s11[i].a));
            s22dbArr.push(parseFloat(spData.s22[i].a));
          }
          else if (spData.params.dataFormat.toLowerCase() == "ma") {
            mag11 = spData.s11[i].a;
            mag22 = spData.s22[i].a;
            mag21 = spData.s21[i].a;
            mag12 = spData.s12[i].a;
            ang11 = spData.s11[i].b*pi/180;
            ang22 = spData.s22[i].b*pi/180;
            ang21 = spData.s21[i].b*pi/180;
            ang12 = spData.s12[i].b*pi/180;
            s11dbArr.push(multiply(20,log(mag11,10)));
            s22dbArr.push(multiply(20,log(mag22,10)));
            s21dbArr.push(multiply(20,log(mag21,10)));
            s12dbArr.push(multiply(20,log(mag12,10)));
          }
          else if (spData.params.dataFormat.toLowerCase() == "ri") {
            mag11 = sqrt(add(pow(spData.s11[i].a,2),pow(spData.s11[i].b,2)));
            mag22 = sqrt(add(pow(spData.s22[i].a,2),pow(spData.s22[i].b,2)));
            mag21 = sqrt(add(pow(spData.s21[i].a,2),pow(spData.s21[i].b,2)));
            mag12 = sqrt(add(pow(spData.s12[i].a,2),pow(spData.s12[i].b,2)));
            ang11 = atan(divide(spData.s11[i].a,spData.s11[i].b));
            ang22 = atan(divide(spData.s22[i].a,spData.s22[i].b));
            ang21 = atan(divide(spData.s21[i].a,spData.s21[i].b));
            ang12 = atan(divide(spData.s12[i].a,spData.s12[i].b));
            s11dbArr.push(multiply(20,log(mag11,10)));
            s22dbArr.push(multiply(20,log(mag22,10)));
            s21dbArr.push(multiply(20,log(mag21,10)));
            s12dbArr.push(multiply(20,log(mag12,10)));
          }
          s11 = complex({phi:ang11,r:mag11});
          s22 = complex({phi:ang22,r:mag22});
          s21 = complex({phi:ang21,r:mag21});
          s12 = complex({phi:ang12,r:mag12});
          vswr1.push(parseFloat((1+mag11)/(1-mag11)));
          vswr2.push(parseFloat((1+mag22)/(1-mag22)));
          delta = subtract(multiply(s11,s22),multiply(s12,s21));
          denom = add(abs(subtract(s22,multiply(conj(s11),delta))),abs(multiply(s21,s12)));
          num = subtract(1,pow(abs(s11),2));
          mu.push(divide(num,denom));
        }
        var trace1 = {
          x: freqArr,
          y: s21dbArr,
          mode: 'lines',
          line: {shape: 'spline'},
          name: 's21'
        };
        var trace2 = {
          x: freqArr,
          y: s11dbArr,
          mode: 'lines',
          line: {shape: 'spline'},
          name: 's11'
        };
        var trace3 = {
          x: freqArr,
          y: s22dbArr,
          mode: 'lines',
          line: {shape: 'spline'},
          name: 's22'
        };
        var trace4 = {
          x: freqArr,
          y: s12dbArr,
          mode: 'lines',
          line: {shape: 'spline'},
          name: 's12'
        };
        var data = [ trace1, trace2, trace3, trace4];
        var layout = {
          title:'S-Parameters',
          height: 600,
          width: 800,
          yaxis: {
            title: "dB",
            zeroline: true,
            showline: true
          },
          xaxis: {
            title: "Frequency (MHz)",
            zeroline: true,
            showline: true,
            exponentformat: "none"
          }
        };
        Plotly.newPlot('spPlot', data, layout,plotlyOptions);
        trace1 = {
          x: freqArr,
          y: vswr1,
          mode: 'lines',
          line: {shape: 'spline'},
          name: 'VSWR Port 1'
        };
        trace2 = {
          x: freqArr,
          y: vswr2,
          mode: 'lines',
          line: {shape: 'spline'},
          name: 'VSWR Port 2'
        };
        data = [ trace1, trace2 ];
        layout = {
          title:'VSWR',
          height: 600,
          width: 800,
          yaxis: {
            title: "",
            zeroline: true,
            showline: true
          },
          xaxis: {
            title: "Frequency (MHz)",
            zeroline: true,
            showline: true,
            exponentformat: "none"
          }
        };
        Plotly.newPlot('swrPlot', data, layout,plotlyOptions);
        trace1 = {
          x: freqArr,
          y: mu,
          mode: 'lines',
          line: {shape: 'spline'},
          name: 'mu'
        };
        data = [ trace1 ];
        layout = {
          title:'Stability Factor (mu)',
          height: 600,
          width: 800,
          yaxis: {
            title: "",
            zeroline: true,
            showline: true
          },
          xaxis: {
            title: "Frequency (MHz)",
            zeroline: true,
            showline: true,
            exponentformat: "none"
          }
        };
        Plotly.newPlot('muPlot', data, layout,plotlyOptions);
//Calculate and plot VSWR///////////////////////////////

      }
      else {
        $('#userMessage').html(spResponse.fileError);
      }
    }
    $("#rowButtonsMuY").removeClass('invisible');
    $("#rowButtonsSwrY").removeClass('invisible');
    $("#rowButtonsSpY").removeClass('invisible');
    $("#rowButtonsX").removeClass('invisible');
});
document.addEventListener('dragover', (e) => {
  e.preventDefault();
  e.stopPropagation();
});
document.getElementById('buttonXaxisUpdate').addEventListener('click', (e) => {
  //console.log($('#inputXmin').val());
  let error = 'none';
  let xMin, xMax;
  if ($('#inputXmin').val().match(/^[+]?\d+([.]\d+)?$/) && $('#inputXmax').val().match(/^[+]?\d+([.]\d+)?$/)) {
    if ($('#inputXmin').val() < $('#inputXmax').val()){
      xMin = $('#inputXmin').val();
      xMax = $('#inputXmax').val();
      console.log('good');
      var update = {
        'xaxis.range': [xMin, xMax]   // updates the xaxis range
      };
      Plotly.relayout('spPlot', update)
      Plotly.relayout('swrPlot', update)
      Plotly.relayout('muPlot', update)
    }
    else {
      console.log('Max needs to be greater than minimum.');
    }
  }
  else {
    console.log('X max and min must be positive numbers.');
  }
});
document.getElementById('buttonSPyaxisUpdate').addEventListener('click', (e) => {
  //console.log($('#inputXmin').val());
  let error = 'none';
  let yMin, yMax;
  if ($('#inputSPymin').val().match(/^-?[0-9]\d*(\.\d+)?$/) && $('#inputSPymax').val().match(/^-?[0-9]\d*(\.\d+)?$/)) {
    if ($('#inputSPymin').val() < $('#inputSPymax').val()){
      yMin = $('#inputSPymin').val();
      yMax = $('#inputSPymax').val();
      console.log('good');
      var update = {
        'yaxis.range': [yMin, yMax]   // updates the xaxis range
      };
      Plotly.relayout('spPlot', update)
    }
    else {
      console.log('Max needs to be greater than minimum.');
    }
  }
  else {
    console.log('Y max and min must be numbers.');
  }
});
document.getElementById('buttonVSWRyaxisUpdate').addEventListener('click', (e) => {
  //console.log($('#inputXmin').val());
  let error = 'none';
  let yMin, yMax;
  if ($('#inputVSWRymin').val().match(/^-?[0-9]\d*(\.\d+)?$/) && $('#inputVSWRymax').val().match(/^-?[0-9]\d*(\.\d+)?$/)) {
    if ($('#inputVSWRymin').val() < $('#inputVSWRymax').val()){
      yMin = $('#inputVSWRymin').val();
      yMax = $('#inputVSWRymax').val();
      console.log('good');
      var update = {
        'yaxis.range': [yMin, yMax]   // updates the xaxis range
      };
      Plotly.relayout('swrPlot', update)
    }
    else {
      console.log('Max needs to be greater than minimum.');
    }
  }
  else {
    console.log('Y max and min must be numbers.');
  }
});
document.getElementById('buttonMUyaxisUpdate').addEventListener('click', (e) => {
  //console.log($('#inputXmin').val());
  let error = 'none';
  let yMin, yMax;
  if ($('#inputMUymin').val().match(/^-?[0-9]\d*(\.\d+)?$/) && $('#inputMUymax').val().match(/^-?[0-9]\d*(\.\d+)?$/)) {
    if ($('#inputMUymin').val() < $('#inputMUymax').val()){
      yMin = $('#inputMUymin').val();
      yMax = $('#inputMUymax').val();
      console.log('good');
      var update = {
        'yaxis.range': [yMin, yMax]   // updates the xaxis range
      };
      Plotly.relayout('muPlot', update)
    }
    else {
      console.log('Max needs to be greater than minimum.');
    }
  }
  else {
    console.log('Y max and min must be numbers.');
  }
});
