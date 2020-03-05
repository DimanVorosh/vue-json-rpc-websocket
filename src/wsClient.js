export default class WebSocketClient {
  constructor (url, options) {
    this.instance = null
    this.url = url
    this.options = options || this.defaultOptions()
    if (this.options) {
      if (options.reconnectEnabled) {
        this.reconnectEnabled = options.reconnectEnabled
        if (this.reconnectEnabled) {
          this.reconnectInterval = options.reconnectInterval
          this.reconnectAttempts = options.recconectAttempts
          this.reconnectCount = 1
        }
      }
      if (options.store) {
        this.store = options.store
      }
    }

    this.wsData = []
    this.methodsData = []

    this.onOpen = null
    this.onMessage = null
    this.onClose = null
    this.onError = null
  }

  createMessage (method, params, id) {
    let msg = {
      jsonrpc: '2.0', method: method, params: params, id: id
    }
    return JSON.stringify(msg)
  }

  defaultOptions () {
    return {
      reconnectEnabled: false,
      reconnectInterval: 0,
      recconectAttempts: 0,
      store: null
    }
  }

  passToStore (eventName, event) {
    if (!eventName.startsWith('socket_')) { return }
    let method = 'commit'
    let target = eventName
    let msg = event
    if (event.data) {
      msg = JSON.parse(event.data)
    }
    this.store[method](target, msg)
  }

  connect () {
    this.instance = new WebSocket(this.url)

    this.instance.onopen = () => {
      if (this.reconnectEnabled) {
        this.reconnectCount = 1
      }
      if (typeof this.onOpen === 'function') {
        this.onOpen()
      }
      if (this.store) this.passToStore('socket_on_open', event)
    }

    this.instance.onmessage = (msg) => {
      let data = JSON.parse(msg.data)
      if (typeof this.onMessage === 'function') {
        this.onMessage(data)
      } else if (this.store) {
        let current = null
        if (msg.id !== 0) {
          current = this.wsData.filter(item => item.id === data.id)[0]
        } else {
          current = this.methodsData.filter(item => item.method === msg.method)
        }
        if (current) {
          this.store.commit(
            current.mutation,
            data.result
          )
        }
        this.passToStore('socket_on_message', data)
      }
    }

    this.instance.onclose = (e) => {
      if (typeof this.onClose === 'function') {
        this.onClose(e)
      } else if (this.store) {
        this.passToStore('socket_on_close', e)
      }
      if (!e.wasClean && this.reconnectEnabled) {
        this.reconnect()
      }
    }

    this.instance.onerror = (e) => {
      if (typeof this.onError === 'function') {
        this.onError(e)
      } else if (this.store) {
        this.passToStore('socket_on_error', e)
      }
    }
  }

  reconnect () {
    if (this.reconnectCount <= this.reconnectAttempts) {
      this.reconnectCount++
      delete this.instance
      setTimeout(() => {
        this.connect()
        if (this.store) { this.passToStore('socket_reconnect', this.reconnectCount) }
      }, this.reconnectInterval)
    } else {
      if (this.store) { this.passToStore('socket_reconnect_error', true) }
    }
  }

  sendData (method, params, mutation = null) {
    let id = Math.floor(Math.random() * 10000) + 1
    if (mutation) {
      this.wsData.push({
        id: id,
        mutation: mutation
      })
    }
    this.instance.send(this.createMessage(method, params, id))
  }

  sendToClient (method, params, mutation = null) {
    let id = Math.floor(Math.random() * 10000) + 1
    if (mutation) {
      this.methodsData.push({
        method: method,
        mutation: mutation
      })
    }
    this.instance.send(this.createMessage(method, params, id))
  }
}
