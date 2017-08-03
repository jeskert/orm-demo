const request = require('sync-request');

function getDoubanTop250Movies(start, count) {
    let res = request('GET', `https://api.douban.com/v2/movie/top250?start=${start}&count=${count}`);
    return JSON.parse(res.getBody()).subjects;
}

function getDoubanMovieByTag(start, count, tag) {
    let res = request('GET', `https://api.douban.com/v2/movie/search?tag=${tag}&start=${start}&count=${count}`);
    return JSON.parse(res.getBody()).subjects;
}

function createMovieGenres(movieGenres, req) {
    for (let movieGenre of movieGenres) {
        req.models.MovieGenre.create(movieGenre, function (err, result) {
            if (err) {
                console.log(err);
            } else {
                console.log("success insert genre")
            }
        });
    }
}
function createMovie(req, movieToSave) {
    req.models.Movie.create(movieToSave, function (err, result) {
        if (err) {
            console.log(err);
        } else {
            console.log("success insert movie")
        }
    });
}
function saveSelectedData(moviesfromDouban, genres, req) {
    for (let movie of moviesfromDouban) {
        let casts = [], directors = [];
        for (let cast of movie.casts) {
            casts.push(cast.name);
        }
        for (let director of movie.directors) {
            directors.push(director.name);
        }
        let movieToSave = {
            id: movie.id,
            alt: movie.alt,
            year: movie.year,
            title: movie.title,
            rating: movie.rating.average,
            original_title: movie.original_title,
            directors: directors.join(","),
            casts: casts.join(","),
            image: movie.images.medium
        };

        let movieGenres = [];
        for (let currentGenre of movie.genres) {
            for (let genre of genres) {
                if (currentGenre == genre.name) {
                    movieGenres.push({
                        movie_id: movie.id,
                        genre_id: genre.id
                    });
                    break;
                }
            }
        }

        createMovie(req, movieToSave);
        createMovieGenres(movieGenres, req);
    }
}
function saveTop250Data(req, genres) {
    let moviesfromDouban = getDoubanTop250Movies(0,100).concat(getDoubanTop250Movies(100,100)).concat(getDoubanTop250Movies(200, 100));
    saveSelectedData(moviesfromDouban, genres, req);
}

function saveDataByTag(req, tag, genres) {
    let moviesFromDouban = [];
    for (let start = 0; start < 20; start += 20) {
        moviesFromDouban.concat(getDoubanMovieByTag(start, 20, tag.name));
    }
    saveSelectedData(moviesFromDouban, genres, req);
}

module.exports = {
    saveTop250Data,
    saveDataByTag
};