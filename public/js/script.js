// public/js/script.js
document.addEventListener('DOMContentLoaded', () => {
  const locale = getLocale();

  // Localize text content
  document.title = locale.title;
  document.getElementById('title').textContent = locale.title;
  document.querySelector('meta[name="description"]').setAttribute('content', locale.description);
  document.querySelector('meta[property="og:title"]').setAttribute('content', locale.title);
  document.querySelector('meta[property="og:description"]').setAttribute('content', locale.description);
  document.getElementById('uploadBtn').textContent = locale.upload;
  document.getElementById('rulesLink').textContent = locale.rules;
  document.getElementById('adminPanelLink').textContent = locale.admin_panel;
  document.getElementById('cancelBtn').textContent = locale.cancel_upload;

  let xhr; // Declare xhr globally so we can abort it

  document.getElementById('uploadBtn').addEventListener('click', () => {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];

    if (!file) return alert(locale.please_select_file);

    const formData = new FormData();
    formData.append('file', file);

    xhr = new XMLHttpRequest();

    xhr.open('POST', '/upload', true);

    const startTime = new Date();

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percentComplete = ((event.loaded / event.total) * 100).toFixed(2);
        document.getElementById('progressBar').value = percentComplete;

        const mbUploaded = (event.loaded / (1024 * 1024)).toFixed(2);
        const mbTotal = (event.total / (1024 * 1024)).toFixed(2);
        const timeElapsed = (new Date() - startTime) / 1000; // in seconds
        const uploadSpeed = (event.loaded / (1024 * 1024)) / timeElapsed; // in MB/sec
        const timeRemaining = ((event.total - event.loaded) / (event.loaded / timeElapsed)) || 0; // in seconds

        // Update progress text
        document.getElementById('progressStatus').textContent = locale.upload_progress
          .replace('{mbUploaded}', mbUploaded)
          .replace('{mbTotal}', mbTotal)
          .replace('{percent}', percentComplete);

        // Update speed text
        document.getElementById('speedStatus').textContent = locale.upload_speed
          .replace('{mbPerSec}', uploadSpeed.toFixed(2));

        // Update time remaining text
        document.getElementById('timeStatus').textContent = locale.time_remaining
          .replace('{timeRemaining}', timeRemaining.toFixed(2));
      }
    };

    xhr.onload = () => {
      if (xhr.status === 200) {
        const response = JSON.parse(xhr.responseText);
        window.location.href = response.link;
      } else {
        alert(locale.upload_failed);
      }
    };

    xhr.onerror = () => {
      alert(locale.upload_failed);
    };

    xhr.onabort = () => {
      alert(locale.upload_canceled);
      resetProgress();
    };

    document.getElementById('cancelBtn').addEventListener('click', () => {
      if (xhr) {
        xhr.abort();
      }
    });

    document.getElementById('progressContainer').style.display = 'block';
    xhr.send(formData);
  });

  function resetProgress() {
    document.getElementById('progressContainer').style.display = 'none';
    document.getElementById('progressBar').value = 0;
    document.getElementById('progressStatus').textContent = '';
    document.getElementById('speedStatus').textContent = '';
    document.getElementById('timeStatus').textContent = '';
  }

  function getLocale() {
    const languages = navigator.languages || [navigator.language || navigator.userLanguage];
    const lang = languages[0].split('-')[0];
    let localeData = null;

    const xhrLocale = new XMLHttpRequest();
    xhrLocale.open('GET', `/locales/${lang}.json`, false);
    xhrLocale.onload = () => {
      if (xhrLocale.status === 200) {
        localeData = JSON.parse(xhrLocale.responseText);
      } else {
        xhrLocale.open('GET', '/locales/en.json', false);
        xhrLocale.send();
        if (xhrLocale.status === 200) {
          localeData = JSON.parse(xhrLocale.responseText);
        }
      }
    };
    xhrLocale.send();
    return localeData;
  }
});
