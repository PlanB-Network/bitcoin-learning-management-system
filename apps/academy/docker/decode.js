const decode = (str) => decodeURIComponent(atob(str));

export default {
  desc: (r) => decode(r.variables.desc64),
  title: (r) => decode(r.variables.title64),
};
