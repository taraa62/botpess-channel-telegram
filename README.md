# botpess-channel-telegram
botpress channel for telegram messenger

----------

global config [config:channel-telegram-t62.json]
```js
{
  "enabled": true,
  "botToken": "",
  "defaultSettings": {
    "parser": "HTML",
    "buttonType": "!!keyboard"
  }
}
defaultSettings - optional
defaultSettings.parser - 'Markdown' | 'HTML'
defaultSettings.buttonType - 'keyboard' | ['inline'  or any words]
```

-------------------

You can dynamically create a telegram chat configuration:

```js
event.payload.t62Settings = {
        telegram: {
          text: "hello user",
          buttons: {
                type: 'inline',
                buttons: [
                   { title: 'btn1', callback: 'btn1' },
                   { title: 'btn2', callback: 'btn2' },
                   { title: 'btn3', callback: 'btn3' },
                ]
           }
        }
}
```
and you must send new event:
```js
const reply = () => {
    if (event.direction === "incoming")
      bp.events.sendEvent(
        bp.IO.Event({
          botId: event.botId,
          channel: event.channel,
          direction: 'outgoing',
          payload: event.payload,
          preview: "yyyyyyyyyyyyyy",
          target: event.target,
          threadId: event.threadId,
          credentials: event.credentials,
          type: "settings"

        })
      )

    event.direction = "outgoing"  //for stop old event
  }
```
I don't think it's a good solution, but it works, maybe then fixed

---------
config for item button:
```ts
export interface ITelButtonsItem {
  title:string;  //message for user
  url?:string;   // is it url
  payload?:string // for integration with old telegram module.
  callback?:string; // if button type is 'inline'
  hide?: boolean;
}
```
Creating Button Groups:
To do this you need to specify in payload || callback_data || title
additional parameters "btn1_gr1". Here "_gr1" indicates that the group is for button 1
'''
 { title: 'btn1', callback: 'btn1_gr1' },
 { title: 'btn11', callback: 'btn2_gr1' },
 { title: 'btn2', payload: 'btn1_gr2' },
 { title: 'btn22', payload: 'btn2_gr2' },
'''
Configuration data supported for "choice" only

--------
checking callback:
```js
action file
    const key = (event.payload.ctx) ? event.payload.ctx.data : event.payload.text

    if (key === 'nextOne' || key === 'Next') {
        your code here
    }

need update!!! 
```

--------- 
for text 
`
{{event.payload.from.username}}
`
