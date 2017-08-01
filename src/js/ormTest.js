const orm = require('orm');
const express = require('express');
let app = express();

app.use(orm.express("mysql://root:@localhost:3306/test", {
    define: function (db, models, next) {
        // 定义model 把数据库的类型映射为node.js的类型，长度、唯一、是否可空等配置将使用数据库中的定义，
        // Node.js的类型有Number、String、Boolean、Date、Object、Buffer和Array。
        models.User = db.define("user", {
            id : Number,
            name : String,
            age : Number
        });
        next();
    }
}));

app.get('/', function (req, res, next) {
    req.models.User.find(function (err, users) {
        if (err) {
            res.send(err);
        }

        res.send(JSON.stringify(users));
    })
});

var server = app.listen(8081, function () {

    var host = server.address().address;
    var port = server.address().port;

    console.log("应用实例，访问地址为 http://%s:%s", host, port)

});

