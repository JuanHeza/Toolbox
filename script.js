if ("serviceWorker" in navigator) {
    window.addEventListener("load", function() {
        navigator.serviceWorker
            .register("/serviceWorker.js")
            .then(res => console.log("service worker registered"))
            .catch(err => console.log("service worker not registered", err))
    })
}

function draw() {
    let json = `{"alto":591,"ancho":1091,"resolucion":96,"altoCms":15.64,"anchoCms":28.87,"fondo":{"image":"none","color":"#ffffff"},"nombre":"prueba2","proyectoId":2,"elementos":[{"id":"elemento_0","type":"fondos","ancho":774,"alto":560,"capa":0,"parent":"droppableTemplate","horizontal":158,"vertical":7,"horizontalReal":158,"verticalReal":7,"ruta":"/galeria/ot/plantilla/imagen/fondo/16-poster-pe-2-promos.png","titulo":"16-poster-pe-2-promos","proyecto":0},{"id":"elemento_8","type":"fondos","ancho":1079,"alto":582,"capa":1,"parent":"droppableTemplate","horizontal":6,"vertical":4,"horizontalReal":6,"verticalReal":4,"ruta":"/galeria/ot/plantilla/imagen/fondo/imagen-39.png","titulo":"imagen-39","proyecto":0},{"id":"elemento_3","type":"texto","ancho":345,"alto":206,"capa":2,"parent":"droppableTemplate","horizontal":561,"vertical":309,"horizontalReal":561,"verticalReal":309,"props":{"fontFamily":"fagocolfblack","fontSize":40,"color":"rgb(102, 51, 153)","alignment":"center","italic":false,"bold":true,"strike":false}},{"id":"elemento_5","type":"mecanicas","ancho":718,"alto":267,"capa":3,"parent":"droppableTemplate","horizontal":184,"vertical":33,"horizontalReal":184,"verticalReal":33,"fondo":{"color":"rgba(255, 255, 255, 0.533)","image":"none"},"titulo":""},{"id":"elemento_10","type":"img","ancho":373,"alto":205,"capa":4,"parent":"droppableTemplate","horizontal":176,"vertical":309,"horizontalReal":176,"verticalReal":309},{"id":"elemento_9","type":"bloques","ancho":375,"alto":309,"capa":5,"parent":"droppableTemplate","horizontal":358,"vertical":141,"horizontalReal":358,"verticalReal":141,"ruta":"/galeria/ot/plantilla/imagen/recurso/3-poster-pe-2-promos.png","titulo":"3-poster-pe-2-promos","proyecto":0}],"mecanicas":[{"id":"elemento_5","mecanicaId":null,"titulo":"","fondo":{"color":"rgba(255, 255, 255, 0.533)","image":"none"},"ancho":718,"alto":267,"horizontal":184,"vertical":33,"elementos":[],"edited":false}],"newParents":{},"calidad":null,"altoMiniatura":"271","edited":true,"anchoMiniatura":"500","capas":null}
`
    const canvas = document.getElementById('tutorial');
    let parsed = JSON.parse(json)

    canvas.width = parsed.ancho;
    canvas.height = parsed.alto;
    if (canvas.getContext) {
        const ctx = canvas.getContext('2d');
        ctx.lineWidth = 2;
        //parsed.elementos.forEach(el => {
        (async function() {
            for await (let el of parsed.elementos) {
                console.log(el)
                ctx.strokeStyle = "#151515";
                ctx.setLineDash([]);
                switch (el.type) {
                    case "mecanicas":
                        ctx.strokeStyle = "#4f9f3d";
                        break;
                    case "img":
                    case "texto":
                        ctx.setLineDash([5]);
                        break;
                }

                if (el.type == "bloques" || el.type == "fondos") {
                    const img = new Image();
                    img.onload = () => {
                        let escala = (img.width > el.ancho || img.height > el.alto)
                        ctx.drawImage(img, el.horizontalReal, el.verticalReal, escala ? el.ancho : img.width, escala ? el.alto : img.height);
                    };
                    img.src = "http://desarrollo.novasys.com.mx:8081/" + el.ruta;
                } else {
                    ctx.strokeRect(el.horizontalReal, el.verticalReal, el.ancho, el.alto);
                }
            }//)
        })()
    }
    //canvas.width = 500
}

$("#button").click(function() {
    test = new ColorPicker()
    console.log(test)
})