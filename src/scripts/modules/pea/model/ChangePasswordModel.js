export default Backbone.Model.extend({

	defaults: {
		username: '',
		oldPassword: '',
		newPassword: '',
		confirmPassword: ''
	},

	resetAllPasswords: function() {
		this.set('oldPassword','', {"silent":true});
		this.set('newPassword','', {"silent":true});
		this.set('confirmPassword','', {"silent":true});
	},

	resetNewFields: function() {
		this.set('newPassword','', {"silent":true});
		this.set('confirmPassword','', {"silent":true});
	}

});

