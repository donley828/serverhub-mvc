/**
 * ServerHub Doc Page Script
 * 
 * ServerHub MVC Doc, MIT License
 * March 15, 2018
 * Yang Zhongdong (yangzd1996@outlook.com)
 */

function adjust_section_screen_height() {
    let avaliableHeight = window.innerHeight - header.clientHeight;
    main.querySelectorAll('section.screen').forEach((section, idx) => {
        section.style.height = avaliableHeight + 'px';
        section.style.top = idx * avaliableHeight + 'px';
        section.classList.add('idx' + idx);
    })
}


window.addEventListener('resize', () => {
    adjust_section_screen_height();
})
adjust_section_screen_height();