const gui = require('gui')
const keytar = require('keytar')

// const {WebClient} = require('@slack/client')

const Service = require('../../model/service')
const TeamsAccount = require('./teams-account')
const { awaitAuthorization, AUTH_URI } = require('./teams-auth-helper');

const FETCH_BUTTON_TEXT = 'Fetch tokens from official Teams app'

class TeamsService extends Service {
  constructor() {
    super('teams', 'Teams')
  }

  login() {
    if (this.loginWindow) {
      this.loginWindow.activate()
      return
    }
    this.createLoginWindow()
    this.loginWindow.center()
    this.loginWindow.activate()
  }

  createAccount(id, name, token) {
    return new TeamsAccount(this, id, name, token)
  }

  async loginWithToken(token, button) {
    // // Set loading information.
    // if (button) {
    //   button.setTitle("Loading...")
    //   button.setEnabled(false)
    // } else {
    //   this.loginWindow.setContentView(gui.Label.create('Loading...'))
    // }
    // try {
    //   // Test the token.
    //   const client = new WebClient(token)
    //   const data = await client.auth.test()
    //   this.createAccount(data.team_id, data.team, token)
    //   // Succeeded.
    //   if (button) {
    //     this.loginWindow.getContentView().removeChildView(button)
    //     this.adujstLoginWindowSize()
    //   } else {
    //     this.loginWindow.close()
    //   }
    // } catch (e) {
    //   // Report error.
    //   const message = e.message.startsWith('An API error occurred: ') ?  e.message.substr(23) : e.message
    //   if (button) {
    //     button.setEnabled(true)
    //     button.setTitle(`Retry (${message})`)
    //   } else {
    //     this.loginWindow.setContentView(gui.Label.create(message))
    //   }
    // }
  }

  createLoginWindow() {
    this.loginWindow = gui.Window.create({})
    this.loginWindow.setTitle('Login to Microsoft Teams')
    this.loginWindow.onClose = () => this.loginWindow = null

    const contentView = gui.Container.create()
    contentView.setStyle({ padding: 10 })
    this.loginWindow.setContentView(contentView)

    /* hide Workspace row
    const row1 = this.createRow(contentView)
    const label11 = gui.Label.create('Workspace')
    row1.addChildView(label11)
    const labelWidth = label11.getBounds().width + 5
    label11.setAlign('start')
    label11.setStyle({minWidth: labelWidth})
    const teamInput = gui.Entry.create()
    teamInput.setStyle({flex: 1})
    row1.addChildView(teamInput)
    const label12 = gui.Label.create('.slack.com')
    row1.addChildView(label12)
    */
    const teamInput = gui.Entry.create()
    teamInput.setStyle({ flex: 1 })
    const row2 = this.createRow(contentView)
    const label21 = gui.Label.create('E-mail')
    row2.addChildView(label21)

    const labelWidth = label21.getBounds().width + 19
    label21.setAlign('start')

    label21.setStyle({ minWidth: labelWidth })

    const emailInput = gui.Entry.create()
    emailInput.setStyle({ flex: 1 })
    row2.addChildView(emailInput)

    const row3 = this.createRow(contentView)
    const label31 = gui.Label.create('Password')
    label31.setAlign('start')
    label31.setStyle({ minWidth: labelWidth })
    row3.addChildView(label31)
    const passInput = gui.Entry.createType('password')
    passInput.setStyle({ flex: 1 })
    row3.addChildView(passInput)

    const loginButton = gui.Button.create('Login')
    loginButton.setStyle({ marginBottom: 10 })
    loginButton.onClick = this.exchangeToken.bind(this, teamInput, emailInput, passInput)
    passInput.onActivate = this.exchangeToken.bind(this, teamInput, emailInput, passInput, loginButton)
    contentView.addChildView(loginButton)

    /* contentView.addChildView(gui.Label.create('----------- OR -----------'))
    const fetchButton = gui.Button.create(FETCH_BUTTON_TEXT)
    fetchButton.setStyle({ marginTop: 10 })
    fetchButton.onClick = this.fetchSlackTokens.bind(this)
    contentView.addChildView(fetchButton) */

    this.adujstLoginWindowSize()
  }

  adujstLoginWindowSize() {
    this.loginWindow.setContentSize({
      width: 400,
      height: this.loginWindow.getContentView().getPreferredHeightForWidth(400),
    })
  }

  createRow(contentView) {
    const row = gui.Container.create()
    row.setStyle({ flexDirection: 'row', marginBottom: 5 })
    contentView.addChildView(row)
    return row
  }

  async exchangeToken(teamInput, emailInput, passInput, loginButton) {

    console.log(emailInput.getText())
    const fieldsValid = [emailInput, passInput].every(entry => entry.getText() !== "")

    if (fieldsValid) {
      this.win = gui.Window.create({})
      this.win.setTitle('MSAL Flow')
      // this.win.setResizable(false)
      // this.win.setMovable(false)
      // this.win.setMaximizable(false)

      let browserWin = gui.Browser.create({ devtools: true, contextMenu: true });
      browserWin.setUserAgent('Node.js/' + process.version.slice(1)
        + ' (' + require('os-name')() + '; ' + process.arch + ')')
      console.log('Node.js/' + process.version.slice(1)
        + ' (' + require('os-name')() + '; ' + process.arch + ')')
      console.log(AUTH_URI)
      browserWin.loadURL("https://twitter.com")

      this.win.setContentView(browserWin)

      this.win.setBounds({ x: 0, y: 0, width: 400, height: 400 })

      this.win.center();
      this.win.onClose = () => { browserWin = this.win = null }
      this.win.activate();

      let authCode;
      awaitAuthorization(browserWin).then(code => authCode = code).then(code => console.log(code));
    }

    // https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=55a80a30-eea6-455a-929e-2e1a7b6cf8f3&response_type=code&redirect_uri=http%3A%2F%2Flocalhost%2Fmyapp%2F&response_mode=query&scope=https%3A%2F%2Fgraph.microsoft.com%2Fcalendars.read%20https%3A%2F%2Fgraph.microsoft.com%2Fmail.send&state=12345

    // loginButton.setEnabled(false)
    // loginButton.setTitle('Loading...')
    // const client = new WebClient()
    // require('./private-apis').extend(client)
    // try {
    //   const {team_id} = await client.auth.findTeam({domain: teamInput.getText()})
    //   const {token} = await client.auth.signin({
    //     email: emailInput.getText(),
    //     password: passInput.getText(),
    //     team: team_id,
    //   })
    //   this.loginWithToken(token)
    // } catch (e) {
    //   const message = e.message.startsWith('An API error occurred: ') ?  e.message.substr(23) : e.message
    //   loginButton.setEnabled(true)
    //   loginButton.setTitle(`Retry (${message})`)
    // }
  }
}

module.exports = new TeamsService
