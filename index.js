/* http://127.0.0.1/

&expires_in=315360000
&token_type=bearer
&refresh_token=aa219e38017b8483f970e2dd833dd8accdeaaadb&account_username=aleleo&account_id=161895473 */
let ID = '449e2a8db6c6e01'
let SECRET = 'b5a8443d64b167b9c94f089bc3e36584b8b08b7e'
let token = ''
let counter = 0;



refreshImgurToken = function () {
    var myHeaders = new Headers();
    myHeaders.append("Authorization", "Client-ID 449e2a8db6c6e01");

    var formdata = new FormData();
    formdata.append("refresh_token", "aa219e38017b8483f970e2dd833dd8accdeaaadb");
    formdata.append("client_id", ID);
    formdata.append("client_secret", SECRET);
    formdata.append("grant_type", "refresh_token");

    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: formdata,
        redirect: 'follow'
    };

    return fetch("https://api.imgur.com/oauth2/token", requestOptions)

}

getFavImages = async function (a, search) {
    var myHeaders = new Headers();
    myHeaders.append("Authorization", `Bearer ${token}`);


    var requestOptions = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow'
    };



    fetch("https://api.imgur.com/3/account/aleleo/gallery_favorites/", requestOptions).then(response => {
        if ([401, 403].includes(response.status)) {
            refreshImgurToken().then(response => {
                if (response.status === 200); {
                    response.json().then(res => {
                        token = res.access_token;
                        console.log(res, token);
                        counter++;
                        if (counter !== 3) getFavImages(a, search);
                        else return

                    });

                }
            }).catch(error => console.log('error', error));
        }
        else {
            response.json().then((result) => {
                arr = Array.from(result.data);
                console.log('/////', arr);
                if (arr.length > 0) {

                    console.log(search)
                 
                    let aa = arr.filter((elem) => { return elem.title.toLowerCase().trim().includes(search) });
                    console.log(aa);
                    let rand = Math.floor(Math.random() * aa.length);
                    console.log(aa[rand]);
                    let index = a[0].innerText;
                    if (aa[rand].images) {
                        (aa[rand].images[0].link === a[3].src) ? a[3].src = ORIGINAL_DATA[parseInt(index)].img : a[3].src = aa[rand].images[0].link;
                    }
                    else { a[3].src = ORIGINAL_DATA[parseInt(index)].img }
                    console.log(a[3])
                  
                }
            });

        }
    });



}


textFixer = function (data) {
    return data.replace(`\n`, '');
};

summarizeArticle = function (a) {
    console.log(a);

    let data = a[2].children[2].innerText;
    console.log(data);
    sendOpenAIreq(data, a[2].children[2]);

}

showOriginalImage = function (a) {
    console.log(ORIGINAL_DATA[parseInt(a[0].innerText)].img)
    a[3].src = ORIGINAL_DATA[parseInt(a[0].innerText)].img
}

viewOriginalData = function (a) {
    let i = a[0].innerText;
    a[2].children[2].innerText = textFixer(ORIGINAL_DATA[parseInt(i)].text);

}


Array.from(document.querySelectorAll('section')).forEach(
    section => {
        console.log(section.children);
        section.children[1].children[0].addEventListener('click', () => {
            summarizeArticle(section.children);
            section.children[1].children[0].disabled = true
            section.children[1].children[1].disabled = false;
        });
        section.children[1].children[1].addEventListener('click', () => {
            viewOriginalData(section.children);
            section.children[1].children[0].disabled = false;
            section.children[1].children[1].disabled = true;
        });
        section.children[3].addEventListener('click', () => {
            getImageRelatedToArticle(section.children);
            section.children[3].alt = 'Nuova immagine non trovata'

        });
        section.children[4].addEventListener('click', () => {
            showOriginalImage(section.children)
        })
    })




sendOpenAIreq = function (data, field) {
    let myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Authorization", "Bearer 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");

    let raw = JSON.stringify({
        "prompt": textFixer(data) + '/n Tl;dr:',
        "temperature": 0.8,
        "max_tokens": 2000,
        "top_p": 1,
        "frequency_penalty": 0,
        "presence_penalty": 0
    });

    let requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow'
    };

    fetch("https://api.openai.com/v1/engines/text-davinci-002/completions", requestOptions)
        .then(response => response.json())
        .then(result => {
            console.log(result.choices[0]);
            field.innerText = result.choices[0].text;

        })
        .catch(error => console.log('error', error));

}


getImageRelatedToArticle = function (a) {
    let search = '';
    let index = a[0].innerText;
    switch (parseInt(index)) {
        case 1:
            search = 'bnp';
            break;
        case 2:
            search = 'hsbc';
            break;
        case 3:
            search = 'crédit'
            break;
        case 4:
            search = 'deutsche';
            break;
        case 5:
            search = 'banco';
            break;
    }

    console.log(search);
    getFavImages(a, search)

}