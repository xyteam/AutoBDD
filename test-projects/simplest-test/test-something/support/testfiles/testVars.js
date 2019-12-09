const All = {
  root_path: '/',
  logo_id: '#logo',
  logo_imageName: 'chromeLogo',
  logo_imageText: 'chrome'
};

const CH = {
};

const IE = {
};

// The properties are overwritten by other objects that have the same properties later in the parameters order
module.exports = Object.assign(All, eval(process.env.BROWSER));

