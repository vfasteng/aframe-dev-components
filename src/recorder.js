module.exports = {
  init: function () {

    var scene = this.el.sceneEl
    var framerate = 5;
    var chunks = [];
    this.recording = false;

    this.getSceneCanvas = new Promise(function (resolve) {
      if (scene.loaded) {
        resolve(scene.canvas);
      }
      scene.addEventListener('loaded', function () {
        resolve(scene.canvas);
      });
    });
    this.getSceneCanvas.then(this.setupRecorder)
  },

  setupRecorder: function (canvas) {
    var videoData = [];
    var recording = false;
    var framerate = 25;
    var stream = canvas.captureStream(framerate);
    var recorder = new MediaRecorder(stream);
    recorder.ondataavailable = handleDataAvailable;

    function handleDataAvailable(e) {
      if (e.data.size > 0) {
        videoData.push(e.data);

        // download chunks
        var blob = new Blob(videoData, {
          type: 'video/webm'
        });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        document.body.appendChild(a);
        a.style = 'display: none';
        a.href = url;
        a.download = 'a-recording.webm';
        a.click();
        window.URL.revokeObjectURL(url);
      }
    }

    var recordButton = document.createElement('button');
    recordButton.innerHTML = 'Record';
    recordButton.style.position = 'absolute';
    recordButton.style.left = '0px';
    recordButton.style.top = '0px';
    recordButton.style.zIndex = '100';
    document.body.appendChild(recordButton)
    recordButton.addEventListener('click', function () {
      toggleRecorder();
    })

    var div = document.createElement('div');
    div.style.fontFamily = 'Helvetica, Arial, Sans-Serif';
    div.style.padding = '10px';
    div.style.color = 'white';
    div.style.position = 'absolute';
    div.style.top = '20px';
    div.style.left = '0px';
    div.style.background = 'black';
    div.style.visibility = 'hidden';

    window.addEventListener('keydown', function(e) {
      if(e.key === 'r') {
        toggleRecorder();
      }
    });
    
    function toggleRecorder() {
      if (!recording) {
        startRecorder();
      } else {
        stopRecorder();
      }

      recording = (recording) ? false : true;
    }

    function startRecorder() {
      recorder.start();
      document.body.appendChild(div);
      div.style.visibility = 'visible';
      div.innerHTML = 'Recording</br>Press `R` to end.';
      recordButton.innerHTML = 'Stop';
    }

    function stopRecorder() {
      recorder.stop();
      div.innerHTML = 'Finished!';
      setTimeout(function () {
        div.style.visibility = 'hidden';
      }, 2000)

      recordButton.innerHTML = 'Record';
    }
  }
};