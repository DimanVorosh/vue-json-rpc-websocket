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

`sendData`

```js
this.$socket.sendData(method, params, action)
```

### Example
```js
this.$socket.sendData('example', { hello: 'world' }, 'setData')
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
    this.$socket.onOpen = () => this.$socket.sendData('example', { hello: 'world' }, 'setData')
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
    socket_on_open ({ state, commit }, event) {
      state.socket.isConnected = true
      console.log('Socket connected')
    },

    socket_on_close ({ commit }, event) {
      state.socket.isConnected = false
      if (event.wasClean) {
        console.log('Socket closed clear')
      } else {
        console.error('Connection failure')
      }
      console.error('Code: ' + event.code)
    },

    socket_on_error ({ commit }, event) {
      console.error('Error')
    },

    socket_on_message ({ commit }, message) {
      console.log(message)
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

## Commit mutations on notification

You can support multiple notification coming from the server as reply to a request.
Main difference between a reply and a notification is that the reply ends the request,
all request must have up to one reply. Supporting notifications, you can send a request
for a long running task and listen back for notification about status updates and every
notification commit a mutation (the same set with the first request).

In example, the following request sent to the server:
```js
{
  "jsonrpc": "2.0",
  "id": "01c19272-a5c7-4f07-904e-47a15b8df8c7",
  "method": "very.long.command"
}
```

ask the server to run a `very.long.command`. The server could reply with multiple notifications, like these:
```js
{
  "jsonrpc": "2.0",
  "method": "very.long.command/progress",
  "params": {
    "request_id": "01c19272-a5c7-4f07-904e-47a15b8df8c7",
    "progress": {
      "elapsed": "10%",
      "remaining": "90%" 
    }
  }
}
```
lack of `id` field means that this is a notification. Inside the `params` we have a `request-id` field with the original request id made by the client.
The plugin is smart enough to match the ID with the mutation bound to the first request and commit that.

There isn't any official standard for this kind of notification, it's up to the server and to the client agree something in common.
The plugin allows to customize the field name used to match the id, as long it's placed inside `params` node and the response is a notification (no `id` set)