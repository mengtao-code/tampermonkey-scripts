// ==UserScript==
// @name             Shit
// @name:en          Shit
// @version          0.0.1
// @namespace        https://github.com/maboloshi/UserScripts/
// @description      Shit
// @description:en   Display anti-hotlinking images, for forced not send a referrer.
// @include          http*://*.inoreader.com/*
// @icon             http://www.inoreader.com/favicon.ico
// @grant GM_xmlhttpRequest
// @connect *
// ==/UserScript==
const config = {
    name: "image-loader",
    urlPrefix: [
        'https://tvax4.sinaimg.cn'
    ]
}


function customBase64Encode(inputStr) {
    var
        bbLen = 3,
        enCharLen = 4,
        inpLen = inputStr.length,
        inx = 0,
        jnx,
        keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"
            + "0123456789+/=",
        output = "",
        paddingBytes = 0;
    var
        bytebuffer = new Array(bbLen),
        encodedCharIndexes = new Array(enCharLen);

    while (inx < inpLen) {
        for (jnx = 0; jnx < bbLen; ++jnx) {
            /*--- Throw away high-order byte, as documented at:
              https://developer.mozilla.org/En/Using_XMLHttpRequest#Handling_binary_data
            */
            if (inx < inpLen)
                bytebuffer[jnx] = inputStr.charCodeAt(inx++) & 0xff;
            else
                bytebuffer[jnx] = 0;
        }

        /*--- Get each encoded character, 6 bits at a time.
            index 0: first  6 bits
            index 1: second 6 bits
                        (2 least significant bits from inputStr byte 1
                         + 4 most significant bits from byte 2)
            index 2: third  6 bits
                        (4 least significant bits from inputStr byte 2
                         + 2 most significant bits from byte 3)
            index 3: forth  6 bits (6 least significant bits from inputStr byte 3)
        */
        encodedCharIndexes[0] = bytebuffer[0] >> 2;
        encodedCharIndexes[1] = ((bytebuffer[0] & 0x3) << 4) | (bytebuffer[1] >> 4);
        encodedCharIndexes[2] = ((bytebuffer[1] & 0x0f) << 2) | (bytebuffer[2] >> 6);
        encodedCharIndexes[3] = bytebuffer[2] & 0x3f;

        //--- Determine whether padding happened, and adjust accordingly.
        paddingBytes = inx - (inpLen - 1);
        switch (paddingBytes) {
            case 1:
                // Set last character to padding char
                encodedCharIndexes[3] = 64;
                break;
            case 2:
                // Set last 2 characters to padding char
                encodedCharIndexes[3] = 64;
                encodedCharIndexes[2] = 64;
                break;
            default:
                break; // No padding - proceed
        }

        /*--- Now grab each appropriate character out of our keystring,
            based on our index array and append it to the output string.
        */
        for (jnx = 0; jnx < enCharLen; ++jnx)
            output += keyStr.charAt(encodedCharIndexes[jnx]);
    }
    return output;
}

const getSrc = (data) => {
    var binResp = customBase64Encode(data.responseText);
    let src = `data:image/jpeg;base64,${binResp}`
    return src;
}

const get = (url) => {
    return new Promise((resolve, reject) => {
        GM.xmlHttpRequest({
            method: "GET",
            url: url,
            headers: {
                "Accept": "*/*",
                "referrerPolicy": "no-referrer",
                "Referer": "https://weibo.com"
            },
            onload: resolve,
            onerror: reject,
            overrideMimeType: 'text/plain; charset=x-user-defined'
        });
    })
}

const main = () => {
    config.urlPrefix.forEach(prefix => {
        let images = Array.from(document.querySelectorAll(`.article_content img[data-original-src^='${prefix}']`));
        console.log(`${config.name} load images. images length:${images.length}`)
        images.forEach(image => {
            if (image.getAttribute('processed-tag') !== 'true') {
                image.setAttribute('alt', 'loading...')
                const originalSrc = image.getAttribute("data-original-src");
                console.log(`originalSrc:${originalSrc}`)
                get(originalSrc)
                    .then(data => {
                        image.setAttribute('src', getSrc(data))
                    })
                    .catch(e => console.error(`FBI warning! ${e}`))
                    .finally(() => image.setAttribute('processed-tag', 'true'))
            }
        })
    })
}

setInterval(main, 3000)
