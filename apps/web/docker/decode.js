const decode = (str) => decodeURIComponent(atob(str));

export default {
  title: (r) => decode(r.variables.title64),
  desc: (r) => decode(r.variables.desc64),
};
