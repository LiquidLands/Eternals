# Eternals.js

A JavaScript library for drawing Eternals on an HTML canvas element based on a provided blueprint. Eternals are typically drawn on an 800x800 canvas and consist of different elements like background, eyes, horns, and mouth. The library can be extended and overwritten to change the drawing style, and individual draw functions (e.g., draw_eyes()) can be called with a custom_draw_function() to draw that section differently.

## Example

https://liquidlands.github.io/Eternals.js/

## Usage

```html
<canvas id="Canvas" width="800" height="800"></canvas>
```

```javascript
let eternal = new Eternal(blueprint);
eternal.draw('Canvas');
```

## Fetching a Blueprint
Blueprints can be retrieved using the metadata URI with ?include=blueprint appended to it, for example:

https://pix.ls/meta/eternals/123?include=blueprint

Eternal.get(id) will do this for you. It will return a standard html status code to the callback with the following typical values:
- 200 success
- 204 no blueprint in the meta
- 404 not found (eg. if eternal not minted yet)

```javascript
let eternal = new Eternal();
eternal.get(id, (status) => {
    if (status == 200) eternal.draw('Canvas');
});
```

## Draw to an off-screen canvas

In this example, we create an off-screen canvas, initialize an Eternal object with the blueprint data, and then use the draw method of the Eternal object to draw the eternal on the off-screen canvas. After that, you can use the off-screen canvas for further manipulations or draw it onto another canvas if needed.

```javascript
let offscreen_canvas = document.createElement('canvas');
offscreen_canvas.width = 800;
offscreen_canvas.height = 800;

let eternal = new Eternal(blueprint);
eternal.draw(offscreen_canvas);
```

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
        left:  { ... },                             // poly stack
        right: { ... },                          
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
        right3: { ... },
        shape: null
    }
}
```

### Background
The background property contains information about the background color and bubbles that make up the Eternal's skin texture. It includes the background color, bubble color, and an array of bubbles with their center coordinates, radius, and opacity.

### Borders
The borders property defines the style of the border lines

### Eyes
The eyes property contains information about the appearance and position of the Eternal's eyes. It includes the count of eyes, and individual eye details such as left, middle (if applicable), and right eyes. Each eye is represented as a poly stack, which is a collection of polygons with specific attributes like size, position, and color. Additionally, a shape property is provided for alternative drawing, which contains the x and y corner points of the polygons in a percentage scaled format.

### Horns
The horns property describes the appearance and position of the Eternal's horns (if present). It includes the count of horns, and individual horn details such as left and right horns. Each horn is also represented as a poly stack with attributes like size, position, and color. Similar to the eyes, a shape property is provided for alternative drawing, containing the x and y corner points of the polygons in a percentage scaled format.

### Mouth
The mouth property contains information about the appearance and position of the Eternal's mouth. It includes the count of mouth features, and individual mouth details such as left3, left2, left1, middle, right1, right2, and right3. Each mouth feature is represented as a poly stack with specific attributes like size, position, and color.

### The Poly Stack
A poly stack represents different facial features of an Eternal, such as eyes, horns, and mouth sections. Each facial feature is composed of a stack of polygons (typically hexagons), which are drawn from largest to smallest to create the desired appearance.

A poly stack has the following key properties:

- **center_x** and **center_y**: These properties represent the center point at which each polygon in the stack is drawn. These can be used to draw other shapes, animate movement, build 3D models, etc. They are not needed if you are drawing directly using the polys array.

- **polys**: An array containing the individual polygons in the stack. Each polygon has its own properties such as color, size, and separate arrays for x and y coordinates of its 18 points (6 corners with 3 points per corner).

- **shape**: The shape defines a 100x100 polygon shape used in this stack for all it's polys. Eyes each have their own shape, whereas all mouth and horns used shared shapes. Shapes are not needed if you are drawing directly using the polys array, but they are useful if you want to manipulate the drawing.

The poly stack structure allows for customization and flexibility when drawing the facial features of an Eternal. For instance, by providing different sets of corner points for each polygon, various expressions can be created for the Eternal's face. Furthermore, a custom draw function can be provided to modify the rendering of the facial features as needed.


## Advanced drawing

Rather than call the main draw() function you can draw each part of the face individually, change stuff, etc.

https://liquidlands.github.io/Eternals.js/advanced.html

```javascript
let eternal = new Eternal(blueprint),
    ctx = eternal.init_canvas(canvas_id);

