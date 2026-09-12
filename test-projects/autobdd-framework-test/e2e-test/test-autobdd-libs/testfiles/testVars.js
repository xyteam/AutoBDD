const All = {
  logo_id: '#logo',
  logo_imageName: 'chromeLogo',
  logo_imageText: 'chrome'
};

const CH = {
};

const IE = {
};

// Variables have the same name will override the previous variable of the same name up to this point.
// Variables defined in browser specific group (CH, IE) will override the same variable defined in All group.

module.exports = Object.assign(All, eval(process.env.BROWSER));

