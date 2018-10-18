
const signIn = {
    signIn: function () {
        const provider = new firebase.auth.GoogleAuthProvider();
        firebase.auth().signInWithPopup(provider).then(result => {
            
            $('#sign-in').attr('style', 'display:none');
            $('#nav-area').attr('style', '');
            $('#main-container').attr('style', '');
            return result.user.displayName;
        }).catch(err => {
            if (err) throw err;
        })
    }
}

module.exports = signIn;