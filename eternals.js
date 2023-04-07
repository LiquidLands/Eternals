
/*  Eternals.js

 *  This library receives or fetches an eternal blueprint and draws it to the provided canvas id
 *  It can be extended and overwritten to change the style of drawing
 *  Individual draw functions (eg. draw_eyes()) can be called with a custom_draw_function() to draw that section differently
    
 *  Standard Usage: 
    
    let eternal = new Eternal(blueprint);
    eternal.draw('Canvas');
      
 *  Fetching a blueprint:  
    (Can be retrieved using the meta data URI with '?include=blueprint' appended to it), eg:
    https://pix.ls/meta/eternals/123?include=blueprint
   
    let eternal = new Eternal();
    eternal.get(id, (status) => {
        if (status == 200) eternal.draw('Canvas');
    });
 
 *  Blueprint object:  
    (Below is an example of a blueprint)
 
    blueprint:
    {
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
            left:  { ... },                              // poly stack
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
*/

class Eternal {  
    meta;           // not used in this library currently
    blueprint;      // everything we need

    // blueprints should be cached and not fetched from pix.ls repeatedly (they don't change, and this is a lot quicker)
    // cached blueprints can be provided to the constructor
    constructor(blueprint) {
        this.blueprint = blueprint;
    }   

    // this fetches the eternal blueprint from the online meta data 
    // it also stores the meta for reference but this is not used in this library currently
    get(id, callback) {

        // this is the normal contract metadata URI, just append ?include=blueprint to add the blueprint to it
        fetch("https://pix.ls/meta/eternals/" + id + "?include=blueprint")
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    callback(response.status);                    
                }
            })
            .then(meta => {
                //console.log(meta);
                if (meta) {
                    this.meta = meta;
                    if (meta?.blueprint) {
                        this.blueprint = meta.blueprint;
                        callback(200);
                    }
                    else {
                        callback(204);
                    }
                }
            })
            .catch(error => {
                callback(error.status);
            });
    }

    // draws a full standard eternal
    draw(canvas_element_or_id) {
        
        // init the canvas
        let ctx = this.init_canvas(canvas_element_or_id);

        // stop here if we don't have a blueprint
        if (!this.blueprint) return;

        // draw each part of the eternal
        this.draw_background(ctx);
        this.draw_skin(ctx);
        this.draw_vignette(ctx);
        this.draw_horns(ctx);
        this.draw_eyes(ctx);
        this.draw_mouth(ctx);       
    }

    // sets the canvas to the eternal size (usually 800x800)
    init_canvas(canvas_element_or_id) {

        let bp = this.blueprint,
            canvas = canvas_element_or_id;
        
        // if this variable is a string then we assume it's an id and we still have to get the element 
        if (typeof canvas_element_or_id === "string") {
            canvas = document.getElementById(canvas_element_or_id);
        }

        let ctx = canvas.getContext('2d');

        // check we have a blueprint
        if (!bp) {
            canvas.width = 800;
            canvas.height = 800;
            ctx.fillStyle = '#eeeeee';
            ctx.fillRect(0, 0, 800, 800);
            return; 
        }

        // set up the canvas
        canvas.width = bp.width;
        canvas.height = bp.height;

        return ctx;
    }

    // draws the background color on the provided canvas context
    draw_background(ctx) {
        let bp = this.blueprint;
        ctx.fillStyle = bp.background.color;
        ctx.fillRect(0, 0, bp.width, bp.height);
    }

    // draws the skin bubbles on the provided canvas context
    draw_skin(ctx) {
        let bp = this.blueprint,
            two_pi = 2 * Math.PI;

        // draw each background bubble
        for (let bubble of bp.background.bubbles) {

            // each bubble is stored as a four value array, eg: [330, 0, 16.39, 0.11]
            // these value are: [center_x, center_y, radius, opacity]
            // so this example bubble requires a circle drawn at coordinates x=330 y=0 with radius=16.39 and opacity=0.11
            let x = bubble[0],
                y = bubble[1],
                rad = bubble[2];

            // add the opacity to the color
            // constrict a color value using the all-bubbles color and this bubble's opacity

            // first convert 0.11 to byte value 0 to 255 (eg. 28), then convert it to hex (eg. 1c)
            var opacity = Math.round(bubble[3] * 255).toString(16),

                // we need to add 0 if the hex is only one character
                opacity_hex = (opacity.length == 1) ? "0" + opacity : opacity,  

                // then build the final color with opacity eg. '#101010' + '1c' becomes '#1010101c'
                color = bp.background.bubble_color + opacity_hex;

            // draw the circle
            ctx.beginPath();
            ctx.arc(x, y, rad, 0, two_pi);
            ctx.fillStyle = color;
            ctx.fill();
        }
    }

    // draws a vignette (this is not included in the blueprint)
    draw_vignette(ctx) {
        let bp = this.blueprint,
            h = bp.width / 2,
            vignette = ctx.createRadialGradient(h, h, h, h, h, bp.width);

        vignette.addColorStop(0, "rgba(0,0,0,0)");
        vignette.addColorStop(1, "rgba(0,0,0,0.5)");

        ctx.fillStyle = vignette;
        ctx.fillRect(0, 0, bp.width, bp.height);
    }

    // horns, eyes and mouth all use poly stacks to draw their shapes
    // they can be provided with a custom draw function to change rendering

    // draws horns if they exist
    draw_horns(ctx, custom_draw_function) {
        let bp = this.blueprint,
            horns = bp.horns,

            // standard draw_polys() will be used unless a custom draw function is provided
            draw_polys = (custom_draw_function || this.draw_polys).bind(this);    

        // these are usually not present
        draw_polys(ctx, horns.left);
        draw_polys(ctx, horns.right);
    }

    // draws eyes
    draw_eyes(ctx, custom_draw_function) {
        let bp = this.blueprint,
            eyes = bp.eyes,

            // standard draw_polys() will be used unless a custom draw function is provided
            draw_polys = (custom_draw_function || this.draw_polys).bind(this);               

        // each of these may or may not be present depending on the type of eternal
        draw_polys(ctx, eyes.left);
        draw_polys(ctx, eyes.middle);
        draw_polys(ctx, eyes.right);
    }

    // draws mouth
    draw_mouth(ctx, custom_draw_function) {
        let bp = this.blueprint,
            mouth = bp.mouth,

            // standard draw_polys() will be used unless a custom draw function is provided
            draw_polys = (custom_draw_function || this.draw_polys).bind(this);    

        // left and right are sometimes not present
        draw_polys(ctx, mouth.left3);             // the 'most left' mouth is #3
        draw_polys(ctx, mouth.left2);
        draw_polys(ctx, mouth.left1);             // the closest to the middle is #1
        draw_polys(ctx, mouth.middle);            // there is always a middle mouth
        draw_polys(ctx, mouth.right1);
        draw_polys(ctx, mouth.right2);
        draw_polys(ctx, mouth.right3);
    }

    // draws a stack of polygons
    // each part of the face (horns, eyes, mouth) is made up of a stack of polys drawn from largest to smallest
    draw_polys(ctx, stack) {

        // polys may be null if this eternal does not have this part (eg. there may be no horns, or no right3 mouth, etc.)
        if (!stack) return;

        let bp = this.blueprint,
            borders = bp.borders,
            polys = stack.polys;

        // stack also contains center_x & center_y which is the center point that each poly is drawn on (not used here though)
        // this can be used to draw other shapes (eg. circles), animate movement, build 3d models, etc.

        // step through each poly in the list
        for (let poly of polys) {

            // each poly is a hexagon with the following structure
            // {
            //    color: "#121212",
            //    size: 35,
            //    x: [..18 corner values..]
            //    y: [..18 corner values..]
            // }
            // it is described by 18 points for it's 6 corners (3 points per corner)
            // x and y are provided individualy for each point using arrays of 18 values each
            // eg x = [a, a, a, b, b, b, c, c, c, d, d, d, e, e, e, f, f, f]     
            //    y = [a, a, a, b, b, b, c, c, c, d, d, d, e, e, e, f, f, f]
            // we provide three points for each corner so that a custom curve can provided for each corner
            // this allows each face to create a different 'expression' with these different curves
            // to build the poly we draw a quadratic curve with each of the sets of 3 points and then draw lines between them
            // size is not used in this function but can be used to draw other shapes of the correct size

            let x = poly.x,
                y = poly.y;

            // create the poly path on the canvas
            ctx.beginPath();

            // step in sets of three through the arrays eg. [0,1,2] then [3,4,5] ...
            for (let point = 0; point < 18; point += 3) {   

                // for the first point in the array we have to moveTo() to start the path
                if (point == 0) ctx.moveTo(x[point], y[point]);

                // thereafter we use lineTo() to connect the corners
                else ctx.lineTo(x[point], y[point]);

                // this draws the custom curve between the the three points of the curner 
                // eg.starting at x[0] and curving through x[1] to x[2] (same for y)
                // this is repeated for each corner 
                ctx.quadraticCurveTo(x[point + 1], y[point + 1], x[point + 2], y[point + 2]);
            }
            ctx.closePath();

            // draw the above poly
            ctx.fillStyle = poly.color;
            ctx.fill();
            ctx.lineWidth = borders.size;
            ctx.strokeStyle = borders.color;
            ctx.stroke();
        }

    }
}