// change some stuff
eternal.blueprint.borders.size = 1;
eternal.blueprint.background.color = '#777777';

// draw each part of the eternal
eternal.draw_background(ctx);
eternal.draw_skin(ctx);         
eternal.draw_vignette(ctx);
eternal.draw_horns(ctx);
eternal.draw_eyes(ctx, (ctx, stack) => {           // a custom draw function has been provided here
  if (!stack) return;

  // step through each poly in the list
  for (let poly of stack.polys) {

      ctx.beginPath();
      ctx.arc(stack.center_x, stack.center_y, poly.size / 2, 0, 2 * Math.PI);
      ctx.fillStyle = poly.color;
      ctx.fill();

      ctx.lineWidth = borders.size;
      ctx.strokeStyle = borders.color;
      ctx.stroke();
  }
});
//eternal.draw_mouth(ctx);                         // no mouth 
```

## Customization
You can extend the Eternal class and override its methods for custom rendering. For example, you can provide a custom draw function to change the rendering of specific elements such as eyes or mouth. Below is an example:

```javascript
class CustomEternal extends Eternal {

    constructor(blueprint) {
        super(blueprint);
    }

    // overwrite the draw function
    draw(canvas_id) {

        // init the canvas
        let ctx = this.init_canvas(canvas_id);

        // stop here if we don't have a blueprint
        if (!this.blueprint) return;

        // draw each part of the eternal
        this.draw_background(ctx);
        //this.draw_skin(ctx);         // eg. don't draw skin
        this.draw_vignette(ctx);
        this.draw_horns(ctx);
        this.draw_eyes(ctx, this.round_circles);
        this.draw_mouth(ctx, this.sharp_polys);
    }

    // example draw function for angular polys with a thin border
    sharp_polys(ctx, stack) {
        if (!stack) return;

        let bp = this.blueprint,
            borders = bp.borders,
            polys = stack.polys;

        // step through each poly in the list
        for (let poly of polys) {

            let x = poly.x,
                y = poly.y;

            // create the poly path on the canvas
            ctx.beginPath();
            for (let point = 0; point < 18; point += 3) {
                if (point == 0) ctx.moveTo(x[point + 1], y[point + 1]);
                else ctx.lineTo(x[point + 1], y[point + 1]);
            }
            ctx.closePath();

            // draw the above poly
            ctx.fillStyle = poly.color;
            ctx.fill();
            ctx.lineWidth = 1;
            ctx.strokeStyle = borders.color;
            ctx.stroke();
        }
    }

    // example draw function 
    round_circles(ctx, stack) {
        if (!stack) return;

        let bp = this.blueprint,
            borders = bp.borders;

        // step through each poly in the list
        for (let poly of stack.polys) {

            ctx.beginPath();
            ctx.arc(stack.center_x, stack.center_y, poly.size / 2, 0, 2 * Math.PI);
            ctx.fillStyle = poly.color;
            ctx.fill();

            ctx.lineWidth = borders.size;
            ctx.strokeStyle = borders.color;
            ctx.stroke();
        }
    }
}
```

It shows the following customizations:

- Overriding the draw method: In this case, the draw_skin(ctx) line is commented out, which means that the skin will not be drawn for this custom object.

- Adding custom draw functions: Two custom draw functions, sharp_polys() and round_circles(), are provided in the CustomEternal class. They can be used to draw shapes in different styles. For instance, sharp_polys() draws angular polygons with thin borders, while round_circles() draws circles with customizable border size and color. They are provided as overrides to draw eyes and mouth.

## Ideas

Using blueprints many new things can be done with Eternals. Here are some ideas:

- Animate the faces
- Change expressions
- Build 3d models
- Combine/merge eternals (create off-spring)
- Create complex scenes
- Templates for AI inputs
- Create derivatives