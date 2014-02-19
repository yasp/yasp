# PushButton
Button which sets its output to `1` as long as the user presses it. If the button is pressed while the shift-key is
pressed the button will stay pressed even if the button is not clicked anymore.

![pushbutton](pushbutton.png)

## State
* Gets: nothing
* Sets: `1` if pressed, else `0`

## Parameters
```javascript
{
  color: 'rgb(100,100,100)',
  pushcolor: 'rgb(60,60,60)'
}
```
