const All = {
  texted_button: 'button=__TEXT__',
  texted_label: 'label=__TEXT__',
  texted_modalDialog: '//*[@class="modal-dialog" and //*[text()="__TEXT__"]]',
  texted_option: 'option=__TEXT__',
};

const CH = {
};

const IE = {
};

// The properties are overwritten by other objects that have the same properties later in the parameters order
module.exports = Object.assign(All, eval(process.env.BROWSER));
