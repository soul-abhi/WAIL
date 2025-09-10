// Tailwind CSS v4 moved its PostCSS plugin to @tailwindcss/postcss
import tailwindcss from '@tailwindcss/postcss'
import autoprefixer from 'autoprefixer'

export default {
    plugins: [tailwindcss(), autoprefixer()]
}
