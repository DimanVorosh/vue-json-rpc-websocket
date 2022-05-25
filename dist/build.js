!function(t,e){"object"==typeof exports&&"object"==typeof module?module.exports=e():"function"==typeof define&&define.amd?define([],e):"object"==typeof exports?exports["Vue-JSONRPC-WS"]=e():t["Vue-JSONRPC-WS"]=e()}(window,(function(){return function(t){var e={};function n(o){if(e[o])return e[o].exports;var i=e[o]={i:o,l:!1,exports:{}};return t[o].call(i.exports,i,i.exports,n),i.l=!0,i.exports}return n.m=t,n.c=e,n.d=function(t,e,o){n.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:o})},n.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},n.t=function(t,e){if(1&e&&(t=n(t)),8&e)return t;if(4&e&&"object"==typeof t&&t&&t.__esModule)return t;var o=Object.create(null);if(n.r(o),Object.defineProperty(o,"default",{enumerable:!0,value:t}),2&e&&"string"!=typeof t)for(var i in t)n.d(o,i,function(e){return t[e]}.bind(null,i));return o},n.n=function(t){var e=t&&t.__esModule?function(){return t.default}:function(){return t};return n.d(e,"a",e),e},n.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},n.p="",n(n.s=0)}([function(t,e,n){"use strict";var o;n.r(e);var i=new Uint8Array(16);function s(){if(!o&&!(o="undefined"!=typeof crypto&&crypto.getRandomValues&&crypto.getRandomValues.bind(crypto)||"undefined"!=typeof msCrypto&&"function"==typeof msCrypto.getRandomValues&&msCrypto.getRandomValues.bind(msCrypto)))throw new Error("crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported");return o(i)}var r=/^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000)$/i;for(var c=function(t){return"string"==typeof t&&r.test(t)},a=[],u=0;u<256;++u)a.push((u+256).toString(16).substr(1));var f=function(t){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:0,n=(a[t[e+0]]+a[t[e+1]]+a[t[e+2]]+a[t[e+3]]+"-"+a[t[e+4]]+a[t[e+5]]+"-"+a[t[e+6]]+a[t[e+7]]+"-"+a[t[e+8]]+a[t[e+9]]+"-"+a[t[e+10]]+a[t[e+11]]+a[t[e+12]]+a[t[e+13]]+a[t[e+14]]+a[t[e+15]]).toLowerCase();if(!c(n))throw TypeError("Stringified UUID is invalid");return n};var l=function(t,e,n){var o=(t=t||{}).random||(t.rng||s)();if(o[6]=15&o[6]|64,o[8]=63&o[8]|128,e){n=n||0;for(var i=0;i<16;++i)e[n+i]=o[i];return e}return f(o)};class d{constructor(t,e){this.instance=null,this.url=t,e=e||{},this.options=Object.assign(this.defaultOptions(),e),this.options&&(e.reconnectEnabled&&(this.reconnectEnabled=e.reconnectEnabled,this.reconnectEnabled&&(this.reconnectInterval=e.reconnectInterval,this.reconnectAttempts=e.recconectAttempts,this.reconnectCount=1)),e.store&&(this.store=e.store),e.eventAfterMutation&&(this.eventAfterMutation=e.eventAfterMutation),e.commitOnNotification&&(this.commitOnNotification=e.commitOnNotification),e.notificationIdField&&(this.notificationIdField=e.notificationIdField),e.uuid&&(this.uuid=e.uuid)),this.beforeConnected=[],this.wsData=[],this.onOpen=null,this.onMessage=null,this.onClose=null,this.onError=null}createMessage(t,e,n){let o={jsonrpc:"2.0",method:t,params:e,id:n};return JSON.stringify(o)}defaultOptions(){return{reconnectEnabled:!1,reconnectInterval:0,recconectAttempts:0,eventAfterMutation:!0,commitOnNotification:!0,notificationIdField:"request_id",uuid:!1,store:null}}passToStore(t,e){if(!t.startsWith("socket_"))return;let n=t,o=e;e.data&&(o=JSON.parse(e.data)),this.store.commit(n,o)}connect(){this.instance=new WebSocket(this.url),this.instance.onopen=()=>{this.beforeConnected.forEach(t=>this.instance.send(t)),this.beforeConnected=[],this.reconnectEnabled&&(this.reconnectCount=1),"function"==typeof this.onOpen&&this.onOpen(),this.store&&this.passToStore("socket_on_open",event)},this.instance.onmessage=t=>{let e=JSON.parse(t.data);if(this.store){let t=this.wsData.filter(t=>!(!e.hasOwnProperty("id")||(console.log("it's a reply",e),t.id!=e.id))||!(e.hasOwnProperty("id")||(console.log("it's a notification",e,this.commitOnNotification,this.notificationIdField),!(this.commitOnNotification&&e.hasOwnProperty("params")&&e.params.hasOwnProperty(this.notificationIdField))))&&(console.log(t.id,e.params[this.notificationIdField]),t.id==e.params[this.notificationIdField]))[0];t&&this.store.commit(t.mutation,e.result?e.result:e.params),this.passToStore("socket_on_message",e)}!this.eventAfterMutation&&this.store||"function"==typeof this.onMessage&&this.onMessage(e)},this.instance.onclose=t=>{"function"==typeof this.onClose?this.onClose(t):this.store&&this.passToStore("socket_on_close",t),!t.wasClean&&this.reconnectEnabled&&this.reconnect()},this.instance.onerror=t=>{"function"==typeof this.onError?this.onError(t):this.store&&this.passToStore("socket_on_error",t)}}reconnect(){this.reconnectCount<=this.reconnectAttempts?(this.reconnectCount++,delete this.instance,setTimeout(()=>{this.connect(),this.store&&this.passToStore("socket_reconnect",this.reconnectCount)},this.reconnectInterval)):this.store&&this.passToStore("socket_reconnect_error",!0)}sendData(t,e,n=null){let o=this.uuid?l():(new Date).getTime()+""+Math.floor(89999*Math.random()+1e4);n&&this.wsData.push({id:o,mutation:n});const i=this.createMessage(t,e,o);this.instance.readyState===WebSocket.OPEN?this.instance.send(i):this.beforeConnected.push(i)}}e.default={install(t,e,n){const o=new d(e,n);o.connect(),t.prototype.$socket=o}}}])}));