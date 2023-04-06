

class Eternal {  
    meta;
    blueprint;
   
    constructor(blueprint) {
        this.blueprint = blueprint;
    }   

    // this fetches the eternal blueprint from the online meta data 
    // it also stores the meta for reference but this is not used in this library currently
    get(id, callback) {
        $.ajax({            
             // this is the normal contract meta data URI, just append ?include=blueprint to add the blueprint to it
            url: "https://pix.ls/meta/eternals/" + id + "?include=blueprint",   
            type: "GET", contentType: "application/json; charset=utf-8", dataType: "json",
            success: (meta) => {

                // store meta for reference
                console.log(meta);
                this.meta = meta;

                // return 200 if we successfully get the blueprint for this id
                if (meta?.blueprint) {
                    this.blueprint = meta.blueprint;
                    callback(200);
                    return;
                }

                // return 204 if there we no blueprint in the meta
                callback(204);
            },
            error: (error) => {
                // return the error code
                // most common is 404 'not found' when requesting an unknown id
                callback(error.status);
            }
        });

    }

    // draws a full standard eternal
    draw(canvas_id) {
        
        let canvas = document.getElementById(canvas_id),
            ctx = canvas.getContext('2d');

        // init the canvas
        this.init_canvas(canvas, ctx);

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
    init_canvas(canvas, ctx) {
        let bp = this.blueprint;

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

    // draws horns if they exist
    draw_horns(ctx, custom_draw_polys) {
        let bp = this.blueprint,
            horns = bp.horns,

            // standard draw_polys() will be used unless a custom function is provided
            draw_polys = (custom_draw_polys || this.draw_polys).bind(this);    

        // these are usually not present
        draw_polys(ctx, horns.left);
        draw_polys(ctx, horns.right);
    }

    // draws eyes
    draw_eyes(ctx, custom_draw_polys) {
        let bp = this.blueprint,
            eyes = bp.eyes,

            // standard draw_polys() will be used unless a custom function is provided
            draw_polys = (custom_draw_polys || this.draw_polys).bind(this);               

        // each of these may or may not be present depending on the type of eternal
        draw_polys(ctx, eyes.left);
        draw_polys(ctx, eyes.middle);
        draw_polys(ctx, eyes.right);
    }

    // draws mouth
    draw_mouth(ctx, custom_draw_polys) {
        let bp = this.blueprint,
            mouth = bp.mouth,

            // standard draw_polys() will be used unless a custom function is provided
            draw_polys = (custom_draw_polys || this.draw_polys).bind(this);    

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

        // step through each poly in the list
        for (let poly of polys) {

            console.log(poly);

            // each poly is a hexagon
            // it described by 18 points for it's 6 corners (3 points per corner)
            // x and y are provided individualy for each point using arrays of 18 values each
            // eg x = [a, a, a, b, b, b, c, c, c, d, d, d, e, e, e, f, f, f]     
            //    y = [a, a, a, b, b, b, c, c, c, d, d, d, e, e, e, f, f, f]

            // we provide three points for each corner so that a custom curve can provided for each corner
            // this allows each face to create a different 'expression' with these different curves
            // to build the poly we draw a quadratic curve with each of the sets of 3 points and then draw lines between them

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