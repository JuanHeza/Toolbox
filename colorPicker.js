class ColorPicker {
    /*
        Desarrollado por
            Juan Heza - 2022
            
        Desarrollado el
            22/sep/2022 - 30/sep/2022
    */
    /*
        IMPLEMENTAR EL CANAL ALFA EN LOS CONVERSORES 
        ALFA DESACTIVABLE Y PREVIEW TOMA TODO ESE ESPACIO // EL ALFA ES CONFLICTIVO AL CONVERTIR

        - REQUERIMIENTOS
        - remover canal alfa
        - hue en la posicion del alfa
        - saturacion y luminocidad ampliar el ancho

        -- COSAS DE JUAN
        -- agregar "estilos & orientacion" al constructor
    */
    constructor(favorites = []) {
        this.container = null
        this.id = "colorPicker" //id del componente
        this.favorites = favorites; //colores favoritos
        this.position = { left: 0, top: 0 }; //posicion del componente
        this.activeModel = 0;

        this.hex = "#ed0714"; //hex exportable
        this.alpha = "1"; //valor alfa
        this.outputHex = "#ed0714";
        this.rgb = { r: 255, g: 0, b: 0 }
        this.hsl = { h: 255, s: 0, l: 0 }
        this.hsv = { h: 255, s: 0, v: 0 }
        this.cmyk = { c: 0, m: 0, y: 0, k: 0 }
        this.hue = 1; // cursor hue
        this.hueHex = "#ff000f" //color del hue
        this.cursors = {
            color: { x: 145, y: 10 },
            hue: 1,
            alpha: 145
        };
        this.sizes = {
            hue: 150,
            alpha: 150,
            color: { w: 150, h: 150 }
        } // tamaños
        return this.build(false)
    }
    
    // FROM HEX TO ANY
    toRGB(color = this.hex, save = true) {
        let r = parseInt(color.slice(1, 3), 16)
        let g = parseInt(color.slice(3, 5), 16)
        let b = parseInt(color.slice(5, 7), 16)
        let rgb = { r: r, g: g, b: b }
        if (save) {
            this.rgb = rgb
            this.hex = color
        }
        return [r, g, b];
    }
    toHSL(color = this.hex, save = false) {
        let r, g, b
        [r, g, b] = this.toRGB(color, false, save)
        r /= 255;
        g /= 255;
        b /= 255;
        let cmin = Math.min(r, g, b)
        let cmax = Math.max(r, g, b)
        let delta = cmax - cmin

        let hsl = { h: 0, s: 0, l: 0 }
        switch (cmax) {
            case r:
                hsl.h = ((g - b) / delta) % 6
                break;
            case g:
                hsl.h = ((b - r) / delta) + 2
                break;
            case b:
                hsl.h = ((r - g) / delta) + 4
                break;
        }
        hsl.h = isNaN(hsl.h) ? 0 : hsl.h
        hsl.h = Math.round(hsl.h * 60)
        hsl.h = hsl.h < 0 ? hsl.h + 360 : hsl.h
        hsl.l = (cmax + cmin) / 2;
        hsl.s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * hsl.l - 1));
        if (save) {
            this.hsl = hsl
        }
        return hsl
    }
    toHSV(color = this.hex, save = true) {
        this.hex = color
        let hsl = this.toHSL(color)
        let hsv = { h: 0, s: 0, v: 0 }
        hsv.h = hsl.h
        hsv.v = hsl.l + hsl.s * Math.min(hsl.l, 1 - hsl.l)
        hsv.s = hsv.v == 0 ? 0 : 2 * (1 - hsl.l / hsv.v)
        if (save) {
            this.hue = hsv.h
            this.cursors = {
                hue: hsv == 0 ? 0 : Math.trunc(150 - ((hsv.h / 360) * 150)),
                color: {
                    x: Math.trunc(hsv.s * 150),
                    y: Math.trunc(-(hsv.v - 1) * 150)
                },
                alpha: 145
            }
        }
        return hsv
    }
    toCMYK(color = this.hex, save = false) {
        let [r, g, b] = this.toRGB(color, false, save)
        r = r / 255
        g = g / 255
        b = b / 255

        let k = 1 - (Math.max(r, g, b))
        let c = (1 - r - k) / (1 - k)
        let m = (1 - g - k) / (1 - k)
        let y = (1 - b - k) / (1 - k)
        let cmyk = {
            c: +(c * 100).toFixed(0),
            m: +(m * 100).toFixed(0),
            y: +(y * 100).toFixed(0),
            k: +(k * 100).toFixed(0)
        }
        if (save) {
            this.cmyk = cmyk
        }
        return cmyk
    }

    // TO HEX FROM ANY
    fromRGB(r, g, b, a = false, save = false) {
        this.rgb = { r: r, g: g, b: b }
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
            this.outputHex = hex
            this.toHSV(hex, true)
        }
        return hex
    }
    fromCMYK({ c, m, y, k } = this.cmyk, save = false) {
        this.cmyk = { c: c, m: m, y: y, k: k }
        let r = Math.trunc(255 * (1 - (c / 100)) * (1 - (k / 100)))
        let g = Math.trunc(255 * (1 - (m / 100)) * (1 - (k / 100)))
        let b = Math.trunc(255 * (1 - (y / 100)) * (1 - (k / 100)))

        return this.fromRGB(r, g, b, false, save)
    }
    fromHSL({ h, s, l } = this.hsl, save = false) {
        this.hsl = { h: h, s: s, l: l }
        let c = (1 - Math.abs(2 * (l / 100) - 1)) * (s / 100)
        let x = c * (1 - Math.abs((h / 60) % 2 - 1))
        let m = l / 100 - c / 2

        let r, g, b
        h = +h
        switch (true) {
            case (0 < h && h < 60):
                [r, g, b] = [c, x, 0]
                break;
            case (60 < h && h < 120):
                [r, g, b] = [x, c, 0]
                break;
            case (120 < h && h < 180):
                [r, g, b] = [0, c, x]
                break;
            case (180 < h && h < 240):
                [r, g, b] = [0, x, c]
                break;
            case (240 < h && h < 300):
                [r, g, b] = [x, 0, c]
                break;
            case (300 < h && h < 360):
                [r, g, b] = [c, 0, x]
                break;
        }
        return this.fromRGB(Math.trunc((r + m) * 255), Math.trunc((g + m) * 255), Math.trunc((b + m) * 255), false, save)
    }

    updateModels(hex = this.hex, updateCursor = true) {
        this.toHSV(hex, updateCursor)
        $("#hex").val(hex)

        let r, g, b;
        [r, g, b] = this.toRGB(hex, false, true);
        $("#red").val(r)
        $("#green").val(g)
        $("#blue").val(b)

        let hsl = this.toHSL(hex, true);
        $("#hueColor").val(hsl.h)
        $("#saturation").val(+(hsl.s * 100).toFixed(1))
        $("#light").val(+(hsl.l * 100).toFixed(1))

        let cmyk = this.toCMYK(hex, true);
        $("#cyan").val(cmyk.c)
        $("#magenta").val(cmyk.m)
        $("#yellow").val(cmyk.y)
        $("#black").val(cmyk.k)
    }
    validateRange(input, m = 0, M = 100) {
        return +input > M ? M : +input < m ? 0 : +input
    }
    // pendiente implementar
    validateHex(input) {
        return input
    }
    // pendiente implementar
    addFavorite() {
        if (!this.favorites.includes(this.hex)) {
            this.favorites.push(this.hex)
            let list = this.favoritesToHTML()

            $(`#${this.id} #favorites`).html(list)
            this.favoritesClick()
        }
    }
    favoritesClick() {
        let obj = this
        $(`#${this.id} #favorites #addFavorite`).click(function() {
            obj.hex = $("#hex").val()
            obj.addFavorite()
        })
        $(`#${this.id} #favorites .favorite:not(#addFavorite)`).click(function() {
            let [r, g, b] = $(this).css("background-color").slice(4, -1).split(",")
            $("#red").val(+r)
            $("#green").val(+g)
            $("#blue").val(+b).change()
        })
    }
    favoritesToHTML() {
        let list = `<div id="addFavorite" class="favorite">+</div>`;
        this.favorites.forEach(fav => {
            list += `<div class="favorite" style="background-color: ${fav}"></div>`;
        });
        return list
    }

    build(visible = false, color = this.hex) {
        let favorites = this.favoritesToHTML()
        let template = `<article id="${this.id}">
            <section id="picker">
                <canvas id="color"></canvas>
                <canvas id="hue"></canvas>
                <canvas id="alpha"></canvas>
                <canvas id="preview"></canvas>
            </section>
            <section id="colorInputs">
                <div id="hexInput" class="colorModel">
                    <label for="hex"> HEX </label>
                    <input type="text" id="hex" value="${color}"/>
                </div>
                <div id="rgbInput" class="colorModel">
                    <label for="red" class="labelSmall"> R </label>
                    <input type="number" id="red" class="inputSmall" min="0" max="255" value="0"/>
                    <label for="green" class="labelSmall"> G </label>
                    <input type="number" id="green" class="inputSmall" min="0" max="255" value="0"/>
                    <label for="blue" class="labelSmall"> B </label>
                    <input type="number" id="blue" class="inputSmall" min="0" max="255" value="0"/>
                </div>
                <div id="hslInput" class="colorModel">
                    <label for="hueColor" class="labelSmall"> H </label>
                    <input type="number" id="hueColor" class="inputSmall" min="0" max="359" value="0"/>
                    <label for="saturation" class="labelSmall"> S </label>
                    <input type="number" id="saturation" class="inputSmall" min="0" max="100" value="0"/>
                    <label for="light" class="labeSmall"> L </label>
                    <input type="number" id="light" class="inputSmall" min="0" max="100" value="0"/>
                </div>
                <div id="cmykInput" class="colorModel">
                    <label for="cyan" class="labelMini"> C </label>
                    <input type="number" id="cyan" class="inputMini" min="0" max="100" value="100"/>
                    <label for="magenta" class="labelMini"> M </label>
                    <input type="number" id="magenta" class="inputMini" min="0" max="100" value="100"/>
                    <label for="yellow" class="labelMini"> Y </label>
                    <input type="number" id="yellow" class="inputMini" min="0" max="100" value="100"/>
                    <label for="black" class="labelMini"> B </label>
                    <input type="number" id="black" class="inputMini" min="0" max="100" value="100"/>
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
        $("#inputSelector").click(function() {
            obj.activeModel = (obj.activeModel + 1) % 4
            $(".colorModel").css("display", "none")
            $(`.colorModel:eq(${obj.activeModel})`).css("display", "flex")
            obj.updateModels()
        });
        $("#hex").change(function() {
            obj.toHSV($(this).val())
            obj.render()
        })
        $("input[type='number'").on("input", function() {
            $(this).val(obj.validateRange($(this).val(), $(this).attr("min"), $(this).attr("max")))
            //          $(this).change();
        });
        $("#rgbInput input").change(function() {
            obj.fromRGB(+$("#red").val(), +$("#green").val(), +$("#blue").val(), false, true)
            obj.render()
        })
        $("#hslInput input").change(function() {
            let hsl = { h: +$("#hue").val(), s: +$("#saturation").val(), l: +$("#light").val() }
            obj.fromHSL(hsl, true)
            obj.render()
        })
        $("#cmykInput input").change(function() {
            let cmyk = { c: +$("#cyan").val(), m: +$("#magenta").val(), y: +$("#yellow").val(), k: +$("#black").val() }
            obj.fromCMYK(cmyk, true)
            obj.render()
        })

        this.favoritesClick()
        this.render(visible);
        $(document).on("click", function() {
            obj.render(false)
            $(document).off("click")
        })
        $("#colorPicker").mouseleave(function() {
            $(document).on("click", function() {
                obj.render(false)
                $(document).off("click")
            })
        }).mouseenter(function() {
            $(document).off("click")
        })
    }
    setPosition(e, color) {
        let bounds = { height: $(window).height(), width: $(window).width() }
        let caller = { width: parseInt($(e.target).css("width")), height: parseInt($(e.target).css("height")), ...$(e.target).offset() }
        let size = { height: $(`#${this.id}`).outerHeight(), width: $(`#${this.id}`).outerWidth() }
        let positions = {
            top: caller.top - size.height - 5,
            bottom: caller.top + caller.height + 5,
            left: caller.left + size.width > bounds.width ? -1 : caller.left,
            right: (caller.left + caller.width) - size.width
        }
        this.position = { top: positions.top > 10 ? positions.top : positions.bottom, left: positions.left > 0 ? positions.left : positions.right }
        $(`#${this.id}`).css(this.position);
        this.container = color;
        $("#hex").val(color.val())
        this.hex = color.val()
        this.render(true)
    }

    renderCursor(ctx, linear = 0, x, y, updateCursor = true) {
        ctx.lineWidth = 1
        let p = ctx.getImageData(x, y, 1, 1).data;
        let color = this.fromRGB(p[0], p[1], p[2])
        ctx.fillStyle = "#ebebeb"
        switch (linear) {
            case 0:
                this.updateModels(this.hex, updateCursor)
                let ctxColor = document.getElementById("color").getContext("2d");
                let preview = color ? this.toRGB(color) : ctxColor.getImageData(x, y, 1, 1).data;
                this.hex = this.fromRGB(preview[0], preview[1], preview[2])
                this.outputHex = this.fromRGB(preview[0], preview[1], preview[2], true)
                this.rgb = { r: preview[0], g: preview[1], b: preview[2] }
                [x, y] = [x % 150, y % 150]
                ctx.fillRect(x + 4, y - 1, 10, 3)
                ctx.fillRect(x - 14, y - 1, 10, 3)
                ctx.fillRect(x - 1, y - 14, 3, 10)
                ctx.fillRect(x - 1, y + 4, 3, 10)
                break;
            case 1:
                this.updateModels(this.hex, updateCursor)
                y = y % 150
                this.hue = (360 * ((this.cursors.hue) / this.sizes.hue)).toFixed(0)
                this.hueHex = this.fromHSL({ h: 360 - this.hue, s: 100, l: 50 })
                ctx.fillRect(0, this.cursors.hue, 150, 3);
                break;
            case 2:
                this.alpha = (x / this.sizes.alpha).toFixed(2)
                ctx.fillRect(x, 0, 3, 150);
                break;
        }
    }
    renderAlpha(color = this.hex, updateCursor = true) {
        let c = document.getElementById("alpha");
        let ctx = c.getContext("2d");

        c.width = 150;
        c.height = 30;
        ctx.clearRect(0, 0, c.width, c.height);

        var grd = ctx.createLinearGradient(0, 0, c.width, 0);
        grd.addColorStop(0, "#0000");
        grd.addColorStop(0.8, color);
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, c.width, c.height);
        this.renderCursor(ctx, 2, this.cursors.alpha, 15, updateCursor)
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
    renderColor(color = this.hueHex, updateCursor = true) {
        let c = document.getElementById("color");
        let ctx = c.getContext("2d");

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

        this.renderCursor(ctx, 0, this.cursors.color.x, this.cursors.color.y, updateCursor)
        this.sizes.color.w = c.width
        this.sizes.color.h = c.height
        let obj = this
        $("#color").off("mousedown");
        $("#color").on("mousedown", function() {
            $(this).mousemove(function(event) {
                //obj.hue = (360 * ((event.offsetY * 2) / obj.sizes.hue)).toFixed(0)
                obj.cursors.color.y = event.offsetY
                obj.cursors.color.x = event.offsetX
                obj.render(true, false)
            })
        }).on("mouseup mouseleave", function() {
            $(this).off("mousemove");
        })
    }
    renderPreview() {
        let c = document.getElementById("preview");
        let ctx = c.getContext("2d");
        c.width = 30;
        c.height = 30;
        ctx.clearRect(0, 0, c.width, c.height);
        let color = this.fromRGB(this.rgb.r, this.rgb.g, this.rgb.b, true);
        ctx.fillStyle = color;
        this.container.val(color)
        this.container.change()
        ctx.fillRect(0, 0, c.width, c.height);
    }
    renderHue(updateCursor = true) {
        let c = document.getElementById("hue");
        let ctx = c.getContext("2d");
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
        this.renderCursor(ctx, 1, 15, this.cursors.hue, updateCursor)
        this.sizes.hue = c.height
        let obj = this
        $("#hue").off("mousedown");
        $("#hue").on("mousedown", function() {
            $(this).mousemove(function(event) {
                obj.cursors.hue = event.offsetY
                obj.render(true, false)
            })
        }).on("mouseup mouseleave", function() {
            $(this).off("mousemove");
        })
    }
    render(visible = true, updateCursor = true) {
        $(`#${this.id}`).css({ display: visible ? "block" : "none" });
        if (visible) {
            this.renderHue(updateCursor);
            this.renderColor(this.hueHex, updateCursor);
            this.renderAlpha(this.hex, updateCursor);
            this.renderPreview();
        }
    }
}