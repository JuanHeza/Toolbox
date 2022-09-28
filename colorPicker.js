class ColorPicker {
    constructor(favorites = []) {
        this.container = "";
        this.id = "colorPicker" //id del componente
        this.favorites = favorites; //colores favoritos
        this.position = { x: 0, y: 0 }; //posicion del componente

        this.hex = "#FF0000"; //hex exportable
        this.alpha = "1"; //valor alfa
        this.outputHex = "#FF0000";
        this.rgb = { r: 255, g: 0, b: 0 }
        this.hsl = { h: 255, s: 0, l: 0 }
        this.hsv = { h: 255, s: 0, v: 0 }
        this.cmyk = { c: 0, m: 0, y: 0, k: 0 }
        this.hue = "0"; // cursor hue
        this.hueHex = "#FF0000" //color del hue
        this.cursors = {
            color: { x: 145, y: 10 },
            hue: 5,
            alpha: 145
        };
        this.sizes = {
            hue: 150,
            alpha: 150,
            color: { w: 150, h: 150 }
        } // tamaños
        return this.build()
    }
    /*
        PONER UNA OPCION PARA REGRESAR EL VALOR O ALMACENARLO, EN TODOS LOS CONVERSORES

        IMPLEMENTAR EL CANAL ALFA EN LOS CONVERSORES

        CORREGIR/SIMPLIFICAR toHSL()

        LISTA DE FAVORITOS & RENDER DE COLORES 
        
        BOTON PARA CAMBIAR LA ENTRADA DE COLOR

        MODAL PARA CERRAR EL PICKER

        UBICACION SEGUN EL SELECTOR Y ESPACIO DE VENTANA

        ALFA DESACTIVABLE Y PREVIEW TOMA TODO ESE ESPACIO // EL ALFA ES CONFLICTIVO AL CONVERTIR

        UPDATE COLOR DEBE REGRESAR EL VALOR HACIA EL EVENTO QUE LO ACTIVO "change()"
        
    */
    toRGB(color = this.hex) {
        let r = parseInt(color.slice(1, 3), 16)
        let g = parseInt(color.slice(3, 5), 16)
        let b = parseInt(color.slice(5, 7), 16)
        this.rgb = { r: r, g: g, b: b }
        return [r, g, b];
    }
    toHSL(color = this.hex) {// Convert hex to RGB first
        let r = 0, g = 0, b = 0;
        if (color.length == 4) {
            r = "0x" + color[1] + color[1];
            g = "0x" + color[2] + color[2];
            b = "0x" + color[3] + color[3];
        } else if (color.length == 7) {
            r = "0x" + color[1] + color[2];
            g = "0x" + color[3] + color[4];
            b = "0x" + color[5] + color[6];
            this.alpha = 1
            this.cursors.alpha = 150
        } else {
            r = "0x" + color[1] + color[2];
            g = "0x" + color[3] + color[4];
            b = "0x" + color[5] + color[6];
        }
        // Then to HSL
        r /= 255;
        g /= 255;
        b /= 255;
        let cmin = Math.min(r, g, b),
            cmax = Math.max(r, g, b),
            delta = cmax - cmin,
            h = 0,
            s = 0,
            l = 0;

        if (delta == 0)
            h = 0;
        else if (cmax == r)
            h = ((g - b) / delta) % 6;
        else if (cmax == g)
            h = (b - r) / delta + 2;
        else
            h = (r - g) / delta + 4;

        h = Math.round(h * 60);

        if (h < 0)
            h += 360;

        l = (cmax + cmin) / 2;
        s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
        this.hue = h
        this.cursors.hue = Math.trunc(150 - ((h / 360) * 150))
        let v = l + s * Math.min(l, 1 - l)
        let sHSV = v == 0 ? 0 : 2 * (1 - l / v)
        s = +(s * 100).toFixed(1);
        l = +(l * 100).toFixed(1);
        this.hsl.h = h
        this.hsl.s = s
        this.hsl.l = l

        this.hsv.h = h
        this.hsv.s = sHSV
        this.hsv.v = v

        this.cursors.color = { x: Math.trunc(sHSV * 150), y: Math.trunc(-(v - 1) * 150) }
        this.toCMYK(color)
        this.render(true, color);
    }
    toHSV(color = this.hex) {

    }
    toCMYK(color = this.hex, save = false) {
        this.toRGB(color)
        let r = this.rgb.r / 255
        let g = this.rgb.g / 255
        let b = this.rgb.b / 255

        let k = 1 - (Math.max(r, g, b))
        let c = (1 - r - k) / (1 - k)
        let m = (1 - g - k) / (1 - k)
        let y = (1 - b - k) / (1 - k)
        let cmyk = { c: Math.trunc(c * 100), m: Math.trunc(m * 100), y: Math.trunc(y * 100), k: Math.trunc(k * 100) }
        if (save) {
            this.cmyk = cmyk
        }
        return cmyk
    }

    fromRGB(r, g, b, a = false, save = false) {
        let rH = r == 0 || r > 255 ? "00" : r.toString(16);
        let gH = g == 0 || g > 255 ? "00" : g.toString(16);
        let bH = b == 0 || b > 255 ? "00" : b.toString(16);
        let aH = this.alpha == 0 ? "00" : this.alpha > 0.9 ? "" : parseInt((this.alpha * 255).toFixed(0)).toString(16)
        rH = rH.length == 1 ? "0" + rH : rH;
        gH = gH.length == 1 ? "0" + gH : gH;
        bH = bH.length == 1 ? "0" + bH : bH;
        aH = aH.length == 1 ? "0" + aH : aH;
        let hex = `#${rH}${gH}${bH}${a ? aH : ""}`;
        if (save) {
            this.hex = a ? this.hex : hex
            this.outputHex = a ? hex : this.outputHex
        }
        return hex
    }
    fromCMYK({ c, m, y, k } = this.cmyk, save = false) {
        let r = Math.trunc(255 * (1 - (c / 100)) * (1 - (k / 100)))
        let g = Math.trunc(255 * (1 - (m / 100)) * (1 - (k / 100)))
        let b = Math.trunc(255 * (1 - (y / 100)) * (1 - (k / 100)))
        return this.fromRGB(r, g, b, false, save)
    }
    fromHSL({ h, s, l } = this.hsl) {
        let c = (1 - Math.abs(2 * (l / 100) - 1)) * (s / 100)
        let x = c * (1 - Math.abs((h / 60) % 2 - 1))
        let m = l / 100 - c / 2

        let r = x, g = 0, b = c
        return this.fromRGB(Math.trunc((r + m) * 255), Math.trunc((g + m) * 255), Math.trunc((b + m) * 255))
    }
    addFavorite() {
        this.favorites.append(this.color)
        return "";
    }
    favoritesToHTML() {
        let list = `<div class="favorite">+</div>`;
        this.favorites.forEach(fav => {
            list += `<div class="favorite" style="background-color: ${fav}"></div>`;
        });
        return list

    }
    updateColors(color = null) {
        this.alpha = (this.cursors.alpha / this.sizes.alpha).toFixed(2)

        let ctx = document.getElementById("hue").getContext("2d")
        let p = ctx.getImageData(0, this.cursors.hue, 1, 1).data;
        this.hue = (360 * ((this.cursors.hue) / this.sizes.hue)).toFixed(0)
        this.hueHex = this.fromRGB(p[0], p[1], p[2])

        let ctxColor = document.getElementById("color").getContext("2d")
        let preview = color ? this.toRGB(color) : ctxColor.getImageData(this.cursors.color.x, this.cursors.color.y, 1, 1).data;
        this.hex = this.fromRGB(preview[0], preview[1], preview[2])
        this.outputHex = this.fromRGB(preview[0], preview[1], preview[2], true)
        this.rgb = { r: preview[0], g: preview[1], b: preview[2] }
        $("#hex").val(this.outputHex)
        console.log({ alpha: this.alpha, hue: this.hue, hueHex: this.hueHex, hex: this.hex, outputHex: this.outputHex, r: this.rgb.r, g: this.rgb.g, b: this.rgb.b })
    }
    build(color = this.hex) {
        let favorites = this.favoritesToHTML()
        let template = `<article id="${this.id}">
            <section id="picker">
                <canvas id="color"></canvas>
                <canvas id="hue"></canvas>
                <canvas id="alpha"></canvas>
                <canvas id="preview"></canvas>
            </section>
            <section id="colorInputs">
                <div id="hexInput">
                    <label for="hex"> HEX </label>
                    <input type="text" id="hex" value="${color}"/>
                </div>
                <div id="rgbInput">
                    <label for="red" class="labelMini"> R </label>
                    <input type="text" id="red" class="inputMini" />
                    <label for="blue" class="labelMini"> B </label>
                    <input type="text" id="green" class="inputMini" />
                    <label for="green" class="labelMini"> G </label>
                    <input type="text" id="blue" class="inputMini" />
                </div>
                <div id="hslInput">
                    <label for="hue" class="labelMini"> H </label>
                    <input type="text" id="hue" class="inputMini" />
                    <label for="saturation" class="labelMini"> S </label>
                    <input type="text" id="saturation" class="inputMini" />
                    <label for="light" class="labelMini"> L </label>
                    <input type="text" id="light" class="inputMini" />
                </div>
                <i id="inputSelector" class="material-icons"> unfold_more </i>
            </section>
            <section id="favorites">
                
                ${favorites}
            </section>
        </article>`;
        let colorPicker = $.parseHTML(template);
        let obj = this
        $("body").append(colorPicker)
        $("#hex").change(function() {
            obj.toHSL($(this).val())
        })
        this.setPosition();
        this.render();
    }
    setPosition(x = 0, y = 0) {
        this.position = { x: x, y: y };
        $(`#${this.id}`).css({ top: y, left: x });
    }

    renderCursor(ctx, linear = 0, x, y, color = null) {
        ctx.lineWidth = 1
        if (color == null) {
            let p = ctx.getImageData(x, y, 1, 1).data;
            color = this.fromRGB(p[0], p[1], p[2])
        }
        ctx.fillStyle = color
        switch (linear) {
            case 0:
                ctx.beginPath();
                ctx.arc(x, y, 3, 0, 2 * Math.PI);
                ctx.fill();

                ctx.beginPath();
                ctx.arc(x, y, 4, 0, 2 * Math.PI);
                ctx.stroke();
                break;
            case 1:
                ctx.strokeRect(1, y, 150, 0);
                break;
            case 2:
                ctx.strokeRect(x, 0, 0, 150);
                break;
        }
    }
    renderAlpha(color = this.hex) {
        var c = document.getElementById("alpha");
        var ctx = c.getContext("2d");
        c.width = 150;
        c.height = 30;
        ctx.clearRect(0, 0, c.width, c.height);

        var grd = ctx.createLinearGradient(0, 0, c.width, 0);
        grd.addColorStop(0, "#0000");
        grd.addColorStop(0.8, color);
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, c.width, c.height);
        this.renderCursor(ctx, 2, this.cursors.alpha, 15)
        this.sizes.alpha = c.width
        let obj = this

        $("#alpha").off("mousedown");
        $("#alpha").on("mousedown", function() {
            $(this).mousemove(function(event) {
                obj.alpha = ((event.offsetX) / obj.sizes.alpha).toFixed(2)
                obj.cursors.alpha = event.offsetX
                obj.render()
            })
        }).on("mouseup mouseleave", function() {
            $(this).off("mousemove");
        })
    }
    renderColor(color = this.hueHex) {
        var c = document.getElementById("color");
        var ctx = c.getContext("2d");
        c.width = 150;
        c.height = 150;
        ctx.clearRect(0, 0, c.width, c.height);

        var grd
        grd = ctx.createLinearGradient(0, 0, c.width, 0);
        grd.addColorStop(0, "#fff");
        grd.addColorStop(1, color);
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, c.width, c.height);

        grd = ctx.createLinearGradient(0, 0, 0, c.height);
        grd.addColorStop(0, "#0000");
        grd.addColorStop(1, "#000");
        ctx.fillStyle = grd
        ctx.fillRect(0, 0, c.width, c.height);

        this.renderCursor(ctx, 0, this.cursors.color.x, this.cursors.color.y)
        this.sizes.color.w = c.width
        this.sizes.color.h = c.height
        let obj = this
        $("#color").off("mousedown");
        $("#color").on("mousedown", function() {
            $(this).mousemove(function(event) {
                //obj.hue = (360 * ((event.offsetY * 2) / obj.sizes.hue)).toFixed(0)
                obj.cursors.color.y = event.offsetY
                obj.cursors.color.x = event.offsetX
                obj.render()
            })
        }).on("mouseup mouseleave", function() {
            $(this).off("mousemove");
        })
    }
    renderPreview() {
        var c = document.getElementById("preview");
        var ctx = c.getContext("2d");
        c.width = 30;
        c.height = 30;
        ctx.clearRect(0, 0, c.width, c.height);

        ctx.fillStyle = this.fromRGB(this.rgb.r, this.rgb.g, this.rgb.b, true);
        ctx.fillRect(0, 0, c.width, c.height);
    }
    renderHue() {
        var c = document.getElementById("hue");
        var ctx = c.getContext("2d");
        c.width = 30;
        c.height = 150;

        var grd = ctx.createLinearGradient(0, 0, 0, c.height);
        grd.addColorStop(0, "#f00");
        grd.addColorStop(0.16, "#f0f");
        grd.addColorStop(0.33, "#00f");
        grd.addColorStop(0.5, "#0ff");
        grd.addColorStop(0.66, "#0f0");
        grd.addColorStop(0.83, "#ff0");
        grd.addColorStop(1, "#f00");

        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, c.width, c.height);
        this.renderCursor(ctx, 1, 15, this.cursors.hue)
        this.sizes.hue = c.height
        let obj = this
        $("#hue").off("mousedown");
        $("#hue").on("mousedown", function() {
            $(this).mousemove(function(event) {
                obj.cursors.hue = event.offsetY
                obj.render()
            })
        }).on("mouseup mouseleave", function() {
            $(this).off("mousemove");
        })
    }
    render(visible = true, color = null) {
        if (visible) {
            this.updateColors(color)
            this.renderHue();
            this.renderAlpha();
            this.renderColor();
            this.renderPreview();
        }
        $(`#${this.id}`).css({ display: visible ? "block" : "none" });
    }
}