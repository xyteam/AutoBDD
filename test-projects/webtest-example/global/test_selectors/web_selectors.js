const All = {
  select: '//select',
  select_option: '//select/option'
};

const CH = {
};

const IE = {
};

// The properties are overwritten by other objects that have the same properties later in the parameters order
module.exports = Object.assign(All, eval(process.env.BROWSER));
