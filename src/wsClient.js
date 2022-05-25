import { v4 as UUIDv4 } from 'uuid'

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
      if (options.eventAfterMutation) {
        this.eventAfterMutation = options.eventAfterMutation
      }
      if (options.commitOnNotification) {
        this.commitOnNotification = options.commitOnNotification
      }
      if (options.notificationIdField) {
        this.notificationIdField = options.notificationIdField
      }      
      if (options.uuid) {
        this.uuid = options.uuid
      }
    }

    this.beforeConnected = []
    this.wsData = []

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
      eventAfterMutation: true,
      commitOnNotification: true,
      notificationIdField: 'request-id',
      uuid: false,
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
      this.beforeConnected.forEach(message => this.instance.send(message))
      this.beforeConnected = []

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

      // Call the store mutation, if any
      if (this.store) {
        let current = this.wsData.filter(item => {
          console.log('parsing item, data',item,data);
          // It's a stadard reply (id passed back)
          if ( data.hasOwnProperty('id') ) {
            console.log('id from data ',data.id)
            if ( item.id == data.id ) {
              return true
            }
          }
          
          // It's a notification (no id passed back)
          if ( !data.hasOwnProperty('id') ) {
            if ( this.commitOnNotification && data.hasOwnProperty('params') && data.params.hasOwnProperty(this.notificationIdField) ) {
              return item.id == data.params[this.notificationIdField]
            }
          }

          return false;
        })[0]

        if (current) {
          this.store.commit(
            current.mutation,
            data.result ? data.result : data.params
          )
        }

        this.passToStore('socket_on_message', data)
      }

      // store not available OR even after mutation set to true, let's try to trigger the onMessage event
      if ( this.eventAfterMutation || !this.store ) {
        if (typeof this.onMessage === 'function') {
          this.onMessage(data)
        }
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
    // If we have Crypto, we use an UUIDv4
    let id = this.uuid ? UUIDv4() : (new Date).getTime() + '' + Math.floor(Math.random() * (99999 - 10000) + 10000)

    if (mutation) {
      this.wsData.push({
        id: id,
        mutation: mutation
      })
    }

    const message = this.createMessage(method, params, id)
    if (this.instance.readyState === WebSocket.OPEN) {
      this.instance.send(message)
    } else {
      this.beforeConnected.push(message)
    }
  }
}
