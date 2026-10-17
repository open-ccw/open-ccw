({ url, code }) => {
  window.location.href = String(url).replace('{code}', encodeURIComponent(code));
  setTimeout(() => {
    window.close();
  }, 3000);
};
