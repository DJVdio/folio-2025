import * as THREE from 'three/webgpu'

const text = `
██████╗      ██╗██╗   ██╗██████╗ ██╗ ██████╗
██╔══██╗     ██║██║   ██║██╔══██╗██║██╔═══██╗
██║  ██║     ██║██║   ██║██║  ██║██║██║   ██║
██║  ██║██   ██║╚██╗ ██╔╝██║  ██║██║██║   ██║
██████╔╝╚█████╔╝ ╚████╔╝ ██████╔╝██║╚██████╔╝
╚═════╝  ╚════╝   ╚═══╝  ╚═════╝ ╚═╝ ╚═════╝

╔═ Intro ═══════════════╗
║ Hey, I'm hufangwei (DJVdio).
║ This is a local fork of Bruno Simon's 2025 folio — just for fun.
║ Drive around and poke at things.
╚═══════════════════════╝

╔═ Socials ═══════════════╗
║ Mail           ⇒ 592161467@qq.com
║ GitHub         ⇒ https://github.com/DJVdio
║ Bilibili       ⇒ https://b23.tv/GiAhchK
║ LinkedIn       ⇒ Fangwei Hu (search on linkedin.com)
╚═══════════════════════╝

╔═ Debug ═══════════════╗
║ Access debug mode by adding #debug at the end of the URL and reloading.
║ Press [V] to toggle the free camera.
╚═══════════════════════╝

╔═ Three.js ════════════╗
║ Three.js is the library used to render this 3D world (release: ${THREE.REVISION})
║ https://threejs.org/
╚═══════════════════════╝

╔═ Credits ════════════╗
║ Based on Bruno Simon's open-source portfolio (MIT license)
║ https://github.com/brunosimon/folio-2025
╚═══════════════════════╝

╔═ Musics ══════════════╗
║ Music by Kounine (CC0 license)
║ https://linktr.ee/Kounine
╚═══════════════════════╝

╔═ Some more links ═════╗
║ Rapier (Physics library)  ⇒ https://rapier.rs/
║ Howler.js (Audio library) ⇒ https://howlerjs.com/
║ Amatic SC (Fonts)         ⇒ https://fonts.google.com/specimen/Amatic+SC
║ Nunito (Fonts).           ⇒ https://fonts.google.com/specimen/Nunito?query=Nunito
╚═══════════════════════╝
`
let finalText = ''
let finalStyles = []
const stylesSet = {
    letter: 'color: #ffffff; font: 400 1em monospace;',
    pipe: 'color: #D66FFF; font: 400 1em monospace;',
}
let currentStyle = null
for(let i = 0; i < text.length; i++)
{
    const char = text[i]

    const style = char.match(/[╔║═╗╚╝╔╝]/) ? 'pipe' : 'letter'
    if(style !== currentStyle)
    {
        currentStyle = style
        finalText += '%c'

        finalStyles.push(stylesSet[currentStyle])
    }
    finalText += char
}

export default [finalText, ...finalStyles]
