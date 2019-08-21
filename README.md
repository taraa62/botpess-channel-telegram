# botpess-channel-telegramv
channel telegram messenger for botpress
----------
install:
1. download dist folder
2. create new folder to /modules/channel-telegram-t62
3. open botpress config = .../data/global/botpress.config.json 
disable default channel-telegram and add new - channel-telegram-t62
4. start/restart server

P/S I don't testing this steps.
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
      }else {
      //for channel === 'web'
        const data = {
          items: [
            {
              title: "carousel",
              image: info.image,
              subtitle: "swqdsw",
              actions: [
                {
                  action: "Postback",
                  title: "hello",
                  payload: "btn1"

                }
              ]
            }
          ]
        }
        const pay = await bp.cms.renderElement("builtin_carousel", data, event);
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
```
 { title: 'btn1', callback: 'btn1_gr1' },
 { title: 'btn11', callback: 'btn2_gr1' },
 { title: 'btn2', payload: 'btn1_gr2' },
 { title: 'btn22', payload: 'btn2_gr2' },
```
To create a group of buttons, you can use "_gr${groupId}"
```
bt1 | bt2                    bt1                 bt1 | bt2 |bt3
   bt3                   bt2  | bt3                bt4  | bt5
                                                       bt6
```
id is added to - payload or callback

--------- 
for text 
`
{{event.payload.from.username}}
`

----------
work with card and carousel
To process button clicks, you need to add to the section 'global / before_incoming_middleware / post_back'
following code:
  ```
  async function hook() {
    if (event.type === 'postback') {
      event.setFlag(bp.IO.WellKnownFlags.SKIP_DIALOG_ENGINE, true)
      event.type = "callback";

      this.bp.events.sendEvent(
        this.bp.IO.Event({
          botId: event.botId,
          channel: event.channel,
          direction: 'incoming',
          payload: event.payload,
          preview: event.preview,
          threadId: event.threadId,
          target: event.target,
          type: "callback"
        })
      )
    }
    //  console.log(event)
  }

  return hook()
  ```
translate our 'event' with 'postBack' => 'callBack' and catch in 'action'
for example:
```
const myAction = async (name, value) => {
    console.log(event.payload)
    const callback = (event.channel === 'telegram') ? event.preview : event.payload.payload

    let element = {
      text: callback === 'btn1' ? "hello btn1" : "????",
      typing: true
    };
    const payloads = await bp.cms.renderElement("builtin_text", element, event);
    bp.events.replyToEvent(event, payloads);
  }
```
