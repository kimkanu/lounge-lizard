const { AUTH_URI } = require('./application-registration.json')

module.exports.awaitAuthorization = (browserWin) => {
    return new Promise(resolve => {
        const interval = setInterval(() => {
            // console.log(browserWin.getURL())
            if (browserWin.getURL().includes("http://localhost/loungelizard/?code=")) {
                // success
                clearInterval(interval);
                console.log('url pre-split', browserWin.getURL())
                // console.log('URL after', browserWin.getURL().split('?'))
                resolve(new URLSearchParams('?' + browserWin.getURL().split('?')[1]).get('code'));
            }
        }, 250)
    })

}

String.prototype.containsAll = function (patterns) {
    return patterns.every(pattern => {
        console.log('WHAT IS THIS?', this)
        return this.includes(pattern)
    })
}

module.exports.AUTH_URI = AUTH_URI