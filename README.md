This is a waybar module to show the lyrics of mpd.

**Make sure your song directory is ~/Music and your waybar config directory is ~/.config/waybar**

**Install and run**
```shell
sudo npm install -g hyric
hyric
```
**Edit waybar config**
```json
{
  "modules-center": ["custom/hyric","mpd"],
  "custom/hyric": {
       "exec": "/home/YOURNAME/.config/waybar/hyric.sh",
       "restart-interval": 1
     }
}
```

**Auto start when hyprland starts**
```shell
exec-once = hyric
```
