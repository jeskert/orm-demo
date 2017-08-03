const request = require('sync-request');
const cheerio = require('cheerio');

function getDoubanCommentFromWebpage(req, url, id) {
    let res = request('GET', url);
    return extractDocument(req, res.getBody().toString(), id);
}
function extractDocument(req, body, id) {
    let $ = cheerio.load(body);
    let summaries = $('#hot-comments').children('div.comment-item');
    summaries.each(function () {
        let commentDiv= $(this).children('div.comment');
        let user = commentDiv.find('.comment-info').find('a').text();
        let content = commentDiv.children('p').text();
        let comment = {
            movie_id: id,
            user: user,
            content: content
        };
        createComment(req, comment);
    })
}

function createComment(req, comment) {
    req.models.Comment.create(comment, function (err, result) {
        if (err) {
            console.log(err);
        } else {
            console.log("success insert comment");
        }
    })
}

module.exports = getDoubanCommentFromWebpage;