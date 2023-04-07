# Eternals.js

A JavaScript library for drawing Eternals on an HTML canvas element based on a provided blueprint. Eternals are typically drawn on an 800x800 canvas and consist of different elements like background, eyes, horns, and mouth. The library can be extended and overwritten to change the drawing style, and individual draw functions (e.g., draw_eyes()) can be called with a custom_draw_function() to draw that section differently.

## Example

https://liquidlands.github.io/Eternals.js/

## Usage

let eternal = new Eternal(blueprint);
eternal.draw('Canvas');

## Fetching a Blueprint
Bluepints can be retrieved using the metadata URI with ?include=blueprint appended to it, for example:

https://pix.ls/meta/eternals/123?include=blueprint

let eternal = new Eternal();
eternal.get(id, (status) => {
    if (status == 200) eternal.draw('Canvas');
});

## Blueprint Object

The blueprint object contains all the necessary information to draw an Eternal on a canvas. It includes details about the appearance of the Eternal's eyes, horns, mouth, and other features. Below is a breakdown of the blueprint object:

```javascript
blueprint: {
    width: 800,                                     // standard eternals are currently drawn on a 800x800 canvas
    height: 800,
    background: {
        color: '#4872fa',                           // the background color of the image
        bubble_color: '#f3f3f3',                    // the color of all bubbles (usually some shade of grey)
        bubbles: [
            [0, 0, 14.35, 0.1],                     // each bubble [center_x, center_y, radius, opacity]
            ...
            [38, 0, 10.92, 0.09]
        ]
    },
    borders: {                                      // the style of all border lines
        size: 8,                                    
        color: '#222222'                            
    },
    eyes: {
        count: 2,
        left: {                                     // poly stack (standard structure used for eyes, horns and mouth)
            center_x: 265,                          // the center point of the stack where each of it's poly's are drawn (these are only needed for custom drawing)
            center_y: 290,                          
            polys: [                                // each poly in the stack (only x, y, color are needed to draw a standard eternal)
                {
                    size: 350,                      // size is only needed if you want to draw alternative shapes
                    x: [.. 18 corner points..],     // eg [a, a, a, b, b, b, c, c, c, d, d, d, e, e, e, f, f, f]  ... 6 sets of 3 corner values each 
                    y: [.. 18 corner points..],     // these are described in further detail in the code below
                    color: '#222222'                
                },
                { ... }
            ],
            shape {                                 // shape details are provided but are not needed to draw a standard eternal (they are only needed for alternative drawing)
                x: [.. 18 corner points..],         // each poly in the stack will have the same shape
                y: [.. 18 corner points..],         // eg [a, a, a, b, b, b, c, c, c, d, d, d, e, e, e, f, f, f]  > 6 sets of 3 corner values each (scaled to 100)
            }
        }
        middle: null,
        right: { ... }                              // poly stack
    },    
    horns: {
        count: 0,
        left:  { ... }                              // poly stack
        right: { ... }                          
        shape: null
    },
    mouth: {
        count: 6,
        left3: null,                                // poly stack
        left2: { ... },
        left1: { ... },
        middle: { ... },
        right1: { ... },
        right2: { ... },
        right3: { ... }
    }
}

### Background
The background property contains information about the background color and bubbles that make up the Eternal's skin texture. It includes the background color, bubble color, and an array of bubbles with their center coordinates, radius, and opacity.

### Borders
The borders property defines the style of the border lines

### Eyes
The eyes property contains information about the appearance and position of the Eternal's eyes. It includes the count of eyes, and individual eye details such as left, middle (if applicable), and right eyes. Each eye is represented as a poly stack, which is a collection of polygons with specific attributes like size, position, and color. Additionally, a shape property is provided for alternative drawing, which contains the x and y corner points of the polygons in a scaled format.

### Horns
The horns property describes the appearance and position of the Eternal's horns. It includes the count of horns, and individual horn details such as left and right horns. Each horn is also represented as a poly stack with attributes like size, position, and color. Similar to the eyes, a shape property is provided for alternative drawing, containing the x and y corner points of the polygons in a scaled format.

### Mouth
The mouth property contains information about the appearance and position of the Eternal's mouth. It includes the count of mouth features, and individual mouth details such as left3, left2, left1, middle, right1, right2, and right3. Each mouth feature is represented as a poly stack with specific attributes like size, position, and color.

## Customization
You can extend the Eternal class and override its methods for custom rendering. For example, you can provide a custom draw function to change the rendering of specific elements such as eyes or mouth.