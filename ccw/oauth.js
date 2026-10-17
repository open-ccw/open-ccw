({ state = '' }) => {
  return fetch(`https://sso.ccw.site/oauth/authorize?state=${state}`, {
    method: 'post',
    body: JSON.stringify({}),
    credentials: 'include',
  }).then((res) => res.json());
};
