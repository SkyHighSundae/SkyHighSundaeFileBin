document.addEventListener('DOMContentLoaded', () => {
  const locale = getLocale();
  document.title = locale.title;
  document.getElementById('title').textContent = locale.title;
  document.getElementById('bannedMessage').textContent = locale.banned_message;

  function getLocale() {
    const languages = navigator.languages || [navigator.language || navigator.userLanguage];
    const lang = languages[0].split('-')[0];
    let localeData = null;

    const xhr = new XMLHttpRequest();
    xhr.open('GET', `locales/${lang}.json`, false);
    xhr.onload = () => {
      if (xhr.status === 200) {
        localeData = JSON.parse(xhr.responseText);
      } else {
        xhr.open('GET', 'locales/en.json', false);
        xhr.send();
        if (xhr.status === 200) {
          localeData = JSON.parse(xhr.responseText);
        }
      }
    };
    xhr.send();
    return localeData;
  }
});
