# botpess-channel-telegramv
channel telegram messenger for botpress

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
full code with group for buttons (in your actions):
only for telegram!
```js
  if (event.channel === 'telegram') {
        const data = {
          text: msg,
          typing: true
        }
        const pay = await bp.cms.renderElement("builtin_text", data, event);
        pay[1].t62Settings = {
          telegram: {
            buttons: {
              type: 'keyboard',
              buttons: [
                { title: 'btn1', callback: 'btn1_gr1' },
                { title: 'btn2', callback: 'btn2_gr1' },
                { title: 'btn3', callback: 'btn3' }
              ]
            }
          }
        }
        bp.events.replyToEvent(event, pay);
      }
```

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
To create a group of buttons, you can use "_gr${groupId}"
```
bt1 | bt2                    bt1                 bt1 | bt2 |bt3
   bt3                   bt2  | bt3                bt4  | bt5
                                                       bt6
```
id is added to - payload or callback

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
