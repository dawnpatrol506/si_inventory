
const signIn = {
    signIn: function () {
        const provider = new firebase.auth.GoogleAuthProvider();
        firebase.auth().signInWithPopup(provider).then(result => {
            user = result.user.displayName;
            $('#sign-in').attr('style', 'display:none');
            $('#nav-area').attr('style', '');
            $('#main-container').attr('style', '');
        }).catch(err => {
            if (err) throw err;
        })
    }
}

module.exports = signIn;