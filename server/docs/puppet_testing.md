# some animation controls
## head_sway
use `update_head_sway(amplitude, speed)` to modify default headsway amplitude and speed. it will update the current puppet as soon as called,
and subsequent puppets will have the same amplitude and speed setting.

## eyebrow motions
`left_brow_raise`, furrow and right brow analogues all accept three optinal arguments now:
`amplitude`: which sets the magnitude of the motion (bigger is more)
`speed:`: which sets the number of frames between the start and end position of the motion (fewer frames == faster)
`duration`: which sets the time (in ms) until the animation starts resuming its original position.

for example: `right_brow_furrow(0.8, 20, 250)` would have the right eyebrow furrow pretty large, taking 20 frames to reach full amplitude, and 
beginning to return to the original position 250 ms after the function was called.


# exporting to video
to render a sample video 3 seconds long, call `test_render()`, it will render 3 seconds of dog3 opening and closing its mouth.
when ready, it will log the video data as base64 encoded string, in the form `video_data <the b64 string>`. the ms to render
each frame will be logged as well, as will the canvas size (in pixels) at the beginning of the reder. the canvas size is really what
controls how fast the frames render. i guess at around 300 x 300 we might be able to get about 15-20ms a frame, but well see. i just want to 
make sure passing the video data this way works first.

# testing the puppet

## testing "api" summary
here are the basic functions available, subsequently explained in a bit more detail:
```javascript
// loading / prep
find_features(<image_path>) // click on image to get coordinates

// basic testing
test(<image_path>) // load a dog and watch it move around
stop_test_animation() // call this to stop it

// static positioning
// use these to set open/close / displace features as they would
// be during the course of an animation
leftEyePosition(<float>)
rightEyePosition(<float>)
mouthPosition(<float>)
mouthLeft(<float>)
mouthRight(<float>)
headTop(<float>)
headBottom(<float>)
headLeft(<float>)
headRight(<float>)

// adjusting feature coordinates
set_position(<feature key string>, <new_x>, <new_y>)

// head sway
head_sway(<float>, <float>) // this ones gotta be animated for now
```

## basic animation
load the puppet in a browser and pop open the console. call `test(<dog image>);` to load a dog image (which should be in the same
directory as the puppet assets) and have it do a bunch of animations simultaneously. currently there are the following image options already set up (pass these strings as the argument to the `test` function:
```javascript
'dog1.jpg'
'dog2.jpg'
'dog3.jpg'
'dog4.jpg'
'chihuahua.png'
```

## find features
to run the above test on a dog image, it first needs to have all the features points specified. use `find_features(<dog image>);` from the console
to have a dog image loaded and stationary. you can then click points to get the coordinates, which can be added to the `feature_map` object in puppet.js.
`feature_map` uses filenames as keys.

## adding a new dog for testing
id follow theses steps
* add the dog image to the puppet assets directory (i keep everything flat, to each his own). lets assume the image is called `new_dog.jpg`.
* call `find_features('new_dog.jpg');` in the browser console.
* click on the features, use the console output to populate the values of `feature_map` as shown below
``` javascript
var feature_map = {
    // ...other dogs...
    'new_dog.jpg': {
        // put the console output in these vectors as needed
        leftEyePosition:  new THREE.Vector2(-0.094, 0.261),
        rightEyePosition: new THREE.Vector2(0.165, 0.267),
        mouthPosition:    new THREE.Vector2(0.040, -0.089),
        mouthLeft:        new THREE.Vector2(-0.04, -0.1091),
        mouthRight:       new THREE.Vector2(0.134, -0.1060),
        headTop:          new THREE.Vector2(0.027, 0.475),
        headBottom:       new THREE.Vector2(0.042, -0.147),
        headLeft:         new THREE.Vector2(-0.304, 0.232),
        headRight:        new THREE.Vector2(0.394, 0.260),
    },
    // ...more dogs...
}
```
* you should be able to call `test('new_dog.jpg');` now, and the dogs features should be in the right spot


## static position testing
it may be helpful to focus on a static position, rather than keeping the puppet in motion. for that, id recommend the following
in the browser console to set things up:
* `test('new_dog.jpg');`
* `stop_test_animation();`
now youll be able to position the puppet as you see fit, with the following methods, which all take a float. they "expect" something
between 0 and 1 but you can pass any flow for a laugh.
* blink_left
* blink_right
* blink
* eyebrow_left
* eyebrow_right
* mouth_open
just call these in the console.

another, slightly more involved option is to update the feature locations dynamically. maybe you want to compare how the mouth looks when its opened
between two mouth left locations. you could follow the steps above to open the mouth, then to compare, you can set the mouth left to a different coordinate
using the `set_position` function in the manner below:
```javascript
set_position('mouthLeft', <new_x>, <new_y>);
```

`set_position` first argument is a key in the feature map (one level down), one of 
```
leftEyePosition
rightEyePosition
mouthPosition
mouthLeft
mouthRight
headTop
headBottom
headLeft
headRight
```

after calling `set_position`, the puppet should reflect the change.

## head sway
head sway is implementedly differently, so without a little tooling in the shaders, its not possible to statically position the head in the manner above.
in lieu of that, i think it could still be helpful to call `head_sway(<float>, <float>)` in conjunction with the other static positioning options.

## debugging the mouth
since it seems like the primary goal is to get the mouth to track the face exactly, here is a rough proposal for debugging / testing that particular issue:
``` javascript
// in the js console in a web browser, at /puppet_002/puppet.html
// each semicolon terminated line here would be an entry into the console
test('new_dog.jpg');
stop_test_animation();
// maybe you want to see what the mouth looks like when its half open and the head is moving
mouth_open(0.5);
// now see how it looks with the head moving
head_sway(1, 1);
// now maybe you want to see how things change if you move the mouth feature points around
set_position('mouthLeft', 0.121, -.231);
// and so on...
```

## gotchas
if you update the features for a dog, youll have to refresh the page to reset that dog's features, since you updated the values in the feature_map.
