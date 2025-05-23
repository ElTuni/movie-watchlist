const headerEl = document.getElementById("header")
const mainEl = document.getElementById("main")


// event listener para la search bar
document.addEventListener("submit", async(e) => {
    e.preventDefault()
    // borra las busquedas anteriores y dejar en screen la barra de busquedas
    mainEl.replaceChildren(mainEl.firstElementChild)
    
    const movieName = e.target.movieName.value
    const response = await fetch(`https://www.omdbapi.com/?apikey=a0d3b366&s=${movieName}`)
    const data = await response.json()

    if (data.Response === 'True') {
        // sacamos solo los id de las peliculas
        for (const movie of data.Search){
            const movieId = movie.imdbID
            renderMovies(movieId)
        }
    } else {
        mainEl.innerHTML += `<p class="notfound">Unable to find what you’re looking for. Please try another search.</p>`
    }
    
})

// event listener para todos los clicks de la pag
document.addEventListener("click", (e) => {
    const btnValue = e.target.dataset.btn
    // renderizamos la watchlistpage, si es que apreta el boton para verlo
    if (btnValue === "mywatchlist") {
        renderWatchlist()
    } 
    // renderizamos la mainpage, si es que apreta el boton para volver, desde la wachlistpage
    else if (btnValue === "searchformovies" || e.target.closest('[data-btn="searchformovies"]')) {
        renderMainPage()
    } 
    else if (e.target.closest('[data-btn="addremovewatchlist"]')) {
        updateLocalStorage(e.target.closest('[data-btn="addremovewatchlist"]'))
    }
})





function renderMainPage() {
    headerEl.innerHTML = `
        <h1>Find your film</h1>
        <button data-btn="mywatchlist" class="header-btn">My Watchlist</button>`

    mainEl.innerHTML = `
        <form id="form">
            <i class="fa-solid fa-magnifying-glass search-i"></i>
            <input class="search-bar" name="movieName" type="text" aria-label="Search bar, for finding your movies" placeholder="Search for a movie">
            <button class="search-btn" type="submit">Submit</button>
        </form>
        <div class="notfound">
            <i class="movie-i fa-solid fa-film"></i>
            <p class="">Start exploring</p>
        </div>`
    }

function renderWatchlist(){
    mainEl.textContent = ""
    const watchlist = JSON.parse(localStorage.getItem("watchlist")) || []
    for(const movie of watchlist) {
        renderMovies(movie)
    }

    if (watchlist.length  === 0) {
        mainEl.innerHTML += `
            <div class="notfound">
                <p class="">Your watchlist is looking a little empty...</p>

                <button data-btn="searchformovies" class="add-remove-watchlist-btn margin0"><i class="fas fa-plus-circle"></i><span> Let's add some movies!</span></button>
            </div>`
    }
    // actualizamos el header button
    headerEl.querySelector("button").textContent = "Seach for movies"
    headerEl.querySelector("button").dataset.btn = "searchformovies"

}

async function renderMovies(movieId) {
    // buscamos en la api, la pelicula especifica segun su id
    const subResponse = await fetch(`https://www.omdbapi.com/?apikey=a0d3b366&i=${movieId}`) 
    const movie = await subResponse.json()

    // creamos la article
    const sectionEl = document.createElement("article")
    sectionEl.classList.add("movie-container")

    // creamos la img de
    const posterDiv = document.createElement("div")
    posterDiv.classList.add("poster-div")
    const posterEl = document.createElement("img")
    posterEl.classList.add("movie-poster")
    posterEl.alt = `Portada de ${movie.Title}`
    posterEl.src = movie.Poster
    // en caso de error al cargar la img, que la oculte
    posterEl.onerror = () => {posterEl.src = "images/movieplaceholder.png"}
    posterDiv.appendChild(posterEl)
    sectionEl.appendChild(posterDiv)



    const txtEl = document.createElement("div")
    txtEl.classList.add("movie-text")
    txtEl.innerHTML = `
        <div class="flex">
            <h2 class="movie-title margin0">${movie.Title}</h2>
            <p class="movie-puntuation margin0"><i class="fa-solid fa-star" style="color: #FFD43B;"></i>${movie.imdbRating}</p>
        </div>
        <div class="flex">
            <p class="margin0">${movie.Runtime}</p>
            <p class="margin0">${movie.Genre}</p>
            ${renderBtn(movie.imdbID)}
        </div>
        <p class="margin0">${movie.Plot}</p>`
    sectionEl.appendChild(txtEl)


    mainEl.appendChild(sectionEl)
}

// devuelve true o false si es la pelicula esta en la wachtlist o no
function isInWatchlist(id) {
    const watchlist = JSON.parse(localStorage.getItem("watchlist")) || []
    return watchlist.includes(id)
}

function renderBtn(movieId){
    let btnWachlistOrRemove
    if (isInWatchlist(movieId)) {
        btnWachlistOrRemove = `<button data-movie-id="${movieId}" data-btn="addremovewatchlist" aria-label="Eliminar de la watchlist" class="add-remove-watchlist-btn margin0"><i class="fa-solid fa-circle-minus"></i><span> Remove</span></button>`
    } else {
        btnWachlistOrRemove = `<button data-movie-id="${movieId}"data-btn="addremovewatchlist"aria-label="Añadir a watchlist" class="add-remove-watchlist-btn margin0"><i class="fas fa-plus-circle"></i><span> Watchlist</span></button>`
    }
    return btnWachlistOrRemove
}

function updateLocalStorage(btn) {

    // si es la primera vez guardando pelis, le creamos el array en localStorage o si no, buscamos en su localStorage
    let watchlist = JSON.parse(localStorage.getItem("watchlist")) || []
    const movieId = btn.dataset.movieId

    // si ya esta agregado, se lo elimina de la watchlist 
    if (isInWatchlist(movieId)){
        watchlist = watchlist.filter(watchlistMovieId => watchlistMovieId !== movieId)
        
        // modificamos el DOM asi cambia de apecto el boton
        btn.querySelector('i').className = ""
        btn.querySelector('i').classList.add("fas", "fa-plus-circle")
        btn.querySelector('span').textContent = " Watchlist"
        btn.setAttribute('aria-label', "Añadir a watchlist")
        
    } 
    // si no esta agregado, lo sumamos a la watchlist
    else {
        watchlist.push(movieId)
        
        // modificamos el DOM asi cambia de apecto el boton
        btn.querySelector('i').className = ""
        btn.querySelector('i').classList.add("fa-solid", "fa-circle-minus")
        btn.querySelector('span').textContent = " Remove"
        btn.setAttribute('aria-label', "Eliminar de la watchlist")
    }

    // actualizamos del localStorage con la nueva watchlist
    localStorage.setItem("watchlist", JSON.stringify(watchlist))
    
    
}

renderMainPage()

