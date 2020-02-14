# vue-json-rpc-websocket
JSON-RPC Websocket client for VueJS with Vuex integration

## Install

```
npm install vue-json-rpc-websocket --save
```

## Basic Usage

In the Vue app entry file `main.js`
```js
import JRPCWS from 'vue-json-rpc-websocket'

Vue.use(JRPCWS, 'wss://echo.websocket.org')
```

## Enable Reconnection
In the Vue app entry file `main.js`
```js
Vue.use(JRPCWS, 'wss://echo.websocket.org', {
  reconnectEnabled: true,
  reconnectInterval: 5000,
  recconectAttempts: 3
})
```

## Enable Vuex integration:

``` js
import store from './store'
Vue.use(JRPCWS, 'wss://echo.websocket.org', { store: store })
```

## Usage in Vue components

The plugin adds a `$socket` to your Vue instance.

In your components, you can handle websocket events by setting them up in the `created` or `mounted` hook.
- `onOpen` — event when socket is connected
- `onMessage` — event when socket receives a message from server
   (you don't need to use JSON.parse, data is already given in a form that is easy to use)
- `onClose` — event when socket is closed normally
- `onError` — event when socket is closed with error

```js
// Component.vue
export default {
  name: 'Component',
  //
  created () {
    this.$socket.onOpen = () => {
      console.log('socket connected')
    }
    this.$socket.onMessage = (msg) => {
      console.log(msg)
    }
    this.$socket.onClose = (msg) => {
      console.log('socket closed')
    }
    this.$socket.onError = (msg) => {
      console.log('socket error')
    }
  }
}
```

## Sending messages

`sendObj`

```js
this.$socketClient.sendObj(method, params, action)
```

### Example
```js
this.$socketClient.sendObj('example', { hello: 'world' }, 'getHelloWorld')
```
Vuex module with example action:

```js
export default {

  state: {
    data: []
  },

  mutations: {
    setData (state, data) {
      state.data.push(data)
    }
  },

  actions: {
    getHelloWorld ({ commit }, data) {
      commit('setData', data)
    }
  }
}
```

In your component you will see the data:
```js
<template>
  <div>
    <p>Test data: {{ wsData }}</p>
  </div>
</template>

<script>
export default {
  name: 'App',

  created () {
    this.$socket.onOpen = () => this.$socket.sendObj('example', { hello: 'world' }, 'getHelloWorld')
  },

  computed: {
    wsData () {
      return this.$store.state.wsData.data
    }
  }
}
</script>
```

## Vuex Store integration

```js
import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    socket: {
      isConnected: false
    }
  },

  mutations: {
    setConnected (state) {
      state.socket.isConnected = true
    },

    setDisconnected (state) {
      state.socket.isConnected = false
    }
  },

  actions: {
    socket_on_open ({ state, commit }, event) {
      commit('setConnected')
      console.log('Socket connected')
    },

    socket_on_close ({ commit }, event) {
      commit('setDisconnected')
      if (event.wasClean) {
        console.log('Socket closed clear')
      } else {
        console.error('Connection failure')
      }
      console.error('Code: ' + event.code + ' причина: ' + event.reason)
    },

    socket_on_error ({ commit }, event) {
      console.error("Error: " + event.message)
    },

    socket_on_message ({ commit }, message) {
      console.log('Data received:  + message.result)
    },

    socket_reconnect ({ commit }, count) {
      console.log(count)
    },

    socket_reconnect_error ({ commit }) {
      console.error('Socket disconnected')
    }
  }
}

```
