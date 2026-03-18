import * as THREE from 'three/webgpu'

// TODO: Replace the ASCII art below with your own name/brand (use https://patorjk.com/software/taag/ to generate)
// TODO: Replace all placeholder social links in the Socials section
const text = `
███╗   ███╗██╗   ██╗
████╗ ████║╚██╗ ██╔╝
██╔████╔██║ ╚████╔╝
██║╚██╔╝██║  ╚██╔╝
██║ ╚═╝ ██║   ██║
╚═╝     ╚═╝   ╚═╝

██████╗  ██████╗ ██████╗ ████████╗███████╗ ██████╗ ██╗     ██╗ ██████╗
██╔══██╗██╔═══██╗██╔══██╗╚══██╔══╝██╔════╝██╔═══██╗██║     ██║██╔═══██╗
██████╔╝██║   ██║██████╔╝   ██║   █████╗  ██║   ██║██║     ██║██║   ██║
██╔═══╝ ██║   ██║██╔══██╗   ██║   ██╔══╝  ██║   ██║██║     ██║██║   ██║
██║     ╚██████╔╝██║  ██║   ██║   ██║     ╚██████╔╝███████╗██║╚██████╔╝
╚═╝      ╚═════╝ ╚═╝  ╚═╝   ╚═╝   ╚═╝      ╚═════╝ ╚══════╝╚═╝ ╚═════╝

╔═ Intro ═══════════════╗
║ Welcome to my interactive 3D portfolio!
║ Drive around and explore different areas to learn more about me.
╚═══════════════════════╝

╔═ Socials ═══════════════╗
║ Mail           ⇒ your@email.com
║ GitHub         ⇒ https://github.com/your-username
║ X              ⇒ https://x.com/your_handle
║ Bilibili       ⇒ https://space.bilibili.com/your_id
║ LinkedIn       ⇒ https://www.linkedin.com/in/your-profile/
║ Blog           ⇒ https://your-blog.com
╚═══════════════════════╝

╔═ Debug ═══════════════╗
║ You can access the debug mode by adding #debug at the end of the URL and reloading.
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
