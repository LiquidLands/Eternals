

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