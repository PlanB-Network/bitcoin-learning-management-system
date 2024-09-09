export default {
  title(r) {
    return atob(r.variables.title64);
  },
  desc(r) {
    return atob(r.variables.desc64);
  },
};
