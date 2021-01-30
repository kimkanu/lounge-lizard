const axios = require('axios')
const config = {
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
    }
}
const { client_id, client_secret, auth_uri, scope } = require('./secrets.json')

module.exports.authenticate = async (userName, password) => {
    const body = new URLSearchParams()

    body.append('client_id', client_id)
    body.append('client_secret', client_secret)
    body.append('scope', scope)
    body.append('grant_type', 'password')
    body.append('userName', userName)
    body.append('password', password)

    const { data } = await axios.post(auth_uri, body, config);
    return data.access_token
}