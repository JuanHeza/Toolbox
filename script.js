/*
if ("serviceWorker" in navigator) {
    window.addEventListener("load", function() {
        navigator.serviceWorker
            .register("/serviceWorker.js")
            .then(res => console.log("service worker registered"))
            .catch(err => console.log("service worker not registered", err))
    })
}
*/
var colorPicker = new ColorPicker()
$(".button").click(function(e) {
    e.preventDefault()
    colorPicker = colorPicker ? colorPicker : new ColorPicker()
    colorPicker.setPosition(e, $(`#${$(this).attr("for")}`))
    console.log(colorPicker)
})
$("input[type=color]").change(function() {
    let id = $(this).attr("id")
    $(`label[for=${id}]`).css({ color: $(this).val() })
})