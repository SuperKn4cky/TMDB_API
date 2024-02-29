//const omdbApiKey = 'c2bc3882';
const tmdbApiKey = '50737f4e77296fa2ea82939cba5b9bac';
const baseUrl = `https://api.themoviedb.org/3/`;

window.onload = home;
document.getElementById("search").focus();

function home() {
    displayMenuMovies();
    constructDropdownGenres();
    constructDropdownNote();
}

async function displayMenuMovies() {
    let movieDisplay = document.getElementById("section2");
    movieDisplay.innerHTML = "";
    
    fetch(`${baseUrl}movie/popular?api_key=${tmdbApiKey}&language=fr-FR`)
    .then(response => response.json())
    .then(response => {
        displayMovieList(response.results, movieDisplay);
        constructCarouselItem(response.results);
        document.getElementById("pagination").style.display = "none";
    })
    .catch(() => console.log("Erreur de recherche"))
    .finally(() => document.getElementById("search").value = "");
}
    
function constructCarouselItem(movies) {
    const carouselInner = document.getElementById("carousel");
    carouselInner.innerHTML = "";

    movies.forEach((movie, index) => {
        let carouselItemHtml = `
            <div class="carousel-item ${index === 0 ? "active" : ""}">
                <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" class="d-block w-100" alt="${movie.title}">
            </div>`;
        carouselInner.insertAdjacentHTML("beforeend", carouselItemHtml);
    });
}

let searchType = null;

function searchMovie(page) {
    currentPage = page;
    searchType = 'name';
    let movieName = document.getElementById("search").value.toLowerCase();
    let url = `${baseUrl}search/movie?api_key=${tmdbApiKey}&query=${movieName}&page=${page}&language=fr-FR`
    lastSearch = url;
    fetch(url)
        .then(response => response.json())
        .then(response => {
            if (response.total_results === 0)
                console.log("Film inconnu");
            else {
                document.getElementById("carousel").innerHTML = "";
                document.getElementById("section2").innerHTML = "";
                displayMovieList(response.results, document.getElementById("section2"));
                lastSearch = movieName;
                document.getElementById("page-number").textContent = page;
                document.getElementById("page-max").textContent = response.total_pages;
                document.getElementById("pagination").style.display = "flex";
            }
        })
        .catch(() => console.log("Erreur de recherche"))
        .finally(() => document.getElementById("search").value = "");
}

let inputButton = document.getElementById("search");
inputButton.onkeyup = function(e){
    if(e.keyCode == 13) {
        searchMovie(1);
    }
}

function displayMovieList(movies, parentElement) {
    parentElement.innerHTML = "";
    movies.forEach(movie => {
        let poster = movie.poster_path ? `<img src="https://image.tmdb.org/t/p/w200${movie.poster_path}" class="card-img-top" alt="${movie.title}">` : `<img src="https://placehold.co/200x300?text=Image+indisponible" class="card-img-top" alt="${movie.title}">`;
        let movieElementHtml = `
            <div class="card w-25 mt-3 text-center">
            ${poster}
                <div class="card-body">
                    <h5 class="card-title">${movie.title}</h5>
                    <button class="btn btn-primary" onclick="showMovieInfo('${movie.id}')">Info</button>
                </div>
            </div>`;
        parentElement.insertAdjacentHTML("beforeend", movieElementHtml);
    });
}

function showMovieInfo(id) {
    fetch(`${baseUrl}movie/${id}?api_key=${tmdbApiKey}&language=fr-FR`)
        .then(response => response.json())
        .then(movie => {
            document.getElementById("movieInfoModalLabel").innerText = movie.title;
            document.querySelector(".modal-body").innerHTML = `
                <img src="${`https://image.tmdb.org/t/p/w200` + movie.poster_path}" alt="${movie.title}" class="img-fluid">
                <p><strong>Year:</strong> ${movie.release_date}</p>
                <p><strong>Genre.s:</strong> ${movie.genres.map(genre => genre.name).join(', ')}</p>
                <p><strong>Note:</strong> ${movie.vote_average}</p>
                <p><strong>Synopsis:</strong> ${movie.overview}</p>
            `;

            var myModal = new bootstrap.Modal(document.getElementById('movieInfoModal'));
            myModal.show();
        });
}

let currentPage = 1;
let lastSearch = null;

function changePage(change) {
    currentPage += change;
    currentPage = Math.max(currentPage, 1);

    document.getElementById("page-number").textContent = currentPage;
    if (searchType === 'id' || searchType === 'note')
        loadMovies(lastSearch, document.getElementById("title").textContent);
    else if (searchType === 'name' && lastSearch) {
        document.getElementById("search").value = lastSearch;
        searchMovie(currentPage);
    } else
        displayMenuMovies();
}

function constructDropdownGenres() {
    document.getElementById("genres-dropdown").innerHTML = "";
    fetch(`${baseUrl}genre/movie/list?api_key=${tmdbApiKey}&language=fr-FR`)
    .then(response => response.json())
    .then(response => {
        for(item of response.genres){
            let itemElement = `<li><p class="dropdown-item" id="${item.id}" onclick="handleGenre(event)">${capitalize(item.name)}</p></li>`;
            document.getElementById("genres-dropdown").insertAdjacentHTML("beforeend", itemElement);
        }
    });
}

function handleGenre(e) {
    e.preventDefault();
    searchType = 'id';
    currentPage = 1;
    loadMovies(`${baseUrl}discover/movie?api_key=${tmdbApiKey}&with_genres=${ e.target.id}&language=fr-FR`, e.target.textContent);
}

function loadMovies(url, tile) {
    document.getElementById("carousel").innerHTML = "";
    document.getElementById("section2").innerHTML = "";
    document.getElementById("title").textContent = tile;
    document.getElementById("page-number").textContent = currentPage;

    fetch(url + `&page=${currentPage}`)
    .then(response => response.json())
    .then(response => {
        lastSearch = url;
        displayMovieList(response.results, document.getElementById("section2"));
        document.getElementById("page-max").textContent = response.total_pages;
        document.getElementById("pagination").style.display = "flex";
    });
}

function capitalize(str){
    return str.charAt(0).toUpperCase() + str.slice(1);
}


function constructDropdownNote() {
    document.getElementById("note-dropdown").innerHTML = "";
        for(let i = 1; i <= 10; i++) {
            let stars = '⭐'.repeat(i);
            let itemElement = `<li><p class="dropdown-item" id="${i}" onclick="handleNote(event)" style="text-align:center;">${stars}</p></li>`;
            document.getElementById("note-dropdown").insertAdjacentHTML("beforeend", itemElement);
        }
}

function handleNote(e) {
    e.preventDefault();
    currentNote = e.target.id;
    searchType = 'note';
    currentPage = 1;
    loadMovies(`${baseUrl}discover/movie?api_key=${tmdbApiKey}&language=fr-FR&vote_average.gte=${e.target.id}&vote_average.lte=${Number(e.target.id) + 0.9}&vote_count.gte=50`, 'note: ' + e.target.id + '⭐');
}