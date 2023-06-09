// ==UserScript==
// @name                 fix-image-error at inoreader
// @name:zh-CN           修复inoreader图片异常
// @version              0.1.0
// @namespace            https://github.com/mengtao-code
// @description          Fix image load error caused by CSP(Content Security Policy)
// @description:zh-CN    修复inoreader的图片加载问题
// @author               Mengtao Xin
// @license              MIT
// @supportURL           https://github.com/mengtao-code/tampermonkey-scripts
// @include              http*://*.inoreader.com/*
// @icon                 http://www.inoreader.com/favicon.ico
// @grant                GM_xmlhttpRequest
// @connect              *
// ==/UserScript==
const config = {
    name: "fix-image-error",
    data: [ // weibo images prefix
        {
            imageServer: 'sinaimg.cn',
            customHeader: {
                Referer: 'https://weibo.com'
            }
        }
    ]
}

/**
 * 
 * @link https://stackoverflow.com/questions/8778863/downloading-an-image-using-xmlhttprequest-in-a-userscript
 * @param {*} inputStr 
 * @returns {string}
 */
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
            if (inx < inpLen)
                bytebuffer[jnx] = inputStr.charCodeAt(inx++) & 0xff;
            else
                bytebuffer[jnx] = 0;
        }
        encodedCharIndexes[0] = bytebuffer[0] >> 2;
        encodedCharIndexes[1] = ((bytebuffer[0] & 0x3) << 4) | (bytebuffer[1] >> 4);
        encodedCharIndexes[2] = ((bytebuffer[1] & 0x0f) << 2) | (bytebuffer[2] >> 6);
        encodedCharIndexes[3] = bytebuffer[2] & 0x3f;
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
        for (jnx = 0; jnx < enCharLen; ++jnx)
            output += keyStr.charAt(encodedCharIndexes[jnx]);
    }
    return output;
}

/**
 *
 * @param data data from http request
 * @returns {string}
 */
const getImageUrl = (data) => {
    var binResp = customBase64Encode(data.responseText);
    let src = `data:image/jpeg;base64,${binResp}`
    return src;
}

/**
 * send get http request
 * @param url
 * @param customHeader
 * @returns {Promise<unknown>}
 */
const httpGetRequest = (url, customHeader) => {
    return new Promise((resolve, reject) => {
        GM.xmlHttpRequest({
            method: "GET",
            url: url,
            headers: {
                "Accept": "*/*",
                "referrerPolicy": "no-referrer",
                ...customHeader
            },
            onload: resolve,
            onerror: reject,
            overrideMimeType: 'text/plain; charset=x-user-defined'
        });
    })
}

const processImage = (dom, customHeader) => {
    if (dom.getAttribute('processed-tag') !== 'true') {
        dom.setAttribute('alt', 'loading...')
        const originalSrc = dom.getAttribute("data-original-src");
        httpGetRequest(originalSrc, customHeader)
            .then(data => {
                dom.setAttribute('src', getImageUrl(data))
            })
            .catch(e => console.error(`${config.name} load image failed! ${e}`))
            .finally(() => dom.setAttribute('processed-tag', 'true'))
    }
}

/**
 * 检测到有异常图片，就调整成正常的图片
 */
const main = () => {
    config.data.forEach(({ imageServer, customHeader }) => {
        Array.from(
            document.querySelectorAll(`.article_content img[data-original-src*='${imageServer}']`))
            .forEach(image => processImage(image, customHeader));
    })
}

setInterval(main, 3000)
