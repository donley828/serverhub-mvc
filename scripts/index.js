/**
 * ServerHub Doc Page Script
 * 
 * ServerHub MVC Doc, MIT License
 * March 15, 2018
 * Yang Zhongdong (yangzd1996@outlook.com)
 */

const header = document.querySelector('header')
const header_div_logo = header.querySelector('.serverhub-logo');
const main = document.querySelector('main');
const content = main.querySelector('div.content');
window.onload = function () {
    main.addEventListener('scroll', (ev) => {
        if (ev.target !== main) return;
        window.requestAnimationFrame(() => {
            if (main.scrollTop <= 200) {
                header_div_logo.style.left = (200 - main.scrollTop) / 200 * (document.body.clientWidth / 2 - 0.5 * header_div_logo.clientWidth) + 'px';
            } else if (main.scrollTop > 200) {
                header_div_logo.style.left = 16 + 'px';
            } else {
                header_div_logo.style.left = 'calc(50% - 75.22px);'
            }
        });
    });
    header_div_logo.addEventListener('click', () => {
        location.href = '../'
    });
    let div = document.createElement('div');
    div.classList.add('github-link');
    if(location.pathname.indexOf('/zh_cn')!==-1)
    div.innerHTML = `<a href='https://github.com/DevChache/serverhub-mvc/'>访问 GitHub 源码仓库</a>`;
    else
    div.innerHTML = `<a href='https://github.com/DevChache/serverhub-mvc/'>View on GitHub</a>`
    content.appendChild(div);
}