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