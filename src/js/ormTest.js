const orm = require('orm');
const express = require('express');
const scrapy = require('./douban-movie-scrapy');
const scrapyComment = require('./douban-comment-scrapy');
const path = require('path');

let app = express();
let appRoot = path.join(__dirname, '../../');

app.use(orm.express(`sqlite:${appRoot}movies.db`, {
    define: function (db, models, next) {
        // 定义model 把数据库的类型映射为node.js的类型，长度、唯一、是否可空等配置将使用数据库中的定义，
        // Node.js的类型有Number、String、Boolean、Date、Object、Buffer和Array。
        models.Genre = db.define("genre", {
            id : Number,
            name : String
        });

        models.Movie = db.define("movie", {
            id: Number,
            alt : String,
            year : Number,
            title : String,
            rating : String,
            original_title: String,
            directors : String,
            casts : String,
            image: String
        });

        models.MovieGenre = db.define("movie_genre", {
            id : Number,
            movie_id : Number,
            genre_id : Number
        });

        models.Comment = db.define("comment", {
            id : Number,
            movie_id: Number,
            user: String,
            content: String
        });
        next();
    }
}));

app.get('/', function (req, res, next) {
    req.models.Movie.find(function (err, movies) {
        if (err) {
            res.send(err);
        }

        res.send(JSON.stringify(movies));
    });
});

app.get('/scrapy', function (req, res, next) {
    req.models.Genre.find(function (err, genres) {
        if (err) {
            res.send(err);
        }
        res.send(scrapy.saveTop250Data(req, genres));
    })
});


app.get('/scrapyByTag', function (req, res, next) {
    req.models.Genre.find(function (err, genres) {
        if (err) {
            res.send(err);
        }
        for (let tag of genres) {
            scrapy.saveDataByTag(req, tag, genres);
        }
        res.send('success');
    })
});

app.get('/scrapyComment', function (req, res, next) {
    req.models.Movie.find(function (err, movies) {
        if (err) {
            res.send(err);
        }
        for (let movie of movies) {
            try {
                scrapyComment(req, movie.alt, movie.id);
            } catch (e) {
                console.log(movie.id);
            }
        }
        res.send('success');
    });
});

app.get('/scrapyCommentById', function (req, res, next) {
    let movieId = req.query.id;
    req.models.Movie.find({id: movieId}, function (err, movies) {
        if (err) {
            res.send(err);
        } else {
            for (let movie of movies) {
                try {
                    scrapyComment(req, movie.alt, movie.id);
                } catch (e) {
                    console.log(movie.id);
                    console.log(e);
                }
            }
        }
        res.send("success");
    })

});

var server = app.listen(8081, function () {

    var host = server.address().address;
    var port = server.address().port;

    console.log("应用实例，访问地址为 http://%s:%s", host, port)

});

