const All = {
  texted_button: 'button=__TEXT__'
};

const CH = {
  texted_modalDialog: '//*[@class="modal-dialog" and //*[text()="__TEXT__"]]',
  texted_label: '//label[contains(text(), "__TEXT__")]'
};

const IE = {
  texted_modalDialog: '//*[@class="modal-dialog" and //*[text()="__TEXT__"]]',
  texted_label: '//label[contains(text(), "__TEXT__")]'
};

// The properties are overwritten by other objects that have the same properties later in the parameters order
module.exports = Object.assign(All, eval(process.env.BROWSER));
