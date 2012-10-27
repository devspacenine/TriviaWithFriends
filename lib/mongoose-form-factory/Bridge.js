function Bridge(model, form) {

  var bridge = {
    setModel: function(_model) {
      model = _model;
    },
    setForm: function(_form) {
      form = _form;
    },
    getForm: function() {
      
      form.eachMappedField(function(field, path) {
        field.value = model[path]; 
      });

      return form;
    },
    getModel: function() {
      
      form.eachMappedField(function(field, path) {      
        model[path] = field.value;
      });

      return model;
    }
  };

  return bridge;
}

exports.Bridge = Bridge;