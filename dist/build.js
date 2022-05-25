!function(t,e){"object"==typeof exports&&"object"==typeof module?module.exports=e():"function"==typeof define&&define.amd?define([],e):"object"==typeof exports?exports["Vue-JSONRPC-WS"]=e():t["Vue-JSONRPC-WS"]=e()}(window,(function(){return function(t){var e={};function n(o){if(e[o])return e[o].exports;var s=e[o]={i:o,l:!1,exports:{}};return t[o].call(s.exports,s,s.exports,n),s.l=!0,s.exports}return n.m=t,n.c=e,n.d=function(t,e,o){n.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:o})},n.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},n.t=function(t,e){if(1&e&&(t=n(t)),8&e)return t;if(4&e&&"object"==typeof t&&t&&t.__esModule)return t;var o=Object.create(null);if(n.r(o),Object.defineProperty(o,"default",{enumerable:!0,value:t}),2&e&&"string"!=typeof t)for(var s in t)n.d(o,s,function(e){return t[e]}.bind(null,s));return o},n.n=function(t){var e=t&&t.__esModule?function(){return t.default}:function(){return t};return n.d(e,"a",e),e},n.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},n.p="",n(n.s=0)}([function(t,e,n){"use strict";var o;n.r(e);var s=new Uint8Array(16);function i(){if(!o&&!(o="undefined"!=typeof crypto&&crypto.getRandomValues&&crypto.getRandomValues.bind(crypto)||"undefined"!=typeof msCrypto&&"function"==typeof msCrypto.getRandomValues&&msCrypto.getRandomValues.bind(msCrypto)))throw new Error("crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported");return o(s)}var r=/^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000)$/i;for(var a=function(t){return"string"==typeof t&&r.test(t)},c=[],u=0;u<256;++u)c.push((u+256).toString(16).substr(1));var l=function(t){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:0,n=(c[t[e+0]]+c[t[e+1]]+c[t[e+2]]+c[t[e+3]]+"-"+c[t[e+4]]+c[t[e+5]]+"-"+c[t[e+6]]+c[t[e+7]]+"-"+c[t[e+8]]+c[t[e+9]]+"-"+c[t[e+10]]+c[t[e+11]]+c[t[e+12]]+c[t[e+13]]+c[t[e+14]]+c[t[e+15]]).toLowerCase();if(!a(n))throw TypeError("Stringified UUID is invalid");return n};var f=function(t,e,n){var o=(t=t||{}).random||(t.rng||i)();if(o[6]=15&o[6]|64,o[8]=63&o[8]|128,e){n=n||0;for(var s=0;s<16;++s)e[n+s]=o[s];return e}return l(o)};class h{constructor(t,e){this.instance=null,this.url=t,e=e||{},this.options=Object.assign(this.defaultOptions(),e),console.log(this.defaultOptions(),e,this.options),this.beforeConnected=[],this.wsData=[],this.onOpen=null,this.onMessage=null,this.onClose=null,this.onError=null}createMessage(t,e,n){let o={jsonrpc:"2.0",method:t,params:e,id:n};return JSON.stringify(o)}defaultOptions(){return{reconnectEnabled:!1,reconnectInterval:0,recconectAttempts:0,eventAfterMutation:!0,commitOnNotification:!0,notificationIdField:"request_id",uuid:!1,store:null}}passToStore(t,e){if(!t.startsWith("socket_"))return;let n=t,o=e;e.data&&(o=JSON.parse(e.data)),this.store.commit(n,o)}connect(){this.instance=new WebSocket(this.url),this.instance.onopen=()=>{this.beforeConnected.forEach(t=>this.instance.send(t)),this.beforeConnected=[],this.reconnectEnabled&&(this.reconnectCount=1),"function"==typeof this.onOpen&&this.onOpen(),this.store&&this.passToStore("socket_on_open",event)},this.instance.onmessage=t=>{let e=JSON.parse(t.data);if(this.store){let t=this.wsData.filter(t=>!(!e.hasOwnProperty("id")||(console.log("it's a reply",e),t.id!=e.id))||!(e.hasOwnProperty("id")||(console.log("it's a notification",e,this.commitOnNotification,this.notificationIdField),!(this.commitOnNotification&&e.hasOwnProperty("params")&&e.params.hasOwnProperty(this.notificationIdField))))&&(console.log(t.id,e.params[this.notificationIdField]),t.id==e.params[this.notificationIdField]))[0];t&&this.store.commit(t.mutation,e.result?e.result:e.params),this.passToStore("socket_on_message",e)}!this.eventAfterMutation&&this.store||"function"==typeof this.onMessage&&this.onMessage(e)},this.instance.onclose=t=>{"function"==typeof this.onClose?this.onClose(t):this.store&&this.passToStore("socket_on_close",t),!t.wasClean&&this.reconnectEnabled&&this.reconnect()},this.instance.onerror=t=>{"function"==typeof this.onError?this.onError(t):this.store&&this.passToStore("socket_on_error",t)}}reconnect(){this.reconnectCount<=this.reconnectAttempts?(this.reconnectCount++,delete this.instance,setTimeout(()=>{this.connect(),this.store&&this.passToStore("socket_reconnect",this.reconnectCount)},this.reconnectInterval)):this.store&&this.passToStore("socket_reconnect_error",!0)}sendData(t,e,n=null){let o=this.uuid?f():(new Date).getTime()+""+Math.floor(89999*Math.random()+1e4);n&&this.wsData.push({id:o,mutation:n});const s=this.createMessage(t,e,o);this.instance.readyState===WebSocket.OPEN?this.instance.send(s):this.beforeConnected.push(s)}}e.default={install(t,e,n){const o=new h(e,n);o.connect(),t.prototype.$socket=o}}}])}));