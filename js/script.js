fetch('https://my.api.mockaroo.com/website_entries.json?key=7d9d28a0')
  .then(response => {
    return response.ok ? response.json() : (function () { throw Error(response.statusText) }())
  })

  .then(data => {
    //TODO:
    //call graph plotting functions
    console.log(data)
  })

  .catch(error => {
    console.log("fetch error")
  })

cursor = document.querySelector("#cursor")
document.querySelector("body").onmousemove = (e) => {
    cursor.style.top = `${e.clientY - cursor.offsetHeight / 2}px`
    cursor.style.left = `${e.clientX - cursor.offsetWidth / 2}px`
}