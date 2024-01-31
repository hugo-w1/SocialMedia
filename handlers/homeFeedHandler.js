
export async function handleUserFeed(db, result) {

    // console.log(result);
    let posts = await db.collection('posts').find({
    }).toArray()

    posts = posts.reverse().filter(element => {
        //remove all posts by the logged in user
        if (element.username != result.username) {
            return element;
        }
    });

    let feed = '';
    if (posts.length > 0) {

        posts.forEach(element => {

            let localTime = new Date(element.time).toLocaleDateString("sv-SV");

            feed += `<div class="userContent">
        <div class="top">
            <a href="${element.username}">
                <h4>${element.username}</h4>
            </a>
        </div>
        <div class="content_image">
        <a href="/${element.username}/content/${element.id}">
            <img src="${element.image}" alt="user uploaded photo">
            </a>
        </div>
        <div class="content_text">
            <p>${element.text}</p>
            <br>
            <h6>${localTime}</h6>
        </div>
    </div>`;
        });
    } else {
        feed = 'Nothing here';
    }


    return feed;

}

/**
 * 
 * @param {import 'http'.IncomingMessage} req 
 * @param {import 'http'.ServerResponse} res 
 * @param {*} db 
 */
export async function loadMoreFeed(req, res, db) {
    if (req.method === 'POST') {

    }
}